import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function createStarField() {
  const group = new THREE.Group();
  group.add(
    createPointCloud(2800, fillBackgroundStar, 0.026, 0.82),
    createPointCloud(2600, fillGalaxyFloorStar, 0.034, 0.9),
    createPointCloud(760, fillForegroundStar, 0.07, 0.88),
  );
  return group;
}

function createPointCloud(count, fillPosition, size, opacity) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xff77b7),
    new THREE.Color(0x8fffe1),
  ];

  for (let i = 0; i < count; i++) {
    fillPosition(positions, i);
    const color = palette[Math.floor(Math.random() * palette.length)];
    colors.set([color.r, color.g, color.b], i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity,
    }),
  );
}

function fillBackgroundStar(positions, index) {
  positions[index * 3] = randomRange(-24, 24);
  positions[index * 3 + 1] = randomRange(-8.5, 8.5);
  positions[index * 3 + 2] = randomRange(-16, 2.5);
}

function fillGalaxyFloorStar(positions, index) {
  const z = randomRange(-10.5, 4.2);
  const spread = 12 + Math.max(z, -2) * 0.9;
  positions[index * 3] = randomRange(-spread, spread);
  positions[index * 3 + 1] = randomRange(-3.2, -0.15) + Math.max(z, 0) * 0.12;
  positions[index * 3 + 2] = z;
}

function fillForegroundStar(positions, index) {
  positions[index * 3] = randomRange(-8, 8);
  positions[index * 3 + 1] = randomRange(-3.6, 3.6);
  positions[index * 3 + 2] = randomRange(0.2, 5.6);
}

export function createSnowField() {
  const count = 620;
  const speed = new Float32Array(count);
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = randomRange(-8, 8);
    positions[i * 3 + 1] = randomRange(-4.5, 5.5);
    positions[i * 3 + 2] = randomRange(-2, 6);
    speed[i] = randomRange(0.45, 1.2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.048,
      transparent: true,
      opacity: 0.9,
    }),
  );

  return { points, geometry, speed };
}

export function updateSnowField(snow, delta, elapsed) {
  const positions = snow.geometry.attributes.position.array;
  for (let i = 0; i < snow.speed.length; i++) {
    positions[i * 3 + 1] -= snow.speed[i] * delta;
    positions[i * 3] += Math.sin(elapsed * 1.4 + i) * 0.002;
    if (positions[i * 3 + 1] < -4.6) positions[i * 3 + 1] = 5.4;
  }
  snow.geometry.attributes.position.needsUpdate = true;
}
