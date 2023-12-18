//import { download, onDownload } from "./downloader.js";

//Section of run model

//General run model, recibe a tensor and run it
async function runOnnxModel(tensor, warm) {
  const input = new String(session.inputNames[0]);
  const output = new String(session.outputNames[0]);
  const feeds = { [input]: tensor };

  //console.log("printing session");
  // Run model with Tensor inputs and get the result.
  const result = await session.run(feeds);
  console.log(warm);
  if (warm) {
    onDownload(result[output], "output.json");
  }
  
  return result;
}

//Run the onnx model from the image loaded in page
async function runSingleModel(imageSize, arrayExpected, modelName) {
  var startTime = performance.now();
  const tensor = await getTensorFromImage(imageSize, arrayExpected, modelName);
  var startTime2 = performance.now();
  const result = await runOnnxModel(tensor, false);
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
  modelName,
  warm
) {
  if (urlArray.length === 0) {
    console.log("Obteniendo arreglo");
    var response = await fetch("http://localhost:3001/urlArray");
    console.log(response);
    var response_fullfiled = await response.json();
    console.log(response_fullfiled);
    urlArray = urlArray.concat(response_fullfiled);
    console.log("Arreglo obtenido: ");
    console.log(JSON.stringify(urlArray));
  }

  let times = {};
  var startTime = performance.now();
  var timeImageArray = performance.now();
  var imageArray = imagesArray;

  if (imageArray.length === 0) {
    console.log("Obteniendo imagenes");
    imageArray = await getImagesArray(urlArray);
  }
  var FTimeImageArray = performance.now() - timeImageArray;
  times["images"] = FTimeImageArray / 1000;
  console.log("Tiempo procesado en fetch de imágenes: ", FTimeImageArray);
  console.log(imageArray);

  console.log("Obteniendo tensor");
  var timeTensor = performance.now();
  const tensorImages = await getTensorFromBatch(
    imageSize,
    imageArray,
    arrayExpected,
    modelName
  );
  var FTimeTensor = performance.now() - timeTensor;

  //Getting size of memory
  const tensorMemory = new Blob([JSON.stringify(tensorImages)], { type: 'application/json' });
  console.log("Memoria utilizada tensor de imágenes: ",tensorMemory.size);
  times["memory"] = tensorMemory.size;

  times["tensor"] = FTimeTensor / 1000;
  console.log("Tiempo procesado en tensor de imágenes: ", FTimeTensor);

  var timeRunModel = performance.now();
  const result = await runOnnxModel(tensorImages, warm);
  console.log(result);
  var FtimeRunModel = performance.now() - timeRunModel;
  times["model"] = FtimeRunModel / 1000;
  console.log("Tiempo procesado en ejecución de modelo: ", FtimeRunModel);
  var finishTime = performance.now() - startTime;
  times["total"] = finishTime / 1000; 
  console.log("Tiempo procesado total: ", finishTime);
  postJSON(result, "http://localhost:3001/data");
  return times;
}

//Run a benchmark of repetition with up to 5 images in batch
//Goes from 1 image to 5 images
async function runBenchmark(
  imageSize,
  arrayExpected,
  imagesArray,
  urlsArray,
  modelName
) {
  urlsArray = [
    "https://picsum.photos/id/0/5000/3333",
    "https://picsum.photos/id/1/5000/3333",
    "https://picsum.photos/id/2/5000/3333",
    "https://picsum.photos/id/3/5000/3333",
    "https://picsum.photos/id/4/5000/3333",
    "https://picsum.photos/id/5/5000/3334",
    "https://picsum.photos/id/6/5000/3333",
    "https://picsum.photos/id/7/4728/3168",
    "https://picsum.photos/id/8/5000/3333",
    "https://picsum.photos/id/9/5000/3269",
    "https://picsum.photos/id/10/2500/1667",
    "https://picsum.photos/id/11/2500/1667",
    "https://picsum.photos/id/12/2500/1667",
    "https://picsum.photos/id/13/2500/1667",
    "https://picsum.photos/id/14/2500/1667",
    "https://picsum.photos/id/15/2500/1667",
    "https://picsum.photos/id/16/2500/1667",
    "https://picsum.photos/id/17/2500/1667",
    "https://picsum.photos/id/18/2500/1667",
    "https://picsum.photos/id/19/2500/1667",
    "https://picsum.photos/id/20/3670/2462",
    "https://picsum.photos/id/21/3008/2008",
    "https://picsum.photos/id/22/4434/3729",
    "https://picsum.photos/id/23/3887/4899",
    "https://picsum.photos/id/24/4855/1803",
    "https://picsum.photos/id/25/5000/3333",
    "https://picsum.photos/id/26/4209/2769",
    "https://picsum.photos/id/27/3264/1836",
    "https://picsum.photos/id/28/4928/3264",
    "https://picsum.photos/id/29/4000/2670"
];

  console.log("Obteniendo arreglo benchmark");
  console.log(urlsArray);
  imagesArray = await getImagesArray(urlsArray);
  console.log(imagesArray.length);
  console.log(imagesArray);
  //console.log(width, height);

  for (let i = 1; i < 11; i++) {

    //Create arrays than will have the json
    var timesJson = [];
    var timesJsonAvg = [];
    
    //Start the repetitions
    for (let rep = 1; rep < 21; rep++) {
      let urlArray = urlsArray;
      let imageArray = imagesArray.slice(0, rep);
      console.log("Testing with: ", imageArray.length, " images");

      console.log(imageArray);
      //create json for each repetition
      timesJson[rep - 1] = await runBatchModel(
        imageSize,
        arrayExpected,
        imageArray,
        urlArray,
        modelName,
        false
      );
    }
    //Saving documents to json file to be proccesed
    //await onDownload(timesJson, modelName + "-" + "wasm-browser" + ".json");
    await postJSON(timesJson, "http://localhost:3001/times");
    //console.log("Json Times: ", timesJson);
    //fs.writeFileSync("./times/resnet-wasm-docker" + rep.toString() +".json", JSON.stringify(resT));
    imageArray = [];
  }
}
//Obtains an array of images connecting to an url
async function getImagesArray(urls) {
  let imgArray = [];
  for (const url of urls) {
    const image = await fetchUrl(url);
    imgArray.push(image);
  }
  //console.log(imgArray);

  return imgArray;
}

//function to use to fetch url and get the image
async function fetchUrl(url) {
  const image = await fetch(url)
    .then((response) => {
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
