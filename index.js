import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import morgan from "morgan";
import mongoose from "mongoose";
import { exec } from "child_process";

const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// mongodb+srv://aabdulmukhsin:<password>@cluster0.kwfkci5.mongodb.net/?retryWrites=true&w=majority

const PORT = 5000;
const CONNECTION_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// Saving data to mondodb....

const potentialUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  phone: String,
  mobile: String,
  fieldOfWork: String,
  occupation: String,
  message: String,
  submitted_at: String,
});

app.post("/api/send", async (req, res) => {
  try {
    let content = "";
    let payload = req.body;
    content = `Name:${payload.name}\nEmail: ${payload.email}\nOrganisation: ${payload.company}\nField Of Work: ${payload.field}\nRole: ${payload.role}\nPhone: ${payload.phone}\nMobile: ${payload.mobile}\nMessage: ${payload.message}\n`;
    const mailData = {
      personalizations: [
        {
          to: [
            { email: "hello@plenocarbon.xyz" },
            { email: "aabdulmukhsin@gmail.com" },
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

    await saveToMongoDB(payload);
    return res.status(200).json({
      message: "message sent",
    });
  } catch (error) {
    return res.status(500).json({
      message: "message not sent",
    });
  }
});

app.get("/api/download", (req, res) => {
  downloadUsers()
    .then((result) => {
      return res.status(200).download(result);
    })
    .catch((error) => {
      return res.status(500).json({ message: "dowload failed" });
    });
});

async function saveToMongoDB(payload) {
  try {
    const PotentialUser = mongoose.model("PotentialUser", potentialUserSchema);
    const user = new PotentialUser({
      name: payload.name,
      email: payload.email,
      company: payload.company,
      phone: payload.phone,
      mobile: payload.mobile,
      fieldOfWork: payload.field,
      occupation: payload.role,
      message: payload.message,
      submitted_at: new Date(),
    });

    await user.save();
    return "success";
  } catch (error) {
    console.error(error);
    throw "Error saving";
  } finally {
    await mongoose.disconnect();
  }
}

// Download Data

const downloadUsers = () => {
  return new Promise((resolve, reject) => {
    const scan = "--forceTableScan";
    const mongocmd = `mongoexport -u ${process.env.DB_USER}  -p "${process.env.DB_PASSWORD}"  --authenticationDatabase=admin --collection "potentialusers" --db=${process.env.DB_NAME} --csv --host=${process.env.DB_HOST}  --out /tmp`;
    exec(mongocmd, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      return resolve(filePath);
    });
  });
};

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to db:mongodb");
    app.listen(PORT, () => console.log(`Server runing on PORT ${PORT}`));
  })
  .catch((err) => console.log(err));
