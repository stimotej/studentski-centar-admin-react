const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const api = new WooCommerceRestApi({
  // url: "https://unaprijedi.com",
  url: "http://161.53.174.14",
  consumerKey: process.env.WOO_API_CUSTOMER_KEY,
  consumerSecret: process.env.WOO_API_CUSTOMER_SECRET,
  wpAPI: true,
  version: "wc/v3",
  queryStringAuth: true,
  axiosConfig: {
    headers: { "Content-Type": "application/json" },
  },
});

module.exports = api;
