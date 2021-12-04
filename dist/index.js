import * as THREE from './three.js-master/build/three.module.js';
import Stats from './three.js-master/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js'
import * as dat from "./three.js-master/examples/jsm/libs/dat.gui.module.js"
import { Octree } from './three.js-master/examples/jsm/math/Octree.js';
import { Capsule } from './three.js-master/examples/jsm/math/Capsule.js';
import { RectAreaLightHelper } from './three.js-master/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from './three.js-master/examples/jsm/lights/RectAreaLightUniformsLib.js';

const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x88ccff );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.rotation.order = 'YXZ';

const gui = new dat.GUI();
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

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
    
    // // optional: remove loader from DOM via event listener
    // loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
    
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


// DIGITAL SPACES
const loader = new GLTFLoader(loadingManager);

// PHASE 1
loader.load( 'phasesatu/phasesatu.gltf', ( gltf ) => {
const phase1 = gltf.scene;
phase1.scale.set(1,1,1);
phase1.position.set(0,-2,-26)
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

//Phase2
loader.load('phase2/phase2.gltf',function ( gltf ) {
const phase2 = gltf.scene;
phase2.scale.set(1,1,1)
phase2.position.set(0,-2,-26)
scene.add( phase2 );



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


//Phase3
loader.load('phase3 Floor/floor.gltf',function ( gltf ) {
    const phase3 = gltf.scene;
    phase3.scale.set(1,1,1)
    phase3.position.set(0,-2,-26)
    scene.add( phase3 );
    
    
    
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

//Phase3
loader.load('phase3 Roof/room.gltf',function ( gltf ) {
    const phase3roof = gltf.scene;
    phase3roof.scale.set(1,1,1)
    phase3roof.position.set(0,-2,-26)
    scene.add( phase3roof );
    
    
    
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

//Phase4_Building
loader.load('phase4/building/building.gltf',function ( gltf ) {
    const Phase4_Building = gltf.scene;
    Phase4_Building.scale.set(1,1,1)
    Phase4_Building.position.set(0,-1.65,-26)
    scene.add( Phase4_Building );
    
    
    
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

//Phase4_Ground
loader.load('phase4/ground/ground.gltf',function ( gltf ) {
    const Phase4_Ground = gltf.scene;
    Phase4_Ground.scale.set(1,1,1)
    Phase4_Ground.position.set(0,-2,-26)
    scene.add( Phase4_Ground );
    
    
    
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

//Phase4_Roof
loader.load('phase4/roof/roof.gltf',function ( gltf ) {
    const Phase4_Roof = gltf.scene;
    Phase4_Roof.scale.set(1,1,1)
    Phase4_Roof.position.set(0,-2,-26)
    scene.add( Phase4_Roof );
    
    
    
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

//Phase4_Sidewallr1
loader.load('phase4/sidewalk/sidewalk.gltf',function ( gltf ) {
    const Phase4_Sidewallr1 = gltf.scene;
    Phase4_Sidewallr1.scale.set(1,1,1)
    Phase4_Sidewallr1.position.set(0,-2,-26)
    scene.add( Phase4_Sidewallr1 );
    
    
    
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

    //OBJECT
    //clothes
    loader.load('men/clothes/clothes.gltf',function ( gltf ) {
        const clothes = gltf.scene;
        clothes.scale.set(.23, .23, .23)
        clothes.position.set(5.7, 0.9, -79.5)
        clothes.rotation.y = -1.17;
        scene.add( clothes );
        // gui.add(clothes.position, 'x')
        // gui.add(clothes.position, 'y')
        // gui.add(clothes.position, 'z')
        // gui.add(clothes.scale, 'x')
        // gui.add(clothes.scale, 'y')
        // gui.add(clothes.scale, 'z')
        // gui.add(clothes.rotation, 'y')

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

loader.load('men/vest/vest.gltf',function ( gltf ) {
    const vest = gltf.scene;
    vest.scale.set(.23, .23, .23)
    vest.position.set(7.3, 2.2, -80)
    vest.rotation.y = -1.22;
    scene.add( vest );
    // gui.add(vest.position, 'x')
    // gui.add(vest.position, 'y')
    // gui.add(vest.position, 'z')
    // gui.add(vest.scale, 'x')
    // gui.add(vest.scale, 'y')
    // gui.add(vest.scale, 'z')
    // gui.add(vest.rotation, 'y')

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

    loader.load('men/outer/outer.gltf',function ( gltf ) {
    const outer = gltf.scene;
    outer.scale.set(.23, .23, .23)
    outer.position.set(6.4, 1.3, -81)
    outer.rotation.y = -1.55;
    scene.add( outer );
    // gui.add(outer.position, 'x')
    // gui.add(outer.position, 'y')
    // gui.add(outer.position, 'z')
    // gui.add(outer.scale, 'x')
    // gui.add(outer.scale, 'y')
    // gui.add(outer.scale, 'z')
    // gui.add(outer.rotation, 'y')

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

    //pants
    loader.load('men/pants/pants.gltf',function ( gltf ) {
        const pants = gltf.scene;
        pants.scale.set(.2, .2, .2)
        pants.position.set(6.9, 1.3, -79)
        pants.rotation.y = -1.1;
        scene.add( pants );
        // gui.add(pants.position, 'x')
        // gui.add(pants.position, 'y')
        // gui.add(pants.position, 'z')
        // gui.add(pants.scale, 'x')
        // gui.add(pants.scale, 'y')
        // gui.add(pants.scale, 'z')
        // gui.add(pants.rotation, 'y')

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

    //odheng
    loader.load('men/odheng/odheng.gltf',function ( gltf ) {
        const odheng = gltf.scene;
        odheng.scale.set(.25, .25, .25)
        odheng.position.set(7.3, 2.1, -55)
        odheng.rotation.y = -1;
        scene.add( odheng );
        // gui.add(odheng.position, 'x')
        // gui.add(odheng.position, 'y')
        // gui.add(odheng.position, 'z')
        // gui.add(odheng.scale, 'x')
        // gui.add(odheng.scale, 'y')
        // gui.add(odheng.scale, 'z')
        // gui.add(odheng.rotation, 'y')

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

    //boots
    loader.load('men/boots/boots.gltf',function ( gltf ) {
        const boots = gltf.scene;
        boots.scale.set(.3, .3, .3)
        boots.position.set(6.9, 0.6, -56)
        boots.rotation.y = -1.6;
        scene.add( boots );
        // gui.add(boots.position, 'x')
        // gui.add(boots.position, 'y')
        // gui.add(boots.position, 'z')
        // gui.add(boots.scale, 'x')
        // gui.add(boots.scale, 'y')
        // gui.add(boots.scale, 'z')
        // gui.add(boots.rotation, 'y')

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

    //collar
    loader.load('woman/collar/collar.gltf',function ( gltf ) {
        const collar = gltf.scene;
        collar.scale.set(.3, .3, .3)
        collar.position.set(-4.8, 2.8, -68)
        collar.rotation.y = -5.4;
        scene.add( collar );
        // gui.add(collar.position, 'x')
        // gui.add(collar.position, 'y')
        // gui.add(collar.position, 'z')
        // gui.add(collar.scale, 'x')
        // gui.add(collar.scale, 'y')
        // gui.add(collar.scale, 'z')
        // gui.add(collar.rotation, 'y')

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

    //kemben
    loader.load('woman/kemben/kebaya.gltf',function ( gltf ) {
        const kemben = gltf.scene;
        kemben.scale.set(.5, .5, .5)
        kemben.position.set(-4.3, 1.25, -69)
        kemben.rotation.y = -5;
        scene.add( kemben );
        // gui.add(kemben.position, 'x')
        // gui.add(kemben.position, 'y')
        // gui.add(kemben.position, 'z')
        // gui.add(kemben.scale, 'x')
        // gui.add(kemben.scale, 'y')
        // gui.add(kemben.scale, 'z')
        // gui.add(kemben.rotation, 'y')

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

    //kebaya
    loader.load('woman/kebaya/kebaya.gltf',function ( gltf ) {
        const kebaya = gltf.scene;
        kebaya.scale.set(.3, .3, .3)
        kebaya.position.set(-5.2, 2.9, -88)
        kebaya.rotation.y = -5;
        scene.add( kebaya );
        // gui.add(kebaya.position, 'x')
        // gui.add(kebaya.position, 'y')
        // gui.add(kebaya.position, 'z')
        // gui.add(kebaya.scale, 'x')
        // gui.add(kebaya.scale, 'y')
        // gui.add(kebaya.scale, 'z')
        // gui.add(kebaya.rotation, 'y')

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

    //skirt
    loader.load('woman/skirt/skirt.gltf',function ( gltf ) {
        const skirt = gltf.scene;
        skirt.scale.set(.3, .3, .3)
        skirt.position.set(-3.5, 1.4, -88)
        skirt.rotation.y = -5.3;
        scene.add( skirt );
        // gui.add(skirt.position, 'x')
        // gui.add(skirt.position, 'y')
        // gui.add(skirt.position, 'z')
        // gui.add(skirt.scale, 'x')
        // gui.add(skirt.scale, 'y')
        // gui.add(skirt.scale, 'z')
        // gui.add(skirt.rotation, 'y')

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

    //sandal
    loader.load('woman/sandal/sandal.gltf',function ( gltf ) {
        const sandal = gltf.scene;
        sandal.scale.set(.2, .2, .2)
        sandal.position.set(-4.3, 0.1, -87)
        sandal.rotation.y = -5.3;
        scene.add( sandal );
        // gui.add(sandal.position, 'x')
        // gui.add(sandal.position, 'y')
        // gui.add(sandal.position, 'z')
        // gui.add(sandal.scale, 'x')
        // gui.add(sandal.scale, 'y')
        // gui.add(sandal.scale, 'z')
        // gui.add(sandal.rotation, 'y')

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

    //fullwoman
    loader.load('fullwoman/fullwoman.gltf',function ( gltf ) {
        const fullwoman = gltf.scene;
        fullwoman.scale.set(.3, .3, .3)
        fullwoman.position.set(-1.4, 1.4, -96)
        fullwoman.rotation.y = 0.44;
        scene.add( fullwoman );
        // gui.add(fullwoman.position, 'x')
        // gui.add(fullwoman.position, 'y')
        // gui.add(fullwoman.position, 'z')
        // gui.add(fullwoman.scale, 'x')
        // gui.add(fullwoman.scale, 'y')
        // gui.add(fullwoman.scale, 'z')
        // gui.add(fullwoman.rotation, 'y')

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

    //fullman
    loader.load('fullman/fullman.gltf',function ( gltf ) {
        const fullman = gltf.scene;
        fullman.scale.set(.3, .3, .3)
        fullman.position.set(3.7, 1.7, -96)
        fullman.rotation.y = -0.56;
        scene.add( fullman );
        // gui.add(fullman.position, 'x')
        // gui.add(fullman.position, 'y')
        // gui.add(fullman.position, 'z')
        // gui.add(fullman.scale, 'x')
        // gui.add(fullman.scale, 'y')
        // gui.add(fullman.scale, 'z')
        // gui.add(fullman.rotation, 'y')

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

    //CUBOID Element
    //text
    loader.load('Cuboid/cuboid.gltf',function ( gltf ) {
        const cuboid = gltf.scene;
        cuboid.scale.set(.5, .5, .5)
        cuboid.position.set(6.4, 0.1, -80)
        cuboid.rotation.y = 1;
        scene.add( cuboid );
        // gui.add(cuboid.position, 'x')
        // gui.add(cuboid.position, 'y')
        // gui.add(cuboid.position, 'z')
        // gui.add(cuboid.scale, 'x')
        // gui.add(cuboid.scale, 'y')
        // gui.add(cuboid.scale, 'z')
        // gui.add(cuboid.rotation, 'y')

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



function animate() {

    const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

        controls( deltaTime );

        updatePlayer( deltaTime );

        updateSpheres( deltaTime );

    }

    renderer.render( scene, camera );

    stats.update();

    requestAnimationFrame( animate );

}

function onTransitionEnd( event ) {

	event.target.remove();
	
}