"use strict";
// TODO: SASS TO JS TECHNIQUE TO READ THESE FROM .scss style sheet variables
var colours = new Array();                  // multi-use incl. pyramids (cylinders sic)
colours[0] = ["orange",     "#ff0000"];     // red background
colours[1] = ["red",        "#0212f4"];     // blue background
colours[2] = ["green",      "#f7ec0e"];     // yellow background
colours[3] = ["yellow",     "#106316"];     // green background
colours[4] = ["purple",     "#f77c02"];     // orange background

var camera, controls, sceneGL, rendererGL, clock;
controls = null; // being explicit

                                    // ************************
var rendererCSS3D, sceneCSS3D;      // for YouTube iframes etc.
                                    // ************************

var water = null;

// animation sequences (calling them phases)
var phaseCubeApproach = true;   // X A R T A cubes - approaching us
var phaseMoonPushBack = false;   // simplfies directions vs camera
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
var moonMesh;                   // the mesh to add to the sceneGL

var num_cylinders = 0;
var num_cylinders_so_far = 0;
var cylinderMasterOpacity = 0;
var range_cylinders = 499;  // keep within 3D bounds {x, y, z} -> 499 etc.
var cylinders;              // Array()
var calmCylinders = false;  // want cylinders to scurry off screen - stop distracting
                            // when video player or photo slider displayed etc.

const YES = 2;              // const ... using bable for ES2015
const NO = 0;               
const PENDING = 1;          
                            

var saveCycles = NO;        // monostable delay after calmCyclinders set to true
                            // - use to toggle whether cylinder matrix updates with changes
                            // reset with calmCylinders = false


var secondsCount = 0;                   // to reset every minute
var minutesCount = 0;                   // to accumulate
var fpsAverageQueue = new queueFps();   // update every second (max-int seconds?)
                                        // queue (upto) last 60 seconds

var fps = 1;                // calculate from frames/accDelta etc.
var fpsAverage = 1;         // calculate average for last (rolling) minute
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


// CUBES WITH LETTERS (FONT)
var initscale = 8;                          // cube scaling
var cubes = new Array();                    // 5 cubes ... X A R T A
var cad = -800;                             // cube approach distance (lead)
                                            // using this to sync whoop sound

init();             // camera, water, moon, cylinders etc. etc. - add to sceneGL
getNewXartaCubes(); // add X A R T A transparent cubes
animate();          // kickstart the animation loop

function init() {
    
    var loader = new THREE.TextureLoader().setCrossOrigin('');    
    // Use same cross-origin loader for all assets

    loader.setPath('https://res.cloudinary.com/xarta/image/upload/');
    // GET LOADING GOING NOW, STRAIGHT-AWAY

    // Load the background texture  STARS (from NASA galleries)
    var stars = loader.load( 'v1497350431/xarta/spiral-galaxy.jpg' );               
    
    
    // Load the background texture MOON (found with Google ... oops - forgot attribution)
    //                                  ... was a jpg, but wanted a circular cropped transparent png
    //                                  ... it's not perfect even with the feathering ... but is ok

    // responosive sizes/quality ... big moon is high quality transparent png (over 300KB)

    
    var loadTime = Date.now() - timerStart;     // set timerStart on index.html - doing this instead of
                                            // window.performance as need before window is ready

    clock = new THREE.Clock();
    var camFarPlane = 3000;
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, camFarPlane);
    camera.position.set(6, 10, 50);


    sceneGL = new THREE.Scene();
    sceneCSS3D = new THREE.Scene(); // used for YouTube iframe etc.

    
    // window.YouTubeDefault    // IF -1
                                // -1 makes CSS3D YouTube controls accessible
                                // on top, but hides WebGL, so no point in having
                                // alpha background WebGL (to see through - to CSS3D
                                // if IT WAS behind WebGL)

    rendererCSS3D = new THREE.CSS3DRenderer();
    rendererCSS3D.setSize( window.innerWidth, window.innerHeight );
    rendererCSS3D.domElement.style.position = 'absolute';
    rendererCSS3D.domElement.style.top = 0;
    rendererCSS3D.domElement.style.zIndex = 10;

    if ( window.YouTubeDefault == -1)
    {
        console.log("CSS3D in front of WebGL e.g. YouTube controls accessible");
        rendererGL = new THREE.WebGLRenderer();
        rendererGL.setClearColor(0x000000, 1); 
        sceneGL.fog = new THREE.FogExp2(0x000000, 0.002); // exponential, color, ex
        rendererGL.setClearColor(sceneGL.fog.color);

        rendererGL.domElement.style.zIndex = -1;
    }
    else
    {
        // to blend with CSS3D
        console.log("WebGL (transparent) in front of CSS3D");
        rendererGL = new THREE.WebGLRenderer({alpha:true, antialias: true});
        rendererGL.setClearColor(0x000000, 0.0);
        sceneGL.fog = new THREE.Fog(0x000000, 800,900); // linear, color, near, far
        //rendererGL.setClearColor(sceneGL.fog.color);

        rendererGL.domElement.style.zIndex = 1;
    }


    rendererGL.setPixelRatio(window.devicePixelRatio);
    rendererGL.setSize(window.innerWidth, window.innerHeight);
    
    rendererGL.domElement.style.position = 'absolute';


                                                // TODO TODO TODO TODO
                                                // TEST IF CAN CHANGE DYNAMICALLY, LATER
    rendererGL.domElement.style.top = 0;

    rendererGL.autoclear = false;              // TODO: NOT SURE ABOUT THIS, AND MANUAL CLEARING OF "STAGE BUFFER" - See water.js

    rendererCSS3D.domElement.appendChild(rendererGL.domElement);
    
    var container = document.getElementById('container');
    //container.appendChild(rendererGL.domElement); // now going to append to CSS3D renderer
    container.appendChild( rendererCSS3D.domElement );      


    // world
    var world = { scene: sceneGL };



    // STARS
    (function()
    {
        var starsMesh = new THREE.Mesh( 
            new THREE.PlaneGeometry(45, 45,1, 1),
            new THREE.MeshBasicMaterial({
                map: stars
            }));

        starsMesh.position.x = -350;  
        starsMesh.position.z = -820;            // behind moon - further back is too dark/blurry, but obscures things behind it
        starsMesh.scale.set(50, 50,10);
        //starsMesh.material.depthTest = true;    // no need
        //starsMesh.material.depthWrite = true;

        sceneGL.add(starsMesh); 
    })();


    // MOON
    (function()
    {
        var theMoon;
        var moonLoaded = function()
        {
            console.log("in moonLoaded");
            window.moonMesh = new THREE.Mesh( 
                new THREE.PlaneGeometry(45, 45,1, 1),
                new THREE.MeshBasicMaterial(
                    {
                        map: theMoon, 
                        transparent: true, 
                        opacity: 0.0, color: 0xff0000
                    })
                );   
            // keep size in portrait mode, but shift partly offscreen to left
            // nb will appear bigger with bigger height to width ratio, because
            // of perspective camera settings and how "near" we are to it
            window.moonMesh.position.x = -1 * 0.25 * window.innerWidth;
            window.moonMesh.position.y = 20;
            window.moonMesh.position.z = window.moonz;
            window.moonMesh.scale.set(13, 14,14); 
            window.moonMesh.material.depthTest = true;   // because transparent png
            window.moonMesh.material.depthWrite = true;

            sceneGL.add(window.moonMesh);    
            window.moonMesh.material.color.setHex( 0xffffff );
            window.phaseMoonPushBack = true;
            console.log("moon should be added to sceneGL now");

        };

        // the compute times in devices might vary considerably each time the page is refreshed,
        // even with cached resources. Resorting to lower quality only if compute/load time is
        // excessive, to help a little ... different between 47KB and over 300KB images
        // (The lowest quality is quite apparent on a Note 4)

        // *******
        // UPDATE:
        /**
         * looking at the waterfall in Chrome, looks like any javascript that loads more resources
         * doesn't kick-in until after about 500ms even if async and other pre-loaded stuff is async
         * ... so now deciding to have one moon ... the highest quality one, and preload it using
         * ... link rel="preload" ... more efficient - do while threejs (min) is downloading from
         * ... elsewhere etc.
         */ 
        //if ( (window.innerWidth > 768) || (loadTime < 2500) || window.fps > 5 || window.bigMoonReady == true )
        //{
            theMoon = loader.load( 'v1496588500/xarta/moon.png', moonLoaded );
        //}
        //else if ( (window.innerWidth > 512) || (loadTime < 3000) || window.moon512Ready == true)
        //{
        //    theMoon = loader.load( 'v1496576988/xarta/moon-lower-quality-512.png', moonLoaded );
        //}
        //else
        //{
        //    theMoon = loader.load( 'v1496586463/xarta/moon-lower-quality-256.png', moonLoaded);
        //}
    })();


    // WATER
    (function waitForGoodFPS(fpsAverage, numAttemptsRemaining)
    {
        if ( (typeof addWaterToScene === 'undefined' || addWaterToScene === null) )
        {
            var addWaterToScene;
        }

        //console.log("In function waitForGoodFPS()");
        //console.log("numAttemptsRemaining: " + numAttemptsRemaining);
        clearTimeout(addWaterToScene);
        addWaterToScene = setTimeout(function() 
        {
            if(numAttemptsRemaining > 0)
            {
                if(fpsAverage > 35)
                {
                    console.log("fpsAverage now OK for WATER: " + fpsAverage);
                    water = new Water(rendererGL, camera, world, 
                        {width: 210, height: 200, segments: 5,
                        lightDirection: new THREE.Vector3(0.7, 0.7, 0)});

                    water.position.set(0, 1, 0); // -70, 1, 0
                    water.rotation.set(Math.PI * -0.5, 0, 0);
                    water.updateMatrix();
            
                    sceneGL.add(water);  
                }
                else
                {
                    console.log("fpsAverage NOT good enough yet for water: " + fpsAverage);
                    console.log("numAttemptsRemaining = " + (numAttemptsRemaining -1));
                    waitForGoodFPS(window.fpsAverage, numAttemptsRemaining - 1);
                }
            }
        }, 100);
    })(fpsAverage, 30);


    function getRandomInt(min, max) 
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomCol(colours)
    {
        var randColour = getRandomInt(0,colours.length-1);
        return colours[randColour][1].replace("#","0x");
    }

    // (I say cylinders ... I mean pyramids ... brain-dead moment early on)
    // UPDATE: NOW SHAPES
    // CYLINDERS        TODO: Some patterned ones e.g. Bee colour stripes, 
    //                  with Doppler-shift buzz audio from camera position
    //                  nb: nice colour is yellow/gold: 0xafab5b
    var geometryDefault = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    // ... ok ... three.js calls them cylinders.  Must be where I got it from!!!

    var materialDefault = new THREE.MeshPhongMaterial({ 
                    color: 0xafab5b, 
                    shading: THREE.FlatShading, 
                    transparent: true,  opacity: 0 });

    var geometrySphere = new THREE.SphereGeometry( 5, 32, 32 );

    var geometryComplex = new THREE.Geometry();

    for ( var count = 0; count < 10; count ++ ) 
    {

        var geo = new THREE.BoxGeometry( 5, 5, 5 );

        geo.translate( THREE.Math.randFloat( - 5, 5 ), THREE.Math.randFloat( - 5, 5 ), THREE.Math.randFloat( - 5, 5 ) );

        var color = new THREE.Color().setHex(getRandomCol(colours));

        for ( var i = 0; i < geo.faces.length; i ++ ) 
        {

            var face = geo.faces[ i ];
            face.vertexColors.push( color, color, color ); // all the same in this case
            //face.color.set( color ); // this works, too; use one or the other

        }
        geometryComplex.merge( geo );
    }

    var materialComplex = new THREE.MeshPhongMaterial({ 
                    color: 0xffffff, 
                    vertexColors: THREE.VertexColors,
                    shading: THREE.FlatShading, 
                    transparent: true,  opacity: 0 });

    setTimeout(function() {
        if (window.fpsAverage < 10)
        {
            num_cylinders = 2;  // keep low for slower devices
        }
        else if (window.fpsAverage < 20)
        {
            num_cylinders = 5;
        }
        else if (window.fpsAverage < 30)
        {
            num_cylinders = 10;
        }
        else if (window.fpsAverage < 40)
        {
            num_cylinders = 15; 
        }
        else if (window.fpsAverage < 60)
        {
            num_cylinders = window.fpsAverage;
        }
        else
        {
            num_cylinders = 60; // plenty!!!
        }
        
        console.log("Number of cylinders: "+ num_cylinders);
        cylinders = new Array(num_cylinders);


        let i = 0;

        let start = Date.now();

        function addShape() 
        {

            if (i < num_cylinders) 
            {
                setTimeout(addShape, Math.floor(30000/window.fps)); 

                if(calmCylinders === false)
                {
                    var setColour = getRandomCol(colours);
                    console.log("Adding shape: " + i);
                    
                    if ( (i < 5) && (window.fps > 50) )
                    {
                        switch(i)
                        {
                            case 0:
                                cylinders[i] = getNewXartaCube( -10,5,-100, "XARTA", i, colours);
                                break;
                            case 1:
                                cylinders[i] = getNewXartaCube(   0,5,-200, "ARTAX", i, colours);
                                break;
                            case 2:
                                cylinders[i] = getNewXartaCube(  10,5,-300, "RTAXA", i, colours);
                                break;
                            case 3:
                                cylinders[i] = getNewXartaCube(  20,5,-400, "TAXAR", i, colours);
                                break;
                            case 4:
                                cylinders[i] = getNewXartaCube(  30,5,-400, "AXART", i, colours);
                                break;
                        }
    
                    }
                    else if ((window.fps + getRandomInt(0,20) > 36))
                    {
                        if (i < num_cylinders/4)
                        {
                            // separate for different colours though more compute?
                            var geometrySimple = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
                            var materialSimple = new THREE.MeshPhongMaterial({ 
                            color: 0xffffff, 
                            shading: THREE.FlatShading, 
                            transparent: true,  opacity: 0 });

                            cylinders[i] = new THREE.Mesh(geometrySimple, materialSimple);
                            cylinders[i].material.color.setHex(setColour);
                        }
                        else if (i < num_cylinders/2)
                        {
                            cylinders[i] = new THREE.Mesh(geometryComplex, materialComplex);
                        }
                        else if (i < num_cylinders*0.75)
                        {
                            var geometrySimple = new THREE.SphereGeometry( 10, 64, 64 );
                            var materialSimple = new THREE.MeshPhongMaterial({ 
                            color: 0xffffff, 
                            shading: THREE.FlatShading, 
                            transparent: true,  opacity: 0 });

                            cylinders[i] = new THREE.Mesh(geometrySimple, materialSimple);
                            cylinders[i].material.color.setHex(setColour);
                        }
                        else
                        {
                            var geometrySimple = new THREE.BoxBufferGeometry( 50, 50, 50 );
                            var materialSimple = new THREE.MeshPhongMaterial({ 
                            color: 0xffffff, 
                            shading: THREE.FlatShading, 
                            transparent: true,  opacity: 0 });

                            cylinders[i] = new THREE.Mesh(geometrySimple, materialSimple);
                            cylinders[i].material.color.setHex(setColour);
                        }
                    }
                    else
                    {
                        cylinders[i] = new THREE.Mesh(geometryDefault, materialDefault);
                    }

                    
                    

                    cylinders[i].position.x = (Math.random() - 0.5) * range_cylinders;
                    cylinders[i].position.y = (Math.random() - 0.5) * range_cylinders;
                    cylinders[i].position.z = (Math.random() - 0.5) * range_cylinders;

                    cylinders[i].xartaDirx = (Math.random() - 0.5) * 15; // velocity
                    cylinders[i].xartaDiry = (Math.random() - 0.5) * 10;
                    cylinders[i].xartaDirz = (Math.random() - 0.5) * 20;

                    cylinders[i].updateMatrix();
                    cylinders[i].matrixAutoUpdate = false;


                    sceneGL.add(cylinders[i]);
                    window.num_cylinders_so_far = i;
                    i++;
                }
            }
        }
        addShape();
             
    },6000);


    // lights (still experimenting)

    var light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(250, -300, 500);
    sceneGL.add(light);

    var spotLight = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
    spotLight.position.set( 0, 150, 0 );
    
    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    spotLight.target = spotTarget;
    
    sceneGL.add(spotLight);
    // sceneGL.add(new THREE.PointLightHelper(spotLight, 1));

    window.addEventListener('resize', onWindowResize, false);

}

function getNewXartaCubes()
{
    if (window.innerHeight > window.innerWidth) // portrait e.g. phones
    {
        // staggar z so fits camera "perspective" view
        cubes[0] = getNewXartaCube( -8,5, cad,      "XARTA", 0, colours);
        cubes[1] = getNewXartaCube(  0,5, cad-20,   "ARTAX", 1, colours);
        cubes[2] = getNewXartaCube( 10,5, cad-40,   "RTAXA", 2, colours);
        cubes[3] = getNewXartaCube( 20,5, cad-60,   "TAXAR", 3, colours);
        cubes[4] = getNewXartaCube( 30,5, cad-80,   "AXART", 4, colours);
    }
    else
    {
        // just in a row - camera zoom will always mean fitting (mostly)
        cubes[0] = getNewXartaCube( -10,5, cad, "XARTA", 0, colours);
        cubes[1] = getNewXartaCube(   0,5, cad, "ARTAX", 1, colours);
        cubes[2] = getNewXartaCube(  10,5, cad, "RTAXA", 2, colours);
        cubes[3] = getNewXartaCube(  20,5, cad, "TAXAR", 3, colours);
        cubes[4] = getNewXartaCube(  30,5, cad, "AXART", 4, colours);
    }
}

function getNewXartaCube(xPos, yPos, zPos, word, colourStartIndex, colours) 
{
	console.log('getNewXartaCube('+xPos+', '+yPos+', '+zPos+', '+word+', '+colourStartIndex+')');

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
	var textureLoader = new THREE.TextureLoader().setCrossOrigin('');
    // loader.crossOrigin = '';
    textureLoader.setPath('https://res.cloudinary.com/xarta/image/upload/');
	var texture = textureLoader.load( "v1497007069/xarta/2014-me-at-work256.jpg" ); // BACK

    // so we're making a cube e.g. 5 faces are letters X A R T A, and the backface is a pic of me lol ...
    // and by using transparency, light from the rest of the dynamic sceneGL will illuminate "me" sometimes through the transparent cube
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

	sceneGL.add( obj );

    return(obj);
}





// this function should now be called
// extended animate or something (more than a tumble - it evolved)

// MISTAKE IN NAMING ON MY PART !!!
// transformRate is clock Delta ... SMALLER transformRate for FASTER MACHINE
var cubesToTumble = true;
function tumble(transformRate)
{

    if (cubesToTumble)
    {
        var xartaRotAcc = 0;
        cubes.forEach(function(cube, index, ar){


            if ( (5 < cubes[index].rotation.x) && (cubes[index].rotation.x < 6) )
            {
                cubes[index].xartaRot = -1; // reverse rotation
            }
            if (cubes[index].rotation.x < 0)
            {
                cubes[index].xartaRot = 0; // stop, showing X A R T A (not precise on slow machine)
            }
            
            xartaRotAcc += cubes[index].xartaRot;

            // rotation.x starts at 0 and is positive accumulative
            cubes[index].rotation.x += (cubes[index].xartaRot * transformRate);
            cubes[index].rotation.y += (cubes[index].xartaRot * transformRate);

            //console.log(cubes[index].xartaRot);
            //console.log(cubes[index].rotation.x);
        }, this);

        if (xartaRotAcc === 0)
        {
            cubesToTumble = false;
        }

    }
 

    var approachRate = 200 * transformRate; // SMALLER VALUE ON FASTER MACHINE
                                            // FINER GRAINED INCREMENTS
    var fit =  ( (window.innerWidth / window.innerHeight) * 2 ) - approachRate ;   
        // reasonably constant
        // during animation

        // using global var "cad"
        // "cube approach distance"


    var scalarCAD = fit-cad;                                    // total distance to travel for approach
    var scalarCADsoFar = cubes[0].position.z - cad;             // always positive
    var scalarCADsoFarFraction = scalarCADsoFar / scalarCAD;    // factional value less than 1

    if (phaseCubeApproach === true)
    {
        if (scalarCADsoFarFraction > 0.7 )
        {
            if (typeof whoop.play() == 'function') 
            { 
                whoop.play(); 
            }
        }

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
            if(window.moonMesh.material.opacity < 1)
            {
                moonMesh.material.opacity += 0.1;
            }
            else
            {
                moonMesh.material.opacity = 1;
            }
            
            moonz += (50*transformRate);
            moonMesh.position.z = moonz;
        }
        else
        {   
            moonMesh.material.opacity = 1;
            phaseMoonApproach = false;
            
        }
    }

    // TODO: Cylinder???  PYRAMID !!!  MUST HAVE BEEN MAD !!!!
    // RANDOM CYLINDER MOVEMENT  (ACTUALLY NOW JUST "SHAPE")
    for (var i = 0; i < num_cylinders_so_far; i++) {


        cylinders[i].position.x += cylinders[i].xartaDirx;
        cylinders[i].position.y += cylinders[i].xartaDiry;
        cylinders[i].position.z += cylinders[i].xartaDirz;


        



        // materialise cylinders at start or later, if not paused
        //var cylinderOpacity = cylinderMasterOpacity;
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

        cylinderMasterOpacity = cylinderOpacity;
        cylinders[i].material.opacity = cylinderOpacity;
        
        var moveRate;

        if(calmCylinders === false)
        {
            moveRate = 90*transformRate;
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
        
        // slow down x direction moverate if even partly under-water
        // as if low-fps device then fps under water part can't keep up
        if (moveRate > 0)
        {
            

            if (cylinders[i].position.y < 0)
            {
                // console.log("slowing a shape down by window.fps/100: " + window.fps/100);

                if (cylinders[i].xartaDirx < 0)
                {
                    if ( (cylinders[i].xartaDirx * -1) > ( (window.fps/150) * moveRate ) )
                    {
                        cylinders[i].xartaDirx = 0.95 * cylinders[i].xartaDirx;
                    }
                    
                }
                else
                {
                    if ( (cylinders[i].xartaDirx) > ( (window.fps/150) * moveRate ) )
                    {
                        cylinders[i].xartaDirx = 0.95 * cylinders[i].xartaDirx;
                    }
                    
                }   
                
                
                if (cylinders[i].xartaDiry < 0) 
                {
                    if ( (cylinders[i].xartaDiry * -1) > ( (window.fps/120) * moveRate ) )
                    {
                        cylinders[i].xartaDiry = cylinders[i].xartaDiry * 0.97;
                    }
                    
                }
                else
                {
                    if ( (cylinders[i].xartaDiry) < ( (window.fps/100) * moveRate * 1.2 ) )
                    {
                        cylinders[i].xartaDiry = cylinders[i].xartaDiry * 1.1;
                    }
                }

                if (cylinders[i].xartaDirz < 0) 
                {
                    if ( (cylinders[i].xartaDirz * -1) > ( (window.fps/100) * moveRate ) )
                    {
                        cylinders[i].xartaDirz = cylinders[i].xartaDirz * 0.9;
                    }
                    
                }
                else
                {
                    if ( (cylinders[i].xartaDirz) < ( (window.fps/100) * moveRate ) )
                    {
                        cylinders[i].xartaDirz = cylinders[i].xartaDirz * 1.1;
                    }
                }
                
            }
            else if ( (cylinders[i].position.y < 250) && (cylinders[i].position.y > 100) )
            {
                if (i % Math.floor(Math.random() * 10) === 1)
                {
                    // add some random x-direction
                    if(Math.abs(cylinders[i].xartaDirx) < (window.fps/100)*moveRate )
                    {
                        cylinders[i].xartaDirx = (Math.random() - 0.5) * 2 * moveRate; // velocity
                    }              
                };

                if (i % Math.floor(Math.random() * 5) === 1)
                {
                    // add some random x-direction
                    if(Math.abs(cylinders[i].xartaDirz) < (window.fps/100)*moveRate )
                    {
                        cylinders[i].xartaDirz = (Math.random() - 0.5) * 2 * moveRate; // velocity
                    }              
                };               

                if (cylinders[i].xartaDiry > 0)
                {
                    if ( (cylinders[i].xartaDiry) < ( 0.9 * moveRate) )
                    {
                        cylinders[i].xartaDiry = cylinders[i].xartaDiry * 1.5;
                    }
                }
                else
                {
                     if ( (cylinders[i].xartaDiry) < ( moveRate ) )
                    {
                        cylinders[i].xartaDiry = cylinders[i].xartaDiry * 1.01;
                    }                   
                }
            }
        }

        // move out the way faster (once at the edges, will have velocity 0)
        if(saveCycles === PENDING)
        {
            cylinders[i].xartaDirx = cylinders[i].xartaDirx * 1.02;
            cylinders[i].xartaDiry = cylinders[i].xartaDiry * 1.02;
            cylinders[i].xartaDirz = cylinders[i].xartaDirz * 1.02;
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    rendererGL.setSize(window.innerWidth, window.innerHeight);
    rendererCSS3D.setSize( window.innerWidth, window.innerHeight );

}

// https://code.tutsplus.com/articles/data-structures-with-javascript-stack-and-queue--cms-23348
// note indexes will increment every second with an eventual 60-second offset
// not sure of number limits ... but assumption is more than enough seconds for normal use :)
function queueFps() {
    this._oldestIndex = 1;
    this._newestIndex = 1;
    this._storage = {};
}
queueFps.prototype.size = function() {
    return this._newestIndex - this._oldestIndex;
};
queueFps.prototype.enqueue = function(data) {
    this._storage[this._newestIndex] = data;
    this._newestIndex++;
};
queueFps.prototype.dequeue = function() {
    var oldestIndex = this._oldestIndex,
        newestIndex = this._newestIndex,
        deletedData;
 
    if (oldestIndex !== newestIndex) {
        deletedData = this._storage[oldestIndex];
        delete this._storage[oldestIndex];
        this._oldestIndex++;
 
        return deletedData;
    }
};
queueFps.prototype.average = function() {
    var fpsAcc = 0;
    if (this._oldestIndex !== this._newestIndex)
    {
        for(let [index, fpsValue] of Object.entries(this._storage)){
            fpsAcc += fpsValue;
        }
        return Math.floor(fpsAcc / (this._newestIndex - this._oldestIndex));
    }
    else
    {
        return 1;
    }
}


function calcFps(delta)
{
    frames += 1;
    accDelta += delta;

    if(accDelta > 1) // every second
    {
        window.fps = frames;
        accDelta = 0;
        secondsCount += 1;
        //console.log("Enqueing " + frames + " frames for fps average calculation");
        fpsAverageQueue.enqueue(frames);
        if (minutesCount > 0)
        {
            //console.log("Dequeing last frame for fps average calculation");
            fpsAverageQueue.dequeue();
        }

        // rolling/moving average
        fpsAverage = fpsAverageQueue.average();
        if (minutesCount < 3)
        {
            console.log("Moving average FPS = " + fpsAverage);
            //console.log("fpsAverageQueue.size():" + fpsAverageQueue.size());
        }
        
        if (secondsCount >= 59)
        {
            minutesCount += 1;
            secondsCount = 0;
        }
        frames = 1;
    }

}
function displayCamPos() {
    var p = document.getElementById('cameraPos');
    p.innerHTML =   ( Math.round( (camera.position.x  + 0.00001) * 100) / 100 ) + ", " + 
                    ( Math.round( (camera.position.y  + 0.00001) * 100) / 100 ) + ", " + 
                    ( Math.round( (camera.position.z  + 0.00001) * 100) / 100 ) +
                    '<input type="text" id="controlsFocus" value="Control Focus">';
}


function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();
    calcFps(delta);


    if ( (typeof water === 'undefined' || water === null ||
          typeof delta === 'undefined' || delta === null ) )
    {
        // do nothing
    }
    else
    {
        //delta = 0.0001;
        water.update(delta);
    }
    

    displayCamPos();

    //console.log(delta);
    // delta is smaller, the faster the machine
    tumble(delta);
    
    //console.log(fps);

    if ( !(typeof controls === 'undefined' || controls === null) ){
        controls.update();
    }

    render();

}



function render() 
{
    if ( !(typeof html5VidPlayer === 'undefined' || html5VidPlayer === null) ){
       if ( !(typeof videoImageContext === 'undefined' || videoImageContext === null) ){
            if ( !(typeof videoTexture === 'undefined' || videoTexture === null) ){
                if ( html5VidPlayer.readyState === html5VidPlayer.HAVE_ENOUGH_DATA ) 
                {
                    videoImageContext.drawImage( html5VidPlayer, 0, 0 );
                    if ( videoTexture ) 
                        videoTexture.needsUpdate = true;
                }
            }
       }
    }

    rendererGL.render(sceneGL, camera);

    if ( !(typeof rendererCSS3D === 'undefined' || rendererCSS3D === null) )
    {
        rendererCSS3D.render(sceneCSS3D, camera);
    }
}


