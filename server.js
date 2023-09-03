const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
const path = require("path");
const fs = require("fs");

app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 5000000
  })
);
// Allow CORS requests from any domain
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(bodyParser.json({ limit: "500mb" }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname)));

app.use(function (req, res, next) {
  next();
});

app.post("/data", function (req, res) {
  global.finishedData = req.body;
  res.send(JSON.stringify("Data posted"));
});

app.get("/data", function (req, res) {
  res.send(global.finishedData);
});

app.post("/times", function (req, res) {
  global.finishedTimes = req.body;
  res.send(JSON.stringify("Times posted"));
});

app.get("/times", function (req, res) {
  res.send(global.finishedTimes);
});

app.get("/getUrls", async function (req, res) {
  const myurls = await fetch("https://picsum.photos/v2/list")
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      let urlsArray = [];
      for (const data of json) {
        urlsArray.push(data["download_url"]);
      }
      //console.log(urlsArray);
      return urlsArray;
    })
    .catch((error) => {
      console.error(error);
    });
  console.log(myurls);
  global.urlsArray = myurls;
  res.send(JSON.stringify(myurls));
});

app.get("/images", function (req, res) {
  let imagesList = [];

  fs.readdirSync(path.join(__dirname, "/images")).forEach((file) => {
    imagesList.push(file);
  });

  res.send(imagesList);
});

app.post("/urlArray", function (req, res) {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid JSON data' });
  }

  // Now, "urls" contains the array of URLs from the JSON file
  console.log('Received URLs:', urls);
  global.urlsArray = urls;

});

app.get("/urlArray", function (req, res) {
  if (!global.urlsArray.length) {
    return res.status(404).json({ error: 'No URLs stored yet.' });
  }
  res.send(global.urlsArray);
});
  

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
