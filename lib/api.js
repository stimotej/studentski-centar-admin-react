import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/prehrana/api",
  withCredentials: true,
  // baseURL: "https://studentski-centar-admin.herokuapp.com/prehrana/api",
});

api.defaults.headers.common["Content-Type"] = "application/json";

export default api;
