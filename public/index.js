//Exececute the program
async function runModel() {
  //Getting options selected
  var modelName = "resnet";
  var modeName = "batch";
  const imageSize = 224;
  const arrayExpected = [1, 3, imageSize, imageSize];
  const imagesArray = [];
  const urlsArray = [];
  const urlArray = [];
  const warm = false;

  console.log("Loading...");
  await loadModel();

  console.log("warming up...");
  await await runBatchModel(
    imageSize,
    arrayExpected,
    imagesArray,
    ["https://picsum.photos/id/0/5000/3333"],
    modelName,
    true
  );

  var result;
  console.log("Entering mode: ", modeName);
  switch (modeName) {
    case "benchmark":
      console.log("Running bench mode");
      result = await runBenchmark(
        imageSize,
        arrayExpected,
        imagesArray,
        urlsArray,
        modelName
      );
      break;
    case "batch":
      console.log("Running batch mode");
      result = await runBatchModel(
        imageSize,
        arrayExpected,
        imagesArray,
        urlArray,
        modelName,
        warm
      );
      break;
    default:
      console.log("Running single mode");
      result = await runSingleModel(imageSize, arrayExpected, modelName);
  }

  console.log("Inference completed");
  return result;
}

// Create an ONNX inference session with WebGL backend.
// Can be 'cpu', 'wasm' or 'webgl
async function loadModel() {
  //Session options to load
  const sessionOptions = {
    executionProviders: ["wasm"],
    enableProfiling: true
  };

  session = await ort.InferenceSession.create(
    "./model.onnx",
    sessionOptions
  );

  console.log("Model Loaded");
}
