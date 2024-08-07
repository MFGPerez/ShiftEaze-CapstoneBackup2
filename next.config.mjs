// next.config.mjs
export default {
    images: {
      domains: [
        "lh3.googleusercontent.com",
        "via.placeholder.com",
        "firebasestorage.googleapis.com",
      ],
    },
    env: {
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    experimental: {
      esmExternals: true,
    },
  };