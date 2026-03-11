import {
  resendClient,
  unwrapResendResponse,
} from "../../../../../../lib/newsletter";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const client = resendClient();
  const { id } = req.query;

  try {
    const response = await client.broadcasts.send(id, {
      ...(req.body?.scheduledAt ? { scheduledAt: req.body.scheduledAt } : {}),
    });

    return res.status(200).json({ data: unwrapResendResponse(response) });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
