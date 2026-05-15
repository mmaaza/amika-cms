/**
 * S3 Media Proxy Middleware
 * 
 * Intercepts requests to /uploads/* and streams the corresponding
 * file from the private Railway S3 bucket. This keeps the bucket
 * fully private while serving media through Strapi's own domain.
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.BUCKET_ENDPOINT,
      region: process.env.BUCKET_REGION || 'us-west-1',
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

// Content-type mapping for common media files
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

function getMimeType(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Only intercept GET requests to /uploads/*
    if (ctx.method !== 'GET' || !ctx.path.startsWith('/uploads/')) {
      return next();
    }

    // Don't proxy if S3 isn't configured (local dev fallback)
    if (!process.env.BUCKET_ENDPOINT || !process.env.BUCKET_NAME) {
      return next();
    }

    // Extract the S3 object key from the URL path
    // /uploads/filename.jpg → filename.jpg
    const objectKey = ctx.path.replace(/^\/uploads\//, '');

    if (!objectKey) {
      return next();
    }

    try {
      const client = getS3Client();
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: objectKey,
      });

      const response = await client.send(command);

      // Set response headers
      ctx.status = 200;
      ctx.type = response.ContentType || getMimeType(objectKey);

      if (response.ContentLength) {
        ctx.set('Content-Length', String(response.ContentLength));
      }

      if (response.ETag) {
        ctx.set('ETag', response.ETag);
      }

      // Cache for 1 year (immutable content-addressed files)
      ctx.set('Cache-Control', 'public, max-age=31536000, immutable');

      // Stream the S3 response body
      ctx.body = response.Body as Readable;
    } catch (error: any) {
      if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
        // File not found in S3, fall through to default handler
        return next();
      }

      strapi.log.error(`[S3 Proxy] Error fetching ${objectKey}:`, error);
      ctx.status = 502;
      ctx.body = { error: 'Failed to fetch media file' };
    }
  };
};
