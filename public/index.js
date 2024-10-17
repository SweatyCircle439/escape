import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

window.THREE = THREE;

const username = "testPlayer439";

/** @type {function[]} */
const animateupdates = [];

/** @type {vehicleInstance[]} */
const vehicleinstances = [];

/**
 * @param { THREE.Vector3 } position - The initial position of the vehicle.
 * @param { string } driver - The name of the driver.
 * @param { vehicletype } vehicletype - The type of vehicle.
*/

class vehicleInstance {
    constructor(position = new THREE.Vector3(0, 0, 0), /** @type {string} **/driver, /** @type {vehicletype} **/vehicletype) {
        this.abilities = [];
        this.currentpreset = "idle";
        this.activeanimations = [];
        this.initialposition = position;
        this.objectloaded = false;
        this.driver = driver;
        this.vehicletype = vehicletype;
        for (const abilitie of this.vehicletype.abilities) {
            this.abilities.push(abilitie);
        }
        this.lastupdatedspeed = -30;
        this.canchangemode = true;
        this.object = null;
        this.currentspeed = 0;
        this.update = () => {
            if (this.objectloaded) {
                this.mixer.stopAllAction();
                this.mixer.time = 0;
                this.object.animations.forEach( ( clip ) => {
                    const animations = this.activeanimations;
                    animations.push({name: "root", loopmode: "infinite"});
                    animations.forEach( ( anim , i) => {
                        if (anim.name === clip.name) {
                            this.mixer.clipAction( clip ).reset().play();
                            if (anim.loopmode === "infinite") {
                                this.mixer.clipAction( clip ).setLoop( THREE.LoopRepeat );
                            } else {
                                this.mixer.clipAction( clip ).setLoop( THREE.LoopRepeat, anim.loopmode );
                                if (anim.after) {
                                    setTimeout(() => {
                                        this.setpreset(anim.after);
                                    }, (clip.duration * anim.loopmode) * 1000);
                                }
                            }
                            if (anim.run) {
                                anim.run(this);
                            }
                        }
                    });
                });
            }
        };
        this.setpreset = (preset) => {
            if (typeof preset === "string") {
                this.activeanimations = this.vehicletype.animationpresets[preset];
            } else {
                this.activeanimations = preset;
            }
            this.update();
        };

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 100;
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '30px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.driver, canvas.width / 2, canvas.height / 2, 256);
        const texture = new THREE.CanvasTexture(canvas);
        const planeGeometry = new THREE.PlaneGeometry(2, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
        });
        this.nametag = new THREE.Mesh(planeGeometry, planeMaterial);
        this.vehicletype.scene.add(this.nametag);
        this.nametag.position.set(this.initialposition.x, this.initialposition.y + 2.5, this.initialposition.z);

        const currentclass = this;

        loader.load( currentclass.vehicletype.file, function ( gltf ) {
            currentclass.object = gltf;
            currentclass.objectloaded = true;
        
            currentclass.vehicletype.scene.add( currentclass.object.scene );

            currentclass.object.scene.position.set(currentclass.initialposition.x, currentclass.initialposition.y, currentclass.initialposition.z);

            currentclass.mixer = new THREE.AnimationMixer( currentclass.object.scene );
    
            currentclass.setpreset("idle");
            currentclass.update();
        }, undefined, function ( error ) {
            console.error( error );
        });

        this.animateupdate = (delta) => {
            
            if ( currentclass.mixer ) currentclass.mixer.update( delta );

            if (currentclass.objectloaded) {
                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyQuaternion(currentclass.object.scene.quaternion);
                direction.normalize();
            
                currentclass.object.scene.position.add(direction.multiplyScalar(currentclass.currentspeed));
                currentclass.nametag.position.set(currentclass.object.scene.position.x, currentclass.object.scene.position.y + 2.5, currentclass.object.scene.position.z);
                if (currentclass.driver == username) {
                    camera.position.set(currentclass.object.scene.position.x, currentclass.object.scene.position.y + 5, currentclass.object.scene.position.z - 5);
                    camera.lookAt(currentclass.object.scene.position.x, currentclass.object.scene.position.y, currentclass.object.scene.position.z);
                    // controls.update();
                }
            }

            if (this.nametag) {
                this.nametag.lookAt(this.vehicletype.camera.position);
            }
        }

        animateupdates.push(this.animateupdate);
        vehicleinstances.push(this);
        for (const vehicleinstance of vehicleinstances) {
            if (vehicleinstance.driver == username) {
                drivingvehicle = vehicleinstance;
            }
        }
    }
}

class vehicletype {
    constructor(scene, camera, name, file, animationpresets, abilities, maxspeed, acceleration, turnspeed = acceleration, slowdown = acceleration * 2, brakespeed = maxspeed) {
        this.name = name;
        this.scene = scene;
        this.camera = camera;
        this.file = file;
        this.animationpresets = animationpresets;
        this.abilities = abilities;
        this.maxspeed = maxspeed;
        this.acceleration = acceleration;
        this.brakespeed = brakespeed;
        this.slowdown = slowdown;
        this.turnspeed = turnspeed;
        this.instance = (position, driver) => {
            return new vehicleInstance(position, driver, this);
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
        case "a":
            turnleft();
            break;
        case "d":
            turnright();
            break;
    }
});

window.activeanimations = [];

const presets = {
    drive: [{name: "drivestrt", loopmode: 1}, {name:"drivefw", loopmode: "infinite"}],
    idle: [{name: "idlestrt", loopmode: 1}, {name:"idle", loopmode: "infinite"}],
    ability1: [{name: 'abilitystart', loopmode: 1, after: [{name: 'ability', loopmode: 5, after: [{name: 'abilityend', loopmode: 1}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}],
    ability1one: [{name: "ability1", loopmode: 1, after: [{name: "idle", loopmode: "infinite", run: (clss) => {clss.canchangemode = true;}}]}],
    ability2one: [{name: "ability2", loopmode: 1, after: [{name: "idle", loopmode: "infinite", run: (clss) => {clss.canchangemode = true;}}]}],
    ability3one: [{name: "ability3", loopmode: 1, after: [{name: "drive", loopmode: "infinite", run: (clss) => {clss.canchangemode = true;}}]}],
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
window.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
// window.controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
const clock = new THREE.Clock();
let mixer;
let van;

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
loader.load( 'assets/maps/map.gltf', function ( gltf ) {

    scene.add( gltf.scene );
}, undefined, function ( error ) {
    console.error( error );
});

camera.position.set( 0, 1, 5 );
const light = new THREE.AmbientLight( "white" );
scene.add( light );

function animate() {
    const delta = clock.getDelta();
    for (const func of animateupdates) {
        func(delta);
    }
    //controls.update();
    renderer.render( scene, camera );
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

animate();

window.pickuptrucktype = new vehicletype(scene, camera, "pickup truck", "assets/vehicles/pickup.gltf", {
    drive: [{name: "drivestrt", loopmode: 1}, {name:"drivefw", loopmode: "infinite"}],
    idle: [{name: "idlestrt", loopmode: 1}, {name:"idle", loopmode: "infinite"}],
    ability1: [{name: "ability1", loopmode: 1, after: [{name: "idle", loopmode: "infinite", run: (clss) => {clss.canchangemode = true;}}]}],
    ability2: [{name: "ability2", loopmode: 1, after: [{name: "idle", loopmode: "infinite", run: (clss) => {clss.canchangemode = true;}}]}],
    ability3: [{name: "ability3", loopmode: 1, after: [{name: "drive", loopmode: "infinite", run: (clss) => {clss.canchangemode = true;}}]}],
}, [
    {function: (clss) => {if (currentpreset === "idle") {
        clss.setpreset("ability1");
        return true;
    }},usesleft: 4},
    {function: (clss) => {if (currentpreset === "idle") {
        clss.setpreset("ability2");
        return true;
    }},usesleft: 3},
    {function: (clss) => {if (currentpreset === "drive") {
        clss.setpreset("ability3");
        return true;
    }},usesleft: 5}
], .5, .01, 10);
window.freecandyvantype = new vehicletype(scene, camera, "free candy van", "assets/vehicles/freecandyvan.gltf", {
    drive: [{name: "drivestrt", loopmode: 1}, {name:"drivefw", loopmode: "infinite"}],
    idle: [{name: "idlestrt", loopmode: 1}, {name:"idle", loopmode: "infinite"}],ability1: [{name: 'abilitystart', loopmode: 1, after: [{name: 'ability', loopmode: 5, after: [{name: 'abilityend', loopmode: 1}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}],
    ability1: [{name: 'abilitystart', loopmode: 1, after: [{name: 'ability', loopmode: 5, after: [{name: 'abilityend', loopmode: 1}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}],
    ability2: [{name: 'ability2start', loopmode: 1, after: [{name: 'ability2', loopmode: 20, after: [{name: 'ability2end', loopmode: 1}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]}, {name:"drivefw", loopmode: "infinite"}]
}, [
    {function: (clss) => {if (currentpreset === "drive") {
        clss.setpreset("ability1");
        return true;
    }}, usesleft: 1},
    {function: (clss) => {if (currentpreset === "drive") {
        speed = 10;
        clss.setpreset("ability2");
        return true;
    }}, usesleft: 10}
], .5, .01, 10);

/**
 * the following code should be on the back-end -- SweatyCircle439
 */

let tick = 0;


window.setInterval(() => {tick++;}, 1000 / 60);

let speed = 0;
let canchangemode = true;

/** @type {vehicleInstance} */
let drivingvehicle;
for (const vehicleinstance of vehicleinstances) {
    if (vehicleinstance.driver == username) {
        drivingvehicle = vehicleinstance;
    }
}

function drivefw() {
    if (drivingvehicle.canchangemode) {
        if (drivingvehicle.currentspeed < drivingvehicle.vehicletype.maxspeed && tick - drivingvehicle.lastupdatedspeed >= 30) {
            drivingvehicle.currentspeed += drivingvehicle.vehicletype.acceleration;
        }
        if (currentpreset == "idle") {
            drivingvehicle.setpreset("drive");
            currentpreset = "drive";
        }
    }
}
function drivebw() {
    if (drivingvehicle.canchangemode) {
        if (drivingvehicle.currentspeed > -drivingvehicle.vehicletype.maxspeed && tick - drivingvehicle.lastupdatedspeed >= 30) {
            drivingvehicle.currentspeed -= drivingvehicle.vehicletype.slowdown;
        }
        if (currentpreset == "idle") {
            drivingvehicle.setpreset("drive");
            currentpreset = "drive";
        }
    }
}
function turnleft() {
    drivingvehicle.object.scene.rotation.y += (Math.PI / 360) * drivingvehicle.vehicletype.turnspeed;
}
function turnright() {
    drivingvehicle.object.scene.rotation.y -= (Math.PI / 360) * drivingvehicle.vehicletype.turnspeed;
}
function stopdriving() {
    
    if (drivingvehicle.canchangemode) {
        if (drivingvehicle.currentspeed > 0) {
            drivingvehicle.currentspeed -= drivingvehicle.vehicletype.brakespeed;
        }
        if (drivingvehicle.currentspeed < 0) {
            drivingvehicle.currentspeed = 0;
        }
        if (currentpreset == "drive") {
            drivingvehicle.setpreset("idle");
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

    if (drivingvehicle.canchangemode) {
        if (drivingvehicle.abilities.length >= abilityid &&
            drivingvehicle.abilities[abilityid - 1].usesleft > 0)
        {
            if (drivingvehicle.abilities[abilityid - 1].function(drivingvehicle)) {
                drivingvehicle.abilities[abilityid - 1].usesleft--;
                drivingvehicle.canchangemode = false;
            }
        }else {
            function run() {
                for (const abilitie of drivingvehicle.abilities) {
                    if (abilitie.usesleft > 0) {
                        if (abilitie.function(drivingvehicle)) {
                            abilitie.usesleft--;
                            drivingvehicle.canchangemode = false;
                            return;
                        }
                    }
                }
            }
            run()
        }
    }
}