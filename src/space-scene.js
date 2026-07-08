import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
import { loadPhotoSources } from "./photo-assets.js";
import { createPhotoCardTexture } from "./photo-card-texture.js";
import { randomMessage } from "./graduation-messages.js";
import { createHeartSprites, updateHeartSprites } from "./heart-sprites.js";
import { createSnowField, createStarField, updateSnowField } from "./space-particles.js";

const PHOTO_WIDTH = 0.92;
const PHOTO_HEIGHT = 1.18;

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.34, "rgba(255,133,196,0.42)");
  gradient.addColorStop(1, "rgba(255,65,158,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export class SpaceScene {
  constructor(canvas, caption) {
    this.canvas = canvas;
    this.caption = caption;
    this.clock = new THREE.Clock();
    this.photoCards = [];
  }

  async init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07030b, 0.045);
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    this.camera.position.set(0, 0.82, 7.25);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x030205, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.setupLights();
    this.setupPlanet();
    this.stars = createStarField();
    this.snow = createSnowField();
    this.hearts = createHeartSprites();
    this.scene.add(this.stars, this.snow.points, this.hearts.group);
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.animate();
    await this.setupPhotos();
  }

  setupLights() {
    this.scene.add(new THREE.AmbientLight(0xffd6ee, 1.35));
    const key = new THREE.PointLight(0xff7fc3, 58, 16);
    key.position.set(0, 1.6, 2.4);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x8fffe1, 18, 18);
    rim.position.set(-3.5, 2.3, -2.6);
    this.scene.add(rim);
  }

  setupPlanet() {
    this.planetGroup = new THREE.Group();
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 72, 72),
      new THREE.MeshPhysicalMaterial({
        color: 0xffb3dc,
        emissive: 0xff4fa7,
        emissiveIntensity: 0.72,
        roughness: 0.58,
        clearcoat: 0.85,
      }),
    );

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff3fb,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.14, 36, 180), ringMaterial);
    ring.rotation.x = 1.18;
    ring.scale.set(1.45, 0.38, 1);
    this.ring = ring;

    const outerRing = ring.clone();
    outerRing.material = new THREE.MeshBasicMaterial({
      color: 0xff6fb2,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    outerRing.scale.set(1.7, 0.48, 1);
    this.outerRing = outerRing;

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    glow.scale.set(5.2, 5.2, 1);

    this.planetGroup.add(glow, outerRing, ring, planet);
    this.scene.add(this.planetGroup);
  }

  async setupPhotos() {
    const sources = await loadPhotoSources();
    await Promise.all(sources.map((source, index) => this.addPhoto(source, index, sources.length)));
  }

  async addPhoto(source, index, total) {
    const texture = await createPhotoCardTexture(source);
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(PHOTO_WIDTH, PHOTO_HEIGHT),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    card.userData = {
      angle: (index / Math.max(total, 1)) * Math.PI * 2,
      speed: randomRange(0.18, 0.28),
      wobble: randomRange(0, Math.PI * 2),
    };
    this.photoCards.push(card);
    this.scene.add(card);
  }

  start() {
    this.captionTimer = window.setInterval(() => {
      this.caption.querySelector("strong").textContent = randomMessage();
    }, 3000);
  }

  updatePhotos(elapsed) {
    const radiusX = this.isMobile ? 1.95 : 4.65;
    const radiusZ = this.isMobile ? 1.28 : 1.76;
    const baseScale = this.isMobile ? 0.42 : 0.56;
    const scaleRange = this.isMobile ? 0.28 : 0.34;

    for (const card of this.photoCards) {
      const angle = card.userData.angle + elapsed * card.userData.speed;
      const x = Math.cos(angle) * radiusX;
      const z = Math.sin(angle) * radiusZ;
      const frontAmount = (z + radiusZ) / (radiusZ * 2);
      const y = 0.02 + Math.sin(angle * 2 + card.userData.wobble) * 0.28 - frontAmount * 0.22;
      const depthScale = baseScale + frontAmount * scaleRange;
      card.position.set(x, y, z);
      card.scale.setScalar(depthScale);
      card.lookAt(this.camera.position);
      card.rotateZ(Math.sin(elapsed * 1.6 + card.userData.wobble) * 0.08);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();
    const delta = this.clock.getDelta();
    this.camera.position.x = Math.sin(elapsed * 0.24) * 0.28;
    this.camera.position.y = 0.82 + Math.sin(elapsed * 0.31) * 0.12;
    this.camera.lookAt(0, -0.08, 0);
    this.planetGroup.rotation.y += delta * 0.36;
    this.planetGroup.rotation.z = Math.sin(elapsed * 0.48) * 0.06;
    this.ring.rotation.z += delta * 0.62;
    this.outerRing.rotation.z -= delta * 0.34;
    this.stars.rotation.y += delta * 0.035;
    updateSnowField(this.snow, delta, elapsed);
    updateHeartSprites(this.hearts, elapsed);
    this.updatePhotos(elapsed);
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.isMobile = width < 680;
    this.camera.aspect = width / height;
    this.camera.position.z = this.isMobile ? 10.8 : 7.25;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
}
