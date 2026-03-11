import {
  buildBroadcastFromPayload,
  createBroadcastPayload,
  normalizeBroadcast,
  resendClient,
  unwrapResendResponse,
} from "../../../../../lib/newsletter";

export default async function handler(req, res) {
  const client = resendClient();
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const response = await client.broadcasts.get(id);
      return res.status(200).json({
        data: normalizeBroadcast(unwrapResendResponse(response)),
      });
    }

    if (req.method === "PATCH") {
      await client.broadcasts.update(id, createBroadcastPayload(req.body));

      return res.status(200).json({
        data: buildBroadcastFromPayload({
          id,
          name: req.body?.name,
          subject: req.body?.subject,
          html: req.body?.html,
          text: req.body?.text,
          design: req.body?.design,
        }),
      });
    }

    if (req.method === "DELETE") {
      const response = await client.broadcasts.remove(id);
      return res.status(200).json({ data: unwrapResendResponse(response) });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.details || null,
    });
  }
}
