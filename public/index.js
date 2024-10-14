import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const username = "testPlayer439"

class vehicletype {
    constructor(scene, name, file, animationpresets, abilities) {
        this.name = name;
        this.scene = scene;
        this.file = file;
        this.animationpresets = animationpresets;
        this.abilities = abilities;
        window[`class.vehicle.${this.name}`] = class {
            constructor(position, driver, vehicletype) {
                this.position = position;
                this.rotation = {x: 0, y: 0, z: 0};
                this.currentpreset = "idle";
                this.activeanimations = [];
                this.objectloaded = false;
                this.driver = driver;
                this.vehicletype = vehicletype;
                this.update = () => {
                    if (this.objectloaded) {
                        this.mixer.stopAllAction();
                        this.mixer.time = 0;
                        this.object.animations.forEach( ( clip ) => {
                            const animations = activeanimations;
                            animations.push({name: "root", loopmode: "infinite"});
                            animations.forEach( ( anim , i) => {
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
                                    if (anim.run) {
                                        anim.run();
                                    }
                                }
                            });
                        });
                    }else {
                        window.setTimeout(this.update, 100);
                    }
                };
                this.setpreset = (preset) => {
                    if (typeof preset === "string") {
                        activeanimations = this.vehicletype.animationpresets[preset];
                    } else {
                        activeanimations = preset;
                    }
                    this.update();
                };

                loader.load( this.vehicletype.file, function ( gltf ) {
                    this.object = gltf;
                    this.objectloaded = true;
                
                    this.vehicletype.scene.add( gltf.scene );
                    this.mixer = new THREE.AnimationMixer( this.object.scene );
            
                    this.setpreset("idle");
                }, undefined, function ( error ) {
                    console.error( error );
                });
            }
        }
        function instance(position, driver) {
            return new window[`class.vehicle.${this.name}`](position, driver, this);
        }
    }
}

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
    ability1one: [{name: "ability1", loopmode: 1, after: [{name: "idle", loopmode: "infinite", run: () => {canchangemode = true;}}]}],
    ability2one: [{name: "ability2", loopmode: 1, after: [{name: "idle", loopmode: "infinite", run: () => {canchangemode = true;}}]}],
    ability3one: [{name: "ability3", loopmode: 1, after: [{name: "drive", loopmode: "infinite", run: () => {canchangemode = true;}}]}],
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
    loader.load( 'assets/vehicles/pickup.gltf', function ( gltf ) {
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
        const animations = activeanimations;
        animations.push({name: "root", loopmode: "infinite"});
        animations.forEach( ( anim , i) => {
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
                if (anim.run) {
                    anim.run();
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
let canchangemode = true;
function drivefw() {
    if (canchangemode) {
        speed = 3;
        if (currentpreset == "idle") {
            setpreset("drive");
            currentpreset = "drive";
        }
    }
}
function drivebw() {
    if (canchangemode) {
        speed = -3;
        if (currentpreset == "idle") {
            setpreset("drive");
            currentpreset = "drive";
        }
    }
}
function stopdriving() {
    if (canchangemode) {
        speed = 0;
        if (currentpreset == "drive") {
            setpreset("idle");
            currentpreset = "idle";
        }
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
    ],
    pickup: [
        {function: () => {if (currentpreset === "idle") {
            setpreset("ability1one");
            return true;
        }},usesleft: 4},
        {function: () => {if (currentpreset === "idle") {
            setpreset("ability2one");
            return true;
        }},usesleft: 3},
        {function: () => {if (currentpreset === "drive") {
            setpreset("ability3one");
            return true;
        }},usesleft: 5}
    ]
};
function ability(abilityid) {

    if (canchangemode) {
        if (abilities.pickup.length >= abilityid &&
            abilities.pickup[abilityid - 1].usesleft > 0)
        {
            if (abilities.pickup[abilityid - 1].function()) {
                abilities.pickup[abilityid - 1].usesleft--;
                canchangemode = false;
            }
        }else {
            function run() {
                for (const abilitie of abilities.pickup) {
                    if (abilitie.usesleft > 0) {
                        if (abilitie.function()) {
                            abilitie.usesleft--;
                            canchangemode = false;
                            return;
                        }
                    }
                }
            }
            run()
        }
    }
}