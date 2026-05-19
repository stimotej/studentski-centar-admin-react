import {
  buildNewsletterHtml,
  getWordPressAuthorization,
  normalizeCampaign,
  wordpressRequest,
} from "../../../../../lib/newsletter";

export default async function handler(req, res) {
  try {
    const authorization = getWordPressAuthorization(req);

    if (req.method === "GET") {
      const response = await wordpressRequest("/sc/v1/newsletter-campaigns", {
        authorization,
      });

      return res.status(200).json({
        data: (response?.data || []).map(normalizeCampaign),
      });
    }

    if (req.method === "POST") {
      const response = await wordpressRequest("/sc/v1/newsletter-campaigns", {
        method: "POST",
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

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
