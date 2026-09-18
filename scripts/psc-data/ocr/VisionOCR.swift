//
//  VisionOCR.swift
//
//  Word-level OCR over rendered PDF pages, using Apple's Vision framework.
//
//  Why Vision rather than tesseract: it needs no install, it is accurate on
//  clean machine print, and -- the part that matters here -- it can report a
//  bounding box per WORD, not just per line. Reconstructing a 24-column
//  financial table means clustering tokens by their x position, so per-word
//  geometry is the whole ballgame.
//
//  Reads image paths on stdin, one per line, and writes one JSON object per
//  line to stdout (NDJSON). Compile once, spawn once, stream the corpus.
//
//    swiftc -O -parse-as-library \
//      -framework Vision -framework AppKit -framework CoreImage \
//      VisionOCR.swift -o visionocr
//
//    find png/far1-2019-q4 -name 'p*.png' | ./visionocr --dpi 300 > out.ndjson
//
//  Input line format:  <path>[\t<x0>,<y0>,<x1>,<y1>]
//  The optional trailing rect is a region of interest in TOP-LEFT PIXEL
//  coordinates; it exists so a single suspect cell can be re-read at
//  magnification without re-processing the page.
//
//  Options:
//    --dpi <n>                 recorded in the output; does not affect OCR
//    --revision <2|3>          Vision text-recognition revision (default 3)
//    --language-correction     opt IN to language correction (default OFF)
//    --min-text-height <f>     default 0.006
//    --custom-words <file>     one term per line
//    --max-candidates <n>      alternates to record per word (default 3)
//    --fast                    .fast instead of .accurate
//

import AppKit
import Foundation
import Vision

// MARK: - Output shapes

struct Word: Encodable {
    let text: String
    let conf: Float
    let line: Int
    let x0: Double
    let y0: Double
    let x1: Double
    let y1: Double
    let alts: [String]?
}

struct Line: Encodable {
    let id: Int
    let text: String
    let conf: Float
    let x0: Double
    let y0: Double
    let x1: Double
    let y1: Double
}

struct PageOut: Encodable {
    let image: String
    let width: Int
    let height: Int
    let dpi: Int
    let revision: Int
    let languageCorrection: Bool
    let roi: [Double]?
    let ms: Int
    let words: [Word]
    let lines: [Line]
}

struct PageErr: Encodable {
    let image: String
    let error: String
}

// MARK: - Options

struct Options {
    var dpi = 300
    var revision = 3
    var languageCorrection = false
    var minTextHeight: Float = 0.006
    var customWords: [String] = []
    var maxCandidates = 3
    var fast = false
}

@main
struct VisionOCR {

    static func parseOptions() -> Options {
        var o = Options()
        let args = Array(CommandLine.arguments.dropFirst())
        var i = 0
        while i < args.count {
            let a = args[i]
            func next() -> String? {
                i += 1
                return i < args.count ? args[i] : nil
            }
            switch a {
            case "--dpi": o.dpi = Int(next() ?? "300") ?? 300
            case "--revision": o.revision = Int(next() ?? "3") ?? 3
            case "--language-correction": o.languageCorrection = true
            case "--no-language-correction": o.languageCorrection = false
            case "--min-text-height": o.minTextHeight = Float(next() ?? "0.006") ?? 0.006
            case "--max-candidates": o.maxCandidates = Int(next() ?? "3") ?? 3
            case "--fast": o.fast = true
            case "--custom-words":
                if let p = next(), let body = try? String(contentsOfFile: p, encoding: .utf8) {
                    o.customWords = body
                        .split(separator: "\n")
                        .map { $0.trimmingCharacters(in: .whitespaces) }
                        .filter { !$0.isEmpty && !$0.hasPrefix("#") }
                }
            default: break
            }
            i += 1
        }
        return o
    }

    /// Vision reports normalized coordinates with a BOTTOM-left origin; every
    /// consumer downstream (and every image tool) uses top-left pixels.
    static func toPixels(_ b: CGRect, _ w: Int, _ h: Int) -> (Double, Double, Double, Double) {
        let x0 = Double(b.minX) * Double(w)
        let x1 = Double(b.maxX) * Double(w)
        let y0 = (1.0 - Double(b.maxY)) * Double(h)
        let y1 = (1.0 - Double(b.minY)) * Double(h)
        return (x0, y0, x1, y1)
    }

    static func loadCGImage(_ path: String) -> CGImage? {
        guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
              let img = CGImageSourceCreateImageAtIndex(src, 0, nil)
        else { return nil }
        return img
    }

    static func recognize(path: String, roi: CGRect?, o: Options) -> Data? {
        let started = Date()
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.withoutEscapingSlashes]

        guard let cg = loadCGImage(path) else {
            return try? encoder.encode(PageErr(image: path, error: "could not decode image"))
        }
        let w = cg.width, h = cg.height

        let request = VNRecognizeTextRequest()
        request.recognitionLevel = o.fast ? .fast : .accurate
        // Language correction rewrites digit strings into words -- "1,234.00"
        // becomes something with letters in it. Non-negotiable for money.
        request.usesLanguageCorrection = o.languageCorrection
        request.minimumTextHeight = o.minTextHeight
        request.recognitionLanguages = ["en-US"]
        if !o.customWords.isEmpty { request.customWords = o.customWords }
        // Pinned: a macOS update must not silently change numbers we published.
        request.revision = o.revision == 2
            ? VNRecognizeTextRequestRevision2
            : VNRecognizeTextRequestRevision3

        if let r = roi {
            // regionOfInterest is normalized, bottom-left origin.
            request.regionOfInterest = CGRect(
                x: r.minX / CGFloat(w),
                y: 1.0 - (r.maxY / CGFloat(h)),
                width: r.width / CGFloat(w),
                height: r.height / CGFloat(h)
            )
        }

        let handler = VNImageRequestHandler(cgImage: cg, options: [:])
        do {
            try handler.perform([request])
        } catch {
            return try? encoder.encode(PageErr(image: path, error: "\(error)"))
        }

        var words: [Word] = []
        var lines: [Line] = []

        for (idx, obs) in (request.results ?? []).enumerated() {
            let candidates = obs.topCandidates(o.maxCandidates)
            guard let best = candidates.first else { continue }

            let (lx0, ly0, lx1, ly1) = toPixels(obs.boundingBox, w, h)
            lines.append(
                Line(id: idx, text: best.string, conf: best.confidence,
                     x0: lx0, y0: ly0, x1: lx1, y1: ly1)
            )

            let alts = candidates.count > 1 ? candidates.map { $0.string } : nil
            let s = best.string

            // Split the recognized line into whitespace-delimited tokens and ask
            // Vision for the box of each token's character range. This is the
            // only way to get per-word geometry out of VNRecognizeTextRequest.
            var tokenStart: String.Index? = nil
            var cursor = s.startIndex

            func flush(_ end: String.Index) {
                guard let start = tokenStart else { return }
                let range = start..<end
                let text = String(s[range])
                tokenStart = nil
                guard !text.isEmpty else { return }
                let box = (try? best.boundingBox(for: range))??.boundingBox
                if let b = box {
                    let (x0, y0, x1, y1) = toPixels(b, w, h)
                    words.append(
                        Word(text: text, conf: best.confidence, line: idx,
                             x0: x0, y0: y0, x1: x1, y1: y1, alts: nil)
                    )
                } else {
                    // No geometry: still record it so the token is not lost, but
                    // with a degenerate box the table builder can filter on.
                    words.append(
                        Word(text: text, conf: best.confidence, line: idx,
                             x0: lx0, y0: ly0, x1: lx0, y1: ly1, alts: nil)
                    )
                }
            }

            while cursor < s.endIndex {
                if s[cursor].isWhitespace {
                    flush(cursor)
                } else if tokenStart == nil {
                    tokenStart = cursor
                }
                cursor = s.index(after: cursor)
            }
            flush(s.endIndex)

            if alts != nil, let last = lines.last, last.id == idx {
                // Alternates are a line-level signal; attach them to the first
                // token of the line so the NDJSON stays small.
                if let i = words.lastIndex(where: { $0.line == idx }) {
                    let wd = words[i]
                    words[i] = Word(text: wd.text, conf: wd.conf, line: wd.line,
                                    x0: wd.x0, y0: wd.y0, x1: wd.x1, y1: wd.y1,
                                    alts: alts)
                }
            }
        }

        let out = PageOut(
            image: path,
            width: w, height: h,
            dpi: o.dpi,
            revision: o.revision,
            languageCorrection: o.languageCorrection,
            roi: roi.map { [Double($0.minX), Double($0.minY), Double($0.maxX), Double($0.maxY)] },
            ms: Int(Date().timeIntervalSince(started) * 1000),
            words: words,
            lines: lines
        )
        return try? encoder.encode(out)
    }

    static func main() {
        let o = parseOptions()
        let out = FileHandle.standardOutput
        let newline = Data([0x0a])

        while let raw = readLine(strippingNewline: true) {
            let line = raw.trimmingCharacters(in: .whitespaces)
            if line.isEmpty { continue }

            let parts = line.split(separator: "\t", maxSplits: 1, omittingEmptySubsequences: false)
            let path = String(parts[0])
            var roi: CGRect? = nil
            if parts.count > 1 {
                let n = parts[1].split(separator: ",").compactMap { Double($0) }
                if n.count == 4 {
                    roi = CGRect(x: n[0], y: n[1], width: n[2] - n[0], height: n[3] - n[1])
                }
            }

            if let data = recognize(path: path, roi: roi, o: o) {
                out.write(data)
                out.write(newline)
            }
        }
    }
}
