# studentski-centar-admin-react

## Local commands

```bash
npm run dev
npm run lint
npm run build
```

## Newsletter v1 environment

Set these as server-only environment variables for the Next app:

```bash
WORDPRESS_API_BASE_URL=https://www.sczg.unizg.hr/wp-json
WORDPRESS_SITE_URL=https://www.sczg.unizg.hr
NEWSLETTER_PAGE=teatar-td

GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_SENDER_EMAIL=
NEWSLETTER_UNSUBSCRIBE_SECRET=

# Existing contact form route still uses these:
MAIL_USER=
MAIL_PASS=
MAIL_ADMIN=
```

`NEWSLETTER_UNSUBSCRIBE_SECRET` must match the secret configured in [docs/newsletter-wordpress-snippet.php](/Users/timotej/Documents/GitHub/studentski-centar-admin-react/docs/newsletter-wordpress-snippet.php).

## Gmail refresh token

Generate a durable Gmail refresh token with:

```bash
npm run gmail:token
```

Before running it:

1. In Google Cloud Console, open the OAuth client and add this redirect URI:
   `http://127.0.0.1:3007/oauth2callback`
2. Set these env vars in the same terminal:

```bash
export GMAIL_CLIENT_ID="..."
export GMAIL_CLIENT_SECRET="..."
export GMAIL_SENDER_EMAIL="newsletter@example.com"
```

3. Run `npm run gmail:token`
4. Open the printed authorize URL in your browser
5. Sign in with the Gmail account that will send newsletters
6. Copy the printed `GMAIL_REFRESH_TOKEN`

Optional overrides:

```bash
GMAIL_OAUTH_PORT=3007
GMAIL_OAUTH_HOST=127.0.0.1
GMAIL_REDIRECT_URI=http://127.0.0.1:3007/oauth2callback
```

## WordPress snippet

The WordPress Code Snippets implementation for newsletter subscribers, campaigns, and unsubscribe handling is in:

`docs/newsletter-wordpress-snippet.php`

Replace `CHANGE_ME` in that file with the same value used for `NEWSLETTER_UNSUBSCRIBE_SECRET`.
