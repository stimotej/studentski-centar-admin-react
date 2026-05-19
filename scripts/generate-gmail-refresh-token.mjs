import http from "node:http";
import { URL } from "node:url";
import { google } from "googleapis";

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const senderEmail = process.env.GMAIL_SENDER_EMAIL || "";
const port = Number(process.env.GMAIL_OAUTH_PORT || 3007);
const host = process.env.GMAIL_OAUTH_HOST || "127.0.0.1";
const redirectUri =
  process.env.GMAIL_REDIRECT_URI || `http://${host}:${port}/oauth2callback`;

if (!clientId || !clientSecret) {
  console.error(
    "Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in the environment.",
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2({
  clientId,
  clientSecret,
  redirectUri,
});

const scopes = ["https://www.googleapis.com/auth/gmail.send"];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes,
  login_hint: senderEmail || undefined,
});

const renderPage = ({ title, message }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body {
        font-family: sans-serif;
        max-width: 720px;
        margin: 48px auto;
        padding: 0 16px;
        line-height: 1.5;
      }
      code {
        background: #f4f4f5;
        padding: 2px 6px;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>${message}</p>
  </body>
</html>`;

console.log("");
console.log("Gmail refresh token generator");
console.log("");
console.log("1. In Google Cloud -> OAuth client, add this redirect URI:");
console.log(`   ${redirectUri}`);
console.log("2. Run this script and open the URL below in your browser.");
console.log("3. Sign in with the Gmail account that should send newsletters.");
console.log("");
console.log("Authorize URL:");
console.log(authorizationUrl);
console.log("");

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://${host}:${port}`);

    if (requestUrl.pathname !== "/oauth2callback") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const error = requestUrl.searchParams.get("error");
    if (error) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        renderPage({
          title: "Authorization failed",
          message: `Google returned <code>${error}</code>. Check the terminal for details.`,
        }),
      );
      console.error(`Google authorization failed: ${error}`);
      server.close();
      process.exit(1);
    }

    const code = requestUrl.searchParams.get("code");
    if (!code) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        renderPage({
          title: "Missing code",
          message: "Google did not return an authorization code.",
        }),
      );
      server.close();
      process.exit(1);
    }

    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        renderPage({
          title: "No refresh token returned",
          message:
            "Google returned tokens, but no refresh token. Revoke prior app access for this account and run the script again.",
        }),
      );
      console.error("No refresh token returned by Google.");
      console.error(
        "Usually this means the account has already granted consent to this OAuth client.",
      );
      console.error(
        "Revoke the app in the Google account security settings, then run the script again.",
      );
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      renderPage({
        title: "Refresh token generated",
        message:
          "The terminal now contains your GMAIL_REFRESH_TOKEN. You can close this tab.",
      }),
    );

    console.log("");
    console.log("Success");
    console.log("");
    console.log(`GMAIL_REFRESH_TOKEN=${refreshToken}`);
    console.log("");
    if (tokens.expiry_date) {
      console.log(
        `Initial access token expiry: ${new Date(tokens.expiry_date).toISOString()}`,
      );
      console.log("");
    }

    server.close(() => process.exit(0));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      renderPage({
        title: "Token exchange failed",
        message: "Check the terminal for the full error details.",
      }),
    );
    console.error("Failed to exchange authorization code for tokens:");
    console.error(error);
    server.close(() => process.exit(1));
  }
});

server.listen(port, host, () => {
  console.log(`Listening on ${redirectUri}`);
});
