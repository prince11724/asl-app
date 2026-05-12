let sentence = "";
let lastGesture = "";
let lastTime = 0;
let lastSpeakTime = 0;
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
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(results => {
  console.log(results); // 👈 ADD THIS

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    console.log("Hand detected"); // 👈 ADD THIS

    const landmarks = results.multiHandLandmarks[0];
    let gesture = detectGesture(landmarks);

if (gesture !== "Unknown" && gesture !== lastGesture) {
  sentence += " " + gesture;
  output.innerText = sentence;
  lastGesture = gesture;
  speak(gesture);
}
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

function detectGesture(lm) {

  let thumb = lm[4].y < lm[3].y;
  let index = lm[8].y < lm[6].y;
  let middle = lm[12].y < lm[10].y;
  let ring = lm[16].y < lm[14].y;
  let pinky = lm[20].y < lm[18].y;

  // ✋ All fingers up
  if (thumb && index && middle && ring && pinky) return "Hello  Pinky  ye app aapke bete ne banaya hai ";

  // ✌️ Two fingers
  if (!thumb && index && middle && !ring && !pinky) return "Peace";

  // ☝️ One finger
  if (!thumb && index && !middle && !ring && !pinky) return "One";

  // 👍 Thumb up
  if (thumb && !index && !middle && !ring && !pinky) return " pinky ji aap apne bete ko maara mat karo";

  // ✋ Stop (palm open without thumb)
  if (!thumb && index && middle && ring && pinky) return "Stop";

  // 🤙 (thumb + pinky)
  if (thumb && !index && !middle && !ring && pinky) return "Call me";

  return "Unknown";
}
function clearSentence() {
  sentence = "";
  output.innerText = "";
}
function speak(text) {
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.lang = "en-US"; // you can change to "hi-IN" for Hindi
  speech.rate = 1; // speed
  speech.pitch = 1; // voice tone

  window.speechSynthesis.speak(speech);
}
