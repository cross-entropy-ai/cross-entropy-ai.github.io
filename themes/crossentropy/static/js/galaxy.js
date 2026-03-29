(function () {
  'use strict';

  var scene, camera, renderer, points, bloomComposer;
  var mouse = { x: 0, y: 0 };
  var mouseTarget = { x: 0, y: 0 };

  var PARTICLE_COUNT = 80000;
  var RADIUS = 6;
  var BRANCHES = 4;
  var RANDOMNESS_POWER = 4;
  var INNER_COLOR = new THREE.Color('#ff6030');
  var OUTER_COLOR = new THREE.Color('#1b3984');

  function generateCircleTexture() {
    var size = 32;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    var ctx = canvas.getContext('2d');
    if (ctx) {
      var half = size / 2;
      var gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(half, half, half, 0, Math.PI * 2);
      ctx.fill();
    }
    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  function createGalaxy() {
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var colors = new Float32Array(PARTICLE_COUNT * 3);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var i3 = i * 3;
      var particleRadius = Math.random() * RADIUS;
      var branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      var spinAngle = particleRadius * 2;

      var randomX = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * particleRadius;
      var randomY = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * particleRadius;
      var randomZ = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * particleRadius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * particleRadius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * particleRadius + randomZ;

      var mixedColor = INNER_COLOR.clone();
      mixedColor.lerp(OUTER_COLOR, Math.pow(particleRadius / RADIUS, 0.75));

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var material = new THREE.PointsMaterial({
      size: 0.018,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: generateCircleTexture(),
      transparent: true,
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
  }

  function init() {
    var canvas = document.getElementById('galaxy-canvas');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(6, 1, 6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    createGalaxy();

    window.addEventListener('mousemove', function (e) {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();

    mouse.x += (mouseTarget.x - mouse.x) * 0.05;
    mouse.y += (mouseTarget.y - mouse.y) * 0.05;

    if (points) {
      points.rotation.x = mouse.y * 0.01;
      points.rotation.y += delta * 0.02;
      points.rotation.y += mouse.x * delta * 0.05;
    }

    renderer.render(scene, camera);
  }

  init();
  animate();
})();
