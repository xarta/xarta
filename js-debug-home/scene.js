var camera, controls, scene, renderer, clock;   // water stuff
                                                // xarta using as a foundation
// testing
// animation sequences (calling them phases)
var phaseCubeApproach = true;   // X A R T A cubes - approaching us
var phaseMoonPushBack = true;   // simplfies directions vs camera
                                // i.e. start in position we want to end-up with
                                // but put the moon back before visible, like
                                // loading a spring-return
var phaseMoonApproach = false;  // trigger for moon to approach
var phaseSink = false;          // trigger for cubes X A R T A to sink under water

// global for now for easy inter-function access
var moonz = -500;               // where we want the moon (has to be far away with depth)
                                // even though it's a 2D picture ... else camera views
                                // will distort it too much, and also want it to look big
                                // compared to pyramids that fly close to it ...
                                // but not so far away that lighting becomes harder
var moonMesh;                   // the mesh to add to the scene
var starsMesh;                  // the mesh to add to the scene

var num_cylinders = 0;
var range_cylinders = 499;  // keep within 3D bounds {x, y, z} -> 499 etc.
var cylinders;              // Array()
var calmCylinders = false;  // want cylinders to scurry off screen - stop distracting
                            // when video player or photo slider displayed etc.

        // TEST
        setTimeout(function() {
            window.calmCylinders = true;
        }, 15000);


                            // ***********************************************************
const YES = 2;              // NB: Choice NOT TO SUPPORT IExplr EARLIER THAN 11 (ES2015)
const NO = 0;               // ... the target audience for my personal website is 
const PENDING = 1;          // ... likely to have a more recent browser (technology ppl)
                            // ***********************************************************

var saveCycles = NO;        // monostable delay after calmCyclinders set to true
                            // - use to toggle whether cylinder matrix updates with changes
                            // reset with calmCylinders = false


var fps = 1;                // calculate from frames/accDelta etc.
var frames = 0;             // count frames in accumalative-delta-time
var accDelta = 0;           // accumulative delta time (avoid divide by zero)

                            // use fps to determine computation power of rendering device
                            // (nb not doing webGL detect specifically or explicit canvas fallbacks)
                            // Use idea of progressive (computation) enchancement ... so don't show
                            // computationally expensive water on low-compute devices
                            // or, limit cylindars on low-compute devices, proportional to fps

                            // nb: first 2 or 3 seconds not stable fps, when cubes are initialised
                            //     so, not perfect.

                            // Xarta testing on Samsung Galaxy S3, Samsung Note 4, Haswell I7 (incl. own GPU)
                            // and, Sandy Bridge I5 with same age medium-grade graphics card
                            // and, year 2009 Core 2 Duo laptop with separate graphics card (gets warm)

var navDrawer = document.getElementsByClassName("drawer")[0];
navDrawer.style.opacity = 0.4;
setTimeout(function() {
    window.navDrawer.style.opacity = 1;
}, 10000);

init(); // camera, water, moon, cylinders etc. etc. - add to scene


var initscale = 8;                          // cube scaling
var cubes = new Array();                    // 5 cubes ... X A R T A
if (window.innerHeight > window.innerWidth) // portrait e.g. phones
{
    cubes[0] = getNewXartaCube( -8,5,-800, "XARTA", 0); // staggar z so fits camera "perspective" view
    cubes[1] = getNewXartaCube(  0,5,-820, "ARTAX", 1);
    cubes[2] = getNewXartaCube( 10,5,-840, "RTAXA", 2);
    cubes[3] = getNewXartaCube( 20,5,-860, "TAXAR", 3);
    cubes[4] = getNewXartaCube( 30,5,-880, "AXART", 4);
}
else
{
    cubes[0] = getNewXartaCube( -10,5,-800, "XARTA", 0); // just in a row - camera zoom will always mean fitting (mostly)
    cubes[1] = getNewXartaCube(   0,5,-800, "ARTAX", 1);
    cubes[2] = getNewXartaCube(  10,5,-800, "RTAXA", 2);
    cubes[3] = getNewXartaCube(  20,5,-800, "TAXAR", 3);
    cubes[4] = getNewXartaCube(  30,5,-800, "AXART", 4);
}


animate();  // kickstart the animation loop



function getNewXartaCube(xPos, yPos, zPos, word, colourStartIndex) 
{
	console.log('getNewXartaCube('+xPos+', '+yPos+', '+zPos+', '+word+', '+colourStartIndex+')');

    var colours = new Array();
    colours[0] = ["orange",     "#ff0000"];     // red background
    colours[1] = ["red",        "#0212f4"];     // blue background
    colours[2] = ["green",      "#f7ec0e"];     // yellow background
    colours[3] = ["yellow",     "#106316"];     // green background
    colours[4] = ["purple",     "#f77c02"];     // orange background

/*
    console.log(colours[(colourStartIndex + 0) % 5][1])
    console.log(colours[(colourStartIndex + 0) % 5][0]);
    console.log(colours[(colourStartIndex + 1) % 5][1])
    console.log(colours[(colourStartIndex + 1) % 5][0]);
    console.log(colours[(colourStartIndex + 2) % 5][1])
    console.log(colours[(colourStartIndex + 2) % 5][0]);
    console.log(colours[(colourStartIndex + 3) % 5][1])
    console.log(colours[(colourStartIndex + 3) % 5][0]);
    console.log(colours[(colourStartIndex + 4) % 5][1])
    console.log(colours[(colourStartIndex + 4) % 5][0]);
*/

    var RIGHT = document.createElement("canvas");
    var RIGHTcontext = RIGHT.getContext("2d");
    RIGHT.width = RIGHT.height = 256;
    RIGHTcontext.shadowColor = "#000";
    RIGHTcontext.shadowBlur = 7;
    RIGHTcontext.fillStyle = colours[(colourStartIndex + 0) % 5][1];
    RIGHTcontext.fillRect(0, 0, 256, 256);
    RIGHTcontext.fillStyle = colours[(colourStartIndex + 0) % 5][0];
    RIGHTcontext.font = "150pt arial bold";
    RIGHTcontext.fillText(word.substr(4,1), 64, 200);

    var LEFT = document.createElement("canvas");
    var LEFTcontext = LEFT.getContext("2d");
    LEFT.width = LEFT.height = 256;
    LEFTcontext.shadowColor = "#000";
    LEFTcontext.shadowBlur = 7;
    LEFTcontext.fillStyle = colours[(colourStartIndex + 1) % 5][1];
    LEFTcontext.fillRect(0, 0, 256, 256);
    LEFTcontext.fillStyle = colours[(colourStartIndex + 1) % 5][0];
    LEFTcontext.font = "150pt arial bold";
    LEFTcontext.fillText(word.substr(1,1), 64, 200);

    var TOP = document.createElement("canvas");
    var TOPcontext = TOP.getContext("2d");
    TOP.width = TOP.height = 256;
    TOPcontext.shadowColor = "#000";
    TOPcontext.shadowBlur = 7;
    TOPcontext.fillStyle =  colours[(colourStartIndex + 2) % 5][1];
    TOPcontext.fillRect(0, 0, 256, 256);
    TOPcontext.fillStyle = colours[(colourStartIndex + 2) % 5][0];
    TOPcontext.font = "150pt arial bold";
    TOPcontext.fillText(word.substr(2,1), 64, 200);

    var BOTTOM = document.createElement("canvas");
    var BOTTOMcontext = BOTTOM.getContext("2d");
    BOTTOM.width = BOTTOM.height = 256;
    BOTTOMcontext.shadowColor = "#000";
    BOTTOMcontext.shadowBlur = 7;
    BOTTOMcontext.fillStyle = colours[(colourStartIndex + 3) % 5][1];
    BOTTOMcontext.fillRect(0, 0, 256, 256);
    BOTTOMcontext.fillStyle = colours[(colourStartIndex + 3) % 5][0];
    BOTTOMcontext.font = "150pt arial bold";
    BOTTOMcontext.fillText(word.substr(3,1), 64, 200);

    var FRONT = document.createElement("canvas");
    var FRONTcontext = FRONT.getContext("2d");
    FRONT.width = FRONT.height = 256;
    FRONTcontext.shadowColor = "#000";
    FRONTcontext.shadowBlur = 7;
    //FRONTcontext.fillStyle = colours[(colourStartIndex + 4) % 5][1];
    FRONTcontext.fillStyle = "black";
    FRONTcontext.fillRect(0, 0, 256, 256);
    FRONTcontext.fillStyle = colours[(colourStartIndex + 4) % 5][0];
    FRONTcontext.font = "150pt arial bold";
    FRONTcontext.fillText(word.substr(0,1), 64, 200);

    var RIGHTmesh =     new THREE.MeshBasicMaterial({ map: new THREE.Texture(RIGHT), 
                                                    transparent: true, opacity: 0.5 });
    RIGHTmesh.map.needsUpdate = true;

    var LEFTmesh =      new THREE.MeshBasicMaterial({ map: new THREE.Texture(LEFT), 
                                                    transparent: true, opacity: 0.5 });
    LEFTmesh.map.needsUpdate = true;

    var TOPmesh =       new THREE.MeshBasicMaterial({ map: new THREE.Texture(TOP), 
                                                    transparent: true, opacity: 0.5 });
    TOPmesh.map.needsUpdate = true;

    var BOTTOMmesh =    new THREE.MeshBasicMaterial({ map: new THREE.Texture(BOTTOM), 
                                                    transparent: true, opacity: 0.5 });
    BOTTOMmesh.map.needsUpdate = true;

    var FRONTmesh =     new THREE.MeshBasicMaterial({ map: new THREE.Texture(FRONT), 
                                                    transparent: true, opacity: 0.5 });
    FRONTmesh.map.needsUpdate = true;


    // cross origin so I can use cloudinary, and 256 pixels width & height
	var textureLoader = new THREE.TextureLoader().setCrossOrigin(true);
	var texture = textureLoader.load( "https://res.cloudinary.com/xarta/image/upload/v1496448263/xarta/2014-me-at-work256.png" ); // BACK

    // so we're making a cube e.g. 5 faces are letters X A R T A, and the backface is a pic of me lol ...
    // and by using transparency, light from the rest of the dynamic scene will illuminate "me" sometimes through the transparent cube
	var materials = [
		RIGHTmesh,
		LEFTmesh,
		TOPmesh,
		BOTTOMmesh,
		FRONTmesh,
		new THREE.MeshBasicMaterial( {  map: texture, 
                                        side:THREE.DoubleSide, 
                                        shading: THREE.FlatShading, 
                                        transparent: true, opacity: 0.5, color: 0xf902d4 } ) // BACK
	];
	
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );


    var obj = new THREE.Mesh( geometry, materials );

    obj.name = word.substr(0,1);                    // letter on face of cube that is facing us
	obj.scale.set(initscale,initscale,initscale);   // initiscale is a global
    obj.position.z = zPos;
    obj.position.x = xPos;
    obj.position.y = yPos;
    
    obj.lightDirection = new THREE.Vector3(0.7, 20, 0); // bright, off centre

    obj.xartaRot = 1; // used for initial object-axis rotation direction

	scene.add( obj );

    return(obj);
}





// this function should now be called
// extended animate or something (more than a tumble - it evolved)
function tumble(transformRate)
{


    cubes.forEach(function(cube, index, ar){


        if ( (5 < cubes[index].rotation.x) && (cubes[index].rotation.x < 6) )
        {
            cubes[index].xartaRot = -1; // reverse rotation
        }
        if (cubes[index].rotation.x < 0)
        {
            cubes[index].xartaRot = 0; // stop, showing X A R T A (not precise on slow machine)
        }

        // rotation.x starts at 0 and is positive accumulative
        cubes[index].rotation.x += (cubes[index].xartaRot * transformRate);
        cubes[index].rotation.y += (cubes[index].xartaRot * transformRate);

        console.log(cubes[index].xartaRot);
        console.log(cubes[index].rotation.x);
    }, this);


    var approachRate = 200 * transformRate;
    var fit =  ( (window.innerWidth / window.innerHeight) * 2 ) - approachRate ;

    if (phaseCubeApproach === true)
    {
        
        // stop the approach of everything, possibly staggard,
        // once X (as in X A R T A) has reached our chosen z-axis
        if (cubes[0].position.z < fit )
        {
            for (i=0; i < cubes.length; i++)
            {
                cubes[i].position.z += approachRate;
            }
        }
        else
        {
            phaseCubeApproach = false;
            setTimeout(function() {
                window.phaseSink = true;
            }, 8000);
        }
    }

    // sink all the cubes under water, out the way (job done - now just adds colour)
    if (phaseSink === true)
    {
        var yBottom = -15;
        for (i=0; i < cubes.length; i++)
        {
            phaseSink = false;
            // also straighten-out ... not fussed about off-screen sunken cubes in portrait
            // - if device switches to landscape, will then display
            if (cubes[i].position.z < fit )
            {
                cubes[i].position.z += (approachRate/50) * (i + 1);
            }

            // sink all until yBottom
            if( cubes[i].position.y > yBottom )
            {
                phaseSink = true;
                if(cubes[i].rotation.x > -0.5)
                {
                    // rotate 45 degrees to tilt front faces toward us, as we are looking down
                    cubes[i].rotation.x -= transformRate;
                }
                cubes[i].position.y -= approachRate/50;
            }
            
        }
    }

    if (phaseMoonPushBack === true)
    {
        moonz = -1000;              // in the dark, out of view
        phaseMoonPushBack = false;  // do once
        phaseMoonApproach = true;   // now slow approach
    }

    if (phaseMoonApproach === true)
    {
        if (moonz < -500)
        {
            moonz += (50*transformRate);
            moonMesh.position.z = moonz;
        }
        else
        {   
            phaseMoonApproach = false;
            scene.add(starsMesh);   // "ping" stars on, after moon in place
                                    // timing should synchronise with cubes
        }
    }

    // TODO: Cylinder???  PYRAMID !!!  MUST HAVE BEEN MAD !!!!
    // RANDOM CYLINDER MOVEMENT
    for (var i = 0; i < num_cylinders; i++) {


        cylinders[i].position.x += cylinders[i].xartaDirx;
        cylinders[i].position.y += cylinders[i].xartaDiry;
        cylinders[i].position.z += cylinders[i].xartaDirz;


        



        // materialise cylinders at start or later, if not paused
        var cylinderOpacity = cylinders[i].material.opacity;
        if ( (cylinderOpacity < 1.0) && (calmCylinders === false) )
        {
            cylinderOpacity += transformRate/300;
            if (cylinderOpacity > 1.0)
            {
                cylinderOpacity = 1.0;
            }
        }
        else if ( (cylinderOpacity > 0) && (calmCylinders === true) )
        {
            cylinderOpacity -= transformRate/500;
            if (cylinderOpacity < 0)
            {
                cylinderOpacity = 0;
            }
        }

        cylinders[i].material.opacity = cylinderOpacity;
    
        if(calmCylinders === false)
        {
            moveRate = (Math.random() + 1) * (125*transformRate);
            saveCycles = NO; // reset monostable delay for suppressing matrix update
        }
        else
        {
            moveRate = 0; // pause cylinders when out the way
            if ( saveCycles === NO)
            {
                saveCycles = PENDING;
                setTimeout(function() {
                    window.saveCycles = YES;
                }, 14000);
            }
        }
        

        // KEEP WITHIN X, Y, Z BOUNDARIES
        if (cylinders[i].position.x > range_cylinders)
        {
            cylinders[i].xartaDirx = (Math.random() * -1) * moveRate;
        }

        if (cylinders[i].position.y > range_cylinders)
        {
            cylinders[i].xartaDiry = (Math.random() * -1) * moveRate;
        }

        if (cylinders[i].position.z > 100)
        {
            cylinders[i].xartaDirz = (Math.random() * -1) * moveRate;
        }


        if (cylinders[i].position.x < (-1 * range_cylinders))
        {
            cylinders[i].xartaDirx = (Math.random() * 1) * moveRate;
        }

        if (cylinders[i].position.y <  (-1 * range_cylinders))
        {
            cylinders[i].xartaDiry = (Math.random() * 1) * moveRate;
        }

        if (cylinders[i].position.z <  (-1 * 498))
        {
            cylinders[i].xartaDirz = (Math.random() * 1) * moveRate;
        }

        // nb: relying on optimisation to negate other unneccessary computation
        if ( (saveCycles === NO) || (saveCycles === PENDING) )
        {
            cylinders[i].updateMatrix();
        }
        


    }
}

function init() {

    var loader = new THREE.TextureLoader().setCrossOrigin(true);    // Use same cross-origin loader for all assets

    // GET LOADING GOING NOW, STRAIGHT-AWAY

    // Load the background texture  STARS (from NASA galleries)
    var stars = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496587567/xarta/spiral-galaxy.jpg' );               
    
    
    // Load the background texture MOON (found with Google ... oops - forgot attribution)
    //                                  ... was a jpg, but wanted a circular cropped transparent png
    //                                  ... it's not perfect even with the feathering ... but is ok

    // responosive sizes/quality ... big moon is high quality transparent png (over 300KB)

    var theMoon;
    if (window.innerWidth > 768)
    {
        theMoon = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496588500/xarta/moon.png' );
    }
    else if (window.innerWidth > 512)
    {
        theMoon = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496576988/xarta/moon-lower-quality-512.png' );
    }
    else
    {
        theMoon = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496586463/xarta/moon-lower-quality-256.png');
    }




    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    renderer = new THREE.WebGLRenderer();   // Not using WebGL Detect yet ... TODO: look into whether I really should (statistically & target audience)
    renderer.setClearColor(0x000000, 1); 
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoclear = true;              // TODO: NOT SURE ABOUT THIS, AND MANUAL CLEARING OF "STAGE BUFFER" - See water.js

    var container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(6, 10, 50);


    setTimeout(function() {
        //controls = new THREE.OrbitControls(camera, renderer.domElement);  TODO: toggle on/off with menu <a> link
    }, 12000);
    


    
    // world
    var world = { scene: scene };



    // STARS
    starsMesh = new THREE.Mesh( 
        new THREE.PlaneGeometry(45, 45,1, 1),
        new THREE.MeshBasicMaterial({
            map: stars
        }));

    starsMesh.position.x = -350;  
    starsMesh.position.z = -600;            // behind moon - further back is too dark/blurry, but obscures things behind it
    starsMesh.scale.set(50, 50,10);
    //starsMesh.material.depthTest = true;    // no need
    //starsMesh.material.depthWrite = true;



    // MOON
    moonMesh = new THREE.Mesh( 
        new THREE.PlaneGeometry(45, 45,1, 1),
        new THREE.MeshBasicMaterial({
            map: theMoon, transparent: true, opacity: 1.0, color: 0xff0000
        })
    );

    // keep size in portrait mode, but shift partly offscreen to left
    // nb will appear bigger with bigger height to width ratio, because
    // of perspective camera settings and how "near" we are to it
    moonMesh.position.x = -1 * 0.25 * window.innerWidth;
    moonMesh.position.y = 20;
    moonMesh.position.z = moonz;
    moonMesh.scale.set(13, 14,14); 
    moonMesh.material.depthTest = true;   // because transparent png
    moonMesh.material.depthWrite = true;

    setTimeout(function() {
        if(window.fps > 5)
        {
            scene.add(moonMesh);    
            moonMesh.material.color.setHex( 0xffffff );
        }
    }, 2000); // first second might be unreliable on 2014 Samsung Note 4 device


    // water computationally HEAVY
    setTimeout(function() {

        if(window.fps > 7)
        {
            // WATER
            water = new Water(renderer, camera, world, {
                width: 210,
                height: 200,
                segments: 5,
                lightDirection: new THREE.Vector3(0.7, 0.7, 0)
            });

            water.position.set(-70, 1, 0);
            water.rotation.set(Math.PI * -0.5, 0, 0);
            water.updateMatrix();


            scene.add(moonMesh);
            
            moonMesh.material.color.setHex( 0xffffff );
            scene.add(water);  
        }
    }, 3000);






    // CYLINDERS        TODO: Some patterned ones e.g. Bee colour stripes, with Doppler-shift buzz audio from camera position
    var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    var material = new THREE.MeshPhongMaterial({ color: 0xafab5b, shading: THREE.FlatShading, transparent: true,  opacity: 0 });

    setTimeout(function() {
        if (window.fps < 60)
        {
            num_cylinders = window.fps;
        }
        else
        {
            num_cylinders = 60; // plenty!!!
        }
        
        console.log("Number of cylinders: "+ num_cylinders);
        cylinders = new Array(num_cylinders);
        for (var i = 0; i < num_cylinders; i++) {

            cylinders[i] = new THREE.Mesh(geometry, material);
            cylinders[i].position.x = (Math.random() - 0.5) * range_cylinders;
            cylinders[i].position.y = (Math.random() - 0.5) * range_cylinders;
            cylinders[i].position.z = (Math.random() - 0.5) * range_cylinders;

            cylinders[i].xartaDirx = (Math.random() - 0.5) * 5;
            cylinders[i].xartaDiry = (Math.random() - 0.5) * 5;
            cylinders[i].xartaDirz = (Math.random() - 0.5) * 5;

            cylinders[i].updateMatrix();
            cylinders[i].matrixAutoUpdate = false;
            scene.add(cylinders[i]);

        }      
    },6000);




    // lights (still experimenting)

    light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(250, -300, 500);
    scene.add(light);

    var spotLight = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
    spotLight.position.set( 0, 150, 0 );
    
    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    spotLight.target = spotTarget;
    
    scene.add(spotLight);
    // scene.add(new THREE.PointLightHelper(spotLight, 1));

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}



function calcFps(delta)
{
    frames += 1;
    accDelta += delta;

    if(accDelta > 1)
    {
        fps = frames;
        accDelta = 0;
        frames = 1;
    }

}


function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();
    calcFps(delta);

    if ( !(typeof water === 'undefined' || water === null) ){
        water.update(delta);
    }
    

    //console.log(delta);
    tumble(delta);
    
    //console.log(fps);


    render();

}



function render() {

    renderer.render(scene, camera);
        

}
