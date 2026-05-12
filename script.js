let sentence = "";
let lastGesture = "";
let lastDetectedTime = 0;

const video = document.getElementById("video");
const output = document.getElementById("output");

console.log("ASL Translator Running...");

/* =========================
   MEDIAPIPE HANDS
========================= */

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

/* =========================
   RESULTS
========================= */

hands.onResults((results) => {

    if(results.multiHandLandmarks &&
       results.multiHandLandmarks.length > 0){

        const landmarks = results.multiHandLandmarks[0];

        const gesture = detectGesture(landmarks);

        const currentTime = Date.now();

        // Prevent repeating same gesture quickly
        if(
            gesture !== "Unknown" &&
            gesture !== lastGesture &&
            currentTime - lastDetectedTime > 2000
        ){

            sentence += " " + gesture;

            output.innerText = sentence;

            speak(gesture);

            lastGesture = gesture;

            lastDetectedTime = currentTime;
        }

    }
});

/* =========================
   CAMERA
========================= */

const camera = new Camera(video,{
    onFrame: async () => {
        await hands.send({ image: video });
    },
    width: 640,
    height: 480
});

camera.start();

/* =========================
   GESTURE DETECTION
========================= */

function detectGesture(lm){

    // Finger states
    const thumb =
        lm[4].x < lm[3].x;

    const index =
        lm[8].y < lm[6].y;

    const middle =
        lm[12].y < lm[10].y;

    const ring =
        lm[16].y < lm[14].y;

    const pinky =
        lm[20].y < lm[18].y;

    /* =====================
       OPEN PALM
    ===================== */

    if(thumb && index && middle && ring && pinky){

        return "Hello";

    }

    /* =====================
       PEACE
    ===================== */

    if(!thumb && index && middle && !ring && !pinky){

        return "Peace";

    }

    /* =====================
       ONE
    ===================== */

    if(!thumb && index && !middle && !ring && !pinky){

        return "One";

    }

    /* =====================
       THUMBS UP
    ===================== */

    if(
        thumb &&
        !index &&
        !middle &&
        !ring &&
        !pinky
    ){

        return "Good";

    }

    /* =====================
       STOP
    ===================== */

    if(
        !thumb &&
        index &&
        middle &&
        ring &&
        pinky
    ){

        return "Stop";

    }

    /* =====================
       CALL ME
    ===================== */

    if(
        thumb &&
        !index &&
        !middle &&
        !ring &&
        pinky
    ){

        return "Call Me";

    }

    return "Unknown";
}

/* =========================
   CLEAR BUTTON
========================= */

function clearSentence(){

    sentence = "";

    output.innerText = "Show Gesture...";

    lastGesture = "";
}

/* =========================
   TEXT TO SPEECH
========================= */

function speak(text){

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}
