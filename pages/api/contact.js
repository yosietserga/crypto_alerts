import nodemailer from "nodemailer";

require("dotenv").config();

const user = process.env.user;
const pass = process.env.pass;

export default function handler(req, res) {
  console.log(req.body);
  
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user,
      pass,
    },
    secure: true,
  });
  const mailData = {
    from: req.body.email,
    to: "informaciones@ganasafi.com.bo",
    subject: `Ganasafi Contacto From ${req.body.name}`,
    text: req.body.message + " | Sent from: " + req.body.email,
    html: `<div>${req.body.message}</div><p>Sent from:${req.body.email}</p>`,
  };
  try {
    transporter.sendMail(mailData, function (err, info) {
      if (err) res.status(500).json({ error: err });
      else res.status(200).json({ result: "OK", payload: info });
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
