const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
const path = require("path");
const fs = require("fs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 5000000
}));
app.use(bodyParser.json({ limit: "500mb" }));

// Allow CORS requests from any domain
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use((req, res, next) => {
  next();
});

app.post("/data", (req, res) => {
  global.finishedData = req.body;
  res.send(JSON.stringify("Data posted"));
});

app.get("/data", (req, res) => {
  res.send(global.finishedData);
});

app.post("/times", (req, res) => {
  global.finishedTimes = req.body;
  res.send(JSON.stringify("Times posted"));
});

app.get("/times", (req, res) => {
  res.send(global.finishedTimes);
});

app.get("/getUrls", async (req, res) => {
  try {
    const response = await fetch("https://picsum.photos/v2/list");
    const json = await response.json();
    let urlsArray = [];
    for (const data of json) {
      urlsArray.push(data["download_url"]);
    }
    global.urlsArray = urlsArray;
    res.send(JSON.stringify(urlsArray));
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching URLs' });
  }
});

app.get("/images", (req, res) => {
  let imagesList = [];
  fs.readdirSync(path.join(__dirname, "/images")).forEach((file) => {
    imagesList.push(file);
  });
  res.send(imagesList);
});

app.post("/urlArray", (req, res) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid JSON data' });
  }
  console.log('Received URLs:', urls);
  global.urlsArray = urls;
  return res.status(200).json({ OK: 'file received' });
});

app.get("/urlArray", (req, res) => {
  if (!global.urlsArray || !global.urlsArray.length) {
    return res.status(404).json({ error: 'No URLs stored yet.' });
  }
  res.send(global.urlsArray);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
