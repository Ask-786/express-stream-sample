import express from "express";
import logger from "morgan";
import fs from "fs";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (_, res) => {
  res.send("something else\n");
});

app.get("/video-sync", (_, res) => {
  const path = process.env.FILE_PATH;
  if (!path) return;

  const file = fs.readFileSync(path);

  res.setHeader("Content-Length", file.length);
  res.write(file, "binary");
  res.end();
});

app.get("/video-stream", (req, res) => {
  const videoPath = process.env.FILE_PATH;
  if (!videoPath) return;

  const videoStat = fs.statSync(videoPath);

  const fileSize = videoStat.size;

  const videoRange = req.headers.range;

  if (!videoRange) {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath).pipe(res);
    return;
  }

  const parts = videoRange.replace(/bytes=/, "").split("-");

  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunksize = end - start + 1;

  const file = fs.createReadStream(videoPath, { start, end });

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,

    "Accept-Ranges": "bytes",

    "Content-Length": chunksize,

    "Content-Type": "video/mp4",
  });

  file.pipe(res);
});

app.listen(3000);
