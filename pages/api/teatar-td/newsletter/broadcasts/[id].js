import {
  buildNewsletterHtml,
  getWordPressAuthorization,
  normalizeCampaign,
  wordpressRequest,
} from "../../../../../lib/newsletter";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const authorization = getWordPressAuthorization(req);

    if (req.method === "GET") {
      const response = await wordpressRequest(`/sc/v1/newsletter-campaigns/${id}`, {
        authorization,
      });

      return res.status(200).json({
        data: normalizeCampaign(response?.data || response),
      });
    }

    if (req.method === "PATCH") {
      const response = await wordpressRequest(`/sc/v1/newsletter-campaigns/${id}`, {
        method: "PATCH",
        authorization,
        body: {
          name: req.body?.name || "",
          subject: req.body?.subject || "",
          html: buildNewsletterHtml({
            html: req.body?.html || "",
            design: req.body?.design || null,
          }),
          design: req.body?.design || null,
        },
      });

      return res.status(200).json({
        data: normalizeCampaign(response?.data || response),
      });
    }

    if (req.method === "DELETE") {
      const response = await wordpressRequest(`/sc/v1/newsletter-campaigns/${id}`, {
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
