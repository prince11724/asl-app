let sentence = "";
let lastGesture = "";
let lastTime = 0;

let stableGesture = "";
let stableCount = 0;

let lastHandSeenTime = Date.now();
let spaceAdded = false;

const video = document.getElementById("video");
const output = document.getElementById("output");

// ---------------- SPEAK FULL SENTENCE ----------------
function speakSentence() {
  if (!sentence.trim()) return;

  let text = sentence.replace(/\//g, " ");

  let utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// ---------------- HANDS SETUP ----------------
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

// ---------------- ADD GESTURE ----------------
function addGesture(gesture) {
  let now = Date.now();

  if (gesture === lastGesture && now - lastTime < 500) return;

  sentence += gesture + " ";
  output.innerText = sentence.trim();

  lastGesture = gesture;
  lastTime = now;
  spaceAdded = false;
}

// ---------------- STABILITY (FASTER) ----------------
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

  // ⚡ FAST MODE (changed from 12 → 3)
  if (stableCount >= 3) {
    addGesture(gesture);
  }
}

// ---------------- AUTO SPACE ----------------
function autoSpace() {
  let now = Date.now();

  if (now - lastHandSeenTime > 1500 && !spaceAdded && sentence.length > 0) {
    sentence += " / ";
    output.innerText = sentence.trim();
    spaceAdded = true;
  }
}

// ---------------- DETECTION ----------------
hands.onResults((results) => {
  if (results.multiHandLandmarks?.length > 0) {

    lastHandSeenTime = Date.now();

    let lm = results.multiHandLandmarks[0];

    let thumb = lm[4].y < lm[3].y;
    let index = lm[8].y < lm[6].y;
    let middle = lm[12].y < lm[10].y;
    let ring = lm[16].y < lm[14].y;
    let pinky = lm[20].y < lm[18].y;

    let gesture = "Unknown";

    if (thumb && index && middle && ring && pinky) gesture = "Hello";
    else if (!thumb && index && middle && !ring && !pinky) gesture = "Peace";
    else if (!thumb && index && !middle && !ring && !pinky) gesture = "One";
    else if (thumb && !index && !middle && !ring && !pinky) gesture = "Good";
    else if (!thumb && index && middle && ring && pinky) gesture = "Stop";
    else if (thumb && !index && !middle && !ring && pinky) gesture = "Call";

    stableUpdate(gesture);

  } else {
    autoSpace();
  }
});

// ---------------- CAMERA ----------------
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

// ---------------- CLEAR ----------------
function clearSentence() {
  sentence = "";
  output.innerText = "Show gesture...";
  lastGesture = "";
  stableGesture = "";
  stableCount = 0;
  spaceAdded = false;

  window.speechSynthesis.cancel();
}
