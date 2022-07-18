import crypto from "crypto";
import fs from "fs";
import path from "path";
import Busboy from "busboy";
import { log } from "../../../utils/common";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    let image = "";
    const buffers = [];
    const hash = crypto.createHash("md5");
    let fileName = "";
    let fileSize = 0;
    let completed = false;

    const getBuffer = () => Buffer.concat(buffers, fileSize);

    const dataHandler = (data) => {
      if (completed === true) {
        log(
          `Error: data chunk for completed upload!`
        );
        return;
      }
      buffers.push(data);
      hash.update(data);
      fileSize += data.length;
      log(`Uploading bytes:${fileSize}...`);
    };

    //upload dir
    const d = new Date();
    const subdir = d.getMonth() + "-" + d.getFullYear() + "/";
    const uploadDir = path.join(
      __dirname + "../../../../../../public/uploads/" + subdir
    );

    //create upload dir if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }
    
    //parse form data
    const busboy = new Busboy(req);
    busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
      log({ fieldname, file, filename, encoding, mimetype });
      fileName = filename;
      file.on("data", function (data) {
        dataHandler(data);
      });
      
      file.on("end", function () {
        image = subdir + filename;
      });
    });

    busboy.on("finish", function () {
      //write and save image file
      fs.writeFile(uploadDir + fileName, getBuffer(), (err) => {
        if (err) return log(err);
      });

      res.status(200).json({
        result: "OK",
        image,
      });
    });

    req.pipe(busboy);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
