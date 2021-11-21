import * as THREE from './three.js-master/build/three.module.js'
import{ GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { PointerLockControls } from './three.js-master/examples/jsm/controls/PointerLockControls.js'
import * as dat from "./three.js-master/examples/jsm/libs/dat.gui.module.js";

let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(1,1,1);
    
    const gui = new dat.GUI();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    // scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    const light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 0, 24.4, -28 );
    light.intensity = 3.6;
    
    scene.add( light );

    gui.add(light.position, 'x')
    gui.add(light.position, 'y')
    gui.add(light.position, 'z')
    gui.add(light, 'intensity')

    const pointLightHelper = new THREE.PointLightHelper(light, 2);
    scene.add(pointLightHelper)


    controls = new PointerLockControls( camera, document.body );



    // const geometry = new THREE.BoxGeometry( 50, 50, 50 );
    // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    // const cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );
    // gui.add(cube.position, 'y')

    // const blocker = document.getElementById( 'blocker' );
    // const instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {

        controls.lock();

    } );

    // controls.addEventListener( 'lock', function () {

    //     instructions.style.display = 'none';
    //     blocker.style.display = 'none';

    // } );

    // controls.addEventListener( 'unlock', function () {

    //     blocker.style.display = 'block';
    //     instructions.style.display = '';

    // } );

    scene.add( controls.getObject() );

    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    
    // Grid
    // const size = 1000;
    // const divisions = 1000;

    // const gridHelper = new THREE.GridHelper( size, divisions );
    // scene.add( gridHelper );


    //OBJECT
    //GLTFLoader
    const loader = new GLTFLoader()
    loader.load('room1/room1.gltf',function ( gltf ) {
            const mars = gltf.scene;
            mars.scale.set(1,1,1)
            mars.position.set(1,-2.75,-30)
            scene.add( mars );

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },

        // called while loading is progressing
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
    );



    //

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    //

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );
    const time = performance.now();

    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 1;

        const intersections = raycaster.intersectObjects( objects, false );

        const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 100.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 100.0 * delta;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
            canJump = true;

        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y < 1 ) {

            velocity.y = 0;
            controls.getObject().position.y = 1;

            canJump = false;

        }

    }

    prevTime = time;

    renderer.render( scene, camera );

}
