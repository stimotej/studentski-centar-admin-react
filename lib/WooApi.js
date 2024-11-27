import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const api = new WooCommerceRestApi({
  // url: "https://unaprijedi.com",
  url: "https://www.sczg.unizg.hr",
  consumerKey: process.env.WOO_API_CUSTOMER_KEY,
  consumerSecret: process.env.WOO_API_CUSTOMER_SECRET,
  // wpAPI: true,
  version: "wc/v3",
  queryStringAuth: true,
  // verifySsl: false,
  axiosConfig: {
    headers: { "Content-Type": "application/json" },
  },
});

export default api;
