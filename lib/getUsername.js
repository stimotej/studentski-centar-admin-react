import cookie from "cookie";
import { userGroups } from "./constants";

export default (context) => {
  const parsedCookies = cookie.parse(context.req.headers.cookie || "");
  const token = parsedCookies.access_token;
  const username = parsedCookies.username;

  const fromRoute = context.resolvedUrl.split("/")[1];

  if (token && userGroups[fromRoute].includes(username)) return username;
  else return null;
};
