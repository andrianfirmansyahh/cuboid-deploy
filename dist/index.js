import * as THREE from './three.js-master/build/three.module.js';

import Stats from './three.js-master/examples/jsm/libs/stats.module.js';
import * as dat from './three.js-master/examples/jsm/libs/dat.gui.module.js'

import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';

import { Octree } from './three.js-master/examples/jsm/math/Octree.js';
import { Capsule } from './three.js-master/examples/jsm/math/Capsule.js';


const clock = new THREE.Clock();

const gui = new dat.GUI();
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x88ccff );

const camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.rotation.order = 'YXZ';
camera.rotation.x = -15;
// gui.add(camera.rotation, 'x')

const GRAVITY = 30;

const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;

const STEPS_PER_FRAME = 5;

const sphereGeometry = new THREE.SphereGeometry( SPHERE_RADIUS, 32, 32 );
const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0x888855, roughness: 0.8, metalness: 0.5 } );

const spheres = [];
let sphereIdx = 0;

for ( let i = 0; i < NUM_SPHERES; i ++ ) {

    const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    scene.add( sphere );

    spheres.push( { mesh: sphere, collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ), velocity: new THREE.Vector3() } );

}

const loadingManager = new THREE.LoadingManager( () => {
	
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    
    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
    
} );

// //RecLights
// RectAreaLightUniformsLib.init();
// const rectLight1 = new THREE.RectAreaLight( 0xff0000, 5, 4, 10 );
// rectLight1.position.set( 0, 0, 0 );
// rectLight1.rotation.y = 1;
// rectLight1.scale.set (1,1,1);
// rectLight1.intensity = 1;
// scene.add( rectLight1 );

// gui.add(rectLight1.position, 'x')
// gui.add(rectLight1.position, 'y')
// gui.add(rectLight1.position, 'z')
// gui.add(rectLight1.rotation, 'y')
// gui.add(rectLight1, 'intensity')

// scene.add( new RectAreaLightHelper( rectLight1 ) );

// MAIN LIGHTS
const ambientlight = new THREE.AmbientLight( 0xffffff,0.6 );
scene.add( ambientlight );

const fillLight1 = new THREE.DirectionalLight( 0x808000, 0.2 );
fillLight1.position.set( - 1, 1, 2 );
scene.add( fillLight1 );

const fillLight2 = new THREE.DirectionalLight( 808000, 0.1 );
fillLight2.position.set( 0, - 1, 0 );
scene.add( fillLight2 );

const directionalLight = new THREE.DirectionalLight( 0x808000, 0.5 );
directionalLight.position.set( - 5, 25, - 1 );
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = - 30;
directionalLight.shadow.camera.top	= 30;
directionalLight.shadow.camera.bottom = - 30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = - 0.00006;
scene.add( directionalLight );

//Light 1
const light1 = new THREE.PointLight( 0xffffff, 1, 100 );
light1.position.set(0, 10.8, -66 );
light1.intensity = 2;
    
scene.add( light1 );

// gui.add(light1.position, 'x')
// gui.add(light1.position, 'y')
// gui.add(light1.position, 'z')
// gui.add(light1, 'intensity')

const pointLightHelper1 = new THREE.PointLightHelper(light1, 2);
scene.add(pointLightHelper1)

//Light 2
const light2 = new THREE.PointLight( 0xffffff, 1, 100 );
light2.position.set( 0, -8.6, -122 );
light2.intensity = 3;
    
scene.add( light2 );

// gui.add(light2.position, 'x')
// gui.add(light2.position, 'y')
// gui.add(light2.position, 'z')
// gui.add(light2, 'intensity')

const pointLightHelper2 = new THREE.PointLightHelper(light2, 2);
scene.add(pointLightHelper2)

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
cube.rotation.y =3.6;
// gui.add(cube.rotation, 'y')

scene.add( cube );


const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

const container = document.getElementById( 'container' );

container.appendChild( renderer.domElement );

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';

container.appendChild( stats.domElement );

const worldOctree = new Octree();

const playerCollider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

document.addEventListener( 'keydown', ( event ) => {

    keyStates[ event.code ] = true;

} );

document.addEventListener( 'keyup', ( event ) => {

    keyStates[ event.code ] = false;

} );

document.addEventListener( 'mousedown', () => {

    document.body.requestPointerLock();

    mouseTime = performance.now();

} );

document.addEventListener( 'mouseup', () => {

    throwBall();

} );

document.body.addEventListener( 'mousemove', ( event ) => {

    if ( document.pointerLockElement === document.body ) {

        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;

    }

} );

window.addEventListener( 'resize', onWindowResize );

// DIGITAL SPACES
const loader = new GLTFLoader(loadingManager);

// PHASE 1
loader.load( 'phase1/phase1.gltf', ( gltf ) => {
const phase1 = gltf.scene;
phase1.scale.set(1,1,1);
phase1.position.set(0, -2,-28)
scene.add( phase1 );
// gui.add(phase1.position, 'x')
// gui.add(phase1.position, 'y')
// gui.add(phase1.position, 'z')


worldOctree.fromGraphNode( gltf.scene );

gltf.scene.traverse( child => {

    if ( child.isMesh ) {

        child.castShadow = true;
        child.receiveShadow = true;

        if ( child.material.map ) {

        child.material.map.anisotropy = 8;

        }

    }

}
    
);

animate();

} );

    //PLANT
    //Plant1
    loader.load('plant1/scene.gltf',function ( gltf ) {
        const plant1 = gltf.scene;
        plant1.scale.set(.03, .03, .03)
        plant1.position.set(13.7, -5.67, -28)
        plant1.rotation.y = 4.1;
        scene.add( plant1 );
        // gui.add(plant1.position, 'x')
        // gui.add(plant1.position, 'y')
        // gui.add(plant1.position, 'z')
        // gui.add(plant1.scale, 'x')
        // gui.add(plant1.scale, 'y')
        // gui.add(plant1.scale, 'z')
        // gui.add(plant1.rotation, 'y')

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


//PLANTS
//Plant1
loader.load('plant3/scene.gltf',function ( gltf ) {
    const plant1 = gltf.scene;
    plant1.scale.set(0.3,0.3,0.3)
    plant1.position.set(11,6.9,-19)
    plant1.rotation.y = -0.2
    scene.add( plant1 );
    // gui.add(plant1.position, 'x')
    // gui.add(plant1.position, 'y')
    // gui.add(plant1.position, 'z')
    // gui.add(plant1.scale, 'x')
    // gui.add(plant1.scale, 'y')
    // gui.add(plant1.scale, 'z')
    // gui.add(plant1.rotation, 'y')
    
    
    worldOctree.fromGraphNode( gltf.scene );
    
    gltf.scene.traverse( child => {
    
        if ( child.isMesh ) {
    
            child.castShadow = true;
            child.receiveShadow = true;
    
        if ( child.material.map ) {
    
            child.material.map.anisotropy = 8;
    
            }
    
        }
    
    });
    
    } );

    loader.load('plant3/scene.gltf',function ( gltf ) {
        const plant1 = gltf.scene;
        plant1.scale.set(0.3,0.3,0.3)
        plant1.position.set(6,6.2,-3)
        plant1.rotation.y = -0.68
        scene.add( plant1 );
        // gui.add(plant1.position, 'x')
        // gui.add(plant1.position, 'y')
        // gui.add(plant1.position, 'z')
        // gui.add(plant1.scale, 'x')
        // gui.add(plant1.scale, 'y')
        // gui.add(plant1.scale, 'z')
        // gui.add(plant1.rotation, 'y')
        
        worldOctree.fromGraphNode( gltf.scene );
        
        gltf.scene.traverse( child => {
        
            if ( child.isMesh ) {
        
                child.castShadow = true;
                child.receiveShadow = true;
        
            if ( child.material.map ) {
        
                child.material.map.anisotropy = 8;
        
                }
        
            }
        
        });

animate();  

} );

loader.load('plant3/scene.gltf',function ( gltf ) {
    const plant2 = gltf.scene;
    plant2.scale.set(0.3,0.3,0.3)
    plant2.position.set(6,6.2,-3)
    plant2.rotation.y = -0.68
    scene.add( plant2 );
    // gui.add(plant2.position, 'x')
    // gui.add(plant2.position, 'y')
    // gui.add(plant2.position, 'z')
    // gui.add(plant2.scale, 'x')
    // gui.add(plant2.scale, 'y')
    // gui.add(plant2.scale, 'z')
    // gui.add(plant2.rotation, 'y')
    
    worldOctree.fromGraphNode( gltf.scene );
    
    gltf.scene.traverse( child => {
    
        if ( child.isMesh ) {
    
            child.castShadow = true;
            child.receiveShadow = true;
    
        if ( child.material.map ) {
    
            child.material.map.anisotropy = 8;
    
            }
    
        }
    
    });

animate();  

} );

loader.load('plant3/scene.gltf',function ( gltf ) {
    const plant3 = gltf.scene;
    plant3.scale.set(0.3,0.3,0.3)
    plant3.position.set(-9.5,6.3,-13.5)
    plant3.rotation.y = -2.97
    scene.add( plant3 );
    // gui.add(plant3.position, 'x')
    // gui.add(plant3.position, 'y')
    // gui.add(plant3.position, 'z')
    // gui.add(plant3.scale, 'x')
    // gui.add(plant3.scale, 'y')
    // gui.add(plant3.scale, 'z')
    // gui.add(plant3.rotation, 'y')
    
    worldOctree.fromGraphNode( gltf.scene );
    
    gltf.scene.traverse( child => {
    
        if ( child.isMesh ) {
    
            child.castShadow = true;
            child.receiveShadow = true;
    
        if ( child.material.map ) {
    
            child.material.map.anisotropy = 8;
    
            }
    
        }
    
    });

animate();  

} );

loader.load('plant3/scene.gltf',function ( gltf ) {
    const plant3 = gltf.scene;
    plant3.scale.set(0.3,0.3,0.3)
    plant3.position.set(-7,6.3,-3)
    plant3.rotation.y = -30.5
    scene.add( plant3 );
    // gui.add(plant3.position, 'x')
    // gui.add(plant3.position, 'y')
    // gui.add(plant3.position, 'z')
    // gui.add(plant3.scale, 'x')
    // gui.add(plant3.scale, 'y')
    // gui.add(plant3.scale, 'z')
    // gui.add(plant3.rotation, 'y')
    
    worldOctree.fromGraphNode( gltf.scene );
    
    gltf.scene.traverse( child => {
    
        if ( child.isMesh ) {
    
            child.castShadow = true;
            child.receiveShadow = true;
    
        if ( child.material.map ) {
    
            child.material.map.anisotropy = 8;
    
            }
    
        }
    
    });

animate();  

} );

loader.load('plant3/scene.gltf',function ( gltf ) {
    const plant4 = gltf.scene;
    plant4.scale.set(0.3,0.3,0.3)
    plant4.position.set(-7,6.3,-3)
    plant4.rotation.y = -30.5
    scene.add( plant4 );
    // gui.add(plant4.position, 'x')
    // gui.add(plant4.position, 'y')
    // gui.add(plant4.position, 'z')
    // gui.add(plant4.scale, 'x')
    // gui.add(plant4.scale, 'y')
    // gui.add(plant4.scale, 'z')
    // gui.add(plant4.rotation, 'y')
    
    worldOctree.fromGraphNode( gltf.scene );
    
    gltf.scene.traverse( child => {
    
        if ( child.isMesh ) {
    
            child.castShadow = true;
            child.receiveShadow = true;
    
        if ( child.material.map ) {
    
            child.material.map.anisotropy = 8;
    
            }
    
        }
    
    });

animate();  

} );

    //Title
    //text
    loader.load('text/line/line.gltf',function ( gltf ) {
        const line = gltf.scene;
        line.scale.set(4, 4, 4)
        line.position.set(0, 14,-16)
        line.rotation.y = 0;
        scene.add( line );
        // gui.add(line.position, 'x')
        // gui.add(line.position, 'y')
        // gui.add(line.position, 'z')
        // gui.add(line.scale, 'x')
        // gui.add(line.scale, 'y')
        // gui.add(line.scale, 'z')
        // gui.add(line.rotation, 'y')

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

    //Title
    //text
    loader.load('text/c/c.gltf',function ( gltf ) {
        const line2 = gltf.scene;
        line2.scale.set(4, 4, 4)
        line2.position.set(0, 14,-16)
        line2.rotation.y = 0;
        scene.add( line2 );
        // gui.add(line2.position, 'x')
        // gui.add(line2.position, 'y')
        // gui.add(line2.position, 'z')
        // gui.add(line2.scale, 'x')
        // gui.add(line2.scale, 'y')
        // gui.add(line2.scale, 'z')
        // gui.add(line2.rotation, 'y')

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

    //Title
    //text
    loader.load('text/u/u.gltf',function ( gltf ) {
        const line3 = gltf.scene;
        line3.scale.set(4, 4, 4)
        line3.position.set(0, 14,-16)
        line3.rotation.y = 0;
        scene.add( line3 );
        // gui.add(line3.position, 'x')
        // gui.add(line3.position, 'y')
        // gui.add(line3.position, 'z')
        // gui.add(line3.scale, 'x')
        // gui.add(line3.scale, 'y')
        // gui.add(line3.scale, 'z')
        // gui.add(line3.rotation, 'y')

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

    //Title
    //text
    loader.load('text/b/b.gltf',function ( gltf ) {
        const line4 = gltf.scene;
        line4.scale.set(4, 4, 4)
        line4.position.set(0, 14,-16)
        line4.rotation.y = 0;
        scene.add( line4 );
        // gui.add(line4.position, 'x')
        // gui.add(line4.position, 'y')
        // gui.add(line4.position, 'z')
        // gui.add(line4.scale, 'x')
        // gui.add(line4.scale, 'y')
        // gui.add(line4.scale, 'z')
        // gui.add(line4.rotation, 'y')

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

    //Title
    //text
    loader.load('text/o/o.gltf',function ( gltf ) {
        const line5 = gltf.scene;
        line5.scale.set(4, 4, 4)
        line5.position.set(0, 14,-16)
        line5.rotation.y = 0;
        scene.add( line5 );
        // gui.add(line5.position, 'x')
        // gui.add(line5.position, 'y')
        // gui.add(line5.position, 'z')
        // gui.add(line5.scale, 'x')
        // gui.add(line5.scale, 'y')
        // gui.add(line5.scale, 'z')
        // gui.add(line5.rotation, 'y')

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

    //Title
    //text
    loader.load('text/d/d.gltf',function ( gltf ) {
        const line6 = gltf.scene;
        line6.scale.set(4, 4, 4)
        line6.position.set(0, 14,-16)
        line6.rotation.y = 0;
        scene.add( line6 );
        // gui.add(line6.position, 'x')
        // gui.add(line6.position, 'y')
        // gui.add(line6.position, 'z')
        // gui.add(line6.scale, 'x')
        // gui.add(line6.scale, 'y')
        // gui.add(line6.scale, 'z')
        // gui.add(line6.rotation, 'y')

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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function throwBall() {

    const sphere = spheres[ sphereIdx ];

    camera.getWorldDirection( playerDirection );

    sphere.collider.center.copy( playerCollider.end ).addScaledVector( playerDirection, playerCollider.radius * 1.5 );

    // throw the ball with more force if we hold the button longer, and if we move forward

    const impulse = 15 + 30 * ( 1 - Math.exp( ( mouseTime - performance.now() ) * 0.001 ) );

    sphere.velocity.copy( playerDirection ).multiplyScalar( impulse );
    sphere.velocity.addScaledVector( playerVelocity, 2 );

    sphereIdx = ( sphereIdx + 1 ) % spheres.length;

}

function playerCollisions() {

    const result = worldOctree.capsuleIntersect( playerCollider );

    playerOnFloor = false;

    if ( result ) {

        playerOnFloor = result.normal.y > 0;

        if ( ! playerOnFloor ) {

            playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );

        }

        playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

    }

}

function updatePlayer( deltaTime ) {

    let damping = Math.exp( - 4 * deltaTime ) - 1;

    if ( ! playerOnFloor ) {

        playerVelocity.y -= GRAVITY * deltaTime;

        // small air resistance
        damping *= 0.1;

    }

    playerVelocity.addScaledVector( playerVelocity, damping );

    const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
    playerCollider.translate( deltaPosition );

    playerCollisions();

    camera.position.copy( playerCollider.end );

}

function playerSphereCollision( sphere ) {

    const center = vector1.addVectors( playerCollider.start, playerCollider.end ).multiplyScalar( 0.5 );

    const sphere_center = sphere.collider.center;

    const r = playerCollider.radius + sphere.collider.radius;
    const r2 = r * r;

    // approximation: player = 3 spheres

    for ( const point of [ playerCollider.start, playerCollider.end, center ] ) {

        const d2 = point.distanceToSquared( sphere_center );

        if ( d2 < r2 ) {

            const normal = vector1.subVectors( point, sphere_center ).normalize();
            const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( playerVelocity ) );
            const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( sphere.velocity ) );

            playerVelocity.add( v2 ).sub( v1 );
            sphere.velocity.add( v1 ).sub( v2 );

            const d = ( r - Math.sqrt( d2 ) ) / 2;
            sphere_center.addScaledVector( normal, - d );

        }

    }

}

function spheresCollisions() {

    for ( let i = 0, length = spheres.length; i < length; i ++ ) {

        const s1 = spheres[ i ];

        for ( let j = i + 1; j < length; j ++ ) {

            const s2 = spheres[ j ];

            const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
            const r = s1.collider.radius + s2.collider.radius;
            const r2 = r * r;

            if ( d2 < r2 ) {

                const normal = vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
                const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
                const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

                s1.velocity.add( v2 ).sub( v1 );
                s2.velocity.add( v1 ).sub( v2 );

                const d = ( r - Math.sqrt( d2 ) ) / 2;

                s1.collider.center.addScaledVector( normal, d );
                s2.collider.center.addScaledVector( normal, - d );

            }

        }

    }

}

function updateSpheres( deltaTime ) {

    spheres.forEach( sphere => {

        sphere.collider.center.addScaledVector( sphere.velocity, deltaTime );

        const result = worldOctree.sphereIntersect( sphere.collider );

        if ( result ) {

            sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
            sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

        } else {

            sphere.velocity.y -= GRAVITY * deltaTime;

        }

        const damping = Math.exp( - 1.5 * deltaTime ) - 1;
        sphere.velocity.addScaledVector( sphere.velocity, damping );

        playerSphereCollision( sphere );

    } );

    spheresCollisions();

    for ( const sphere of spheres ) {

        sphere.mesh.position.copy( sphere.collider.center );

    }

}

function getForwardVector() {

    camera.getWorldDirection( playerDirection );
    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;

}

function getSideVector() {

    camera.getWorldDirection( playerDirection );
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross( camera.up );

    return playerDirection;

}

function controls( deltaTime ) {

    // gives a bit of air control
    const speedDelta = deltaTime * ( playerOnFloor ? 25 : 8 );

    if ( keyStates[ 'KeyW' ] ) {

        playerVelocity.add( getForwardVector().multiplyScalar( speedDelta ) );

    }

    if ( keyStates[ 'KeyS' ] ) {

        playerVelocity.add( getForwardVector().multiplyScalar( - speedDelta ) );

    }

    if ( keyStates[ 'KeyA' ] ) {

        playerVelocity.add( getSideVector().multiplyScalar( - speedDelta ) );

    }

    if ( keyStates[ 'KeyD' ] ) {

        playerVelocity.add( getSideVector().multiplyScalar( speedDelta ) );

    }

    if ( playerOnFloor ) {

        if ( keyStates[ 'Space' ] ) {

            playerVelocity.y = 15;

        }

    }

}

function teleportPlayerIfOob(){
    if (camera.position.y <= -1){
        playerCollider.start.set( 0, 0.35, 0 );
        playerCollider.end.set( 0, 1, 0 );
        playerCollider.radius =  0.35;
        camera.position.copy( playerCollider.end );
        camera.rotation.set( 0.72, 0, 0 );
    }
}

function teleportPlayerIfOob1(){
    if (camera.position.z <= -40){
        playerCollider.start.set( 0, 0.35, 0 );
        playerCollider.end.set( 0, 1, 0 );
        playerCollider.radius =  0.35;
        camera.position.copy( playerCollider.end );
        camera.rotation.set( 0.72, 0, 0 );
    }
}

function animate() {

    const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

        controls( deltaTime );

        updatePlayer( deltaTime );

        updateSpheres( deltaTime );

        teleportPlayerIfOob();

        teleportPlayerIfOob1();

    }

    renderer.render( scene, camera );

    stats.update();

    requestAnimationFrame( animate );

}

function onTransitionEnd( event ) {

	event.target.remove();
	
}

animate();