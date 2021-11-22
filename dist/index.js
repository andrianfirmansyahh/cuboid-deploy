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

let logo;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 105, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(1,5,1);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    // scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    const gui = new dat.GUI();
    const animationsFolder = gui.addFolder('Animations')
    animationsFolder.open()

    // BACKGROUND MOUNTAIN

    const loaderWorld_bk = new THREE.TextureLoader().load('background/gloom_ft.jpg');
    const loaderWorld_dn = new THREE.TextureLoader().load('background/gloom_bk.jpg');
    const loaderWorld_ft = new THREE.TextureLoader().load('background/gloom_up.jpg');
    const loaderWorld_lf = new THREE.TextureLoader().load('background/gloom_dn.jpg');
    const loaderWorld_rt = new THREE.TextureLoader().load('background/gloom_rt.jpg');
    const loaderWorld_up = new THREE.TextureLoader().load('background/gloom_lf.jpg');

    const array = [
        new THREE.MeshBasicMaterial({map: loaderWorld_bk, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: loaderWorld_dn, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: loaderWorld_ft, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: loaderWorld_lf, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: loaderWorld_rt, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: loaderWorld_up, side: THREE.BackSide}),
    ];

    const geometry = new THREE.BoxGeometry( 500, 500, 500 );
    const cube = new THREE.Mesh( geometry, array );
    cube.position.set(0,0,-100);
    cube.rotation.y = 3.58;
    scene.add( cube );

    //LIGHTS

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff );
    hemiLight.position.set( 0, 30, 0 );
    hemiLight.intensity = 4;
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( - 3, 10, - 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add( dirLight );

    // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

    // const light = new THREE.PointLight( 0xffffff, 1, 100 );
    // light.position.set( 0, 19, -9 );
    // light.intensity = 2;
    
    // scene.add( light );

    // gui.add(light.position, 'x')
    // gui.add(light.position, 'y')
    // gui.add(light.position, 'z')
    // gui.add(light, 'intensity')

    // const pointLightHelper = new THREE.PointLightHelper(light, 2);
    // scene.add(pointLightHelper)

    // const light2 = new THREE.PointLight( 0xffffff, 1, 100 );
    // light2.position.set(1, -22, -93 );
    // light2.intensity = 4;
    
    // scene.add( light2 );

    // gui.add(light2.position, 'x')
    // gui.add(light2.position, 'y')
    // gui.add(light2.position, 'z')
    // gui.add(light2, 'intensity')

    // const pointLightHelper2 = new THREE.PointLightHelper(light2, 2);
    // scene.add(pointLightHelper2)

    // const light3 = new THREE.PointLight( 0xFFF0B3, 1, 100 );
    // light3.position.set(-0.1, 0.9, -239 );
    // light3.intensity = 2;
    
    // scene.add( light3 );

    // gui.add(light3.position, 'x')
    // gui.add(light3.position, 'y')
    // gui.add(light3.position, 'z')
    // gui.add(light3, 'intensity')

    // const pointLightHelper3 = new THREE.PointLightHelper(light3, 2);
    // scene.add(pointLightHelper3)



    controls = new PointerLockControls( camera, document.body );

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {

        controls.lock();

    } );

    controls.addEventListener( 'lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    } );

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
    // loader.load('pa/PA.gltf',function ( gltf ) {
    //         const mars = gltf.scene;
    //         mars.scale.set(1,1,1)
    //         mars.position.set(0,0,0)
    //         scene.add( mars );

    //         gltf.animations; // Array<THREE.AnimationClip>
    //         gltf.scene; // THREE.Group
    //         gltf.scenes; // Array<THREE.Group>
    //         gltf.cameras; // Array<THREE.Camera>
    //         gltf.asset; // Object
    //     },

    //     // called while loading is progressing
    //     function ( xhr ) {

    //         console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    //     },
    //     // called when loading has errors
    //     function ( error ) {

    //         console.log( 'An error happened' );

    //     }
    // );

    loader.load('gltf5/gltf5.gltf',function ( gltf ) {
        const mars2 = gltf.scene;
        mars2.scale.set(1,1,1)
        mars2.position.set(1,-2.75,-30)
        scene.add( mars2 );

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


// loader.load('spacec/spacec.gltf',function ( gltf ) {
//     const mars3 = gltf.scene;
//     mars3.scale.set(1,1,1)
//     mars3.position.set(1,-2.75,-30)
//     scene.add( mars3 );

//     gltf.animations; // Array<THREE.AnimationClip>
//     gltf.scene; // THREE.Group
//     gltf.scenes; // Array<THREE.Group>
//     gltf.cameras; // Array<THREE.Camera>
//     gltf.asset; // Object
// },

// // called while loading is progressing
// function ( xhr ) {

//     console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

// },
// // called when loading has errors
// function ( error ) {

//     console.log( 'An error happened' );

// }
// );

// loader.load('boots/boots.gltf',function ( gltf ) {
//     scene.add( gltf.scene );
//     boots = gltf.scene.children[0];
//     boots.position.set(0,5,0);
//     boots.scale.set(1,1,1);

//     gui.add(boots.position, 'x')
//     gui.add(boots.position, 'y')
//     gui.add(boots.position, 'z')
//     gui.add(boots.scale, 'x')
//     gui.add(boots.scale, 'y')
//     gui.add(boots.scale, 'z')
// });


    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
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

        velocity.x -= velocity.x * 45.0 * delta;
        velocity.z -= velocity.z * 45.0 * delta;

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
