import { google } from "googleapis";
import {
  buildUnsubscribeUrl,
  createPlainTextFromHtml,
  getNewsletterPage,
  getWordPressAuthorization,
  normalizeCampaign,
  normalizeContact,
  renderNewsletterHtml,
  wordpressRequest,
} from "../../../../../../lib/newsletter";

const SENDER_NAME = "Teatar&TD";

const encodeHeader = (value = "") =>
  `=?UTF-8?B?${Buffer.from(String(value), "utf8").toString("base64")}?=`;

const formatFromHeader = ({ name, email }) =>
  name ? `${encodeHeader(name)} <${email}>` : email;

const toBase64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const createMimeMessage = ({ from, to, subject, html, text }) => {
  const boundary = `newsletter_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;

  return [
    `From: ${formatFromHeader({ name: SENDER_NAME, email: from })}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\r\n");
};

const getGmailClient = async () => {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Gmail OAuth environment variables. Expected GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN.",
    );
  }

  const oauth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
  });

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const page = getNewsletterPage();
  const senderEmail = process.env.GMAIL_SENDER_EMAIL;

  if (!senderEmail) {
    return res.status(500).json({
      message: "Missing GMAIL_SENDER_EMAIL",
    });
  }

  try {
    const authorization = getWordPressAuthorization(req);

    const campaignResponse = await wordpressRequest(
      `/sc/v1/newsletter-campaigns/${id}`,
      {
        authorization,
      },
    );
    const campaign = normalizeCampaign(campaignResponse?.data || campaignResponse);

    if (campaign.status === "sent") {
      return res.status(400).json({
        message: "Ovaj newsletter je već poslan.",
      });
    }

    const contactsResponse = await wordpressRequest(
      `/sc/v1/newsletter-subscribers?page=${encodeURIComponent(page)}`,
      {
        authorization,
      },
    );
    const activeSubscribers = (contactsResponse?.data || [])
      .map(normalizeContact)
      .filter((contact) => !contact.unsubscribed && contact.email);

    if (activeSubscribers.length <= 0) {
      const failedResponse = await wordpressRequest(
        `/sc/v1/newsletter-campaigns/${id}`,
        {
          method: "PATCH",
          authorization,
          body: {
            status: "failed",
            recipientCount: 0,
            sentCount: 0,
            failedCount: 0,
            errorSummary: "Nema aktivnih pretplatnika za slanje.",
          },
        },
      );

      return res.status(400).json({
        message: "Nema aktivnih pretplatnika za slanje.",
        data: normalizeCampaign(failedResponse?.data || failedResponse),
      });
    }

    const subscribers = activeSubscribers;

    await wordpressRequest(`/sc/v1/newsletter-campaigns/${id}`, {
      method: "PATCH",
      authorization,
      body: {
        status: "sending",
        recipientCount: subscribers.length,
        sentCount: 0,
        failedCount: 0,
        errorSummary: "",
      },
    });

    const gmail = await getGmailClient();
    let sentCount = 0;
    let failedCount = 0;
    const failures = [];

    for (const subscriber of subscribers) {
      const unsubscribeUrl = buildUnsubscribeUrl({
        subscriber,
        campaignId: campaign.id,
      });
      const html = renderNewsletterHtml({
        html: campaign.html || "",
        subscriber,
        unsubscribeUrl,
      });
      const text = createPlainTextFromHtml(html);

      try {
        await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: toBase64Url(
              createMimeMessage({
                from: senderEmail,
                to: subscriber.email,
                subject: campaign.subject || campaign.name || "Newsletter",
                html,
                text,
              }),
            ),
          },
        });

        sentCount += 1;
      } catch (error) {
        failedCount += 1;
        failures.push(`${subscriber.email}: ${error.message}`);
      }
    }

    const finalStatus = failedCount > 0 ? "failed" : "sent";
    const finalResponse = await wordpressRequest(
      `/sc/v1/newsletter-campaigns/${id}`,
      {
        method: "PATCH",
        authorization,
        body: {
          status: finalStatus,
          sentAt: new Date().toISOString(),
          recipientCount: subscribers.length,
          sentCount,
          failedCount,
          errorSummary: failures.slice(0, 10).join(" | "),
        },
      },
    );

    return res.status(200).json({
      data: normalizeCampaign(finalResponse?.data || finalResponse),
    });
  } catch (error) {
    try {
      await wordpressRequest(`/sc/v1/newsletter-campaigns/${id}`, {
        method: "PATCH",
        authorization,
        body: {
          status: "failed",
          errorSummary: error.message,
        },
      });
    } catch (updateError) {
      // Ignore secondary failure; the primary error is more relevant to the caller.
    }

    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
