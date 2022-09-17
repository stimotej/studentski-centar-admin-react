module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["unaprijedi.com", "161.53.174.14"],
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
    WOO_API_CUSTOMER_KEY: "ck_ed63c982672207b21afbecce812ab7a06322ba8e",
    WOO_API_CUSTOMER_SECRET: "cs_4e0e8f4724d48b071c7b1c4d5b799f72a43ba32b",
    MAIL_USER: "timotej.sofijanovic.test@gmail.com",
    MAIL_PASS: "timotejsofijanovic",
    MAIL_ADMIN: "timotej1707timi@gmail.com",
    PUSHER_APP_ID: "1343490",
    PUSHER_KEY: "096b9e211c30bb6382b7",
    PUSHER_SECRET: "9311f17b7b7e9c82f52f",
    PUSHER_CLUSTER: "eu",
  },
};
