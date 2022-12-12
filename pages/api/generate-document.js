import { renderToStream } from "@react-pdf/renderer";
import axios from "axios";
import CompanyDocument from "../../components/CompanyDocument";

const documentCategoryId = 163;

export default async function handler(req, res) {
  console.log("req", req.body);
  if (req.method !== "POST") {
    res.status(405).json({ message: `Method "${req.method}" not allowed` });
    return;
  }

  if (!req.body?.roles?.includes("poslodavac")) {
    res.status(401).json({
      message: `Morate biti poslodavac za generiranje ovog dokumenta`,
    });
    return;
  }

  try {
    const documentFile = await renderToStream(
      <CompanyDocument userData={req.body} />
    );

    const response = await axios.post(
      "http://161.53.174.14/wp-json/wp/v2/media",
      documentFile,
      {
        headers: {
          Authorization: req.headers?.authorization,
          "Content-Type": "application/pdf",
          Accept: "application/json",
          "Content-Disposition":
            'attachment; filename="obrazac_za_prijavu_poslodavaca.pdf"',
        },
      }
    );
    await axios.post(
      "http://161.53.174.14/wp-json/wp/v2/media/" + response.data.id,
      {
        categories: documentCategoryId,
        author: req.body?.user_id,
      }
    );
  } catch (error) {
    const errorData = error.response?.data;
    if (errorData) res.status(errorData?.data?.status).json(errorData);
    else res.status(500).json({ message: "Došlo je do greške" });
  }
}
