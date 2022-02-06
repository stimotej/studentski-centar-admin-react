module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["unaprijedi.com"],
  },
  webpack: (config, options) => {
    config.plugins.push(
      new options.webpack.ProvidePlugin({
        "window.Quill": "quill",
      })
    );

    return config;
  },
  env: {
    WOO_API_CUSTOMER_KEY: "ck_5d9ee4faf76c88d4fa17a9174d8e65b187a2a1ad",
    WOO_API_CUSTOMER_SECRET: "cs_1fdf3bec652f0745b4f3e58ef9dde4c0dc66d456",
    MAIL_USER: "timotej.sofijanovic.test@gmail.com",
    MAIL_PASS: "timotejsofijanovic",
    MAIL_ADMIN: "timotej1707timi@gmail.com",
    PUSHER_APP_ID: "1343490",
    PUSHER_KEY: "096b9e211c30bb6382b7",
    PUSHER_SECRET: "9311f17b7b7e9c82f52f",
    PUSHER_CLUSTER: "eu",
  },
};
