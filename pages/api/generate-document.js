import { renderToStream } from "@react-pdf/renderer";
import axios from "axios";
import CompanyDocument from "../../components/CompanyDocument";

// const userData = {
//   oib_company: "12345678910",
//   name: "Puno ime firme d.o.o",
//   short_name: "Firma d.o.o",
//   id_number: "12345678",
//   address: "Adresa 12A",
//   location: "Zagreb, 10000",
//   first_name: "Marko",
//   last_name: "Marković",
//   oib: "12345678911",
//   iban: "HR12345678910",
//   phone: "098123456789",
//   mobile: "01/1234567",
//   telefax: "098123456789",
//   email: "marko@email.com",
//   contact_person: "Ivan Ivković",
//   mbg: "123456788",
// };

const documentCategoryId = 163;

export default async function handler(req, res) {
  res.status(200).json(req.body);
  try {
    const documentFile = await renderToStream(
      <CompanyDocument userData={req.body} />
    );

    // `${__dirname}/document.pdf`

    // const readDocument = fs.createReadStream(
    //   `${__dirname}/document.pdf`,
    //   "utf8"
    // );
    // var stat = fs.statSync(`${__dirname}/document.pdf`);
    // console.log("documentFile read: ", readDocument);
    // console.log("stat: ", stat);

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
    console.log("response from wp: ", response.data);
  } catch (error) {
    console.log("error from wp: ", error.response?.data || error);
  }
}
