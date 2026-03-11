import {
  buildBroadcastFromPayload,
  createBroadcastPayload,
  getNewsletterConfig,
  normalizeBroadcast,
  normalizeBroadcastSummary,
  resendClient,
  unwrapResendResponse,
} from "../../../../../lib/newsletter";

const getAllBroadcasts = async (client) => {
  const listResponse = await client.broadcasts.list();
  const broadcasts = unwrapResendResponse(listResponse)?.data || [];
  return broadcasts
    .map(normalizeBroadcastSummary)
    .sort(
      (first, second) =>
        new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
    );
};

export default async function handler(req, res) {
  const client = resendClient();
  const { segmentId } = getNewsletterConfig();

  try {
    if (req.method === "GET") {
      const broadcasts = await getAllBroadcasts(client);
      return res.status(200).json({
        data: broadcasts.filter(
          (broadcast) => broadcast.segmentId === segmentId,
        ),
      });
    }

    if (req.method === "POST") {
      const payload = createBroadcastPayload(req.body);
      const createResponse = await client.broadcasts.create(payload);
      const broadcastId = unwrapResendResponse(createResponse)?.id;

      return res.status(200).json({
        data: buildBroadcastFromPayload({
          id: broadcastId,
          name: req.body?.name,
          subject: req.body?.subject,
          html: req.body?.html,
          text: req.body?.text,
          design: req.body?.design,
          status: "draft",
          createdAt: new Date().toISOString(),
        }),
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
