// ======================================
// ASL COFFEE SHOP TRANSLATOR - FINAL JS
// ======================================

// ======================
// VARIABLES
// ======================

let lastGesture = "";
let lastGestureTime = 0;

// ======================
// ELEMENTS
// ======================

const video =
    document.querySelector("video");

const gestureText =
    document.getElementById(
        "gestureText"
    );

console.log(
    "Coffee Shop ASL Running..."
);

// ======================
// TEXT TO SPEECH
// ======================

function speakText(text){

    // STOP PREVIOUS SPEECH

    window.speechSynthesis.cancel();

    // REMOVE EMOJIS

    const cleanText =
        text.replace(/[^\w\s]/gi,'');

    // CREATE SPEECH

    const speech =
        new SpeechSynthesisUtterance(
            cleanText
        );

    // VOICE SETTINGS

    speech.lang = "en-IN";

    speech.rate = 0.9;

    speech.pitch = 1;

    speech.volume = 1;

    // SPEAK

    window.speechSynthesis.speak(
        speech
    );

}

// ======================
// UPDATE GESTURE
// ======================

function updateGesture(text){

    const currentTime = Date.now();

    // PREVENT VERY FAST CHANGES

    if(
        text !== lastGesture &&
        currentTime - lastGestureTime > 1500
    ){

        // SHOW TEXT

        gestureText.innerHTML = text;

        // SPEAK TEXT

        speakText(text);

        // SAVE LAST GESTURE

        lastGesture = text;

        lastGestureTime = currentTime;

    }

}

// ======================
// MEDIAPIPE HANDS
// ======================

const hands = new Hands({

    locateFile: (file) => {

        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

    }

});

// ======================
// HAND SETTINGS
// ======================

hands.setOptions({

    maxNumHands:1,

    modelComplexity:1,

    minDetectionConfidence:0.7,

    minTrackingConfidence:0.7

});

// ======================
// HAND RESULTS
// ======================

hands.onResults((results) => {

    // HAND DETECTED

    if(
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ){

        const lm =
            results.multiHandLandmarks[0];

        detectGesture(lm);

    }

    // NO HAND

    else{

        gestureText.innerHTML =
            "Show Gesture...";

    }

});

// ======================
// CAMERA
// ======================

const camera =
    new Camera(video,{

    onFrame: async () => {

        await hands.send({
            image: video
        });

    },

    width:640,

    height:480

});

// START CAMERA

camera.start();

// ======================
// GESTURE DETECTION
// ======================

function detectGesture(lm){

    // ======================
    // FINGER STATES
    // ======================

    const thumbOpen =
        Math.abs(
            lm[4].x - lm[2].x
        ) > 0.1;

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

    // ======================
    // I WANT COFFEE ☕
    // ALL FINGERS OPEN
    // ======================

    if(
        thumbOpen &&
        indexOpen &&
        middleOpen &&
        ringOpen &&
        pinkyOpen
    ){

        updateGesture(
            "I Want Coffee ☕"
        );

    }

    // ======================
    // HOW MUCH 💰
    // PEACE SIGN
    // ======================

    else if(
        !thumbOpen &&
        indexOpen &&
        middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ){

        updateGesture(
            "How Much? 💰"
        );

    }

    // ======================
    // CAPPUCCINO ☕
    // ONE FINGER
    // ======================

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

    // ======================
    // OKAY 👍
    // THUMBS UP
    // ======================

    else if(
        thumbOpen &&
        !indexOpen &&
        !middleOpen &&
        !ringOpen &&
        !pinkyOpen
    ){

        updateGesture(
            "Okay 👍"
        );

    }

    // ======================
    // THANK YOU ❤️
    // CALL ME SIGN
    // ======================

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

    // ======================
    // BILL PLEASE 🧾
    // CLOSED FIST
    // ======================

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

    // ======================
    // UNKNOWN
    // ======================

    else{

        updateGesture(
            "Gesture Not Recognized"
        );

    }

}

// ======================
// CLEAR BUTTON
// ======================

document.getElementById(
    "clearBtn"
).onclick = function(){

    gestureText.innerHTML =
        "Show Gesture...";

    lastGesture = "";

};
