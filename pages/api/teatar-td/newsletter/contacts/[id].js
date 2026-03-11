import {
  normalizeContact,
  resendClient,
  unwrapResendResponse,
} from "../../../../../lib/newsletter";

export default async function handler(req, res) {
  const client = resendClient();
  const { id } = req.query;

  try {
    if (req.method === "PATCH") {
      await client.contacts.update({
        id,
        firstName: req.body?.firstName || null,
        lastName: req.body?.lastName || null,
        unsubscribed: !!req.body?.unsubscribed,
      });

      const response = await client.contacts.get(id);

      return res.status(200).json({
        data: normalizeContact(unwrapResendResponse(response)),
      });
    }

    if (req.method === "DELETE") {
      const response = await client.contacts.remove(id);
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
