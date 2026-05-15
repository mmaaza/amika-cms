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
          Bucket: env('BUCKET_NAME'),
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
