import {
  buildBroadcastFromPayload,
  createBroadcastPayload,
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
    const existingResponse = await client.broadcasts.get(id);
    const existingBroadcast = unwrapResendResponse(existingResponse);

    const payload = createBroadcastPayload({
      name: existingBroadcast.name
        ? `${existingBroadcast.name} (kopija)`
        : "Kopija newslettera",
      subject: existingBroadcast.subject || "",
      html: existingBroadcast.html || "",
      text: existingBroadcast.text || "",
      design: null,
    });

    const createResponse = await client.broadcasts.create(payload);
    const duplicatedId = unwrapResendResponse(createResponse)?.id;

    return res.status(200).json({
      data: buildBroadcastFromPayload({
        id: duplicatedId,
        name: payload.name,
        subject: existingBroadcast.subject || "",
        html: existingBroadcast.html || "",
        text: existingBroadcast.text || "",
        design: null,
        status: "draft",
        createdAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
