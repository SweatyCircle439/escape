import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

window.activeanimations = [{name: "drivestrt"}, "drivefw"];

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
    loader.load( 'model.gltf', function ( gltf ) {
        van = gltf;
    
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    });
}

window.updateAnimation = () => {
    mixer = new THREE.AnimationMixer( van.scene );
        
    van.animations.forEach( ( clip ) => {
        if (activeanimations.includes(clip.name)) {
            mixer.clipAction( clip ).play();
        }
    });
}

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
