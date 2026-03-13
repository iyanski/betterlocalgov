variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for hosting the website (must be globally unique)"
  type        = string
}

variable "dist_folder_path" {
  description = "Path to the dist folder containing built assets"
  type        = string
  default     = "../dist"
}

variable "tags" {
  description = "Tags to apply to AWS resources"
  type        = map(string)
  default = {
    Project     = "BetterLocalGov"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

variable "mime_types" {
  description = "Map of file extensions to MIME types"
  type        = map(string)
  default = {
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"  = "font/ttf"
    ".eot"  = "application/vnd.ms-fontobject"
    ".otf"  = "font/otf"
    ".txt"  = "text/plain"
    ".xml"  = "application/xml"
    ".pdf"  = "application/pdf"
    ".zip"  = "application/zip"
    ".webp" = "image/webp"
    ".webm" = "video/webm"
    ".mp4"  = "video/mp4"
    ".md"   = "text/markdown"
  }
}
