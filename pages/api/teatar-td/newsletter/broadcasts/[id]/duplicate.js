import {
  buildNewsletterHtml,
  getWordPressAuthorization,
  normalizeCampaign,
  wordpressRequest,
} from "../../../../../../lib/newsletter";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const authorization = getWordPressAuthorization(req);

    const existingResponse = await wordpressRequest(
      `/sc/v1/newsletter-campaigns/${id}`,
      {
        authorization,
      },
    );
    const existingCampaign = normalizeCampaign(existingResponse?.data || existingResponse);

    const response = await wordpressRequest("/sc/v1/newsletter-campaigns", {
      method: "POST",
      authorization,
      body: {
        name: existingCampaign.name
          ? `${existingCampaign.name} (kopija)`
          : "Kopija newslettera",
        subject: existingCampaign.subject || "",
        html: buildNewsletterHtml({
          html: existingCampaign.html || "",
          design: existingCampaign.design || null,
        }),
        design: existingCampaign.design || null,
      },
    });

    return res.status(200).json({
      data: normalizeCampaign(response?.data || response),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
