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

let cuboid;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 110, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(1,1,1);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    // scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    // const gui = new dat.GUI();
    // const animationsFolder = gui.addFolder('Animations')
    // animationsFolder.open()

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

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x000000 );
    hemiLight.position.set( 0, 30, 0 );
    hemiLight.intensity = 1;
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

    //Light 1
    const light1 = new THREE.PointLight( 0xffffff, 1, 100 );
    light1.position.set( 1.5, 24, -20.7 );
    light1.intensity = 1;
    
    scene.add( light1 );

    // gui.add(light1.position, 'x')
    // gui.add(light1.position, 'y')
    // gui.add(light1.position, 'z')
    // gui.add(light1, 'intensity')

    const pointLightHelper1 = new THREE.PointLightHelper(light1, 2);
    scene.add(pointLightHelper1)
    
    // //Light 2
    // const light2 = new THREE.PointLight( 0xffffff, 1, 100 );
    // light2.position.set(-9, 0, -18.5 );
    // light2.intensity = 0.2;
    
    // scene.add( light2 );

    // gui.add(light2.position, 'x')
    // gui.add(light2.position, 'y')
    // gui.add(light2.position, 'z')
    // gui.add(light2, 'intensity')

    // const pointLightHelper2 = new THREE.PointLightHelper(light2, 2);
    // scene.add(pointLightHelper2)

    // //Light 3
    // const light3 = new THREE.PointLight( 0xffffff, 1, 100 );
    // light3.position.set(11, 0, -18.5 );
    // light3.intensity = 0.2;
    
    // scene.add( light3 );

    // gui.add(light3.position, 'x')
    // gui.add(light3.position, 'y')
    // gui.add(light3.position, 'z')
    // gui.add(light3, 'intensity')

    // const pointLightHelper3 = new THREE.PointLightHelper(light3, 2);
    // scene.add(pointLightHelper3)

    //Light 4
    const light4 = new THREE.PointLight( 0xffffff, 1, 100 );
    light4.position.set(0, 5, -64 );
    light4.intensity = 0.1;
    
    scene.add( light4 );

    // gui.add(light4.position, 'x')
    // gui.add(light4.position, 'y')
    // gui.add(light4.position, 'z')
    // gui.add(light4, 'intensity')

    const pointLightHelper4 = new THREE.PointLightHelper(light4, 2);
    scene.add(pointLightHelper4)

    

    //Spotlight 1


    //Controls
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

    //GLTFLoader
    const loader = new GLTFLoader()
    
    //DIGITAL SPACE
    // Phase1
    loader.load('phase1/phase1.gltf',function ( gltf ) {
            const phase1 = gltf.scene;
            phase1.scale.set(1,1,1)
            phase1.position.set(0.9,-2,-26)
            scene.add( phase1 );
            // gui.add(phase1.position, 'x')
            // gui.add(phase1.position, 'y')
            // gui.add(phase1.position, 'z')

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

        //Phase1a
        loader.load('phase1a/phase1a.gltf',function ( gltf ) {
            const phase1a = gltf.scene;
            phase1a.scale.set(1,1,1)
            phase1a.position.set(0.9,-2,-26)
            scene.add( phase1a );
            // gui.add(phase1a.position, 'x')
            // gui.add(phase1a.position, 'y')
            // gui.add(phase1a.position, 'z')

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

        //     //Phase2
            loader.load('phase2/phase2.gltf',function ( gltf ) {
                const phase2 = gltf.scene;
                phase2.scale.set(1,1,1)
                phase2.position.set(0.9,-2,-26)
                scene.add( phase2 );
                // gui.add(phase2.position, 'x')
                // gui.add(phase2.position, 'y')
                // gui.add(phase2.position, 'z')
    
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

            //Phase3
            loader.load('phase3/phase3.gltf',function ( gltf ) {
                const phase3 = gltf.scene;
                phase3.scale.set(1,1,1)
                phase3.position.set(0.9,-2,-26)
                scene.add( phase3 );
                // gui.add(phase3.position, 'x')
                // gui.add(phase3.position, 'y')
                // gui.add(phase3.position, 'z')
    
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
    // let cuboid.rotation.y += 0,1;

    const time = performance.now();

    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 1;

        const intersections = raycaster.intersectObjects( objects, false );

        const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 55.0 * delta;
        velocity.z -= velocity.z * 55.0 * delta;

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
