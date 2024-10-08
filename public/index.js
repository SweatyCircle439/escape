import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let currentpreset = "idle";

document.addEventListener("keypress", (e) => {
    if (e.key === "p") {
        if (currentpreset === "idle") {
            currentpreset = "drive";
        } else {
            currentpreset = "idle";
        }
        window.setpreset(currentpreset);
    }
});

document.addEventListener("keydown", (e) => {

});

window.activeanimations = [];

const presets = {
    drive: [{name: "drivestrt", loopmode: 1}, {name:"drivefw", loopmode: "infinite"}],
    idle: [{name: "idlestrt", loopmode: 1}, {name:"idle", loopmode: "infinite"}]
};

window.setpreset = (preset) => {
    if (typeof preset === "string") {
        activeanimations = presets[preset];
    } else {
        activeanimations = preset;
    }
    updateAnimation();
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
const clock = new THREE.Clock();
let mixer;
let van;

function spawnvan () {
    loader.load( 'assets/vehicles/freecandyvan.gltf', function ( gltf ) {
        van = gltf;
    
        scene.add( gltf.scene );
        mixer = new THREE.AnimationMixer( van.scene );

        setpreset("idle");
    }, undefined, function ( error ) {
        console.error( error );
    });
}

window.updateAnimation = () => {
    mixer.stopAllAction();
    mixer.time = 0;
    van.animations.forEach( ( clip ) => {
        activeanimations.forEach( ( anim , i) => {
            if (anim.name === clip.name) {
                mixer.clipAction( clip ).reset().play();
                if (anim.loopmode === "infinite") {
                    mixer.clipAction( clip ).setLoop( THREE.LoopRepeat );
                } else {
                    mixer.clipAction( clip ).setLoop( THREE.LoopRepeat, anim.loopmode );
                }
            }
        });
    });
}
loader.load( 'assets/maps/map_city.gtlf', function ( gltf ) {
    van = gltf;

    scene.add( gltf.scene );
    mixer = new THREE.AnimationMixer( van.scene );

    setpreset("idle");
}, undefined, function ( error ) {
    console.error( error );
});

spawnvan();

camera.position.set( 0, 1, 5 );
const light = new THREE.AmbientLight( "white" );
scene.add( light );

function animate() {
    const delta = clock.getDelta();
    if ( mixer ) mixer.update( delta );
    controls.update();
    renderer.render( scene, camera );
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

animate();

