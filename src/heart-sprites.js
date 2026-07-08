import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

function makeHeartTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.translate(128, 134);
  ctx.scale(4.8, 4.8);
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.bezierCurveTo(-28, -5, -20, -30, 0, -16);
  ctx.bezierCurveTo(20, -30, 28, -5, 0, 18);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(-20, -24, 20, 22);
  gradient.addColorStop(0, "#ff4f9b");
  gradient.addColorStop(0.55, "#ff1f72");
  gradient.addColorStop(1, "#ff9ad0");
  ctx.shadowColor = "rgba(255, 90, 168, 0.8)";
  ctx.shadowBlur = 6;
  ctx.fillStyle = gradient;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function createHeartSprites() {
  const texture = makeHeartTexture();
  const group = new THREE.Group();
  const hearts = [];

  for (let i = 0; i < 8; i++) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      }),
    );
    const side = Math.random() > 0.5 ? 1 : -1;
    sprite.position.set(
      side * randomRange(3.15, 5.25),
      randomRange(-2, 1.45),
      randomRange(0.8, 3.9),
    );
    const size = randomRange(0.28, 0.58);
    sprite.scale.set(size, size, 1);
    sprite.material.rotation = randomRange(-0.55, 0.55);
    sprite.userData = {
      baseY: sprite.position.y,
      speed: randomRange(0.45, 0.95),
      phase: randomRange(0, Math.PI * 2),
    };
    hearts.push(sprite);
    group.add(sprite);
  }

  return { group, hearts };
}

export function updateHeartSprites(heartField, elapsed) {
  for (const heart of heartField.hearts) {
    heart.position.y = heart.userData.baseY + Math.sin(elapsed * heart.userData.speed + heart.userData.phase) * 0.28;
    heart.position.x += Math.sin(elapsed * 1.2 + heart.userData.phase) * 0.0018;
    heart.material.rotation += 0.0045;
  }
}
