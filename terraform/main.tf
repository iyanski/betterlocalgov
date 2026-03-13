terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 bucket for hosting static website
resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name

  tags = var.tags
}

# S3 bucket website configuration
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # For SPA routing
  }
}

# S3 bucket public access block configuration
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy to allow public read access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  depends_on = [aws_s3_bucket_public_access_block.website]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })
}

# Upload dist folder contents to S3
resource "aws_s3_object" "website_files" {
  for_each = fileset("${var.dist_folder_path}", "**/*")

  bucket       = aws_s3_bucket.website.id
  key          = each.value
  source       = "${var.dist_folder_path}/${each.value}"
  etag         = filemd5("${var.dist_folder_path}/${each.value}")
  content_type = lookup(var.mime_types, regex("\\.[^.]+$", each.value), "application/octet-stream")

  depends_on = [aws_s3_bucket_policy.website]
}
