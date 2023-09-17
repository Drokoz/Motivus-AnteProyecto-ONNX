//Exececute the program
async function runModel() {
  //Getting options selected
  var modelName = "resnet";
  var modeName = "benchmark";
  const imageSize = 224;
  const arrayExpected = [1, 3, imageSize, imageSize];
  const imagesArray = [];

  console.log("Loading...");
  await loadModel();

  var result;
  console.log("Entering mode: ", modeName);
  switch (modeName) {
    case "benchmark":
      console.log("Running batch mode");
      result = await runBenchmark(
        imageSize,
        arrayExpected,
        imagesArray,
        [],
        modelName
      );
      break;
    case "batch":
      console.log("Running batch mode");
      result = await runBatchModel(
        imageSize,
        arrayExpected,
        imagesArray,
        [],
        modelName
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
