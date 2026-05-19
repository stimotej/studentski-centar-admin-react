import {
  getNewsletterPage,
  getWordPressAuthorization,
  normalizeContact,
  wordpressRequest,
} from "../../../../../lib/newsletter";

const EMAIL_SEPARATOR_REGEX = /[\s,;]+/;

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export default async function handler(req, res) {
  const page = getNewsletterPage();

  try {
    const authorization = getWordPressAuthorization(req);

    if (req.method === "GET") {
      const response = await wordpressRequest(
        `/sc/v1/newsletter-subscribers?page=${encodeURIComponent(page)}`,
        {
          authorization,
        },
      );

      return res.status(200).json({
        data: (response?.data || []).map(normalizeContact),
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

      for (const email of emails) {
        try {
          const response = await wordpressRequest("/sc/v1/newsletter-subscribers", {
            method: "POST",
            authorization,
            body: {
              email,
              page,
            },
          });

          createdContacts.push(normalizeContact(response?.data || response));
        } catch (error) {
          failedEmails.push({
            email,
            message: error.message,
          });
        }
      }

      if (createdContacts.length <= 0) {
        return res.status(400).json({
          message:
            failedEmails[0]?.message || "Dodavanje pretplatnika nije uspjelo.",
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
