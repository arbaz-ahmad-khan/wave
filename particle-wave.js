const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
let texture = null;
const imageLoader = new Promise((resolve) => {
  loader.load('image-1.jpg', (loadedTexture) => {
    texture = loadedTexture;
    resolve();
  });
});

imageLoader.then(() => {
  const geometry = new THREE.PlaneGeometry(2, 2, texture.image.width, texture.image.height);
  const material = new THREE.MeshBasicMaterial({ map: texture });

  const uniforms = {
    uTime: { value: 0.0 },
  };

  const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 newPosition = position;

      // Apply wave effect
      float waveHeight = sin(uv.x * 3.14159 * 4.0 + uTime * 2.0) * 0.2;
      newPosition.z = waveHeight;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      gl_FragColor = texture2D(uTexture, vUv);
    }
  `;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uTexture = { value: texture };
    shader.vertexShader = vertexShader;
    shader.fragmentShader = fragmentShader;
  };

  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  function animate() {
    requestAnimationFrame(animate);

    uniforms.uTime.value += 0.01;

    renderer.render(scene, camera);
  }

  animate();
});

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  camera.position.x = mouseX;
  camera.position.y = mouseY;
  camera.lookAt(scene.position);
});

// rezise
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});