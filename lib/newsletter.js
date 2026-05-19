import crypto from "crypto";

const DESIGN_PREFIX = "newsletter-design:";
const DEFAULT_WORDPRESS_API_BASE_URL = "https://www.sczg.unizg.hr/wp-json";
const DEFAULT_WORDPRESS_SITE_URL = "https://www.sczg.unizg.hr";
const DEFAULT_NEWSLETTER_PAGE = "teatar-td";
const UNSUBSCRIBE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

const stripTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const getWordPressApiBaseUrl = () =>
  stripTrailingSlash(
    process.env.WORDPRESS_API_BASE_URL || DEFAULT_WORDPRESS_API_BASE_URL,
  );

export const getWordPressSiteUrl = () => {
  const configured =
    process.env.WORDPRESS_SITE_URL ||
    getWordPressApiBaseUrl().replace(/\/wp-json$/, "");

  return stripTrailingSlash(configured || DEFAULT_WORDPRESS_SITE_URL);
};

export const getNewsletterPage = () =>
  process.env.NEWSLETTER_PAGE || DEFAULT_NEWSLETTER_PAGE;

export const getNewsletterConfig = () => {
  const senderEmail = process.env.GMAIL_SENDER_EMAIL;
  const unsubscribeSecret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;

  if (!senderEmail) {
    throw new Error("Missing GMAIL_SENDER_EMAIL");
  }

  if (!unsubscribeSecret) {
    throw new Error("Missing NEWSLETTER_UNSUBSCRIBE_SECRET");
  }

  return {
    senderEmail,
    unsubscribeSecret,
    page: getNewsletterPage(),
    wordpressApiBaseUrl: getWordPressApiBaseUrl(),
    wordpressSiteUrl: getWordPressSiteUrl(),
  };
};

const encodeTokenPart = (value) =>
  Buffer.from(JSON.stringify(value), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const decodeTokenPart = (value) => {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return JSON.parse(Buffer.from(`${normalized}${padding}`, "base64").toString("utf8"));
};

const signTokenPayload = (payload, secret) =>
  crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const coerceBoolean = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  value === "true";

export const getWordPressAuthorization = (req) => {
  const authorization = req.headers.authorization || req.headers.Authorization;

  if (!authorization) {
    const error = new Error("Missing Authorization header");
    error.statusCode = 401;
    throw error;
  }

  return authorization;
};

export const wordpressRequest = async (
  path,
  { method = "GET", body, authorization, headers = {} } = {},
) => {
  const response = await fetch(`${getWordPressApiBaseUrl()}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(authorization ? { Authorization: authorization } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      payload?.message ||
        payload?.error ||
        payload?.code ||
        "WordPress request failed",
    );
    error.statusCode = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
};

export const encodeDesign = (design) => {
  if (!design) return "";

  return Buffer.from(JSON.stringify(design), "utf8").toString("base64");
};

export const decodeDesign = (encodedDesign) => {
  if (!encodedDesign) return null;

  try {
    const decoded = Buffer.from(encodedDesign, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export const buildNewsletterHtml = ({ html, design }) => {
  const encodedDesign = encodeDesign(design);
  const designComment = encodedDesign
    ? `<!--${DESIGN_PREFIX}${encodedDesign}-->`
    : "";

  return `${designComment}${html || ""}`;
};

export const extractNewsletterDesign = (html) => {
  if (!html) {
    return {
      design: null,
      html: "",
    };
  }

  const match = html.match(
    new RegExp(`<!--${DESIGN_PREFIX}([A-Za-z0-9+/=]+)-->`),
  );

  if (!match) {
    return {
      design: null,
      html,
    };
  }

  return {
    design: decodeDesign(match[1]),
    html: html.replace(match[0], ""),
  };
};

export const normalizeCampaign = (campaign = {}) => {
  const htmlSource =
    campaign.html ||
    campaign.content?.raw ||
    campaign.content?.rendered ||
    campaign.meta?.html ||
    "";
  const designSource = campaign.design || campaign.meta?.design || null;
  const extracted = designSource
    ? { design: designSource, html: htmlSource }
    : extractNewsletterDesign(htmlSource);

  return {
    id: campaign.id,
    name:
      campaign.name ||
      campaign.internal_name ||
      campaign.meta?.internal_name ||
      campaign.title?.rendered ||
      "",
    subject: campaign.subject || campaign.meta?.subject || "",
    html: extracted.html || "",
    design: extracted.design || null,
    status: campaign.status || campaign.meta?.status || "draft",
    createdAt: campaign.createdAt || campaign.date_gmt || campaign.date || null,
    sentAt: campaign.sentAt || campaign.sent_at || campaign.meta?.sent_at || null,
    recipientCount:
      Number(
        campaign.recipientCount ??
          campaign.recipient_count ??
          campaign.meta?.recipient_count ??
          0,
      ) || 0,
    sentCount:
      Number(
        campaign.sentCount ?? campaign.sent_count ?? campaign.meta?.sent_count ?? 0,
      ) || 0,
    failedCount:
      Number(
        campaign.failedCount ??
          campaign.failed_count ??
          campaign.meta?.failed_count ??
          0,
      ) || 0,
    errorSummary:
      campaign.errorSummary || campaign.error_summary || campaign.meta?.error_summary || "",
  };
};

export const normalizeContact = (contact = {}) => ({
  id: contact.id,
  email: contact.email || contact.meta?.email || contact.title?.rendered || "",
  firstName:
    contact.firstName || contact.first_name || contact.meta?.first_name || "",
  lastName:
    contact.lastName || contact.last_name || contact.meta?.last_name || "",
  page: contact.page || contact.meta?.page || getNewsletterPage(),
  unsubscribed: coerceBoolean(contact.unsubscribed ?? contact.meta?.unsubscribed),
  createdAt: contact.createdAt || contact.date_gmt || contact.date || null,
  unsubscribedAt:
    contact.unsubscribedAt || contact.unsubscribed_at || contact.meta?.unsubscribed_at || null,
});

export const renderNewsletterHtml = ({ html = "", subscriber, unsubscribeUrl }) =>
  html
    .replaceAll("{{first_name}}", subscriber.firstName || "")
    .replaceAll("{{last_name}}", subscriber.lastName || "")
    .replaceAll("{{email}}", subscriber.email || "")
    .replaceAll("{{unsubscribe_url}}", unsubscribeUrl || "");

export const createUnsubscribeToken = ({ subscriber, campaignId = null }) => {
  const { unsubscribeSecret, page } = getNewsletterConfig();
  const payload = {
    subscriberId: subscriber.id,
    email: subscriber.email,
    page: subscriber.page || page,
    campaignId,
    exp: Math.floor(Date.now() / 1000) + UNSUBSCRIBE_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = encodeTokenPart(payload);
  const signature = signTokenPayload(encodedPayload, unsubscribeSecret);

  return `${encodedPayload}.${signature}`;
};

export const verifyUnsubscribeToken = (token) => {
  const { unsubscribeSecret } = getNewsletterConfig();
  const [encodedPayload, signature] = String(token || "").split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid unsubscribe token");
  }

  const expectedSignature = signTokenPayload(encodedPayload, unsubscribeSecret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    throw new Error("Invalid unsubscribe token");
  }

  const payload = decodeTokenPart(encodedPayload);

  if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Expired unsubscribe token");
  }

  return payload;
};

export const buildUnsubscribeUrl = ({ subscriber, campaignId = null }) => {
  const token = createUnsubscribeToken({ subscriber, campaignId });
  const url = new URL("/wp-json/sc/v1/newsletter-unsubscribe", getWordPressSiteUrl());
  url.searchParams.set("token", token);
  return url.toString();
};

export const createPlainTextFromHtml = (html = "") =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
