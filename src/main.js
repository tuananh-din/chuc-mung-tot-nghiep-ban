import { SpaceScene } from "./space-scene.js";

const canvas = document.getElementById("space-canvas");
const caption = document.getElementById("caption");
const modal = document.getElementById("entry-modal");
const entryButton = document.getElementById("entry-button");
const audioButton = document.getElementById("audio-toggle");
const fullscreenButton = document.getElementById("fullscreen-toggle");
const music = document.getElementById("bg-music");

const scene = new SpaceScene(canvas, caption);
window.giftScene = scene;
let hasEntered = false;

function setAudioButtonState(isPlaying) {
  audioButton.classList.toggle("is-muted", !isPlaying);
  audioButton.setAttribute("aria-label", isPlaying ? "Tắt nhạc" : "Bật nhạc");
}

async function playMusic() {
  try {
    await music.play();
    setAudioButtonState(true);
  } catch {
    setAudioButtonState(false);
  }
}

entryButton.addEventListener("click", async () => {
  if (hasEntered) return;
  hasEntered = true;
  modal.classList.add("is-hidden");
  scene.start();
  music.currentTime = 0;
  await playMusic();
});

audioButton.addEventListener("click", async () => {
  if (music.paused) {
    await playMusic();
  } else {
    music.pause();
    setAudioButtonState(false);
  }
});

fullscreenButton.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

scene.init();
setAudioButtonState(false);
