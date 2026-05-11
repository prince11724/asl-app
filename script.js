let sentence = "";
let lastGesture = "";
let lastAddedTime = 0;

let stableGesture = "";
let stableCount = 0;

const video = document.getElementById("video");
const output = document.getElementById("output");

console.log("App running...");

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,  // LOWER = FASTER
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Add gesture only if stable + cooldown
function addGesture(gesture) {
  let now = Date.now();

  // cooldown 1.5 sec to avoid repetition
  if (gesture === lastGesture && now - lastAddedTime < 1500) {
    return;
  }

  // add to sentence
  sentence += " " + gesture;
  output.innerText = sentence.trim();

  lastGesture = gesture;
  lastAddedTime = now;
}

// Stable gesture logic
function stableUpdate(gesture) {
  if (gesture === "Unknown") {
    stableGesture = "";
    stableCount = 0;
    return;
  }

  if (gesture === stableGesture) {
    stableCount++;
  } else {
    stableGesture = gesture;
    stableCount = 1;
  }

  // gesture must appear stable for 12 frames
  if (stableCount === 12) {
    addGesture(gesture);
  }
}

hands.onResults(results => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    let gesture = detectGesture(landmarks);

    stableUpdate(gesture);
  }
});

// Camera settings (lower resolution = less lag)
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 480,
  height: 360
});

camera.start();

function detectGesture(lm) {
  let thumb = lm[4].y < lm[3].y;
  let index = lm[8].y < lm[6].y;
  let middle = lm[12].y < lm[10].y;
  let ring = lm[16].y < lm[14].y;
  let pinky = lm[20].y < lm[18].y;

  // ✋ All fingers up
  if (thumb && index && middle && ring && pinky) return "Hello";

  // ✌️ Two fingers
  if (!thumb && index && middle && !ring && !pinky) return "Peace";

  // ☝️ One finger
  if (!thumb && index && !middle && !ring && !pinky) return "One";

  // 👍 Thumb up
  if (thumb && !index && !middle && !ring && !pinky) return "Good";

  // ✋ Stop (palm open without thumb)
  if (!thumb && index && middle && ring && pinky) return "Stop";

  // 🤙 (thumb + pinky)
  if (thumb && !index && !middle && !ring && pinky) return "Call me";

  return "Unknown";
}

function clearSentence() {
  sentence = "";
  output.innerText = "Show gesture...";
  lastGesture = "";
  stableGesture = "";
  stableCount = 0;
}
