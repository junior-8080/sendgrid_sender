import * as dotenv from 'dotenv';
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import morgan from 'morgan';


const app = express();

app.use(morgan('tiny'))
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = 5000;

app.post("/api/send", async (req, res) => {
  try {
    let content = "";
    let payload = req.body;
    content = `Name:${payload.name}\nEmail: ${payload.email}\nOrganisation: ${payload.company}\nField Of Work: ${payload.field}\nRole: ${payload.role}\nPhone: ${payload.phone}\nMobile: ${payload.mobile}\n
    Message: ${payload.message}\n`;
    const mailData = {
      personalizations: [
        {
          to: [
            { email: "aabdulmukhsin@gmail.com" },
            { email: "hello@plenocarbon.xyz" },
          ],
          subject: "Pleno Waitlist",
        },
      ],
      content: [{ type: "text/plain", value: content }],
      from: { email: "hello@plenocarbon.xyz" },
    };
    const options = {
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
    };

    await axios.post(
      "https://api.sendgrid.com/v3/mail/send",
      mailData,
      options
    );
    return res.status(200).json({
      message: "message sent",
    });
  } catch (error) {
    return res.status(500).json({
      message: "message not sent",
    });
  }
});

app.listen(PORT, () => console.log(`Server runing on PORT ${PORT}`));
