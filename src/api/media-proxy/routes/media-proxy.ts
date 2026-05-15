/**
 * Media Proxy Route
 *
 * Public GET endpoint to serve files from private S3 storage.
 * Example: GET /api/media-proxy?key=large_product_image_abc123.png
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/media-proxy',
      handler: 'media-proxy.proxy',
      config: {
        auth: false, // Public — images must be accessible without login
      },
    },
  ],
};
