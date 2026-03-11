import { Resend } from "resend";

const DESIGN_PREFIX = "newsletter-design:";

export const getNewsletterConfig = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_NEWSLETTER_FROM;
  const replyTo = process.env.RESEND_NEWSLETTER_REPLY_TO;
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const topicId = process.env.RESEND_NEWSLETTER_TOPIC_ID;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!from) {
    throw new Error("Missing RESEND_NEWSLETTER_FROM");
  }

  if (!segmentId) {
    throw new Error("Missing RESEND_NEWSLETTER_SEGMENT_ID");
  }

  return {
    apiKey,
    from,
    replyTo: replyTo?.includes(",")
      ? replyTo
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : replyTo,
    segmentId,
    topicId,
  };
};

export const resendClient = () => {
  const { apiKey } = getNewsletterConfig();

  return new Resend(apiKey);
};

export const unwrapResendResponse = (response) => {
  if (response?.error) {
    const error = new Error(response.error.message || "Resend error");
    error.statusCode = response.error.statusCode || 500;
    error.details = response.error;
    throw error;
  }

  return response?.data;
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

export const normalizeBroadcast = (broadcast) => {
  const { design, html } = extractNewsletterDesign(broadcast.html);

  return {
    id: broadcast.id,
    name: broadcast.name || "",
    subject: broadcast.subject || "",
    html,
    text: broadcast.text || "",
    status: broadcast.status || "",
    createdAt: broadcast.created_at || null,
    scheduledAt: broadcast.scheduled_at || null,
    sentAt: broadcast.sent_at || null,
    from: broadcast.from || "",
    replyTo: broadcast.reply_to || [],
    segmentId: broadcast.segment_id || broadcast.audience_id || null,
    topicId: broadcast.topic_id || null,
    design,
  };
};

export const normalizeBroadcastSummary = (broadcast) => ({
  id: broadcast.id,
  name: broadcast.name || "",
  subject: "",
  html: "",
  text: "",
  status: broadcast.status || "",
  createdAt: broadcast.created_at || null,
  scheduledAt: broadcast.scheduled_at || null,
  sentAt: broadcast.sent_at || null,
  from: "",
  replyTo: [],
  segmentId: broadcast.segment_id || broadcast.audience_id || null,
  topicId: broadcast.topic_id || null,
  design: null,
});

export const normalizeContact = (contact) => ({
  id: contact.id,
  email: contact.email || "",
  firstName: contact.first_name || "",
  lastName: contact.last_name || "",
  createdAt: contact.created_at || null,
  unsubscribed: !!contact.unsubscribed,
});

export const buildBroadcastFromPayload = ({
  id,
  name,
  subject,
  html,
  text,
  design,
  status = "draft",
  createdAt = null,
  scheduledAt = null,
  sentAt = null,
}) => {
  const config = getNewsletterConfig();

  return {
    id,
    name: name || "",
    subject: subject || "",
    html: html || "",
    text: text || "",
    status,
    createdAt,
    scheduledAt,
    sentAt,
    from: config.from,
    replyTo: config.replyTo || [],
    segmentId: config.segmentId,
    topicId: config.topicId || null,
    design: design || null,
  };
};

export const createBroadcastPayload = ({
  name,
  subject,
  html,
  text,
  design,
}) => {
  const config = getNewsletterConfig();

  return {
    segmentId: config.segmentId,
    from: config.from,
    ...(config.replyTo ? { replyTo: config.replyTo } : {}),
    ...(config.topicId ? { topicId: config.topicId } : {}),
    name,
    subject,
    html: buildNewsletterHtml({ html, design }),
    ...(typeof text === "string" ? { text } : {}),
  };
};
