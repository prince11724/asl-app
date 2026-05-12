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

    const currentTime = Date.now();

    if(
        text !== lastGesture &&
        currentTime - lastGestureTime > 1500
    ){

        // Show text

        gestureText.innerHTML = text;

        // Speak text

        speakText(text);

        // Save gesture

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

   /* =====================
   HELLO
===================== */

if(
    thumbOpen &&
    indexOpen &&
    middleOpen &&
    ringOpen &&
    pinkyOpen
){

    updateGesture(
        "I WANT COFFEE 👋"
    );

}

/* =====================
   COFFEE
===================== */

else if(
    thumbOpen &&
    indexOpen &&
    middleOpen &&
    !ringOpen &&
    !pinkyOpen
){

    updateGesture(
        "HOW MUCH?"
    );

}

/* =====================
   CAPPUCCINO
===================== */

else if(
    !thumbOpen &&
    indexOpen &&
    !middleOpen &&
    !ringOpen &&
    !pinkyOpen
){

    updateGesture(
        "One Cappuccino Please ☕"
    );

}

/* =====================
   HOW MUCH
===================== */

else if(
    thumbOpen &&
    !indexOpen &&
    !middleOpen &&
    !ringOpen &&
    !pinkyOpen
){

    updateGesture(
        "OKAY"
    );

}

/* =====================
   THANK YOU
===================== */

else if(
    thumbOpen &&
    !indexOpen &&
    !middleOpen &&
    !ringOpen &&
    pinkyOpen
){

    updateGesture(
        "Thank You ❤️"
    );

}

/* =====================
   BILL PLEASE
===================== */

else if(
    !thumbOpen &&
    !indexOpen &&
    !middleOpen &&
    !ringOpen &&
    !pinkyOpen
){

    updateGesture(
        "Bill Please 🧾"
    );

}

else{

    updateGesture(
        "Gesture Not Recognized"
    );

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
