var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export default function handler(req, res) {
  transporter
    .sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_ADMIN,
      subject: req.body.subject,
      html: `
        Username: 
        <div style="padding: 10px;border:1px solid black;margin-top:5px;border-radius:10px;">
          ${req.body.user}
        </div> <br> 
        Message: 
        <div style="padding: 10px;border:1px solid black;margin-top:5px;border-radius:10px;">
          ${req.body.message}
        </div>
        `,
    })
    .then((response) => res.status(200).json(response))
    .catch((error) => res.status(400).json(error));
}
