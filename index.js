
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();

let van;

loader.load( 'model.gltf', function ( gltf ) {

    van  = gltf.scene;
    scene.add( gltf.scene );

}, undefined, function ( error ) {

    console.error( error );

} );

camera.position.z = 5;

const light = new THREE.AmbientLight( "white" ); // soft white light
scene.add( light );
function animate() {

    controls.update();

    renderer.render( scene, camera );

    window.requestAnimationFrame(animate);
}
animate()
function update() {
    if (van) {
        const mixer = new THREE.AnimationMixer( van );
        const clips = mesh.animations;

        // Update the mixer on each frame
        function update () {
            mixer.update( deltaSeconds );
        }

        // Play a specific animation
        const clip = THREE.AnimationClip.findByName( clips, 'drivefw' );
        const action = mixer.clipAction( clip );
        action.play();
    }else {
        window.requestAnimationFrame(update);
    }
}
update();