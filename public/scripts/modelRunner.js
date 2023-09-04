//import { download, onDownload } from "./downloader.js";

//Section of run model

//General run model, recibe a tensor and run it
async function runOnnxModel(tensor) {
  const input = new String(session.inputNames[0]);
  const feeds = { [input]: tensor };

  //console.log("printing session");
  // Run model with Tensor inputs and get the result.
  const result = await session.run(feeds);
  //onDownload(result, "output.json");
  return result;
}

//Run the onnx model from the image loaded in page
async function runSingleModel(imageSize, arrayExpected, modelName) {
  var startTime = performance.now();
  const tensor = await getTensorFromImage(imageSize, arrayExpected, modelName);
  var startTime2 = performance.now();
  const result = await runOnnxModel(tensor);
  var finishTime2 = performance.now() - startTime2;
  console.log("Tiempo procesado en ejecución modelo: ", finishTime2);
  console.log("Tiempo procesado total: ", finishTime);
  var finishTime = performance.now() - startTime;
  console.log("Tiempo procesado total: ", finishTime);
  return result;
}

//Run the model obtaining a batch or an image from an url
async function runBatchModel(
  imageSize,
  arrayExpected,
  imagesArray,
  urlArray,
  modelName
) {
  if (urlArray.length === 0) {
    console.log("Obteniendo arreglo");
    var response = await fetch("http://localhost:3001/urlArray");
    console.log(response);
    console.log(response.json())
    urlArray = urlArray.concat(["https://i.imgur.com/b0rgmfl.jpg",
    "https://i.imgur.com/T0wfmza.jpg",
    "https://i.imgur.com/pX4HIwE.jpg",
    "https://i.imgur.com/Mh0CzBL.jpg",
    "https://i.imgur.com/ShJfWWk.jpg"]);
  }
  console.log("Arreglo obtenido: ");
  console.log(JSON.stringify(urlArray));
  let times = {};
  var startTime = performance.now();
  var timeImageArray = performance.now();
  var imageArray = imagesArray;

  console.log("Obteniendo imagenes");
  if (imagesArray.length === 0) {
    imageArray = await getImagesArray(urlArray);
  }
  var FTimeImageArray = performance.now() - timeImageArray;
  times["images"] = FTimeImageArray;
  console.log("Tiempo procesado en fetch de imágenes: ", FTimeImageArray);
  //console.log(imageArray);

  console.log("Obteniendo tensor");
  var timeTensor = performance.now();
  const tensorImages = await getTensorFromBatch(
    imageSize,
    imageArray,
    arrayExpected,
    modelName
  );
  var FTimeTensor = performance.now() - timeTensor;
  times["tensor"] = FTimeTensor;
  console.log("Tiempo procesado en tensor de imágenes: ", FTimeTensor);

  var timeRunModel = performance.now();
  const result = await runOnnxModel(tensorImages);
  var FtimeRunModel = performance.now() - timeRunModel;
  times["model"] = FtimeRunModel;
  console.log("Tiempo procesado en ejecución de modelo: ", FtimeRunModel);
  var finishTime = performance.now() - startTime;
  times["total"] = finishTime;
  console.log("Tiempo procesado total: ", finishTime);
  //postJSON(result, "http://localhost:3001/data");
  return times;
}

//Run a benchmark of repetition with up to 5 images in batch
//Goes from 1 image to 5 images
async function runBenchmark(
  imageSize,
  arrayExpected,
  url,
  urlArray,
  modelName
) {
  //console.log(width, height);

  //Create arrays than will have the json
  var timesJson = [];
  var timesJsonAvg = [];
  const urlsArray = await (await fetch("http://localhost:3001/getUrls")).json();
  const imagesArray = await getImagesArray(urlsArray);
  //console.log(imagesArray.length);
  //console.log(imagesArray);
  //Start the repetitions
  for (let rep = 1; rep < imagesArray.length + 1; rep++) {
    if (rep == 8) {
      break;
    }
    let urlArray = imagesArray.slice(0, rep);
    console.log("Testing with: ", urlArray.length, " images");

    //console.log(urlArray);
    //create json for each repetition
    timesJson[rep - 1] = await runBatchModel(
      imageSize,
      arrayExpected,
      urlArray,
      urlArray,
      modelName
    );
  }
  //Saving documents to json file to be proccesed
  await postJSON(timesJson, "http://localhost:3001/times");
  console.log("Json Times: ", timesJson);
  await onDownload(timesJson, modelName + "-" + "wasm-browser" + ".json");
  console.log("Download ready");
  //   onDownload(timesJsonAvg, "avg-" + modelName + "-" + backend + ".json");
}
//Obtains an array of images connecting to an url
async function getImagesArray(urls) {
  let imgArray = [];
  if (urls[0].includes("localhost")) {
    fetch(urls[0], {
      method: "GET"
    })
      .then((response) => response.json())
      .then((imagesList) => {
        imagesList.forEach((filename) => {
          fetch(`${url}/${filename}`)
            .then((response) => response.blob())
            .then((imageBlob) => {
              // Create a new Image object
              var image = new Image();

              // Set the src property to the URL created from the blob using createObjectURL()
              image.src = URL.createObjectURL(imageBlob);

              // Once the image has loaded, you can display it on the page
              image.onload = function () {
                // Add the image to the DOM
                image.width = this.width;
                image.height = this.height;
                //document.body.appendChild(image);
                imgArray.push(image);
              };
            })
            .catch((error) => {
              console.error(error);
            });
        });
      })
      .catch((error) => {
        console.error(error);
      });
    //Using a link/links to get images
  } else {
    for (const url of urls) {
      console.log("fetching");
      const image = await fetchUrl(url);
      imgArray.push(image);
    }
  }
  console.log(imgArray);

  return imgArray;
}

//function to use to fetch url and get the image
async function fetchUrl(url) {
  const image = await fetch(url)
    .then((response) => {
      console.log("response");
      return response.blob();
    })
    .then((imageBlob) => {
      // Create a new Image object
      //console.log(imageBlob);
      var image = new Image();

      // Set the src property to the URL created from the blob using createObjectURL()
      image.src = URL.createObjectURL(imageBlob);

      // Once the image has loaded, you can display it on the page
      image.onload = function () {
        // Add the image to the DOM
        //console.log(this.width);
        image.width = this.width;
        image.height = this.height;
        //document.body.appendChild(image);
      };
      return image;
    })
    .catch((error) => {
      console.error(error);
    });
  //console.log(image);
  return image;
}
//console.log(imgArray);
