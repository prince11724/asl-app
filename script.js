let sentence = "";
let lastGesture = "";
let lastAddedTime = 0;

let stableGesture = "";
let stableCount = 0;

let lastHandSeenTime = Date.now();
let spaceAdded = false;

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
  modelComplexity: 0,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// 🔊 SPEAK FULL SENTENCE (IMPORTANT FIX)
function speakSentence() {
  if (!sentence.trim()) return;

  let textToSpeak = sentence.replace(/\//g, " ");

  let utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Add gesture only if stable + cooldown
function addGesture(gesture) {
  let now = Date.now();

  if (gesture === lastGesture && now - lastAddedTime < 1500) {
    return;
  }

  sentence += gesture + " ";
  output.innerText = sentence.trim();

  lastGesture = gesture;
  lastAddedTime = now;

  spaceAdded = false;
}

// Stable gesture detection
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

  if (stableCount === 12) {
    addGesture(gesture);
  }
}

// Auto space if hand disappears
function autoSpace() {
  let now = Date.now();

  if (now - lastHandSeenTime > 2000 && !spaceAdded && sentence.length > 0) {
    sentence += " / ";
    output.innerText = sentence.trim();
    spaceAdded = true;

    // 🔊 OPTIONAL: auto speak full sentence
    speakSentence();
  }
}

hands.onResults(results => {

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

    lastHandSeenTime = Date.now();

    const landmarks = results.multiHandLandmarks[0];
    let gesture = detectGesture(landmarks);

    stableUpdate(gesture);

  } else {
    autoSpace();
  }
});

// Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 480,
  height: 360
});

camera.start();

// Gesture detection
function detectGesture(lm) {

  let thumb = lm[4].y < lm[3].y;
  let index = lm[8].y < lm[6].y;
  let middle = lm[12].y < lm[10].y;
  let ring = lm[16].y < lm[14].y;
  let pinky = lm[20].y < lm[18].y;

  if (thumb && index && middle && ring && pinky) return "Hello";
  if (!thumb && index && middle && !ring && !pinky) return "Peace";
  if (!thumb && index && !middle && !ring && !pinky) return "One";
  if (thumb && !index && !middle && !ring && !pinky) return "Good";
  if (!thumb && index && middle && ring && pinky) return "Stop";
  if (thumb && !index && !middle && !ring && pinky) return "Call me";

  return "Unknown";
}

// Clear everything
function clearSentence() {
  sentence = "";
  output.innerText = "Show gesture...";
  lastGesture = "";
  stableGesture = "";
  stableCount = 0;
  spaceAdded = false;

  window.speechSynthesis.cancel();
}

// 🟢 BUTTON FUNCTION (ADD THIS IN HTML BUTTON)
function speakNow() {
  speakSentence();
}
