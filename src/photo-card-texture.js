import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const imageRatio = image.width / image.height;
  const frameRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (imageRatio > frameRatio) {
    sw = image.height * frameRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / frameRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

export async function createPhotoCardTexture(src) {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 820;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowColor = "rgba(255, 98, 174, 0.55)";
  ctx.shadowBlur = 34;
  ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
  roundedRect(ctx, 18, 18, 604, 784, 34);
  ctx.fill();

  ctx.save();
  roundedRect(ctx, 38, 38, 564, 724, 24);
  ctx.clip();
  drawCoverImage(ctx, image, 38, 38, 564, 724);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
