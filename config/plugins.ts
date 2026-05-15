export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        // Railway Bucket S3-compatible endpoint
        endpoint: env('BUCKET_ENDPOINT'),
        forcePathStyle: true,
        credentials: {
          accessKeyId: env('BUCKET_ACCESS_KEY_ID'),
          secretAccessKey: env('BUCKET_SECRET_ACCESS_KEY'),
        },
        region: env('BUCKET_REGION', 'us-west-1'),
        params: {
          ACL: 'private',
          Bucket: env('BUCKET_NAME'),
        },
      },
      // Store relative /uploads/... paths so media is served through Strapi
      // instead of exposing private S3 bucket URLs
      baseUrl: env('PUBLIC_URL', env('APP_URL', `http://localhost:${env('PORT', 1337)}`)) + '/uploads',
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
