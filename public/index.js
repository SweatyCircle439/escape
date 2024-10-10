import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let currentpreset = "idle";

document.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "p": 
            if (currentpreset === "idle") {
                currentpreset = "drive";
            } else {
                currentpreset = "idle";
            }
            window.setpreset(currentpreset);
            break;
        case "q":
            ability(1);
            break;
        case "e":
            ability(2);
            break;
        case "r":
            ability(3);
            break;
        case "u":
            ability(4);
            break;
        case "i": 
            ability(5);
            break;
        case "o":
            ability(6);
            break;
        case "w":
            stopdriving();
            break;
        case "s":
            stopdriving();
            break;
    }
});

document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            drivefw();
            break;
        case "s":
            drivebw();
            break;
    }
});

window.activeanimations = [];

const presets = {
    drive: [{name: "drivestrt", loopmode: 1}, {name:"drivefw", loopmode: "infinite"}],
    idle: [{name: "idlestrt", loopmode: 1}, {name:"idle", loopmode: "infinite"}],
    ability1: [{name: 'abilitystart', loopmode: 1, after: [{name: 'ability', loopmode: 5, after: [{name: 'abilityend', loopmode: 1}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}],
    ability2: [{name: 'ability2start', loopmode: 1, after: [{name: 'ability2', loopmode: 20, after: [{name: 'ability2end', loopmode: 1}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]
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
                    if (anim.after) {
                        setTimeout(() => {
                            setpreset(anim.after);
                        }, (clip.duration * anim.loopmode) * 1000);
                    }
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

/**
 * the following code should be on the back-end -- SweatyCircle439
 */
let speed = 0;
function drivefw() {
    speed = 3;
    if (currentpreset == "idle") {
        setpreset("drive");
        currentpreset = "drive";
    }
}
function drivebw() {
    speed = -3;
    if (currentpreset == "idle") {
        setpreset("drive");
        currentpreset = "drive";
    }
}
function stopdriving() {
    speed = 0;
    if (currentpreset == "drive") {
        setpreset("idle");
        currentpreset = "idle";
    }
}
const abilities = {
    freecandyvan: [
        {function: () => {if (currentpreset === "drive") {
            setpreset("ability1");
            return true;
        }}, usesleft: 1},
        {function: () => {if (currentpreset === "drive") {
            speed = 10;
            setpreset("ability2");
            return true;
        }}, usesleft: 10}
    ]
};
function ability(abilityid) {

    if (abilities.freecandyvan.length >= abilityid &&
        abilities.freecandyvan[abilityid - 1].usesleft > 0)
    {
        if (abilities.freecandyvan[abilityid - 1].function()) {
            abilities.freecandyvan[abilityid - 1].usesleft--;
        }
    }else {
        function run() {
            for (const abilitie of abilities.freecandyvan) {
                if (abilitie.usesleft > 0) {
                    if (abilitie.function()) {
                        abilitie.usesleft--;
                        return;
                    }
                }
            }
        }
        run()
    }
}