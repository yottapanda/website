
import * as THREE from "./three/build/three.module.js";

const canvas = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(0.5);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1,);

const scene = new THREE.Scene();

const fragmentShader = await fetch('./shader.frag').then((v) => v.text());

const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(canvas.width, canvas.height) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
};

scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
        fragmentShader,
        uniforms,
    })
));

window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    uniforms.uResolution.value.set(canvas.width, canvas.height);
});

document.addEventListener('mousemove', function (event) {
    uniforms.uMouse.value.set(
        (event.clientX / window.innerWidth),
        1 - (event.clientY / window.innerHeight)
    );
}, false);

var dt = 1000 / 60;
var timeTarget = 0;

function render(time) {

    uniforms.uTime.value = time * 0.001;

    if (Date.now() >= timeTarget) {

        renderer.render(scene, camera);

        timeTarget += dt;
        if (Date.now() >= timeTarget) {
            timeTarget = Date.now();
        }
    }

    requestAnimationFrame(render);
};

render();