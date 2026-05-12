```javascript id="f7m2qx"
// ===============================
// ASL TRANSLATOR - FINAL JS CODE
// ===============================

let lastGesture = "";
let lastDetectedTime = 0;

const video = document.getElementById("video");
const output = document.getElementById("output");

console.log("ASL Translator Running...");

// ===============================
// MEDIAPIPE HANDS SETUP
// ===============================

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

// HAND SETTINGS

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// ===============================
// HAND DETECTION RESULTS
// ===============================

hands.onResults((results) => {

    // HAND DETECTED

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks =
            results.multiHandLandmarks[0];

        // DETECT GESTURE

        const gesture =
            detectGesture(landmarks);

        const currentTime = Date.now();

    function updateGesture(text){

    if(
        text !== lastGesture &&
        currentTime - lastGestureTime > 1500
    ){

        gestureText.innerHTML = text;

        lastGesture = text;

        lastGestureTime = currentTime;
    }

}
        // SHOW GESTURE

        if (gesture !== "Unknown") {

            output.innerText = gesture;

            // SPEAK ONLY IF NEW

            if (
                gesture !== lastGesture ||
                currentTime - lastDetectedTime > 2000
            ) {

                speak(gesture);

                lastGesture = gesture;

                lastDetectedTime = currentTime;
            }

        }

        else {

            output.innerText =
                "Gesture Not Recognized";

        }

    }

    // NO HAND DETECTED

    else {

        output.innerText =
            "Show Gesture...";

    }

});

// ===============================
// CAMERA START
// ===============================

const camera = new Camera(video, {

    onFrame: async () => {

        await hands.send({
            image: video
        });

    },

    width: 640,
    height: 480

});

// START CAMERA

camera.start();

// ===============================
// GESTURE DETECTION FUNCTION
// ===============================

function detectGesture(lm) {

    // ===========================
    // FINGER STATES
    // ===========================

    const thumbOpen =
        Math.abs(lm[4].x - lm[2].x) > 0.1;

    const indexOpen =
        lm[8].y < lm[6].y;

    const middleOpen =
        lm[12].y < lm[10].y;

    const ringOpen =
        lm[16].y < lm[14].y;

    const pinkyOpen =
        lm[20].y < lm[18].y;

    console.log(
        thumbOpen,
        indexOpen,
        middleOpen,
        ringOpen,
        pinkyOpen
    );

    // ===========================
    // HELLO ✋
    // ===========================

    if (
        thumbOpen &&
        indexOpen &&
        middleOpen &&
        ringOpen &&
        pinkyOpen
    ) {

        return "HELLO ✋";

    }

    // ===========================
    // PEACE ✌️
    // ===========================

    if (
        !thumbOpen &&
        indexOpen &&
        middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ) {

        return "PEACE ✌️";

    }

    // ===========================
    // ONE ☝️
    // ===========================

    if (
        !thumbOpen &&
        indexOpen &&
        !middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ) {

        return "ONE ☝️";

    }

    // ===========================
    // GOOD 👍
    // ===========================

    if (
        thumbOpen &&
        !indexOpen &&
        !middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ) {

        return "GOOD 👍";

    }

    // ===========================
    // STOP ✋
    // ===========================

    if (
        !thumbOpen &&
        indexOpen &&
        middleOpen &&
        ringOpen &&
        pinkyOpen
    ) {

        return "STOP ✋";

    }

    // ===========================
    // CALL ME 🤙
    // ===========================

    if (
        thumbOpen &&
        !indexOpen &&
        !middleOpen &&
        !ringOpen &&
        pinkyOpen
    ) {

        return "CALL ME 🤙";

    }

    // ===========================
    // UNKNOWN
    // ===========================

    return "Unknown";

}

// ===============================
// CLEAR BUTTON FUNCTION
// ===============================

function clearSentence() {

    output.innerText =
        "Show Gesture...";

    lastGesture = "";

}

// ===============================
// TEXT TO SPEECH
// ===============================

function speak(text) {

    // STOP PREVIOUS SPEECH

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance();

    speech.text = text;

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

}
```
