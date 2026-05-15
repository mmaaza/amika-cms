/**
 * Media Proxy Controller
 *
 * Streams files from the private Railway S3 bucket through Strapi.
 * Usage: GET /api/media-proxy?key=filename.png
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

export default {
  async proxy(ctx) {
    const key = ctx.query.key as string;

    if (!key) {
      ctx.status = 400;
      ctx.body = { error: 'Missing "key" query parameter' };
      return;
    }

    if (!process.env.BUCKET_ENDPOINT || !process.env.BUCKET_NAME) {
      ctx.status = 503;
      ctx.body = { error: 'S3 storage not configured' };
      return;
    }

    // Sanitize the key to prevent path traversal
    const sanitizedKey = key.replace(/\.\./g, '').replace(/^\/+/, '');

    try {
      const client = getS3Client();
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: sanitizedKey,
      });

      const response = await client.send(command);

      ctx.status = 200;
      ctx.type = response.ContentType || getMimeType(sanitizedKey);

      if (response.ContentLength) {
        ctx.set('Content-Length', String(response.ContentLength));
      }

      if (response.ETag) {
        ctx.set('ETag', response.ETag);
      }

      // Cache for 1 year — Strapi filenames are content-addressed (include hashes)
      ctx.set('Cache-Control', 'public, max-age=31536000, immutable');

      // Stream the S3 response body directly to the client
      ctx.body = response.Body as Readable;
    } catch (error: any) {
      if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
        ctx.status = 404;
        ctx.body = { error: 'File not found' };
        return;
      }

      strapi.log.error(`[Media Proxy] Error fetching "${sanitizedKey}":`, error);
      ctx.status = 502;
      ctx.body = { error: 'Failed to fetch media file' };
    }
  },
};
