var camera, controls, scene, renderer, clock; // water stuff

var camz = 50; // easier for zooming in to preset amount
var camx = 0;
var camy = 10;

var phase0 = true;
var phase1 = true;
var phase2 = false;
var phase3 = false;

var moonz = -500;
var moonMesh;
var starsMesh;

var num_cylinders = 0;
var range_cylinders = 499;
var cylinders;

var fps = 1;
var frames = 0;
var accDelta = 0;


init();


// xarta adding borg cube
var borg;
var initscale = 8;
var cubes = new Array();
cubes['x'] = getNewXartaCube();
cubes['a'] = getNewXartaCube();
cubes['r'] = getNewXartaCube();
cubes['t'] = getNewXartaCube();
cubes['a'] = getNewXartaCube();
cubes['me'] = getNewXartaCube();




borg=getNewXartaCube();
animate();





function getNewXartaCube() 
{
	// clog("Starting the Borg cube",1);

    var x = document.createElement("canvas");
    var xc = x.getContext("2d");
    x.width = x.height = 256;
    xc.shadowColor = "#000";
    xc.shadowBlur = 7;
    xc.fillStyle = "#ff0000";       // red backgroud
    xc.fillRect(0, 0, 256, 256);
    xc.fillStyle = "orange";        // orange font
    xc.font = "150pt arial bold";
    xc.fillText('X', 64, 200);

    var a = document.createElement("canvas");
    var ac = a.getContext("2d");
    a.width = a.height = 256;
    ac.shadowColor = "#000";
    ac.shadowBlur = 7;
    ac.fillStyle = "#0212f4";       // blue background
    ac.fillRect(0, 0, 256, 256);
    ac.fillStyle = "red";           // red font
    ac.font = "150pt arial bold";
    ac.fillText('A', 64, 200);

    var r = document.createElement("canvas");
    var rc = r.getContext("2d");
    r.width = r.height = 256;
    rc.shadowColor = "#000";
    rc.shadowBlur = 7;
    rc.fillStyle = "#f7ec0e";       // yellow background
    rc.fillRect(0, 0, 256, 256);
    rc.fillStyle = "green";         // green font
    rc.font = "150pt arial bold";
    rc.fillText('R', 64, 200);

    var t = document.createElement("canvas");
    var tc = t.getContext("2d");
    t.width = t.height = 256;
    tc.shadowColor = "#000";
    tc.shadowBlur = 7;
    tc.fillStyle = "#106316";       // green background
    tc.fillRect(0, 0, 256, 256);
    tc.fillStyle = "yellow";        // yellow font
    tc.font = "150pt arial bold";
    tc.fillText('T', 64, 200);

    var a2 = document.createElement("canvas");
    var a2c = a2.getContext("2d");
    a2.width = a2.height = 256;
    a2c.shadowColor = "#000";
    a2c.shadowBlur = 7;
    a2c.fillStyle = "#f77c02";      // orange background
    a2c.fillRect(0, 0, 256, 256);
    a2c.fillStyle = "black";         // black font
    a2c.font = "150pt arial bold";
    a2c.fillText('A', 64, 200);

    var xm = new THREE.MeshBasicMaterial({ map: new THREE.Texture(x), transparent: true, opacity: 0.5 });
    xm.map.needsUpdate = true;

    var am = new THREE.MeshBasicMaterial({ map: new THREE.Texture(a), transparent: true, opacity: 0.5 });
    am.map.needsUpdate = true;

    var rm = new THREE.MeshBasicMaterial({ map: new THREE.Texture(r), transparent: true, opacity: 0.5 });
    rm.map.needsUpdate = true;

    var tm = new THREE.MeshBasicMaterial({ map: new THREE.Texture(t), transparent: true, opacity: 0.5 });
    tm.map.needsUpdate = true;

    var a2m = new THREE.MeshBasicMaterial({ map: new THREE.Texture(a2), transparent: true, opacity: 0.5 });
    a2m.map.needsUpdate = true;



	var textureLoader = new THREE.TextureLoader().setCrossOrigin(true);
	var texture = textureLoader.load( "https://res.cloudinary.com/xarta/image/upload/v1496448263/xarta/2014-me-at-work256.png" ); // front

	var materials = [
		xm, // right
		am, // left
		rm, // top
		tm, // bottom
		a2m, // back
		new THREE.MeshBasicMaterial( { map: texture, side:THREE.DoubleSide, shading: THREE.FlatShading, transparent: true, opacity: 0.5, color: 0xf902d4 } ) // front
	];
	
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );


    var obj = new THREE.Mesh( geometry, materials );
	obj.scale.set(initscale,initscale,initscale);
    obj.position.z = -800;
    obj.position.x = -10;
    obj.position.y = 5;
    //borg.lightDirection = new THREE.Vector3(0.7, 20, 0)

	scene.add( obj );
    //camera.position.set(0, 2, 50, 5);
	//camera.position.z = 5;

    return(obj);
}





function tumble(transformRate)
{
    // clog("tumbling",3);
    borg.rotation.x += transformRate;
    borg.rotation.y += transformRate;
    if (phase0 === true)
    {
        if (borg.position.z < (-200*transformRate))
        {
            borg.position.z += (200*transformRate);
        }
        else
        {
            phase0 = false;
        }
    }



    if (phase1 === true)
    {
        moonz = -1000;
        phase1 = false;
        phase2 = true;
    }

    if (phase2 === true)
    {
        if (moonz < -500)
        {
            moonz += (50*transformRate);
            //moonMesh.position.x = -1 * 0.25 * window.innerWidth;
            //moonMesh.position.x = -350;           // half-moon = -350 (landscape)
            //moonMesh.position.y = 20;             // half-moon = 290
            moonMesh.position.z = moonz;           // half-moon = -500
            //moonMesh.scale.set(13, 14,14);        // half-moon = 14, 14, 14
        }
        else
        {   
            phase2 = false;
            scene.add(starsMesh);
        }
    }

    


       // camera.updateProjectionMatrix();
    

    for (var i = 0; i < num_cylinders; i++) {


        cylinders[i].position.x += cylinders[i].xartaDirx;
        cylinders[i].position.y += cylinders[i].xartaDiry;
        cylinders[i].position.z += cylinders[i].xartaDirz;

        if (cylinders[i].material.opacity < 1.0)
        {
            cylinders[i].material.opacity += transformRate/300;
            if (cylinders[i].material.opacity > 1.0)
            {
                cylinders[i].material.opacity = 1.0;
            }
        }
        

        rate = (Math.random() + 1) * (125*transformRate);

        if (cylinders[i].position.x > range_cylinders)
        {
            cylinders[i].xartaDirx = (Math.random() * -1) * rate;
        }

        if (cylinders[i].position.y > range_cylinders)
        {
            cylinders[i].xartaDiry = (Math.random() * -1) * rate;
        }

        if (cylinders[i].position.z > 100)
        {
            cylinders[i].xartaDirz = (Math.random() * -1) * rate;
        }


        if (cylinders[i].position.x < (-1 * range_cylinders))
        {
            cylinders[i].xartaDirx = (Math.random() * 1) * rate;
        }

        if (cylinders[i].position.y <  (-1 * range_cylinders))
        {
            cylinders[i].xartaDiry = (Math.random() * 1) * rate;
        }

        if (cylinders[i].position.z <  (-1 * 498))
        {
            cylinders[i].xartaDirz = (Math.random() * 1) * rate;
        }

        cylinders[i].updateMatrix();


    }
}

function init() {




    var loader = new THREE.TextureLoader().setCrossOrigin(true);


    // Load the background texture  STARS
    var stars = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496587567/xarta/spiral-galaxy.jpg' );               
    // Load the background texture MOON
    
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
    //scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1); 
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoclear = true;

    var container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(6, 10, 50);


    setTimeout(function() {
        //controls = new THREE.OrbitControls(camera, renderer.domElement);
    }, 12000);
    


    
    // world
    var world = { scene: scene };



    // STARS
    starsMesh = new THREE.Mesh( 
        new THREE.PlaneGeometry(45, 45,1, 1),
        new THREE.MeshBasicMaterial({
            map: stars
        }));

    starsMesh.position.x = -350;  // 10
    starsMesh.position.y =800;  // 22
    starsMesh.position.z = -600; // -50
    starsMesh.scale.set(50, 50,10);
    starsMesh.material.depthTest = true; // because transparent png
    starsMesh.material.depthWrite = true;



    // MOON
    moonMesh = new THREE.Mesh( 
        new THREE.PlaneGeometry(45, 45,1, 1),
        new THREE.MeshBasicMaterial({
            map: theMoon, transparent: true, opacity: 1.0, color: 0xff0000
        })
    );

    moonMesh.position.x = -1 * 0.25 * window.innerWidth;
    //moonMesh.position.x = -350;           // half-moon = -350 (landscape)
    moonMesh.position.y = 20;             // half-moon = 290
    moonMesh.position.z = moonz;           // half-moon = -500
    moonMesh.scale.set(13, 14,14);        // half-moon = 14, 14, 14
    moonMesh.material.depthTest = true;   // because transparent png
    moonMesh.material.depthWrite = true;

    setTimeout(function() {
        if(window.fps > 10)
        {
            scene.add(moonMesh);    
            moonMesh.material.color.setHex( 0xffffff );
        }
    }, 1000);



    setTimeout(function() {

        if(window.fps > 15)
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
    }, 2000);






    // CYLINDERS
    var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    var material = new THREE.MeshPhongMaterial({ color: 0xafab5b, shading: THREE.FlatShading, transparent: true,  opacity: 0 });

    setTimeout(function() {
        num_cylinders = window.fps;
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




    // lights

    light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(250, -300, 500);
    scene.add(light);

    var spotLight = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
    spotLight.position.set( 0, 150, 0 );
    
    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    spotLight.target = spotTarget;
    
    scene.add(spotLight);
    scene.add(new THREE.PointLightHelper(spotLight, 1));

/*
    var bluePoint = new THREE.PointLight(0x0033ff, 100, 1050);
    bluePoint.position.set( 10, 15, 20 );
    scene.add(bluePoint);
    scene.add(new THREE.PointLightHelper(bluePoint, 3));
    
    var greenPoint = new THREE.PointLight(0x33ff00, 100, 1050);
    greenPoint.position.set( -10, 15, 20 );
    scene.add(greenPoint);
    scene.add(new THREE.PointLightHelper(greenPoint, 3));
*/
    //

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
