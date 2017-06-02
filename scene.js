var camera, controls, scene, renderer, clock;

init();
animate();

function init() {

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 20, 50);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // world
    var world = { scene: scene };

    water = new Water(renderer, camera, world, {
        width: 200,
        height: 200,
        segments: 5,
        lightDirection: new THREE.Vector3(0.7, 0.7, 0)
    });

    water.position.set(0, 1, 0);
    water.rotation.set(Math.PI * -0.5, 0, 0);
    water.updateMatrix();
    scene.add(water);

    var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading });

    for (var i = 0; i < 500; i++) {

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 1000;
        mesh.position.y = (Math.random() - 0.5) * 1000;
        mesh.position.z = (Math.random() - 0.5) * 1000;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        scene.add(mesh);

    }

    // lights

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);

    //

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();

    water.update(delta);

    render();

}

function render() {

    renderer.render(scene, camera);

}
