import {
  getWordPressAuthorization,
  normalizeContact,
  wordpressRequest,
} from "../../../../../lib/newsletter";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const authorization = getWordPressAuthorization(req);

    if (req.method === "PATCH") {
      const response = await wordpressRequest(`/sc/v1/newsletter-subscribers/${id}`, {
        method: "PATCH",
        authorization,
        body: {
          firstName: req.body?.firstName || "",
          lastName: req.body?.lastName || "",
          unsubscribed: !!req.body?.unsubscribed,
        },
      });

      return res.status(200).json({
        data: normalizeContact(response?.data || response),
      });
    }

    if (req.method === "DELETE") {
      const response = await wordpressRequest(`/sc/v1/newsletter-subscribers/${id}`, {
        method: "DELETE",
        authorization,
      });

      return res.status(200).json({ data: response?.data || response });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
