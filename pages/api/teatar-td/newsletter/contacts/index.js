import {
  getNewsletterConfig,
  normalizeContact,
  resendClient,
  unwrapResendResponse,
} from "../../../../../lib/newsletter";

const EMAIL_SEPARATOR_REGEX = /[\s,;]+/;

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

const sleep = (duration) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export default async function handler(req, res) {
  const client = resendClient();
  const { segmentId } = getNewsletterConfig();

  try {
    if (req.method === "GET") {
      const response = await client.contacts.list({
        segmentId,
      });

      return res.status(200).json({
        data: (unwrapResendResponse(response)?.data || []).map(normalizeContact),
      });
    }

    if (req.method === "POST") {
      const emails = Array.from(
        new Set(
          String(req.body?.emails || "")
            .split(EMAIL_SEPARATOR_REGEX)
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean),
        ),
      );

      if (emails.length <= 0) {
        return res.status(400).json({
          message: "Unesite barem jednu email adresu.",
        });
      }

      const invalidEmails = emails.filter((email) => !isValidEmail(email));

      if (invalidEmails.length > 0) {
        return res.status(400).json({
          message: "Neke email adrese nisu ispravne.",
          data: {
            invalidEmails,
          },
        });
      }

      const createdContacts = [];
      const failedEmails = [];

      for (const [index, email] of emails.entries()) {
        try {
          const response = await client.contacts.create({
            email,
            unsubscribed: false,
            segments: [{ id: segmentId }],
          });
          const contact = unwrapResendResponse(response);

          createdContacts.push({
            id: contact.id,
            email,
            firstName: "",
            lastName: "",
            createdAt: new Date().toISOString(),
            unsubscribed: false,
          });
        } catch (error) {
          failedEmails.push({
            email,
            message: error.message,
          });
        }

        if (index < emails.length - 1) {
          await sleep(550);
        }
      }

      if (createdContacts.length <= 0) {
        return res.status(400).json({
          message: failedEmails[0]?.message || "Dodavanje pretplatnika nije uspjelo.",
          data: {
            failedEmails,
          },
        });
      }

      return res.status(200).json({
        data: createdContacts,
        meta: {
          createdCount: createdContacts.length,
          failedCount: failedEmails.length,
          failedEmails,
        },
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
