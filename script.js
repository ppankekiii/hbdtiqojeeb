/* ======================================
   ELEMENTS
====================================== */
const lockscreen = document.getElementById("lockscreen");
const passcodeScreen = document.getElementById("passcode-screen");
const clock = document.getElementById("clock");
const dateText = document.getElementById("date");
const dots = document.querySelectorAll("#password-dots span");
const keys = document.querySelectorAll("#keypad button");
const gallery = document.getElementById("gallery");
const slides = document.querySelectorAll(".slide");
const counter = document.getElementById("counter");
const song = document.getElementById("birthday-song");
const swipeArea = document.getElementById("swipe-area");

/* ======================================
   REAL TIME CLOCK
====================================== */
function updateClock() {
    const now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();

    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;

    clock.innerText = `${hour}:${minute}`;

    dateText.innerText = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}

setInterval(updateClock, 1000);
updateClock();

/* ======================================
   PASSCODE SCREEN TRIGGER
====================================== */
function showPasscode(e) {
    if (e) e.stopPropagation();
    lockscreen.classList.add("slide-up");
    passcodeScreen.classList.add("show");
}

// Click and touch triggers for lockscreen and swipe area
lockscreen.addEventListener("click", showPasscode);
if (swipeArea) {
    swipeArea.addEventListener("click", showPasscode);
    swipeArea.addEventListener("touchstart", (e) => {
        showPasscode(e);
    }, { passive: true });
}

/* ======================================
   AUDIO SETUP FOR IOS / IPHONE
====================================== */
let isAudioUnlocked = false;

function unlockIOSAudio() {
    if (!isAudioUnlocked && song) {
        song.volume = 0.7;
        song.play().then(() => {
            song.pause();
            song.currentTime = 0;
            isAudioUnlocked = true;
        }).catch((err) => {
            console.log("Waiting for user interaction to play audio:", err);
        });
    }
}

function playMusic() {
    if (song) {
        song.volume = 0.7;
        song.currentTime = 0;
        
        const playPromise = song.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log("Auto-play prevented. Playing on next user interaction.");
                document.body.addEventListener("click", () => {
                    song.play();
                }, { once: true });
            });
        }
    }
}

/* ======================================
   PASSWORD SYSTEM
====================================== */
const correctPassword = "281006";
let enteredPassword = "";

keys.forEach(key => {
    const handleKeyPress = (e) => {
        e.stopPropagation();
        unlockIOSAudio();

        let number = key.innerText.trim();

        if (number === "⌫") {
            enteredPassword = enteredPassword.slice(0, -1);
            updateDots();
            return;
        }

        if (enteredPassword.length < 6) {
            enteredPassword += number;
            updateDots();

            if (enteredPassword.length === 6) {
                setTimeout(checkPassword, 300);
            }
        }
    };

    key.addEventListener("click", handleKeyPress);
    key.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleKeyPress(e);
    }, { passive: false });
});

function updateDots() {
    dots.forEach((dot, index) => {
        if (index < enteredPassword.length) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function checkPassword() {
    if (enteredPassword === correctPassword) {
        unlock();
    } else {
        enteredPassword = "";
        updateDots();

        const box = document.querySelector(".passcode-container");
        box.style.animation = "shake .4s";

        setTimeout(() => {
            box.style.animation = "";
        }, 500);
    }
}

/* ======================================
   UNLOCK
====================================== */
function unlock() {
    document.getElementById("lock-symbol").innerHTML = "🔓";
    passcodeScreen.classList.add("unlock");

    setTimeout(() => {
        lockscreen.style.display = "none";
        passcodeScreen.style.display = "none";
        gallery.style.display = "block";

        showSlide(0);
        startMegaConfetti(); // Massive confetti burst
        playMusic();
    }, 1000);
}

/* ======================================
   GALLERY
====================================== */
let currentSlide = 0;

function showSlide(index) {
    if (index < 0) {
        index = 0;
    }

    if (index >= slides.length) {
        index = slides.length - 1;
    }

    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    slides[index].classList.add("active");
    currentSlide = index;

    counter.innerText = `${index + 1} / ${slides.length}`;

    if (index === slides.length - 1) {
        createHearts();
    }
}

document.getElementById("next").addEventListener("click", () => {
    showSlide(currentSlide + 1);
});

document.getElementById("previous").addEventListener("click", () => {
    showSlide(currentSlide - 1);
});

/* ======================================
   MEGA CONFETTI (MORE & BIGGER)
====================================== */
const confettiFiles = [
    "confetti1.png",
    "confetti2.png",
    "confetti3.png",
    "confetti4.png"
];

function startMegaConfetti() {
    // Immediate initial explosion burst (40 pieces at once)
    for (let i = 0; i < 40; i++) {
        setTimeout(createConfetti, Math.random() * 800);
    }

    // Continuous heavy confetti rain (spawns 2 pieces every 150ms)
    setInterval(() => {
        createConfetti();
        createConfetti();
    }, 150);
}

function createConfetti() {
    const container = document.getElementById("confetti-container");
    if (!container) return;

    const piece = document.createElement("img");

    piece.className = "confetti";
    piece.src = confettiFiles[Math.floor(Math.random() * confettiFiles.length)];

    // Randomize position across full screen width
    piece.style.left = Math.random() * 100 + "%";

    // BIGGER SIZE: Random size between 30px and 55px (previously 15px-35px)
    let size = Math.random() * 25 + 30;
    piece.style.width = size + "px";
    piece.style.height = "auto";

    // Random speed between 3s and 6s
    let duration = Math.random() * 3 + 3;
    piece.style.animationDuration = duration + "s";

    container.appendChild(piece);

    // Remove element after animation ends to preserve memory
    setTimeout(() => {
        piece.remove();
    }, duration * 1000);
}

/* ======================================
   FINAL PAGE HEARTS
====================================== */
function createHearts() {
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement("div");
        heart.className = "heart";
        heart.innerHTML = "❤";
        heart.style.left = Math.random() * 100 + "%";
        heart.style.animationDelay = Math.random() * 5 + "s";
        heart.style.fontSize = (Math.random() * 20 + 15) + "px";

        document.body.appendChild(heart);
    }
}