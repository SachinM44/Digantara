let scene, camera, renderer, controls;
let objects = [];
let selectedObject = null;
let raycaster, mouse;
let stars = [];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);

    createLights();
    createStarfield();
    createGrid();
    createObjects();

    animate();
}

function createLights() {
    const ambientLight = new THREE.AmbientLight(0x101025, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4fc3f7, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3d5afe, 1, 20);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);
}

function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    stars.push(starField);
}

function createGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x3d5afe, 0x1a1a3e);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    const platformGeometry = new THREE.CircleGeometry(10, 64);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a3e, 
        roughness: 0.8, 
        metalness: 0.2,
        transparent: true,
        opacity: 0.7
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = -2;
    platform.receiveShadow = true;
    scene.add(platform);

    const orbitalRingGeometry1 = new THREE.RingGeometry(3, 3.05, 64);
    const orbitalRingMaterial1 = new THREE.MeshBasicMaterial({ 
        color: 0x4fc3f7, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const orbitalRing1 = new THREE.Mesh(orbitalRingGeometry1, orbitalRingMaterial1);
    orbitalRing1.rotation.x = Math.PI / 2;
    orbitalRing1.position.y = -1.9;
    scene.add(orbitalRing1);

    const orbitalRingGeometry2 = new THREE.RingGeometry(6, 6.05, 64);
    const orbitalRingMaterial2 = new THREE.MeshBasicMaterial({ 
        color: 0x3d5afe, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const orbitalRing2 = new THREE.Mesh(orbitalRingGeometry2, orbitalRingMaterial2);
    orbitalRing2.rotation.x = Math.PI / 2;
    orbitalRing2.position.y = -1.9;
    scene.add(orbitalRing2);
}

function createObjects() {
    const materials = [
        new THREE.MeshStandardMaterial({ 
            color: 0xff5252, 
            roughness: 0.5, 
            metalness: 0.7,
            emissive: 0x330000,
            emissiveIntensity: 0.2
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0xffb142, 
            roughness: 0.5, 
            metalness: 0.7,
            emissive: 0x331000,
            emissiveIntensity: 0.2
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x69f0ae, 
            roughness: 0.5, 
            metalness: 0.7,
            emissive: 0x003310,
            emissiveIntensity: 0.2
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x18ffff, 
            roughness: 0.5, 
            metalness: 0.7,
            emissive: 0x003333,
            emissiveIntensity: 0.2
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0xe040fb, 
            roughness: 0.5, 
            metalness: 0.7,
            emissive: 0x330033,
            emissiveIntensity: 0.2
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x4fc3f7, 
            roughness: 0.5, 
            metalness: 0.7,
            emissive: 0x003366,
            emissiveIntensity: 0.2
        })
    ];

    const objectData = [
        { name: "Satellite Alpha", type: "Communication", orbit: "LEO", status: "Active" },
        { name: "Space Debris Beta", type: "Debris", orbit: "MEO", status: "Inactive" },
        { name: "Probe Gamma", type: "Scientific", orbit: "GEO", status: "Active" },
        { name: "Station Delta", type: "Habitation", orbit: "LEO", status: "Active" },
        { name: "Telescope Epsilon", type: "Observatory", orbit: "HEO", status: "Active" },
        { name: "Rocket Body Zeta", type: "Debris", orbit: "GTO", status: "Inactive" }
    ];

    const satelliteGroup = new THREE.Group();
    const cubeGeometry = new THREE.BoxGeometry(0.8, 0.3, 1.2);
    const cube = new THREE.Mesh(cubeGeometry, materials[0]);
    cube.castShadow = true;
    satelliteGroup.add(cube);
    
    const panelGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.5);
    const leftPanel = new THREE.Mesh(panelGeometry, materials[5]);
    leftPanel.position.set(-1.2, 0, 0);
    satelliteGroup.add(leftPanel);
    
    const rightPanel = new THREE.Mesh(panelGeometry, materials[5]);
    rightPanel.position.set(1.2, 0, 0);
    satelliteGroup.add(rightPanel);
    
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
    const antenna = new THREE.Mesh(antennaGeometry, materials[0]);
    antenna.position.set(0, 0.4, 0);
    satelliteGroup.add(antenna);
    
    satelliteGroup.position.set(-3, 0, 0);
    satelliteGroup.name = objectData[0].name;
    satelliteGroup.userData = objectData[0];
    scene.add(satelliteGroup);
    objects.push(satelliteGroup);

    const debrisGroup = new THREE.Group();
    const debrisGeometry = new THREE.TetrahedronGeometry(0.7, 1);
    const debris = new THREE.Mesh(debrisGeometry, materials[1]);
    debris.castShadow = true;
    debrisGroup.add(debris);
    
    const smallDebrisGeometry = new THREE.TetrahedronGeometry(0.2, 0);
    const smallDebris1 = new THREE.Mesh(smallDebrisGeometry, materials[1]);
    smallDebris1.position.set(0.6, 0.2, 0.3);
    smallDebris1.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    debrisGroup.add(smallDebris1);
    
    const smallDebris2 = new THREE.Mesh(smallDebrisGeometry, materials[1]);
    smallDebris2.position.set(-0.5, 0.3, -0.2);
    smallDebris2.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    debrisGroup.add(smallDebris2);
    
    debrisGroup.position.set(-1, 0, 0);
    debrisGroup.name = objectData[1].name;
    debrisGroup.userData = objectData[1];
    scene.add(debrisGroup);
    objects.push(debrisGroup);

    const probeGroup = new THREE.Group();
    const coneGeometry = new THREE.ConeGeometry(0.5, 1.2, 32);
    const cone = new THREE.Mesh(coneGeometry, materials[2]);
    cone.castShadow = true;
    cone.position.set(0, 0.3, 0);
    probeGroup.add(cone);
    
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
    const base = new THREE.Mesh(baseGeometry, materials[2]);
    base.position.set(0, -0.3, 0);
    probeGroup.add(base);
    
    const instrumentGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.2);
    const instrument1 = new THREE.Mesh(instrumentGeometry, materials[5]);
    instrument1.position.set(0.4, -0.2, 0);
    probeGroup.add(instrument1);
    
    const instrument2 = new THREE.Mesh(instrumentGeometry, materials[5]);
    instrument2.position.set(-0.4, -0.2, 0);
    probeGroup.add(instrument2);
    
    probeGroup.position.set(1, 0, 0);
    probeGroup.name = objectData[2].name;
    probeGroup.userData = objectData[2];
    scene.add(probeGroup);
    objects.push(probeGroup);

    const stationGroup = new THREE.Group();
    const torusGeometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
    const torus = new THREE.Mesh(torusGeometry, materials[3]);
    torus.castShadow = true;
    stationGroup.add(torus);
    
    const moduleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
    const module1 = new THREE.Mesh(moduleGeometry, materials[3]);
    module1.rotation.z = Math.PI / 2;
    module1.position.set(0, 0, 0);
    stationGroup.add(module1);
    
    const module2 = new THREE.Mesh(moduleGeometry, materials[3]);
    module2.rotation.x = Math.PI / 2;
    module2.position.set(0, 0, 0);
    stationGroup.add(module2);
    
    stationGroup.position.set(3, 0, 0);
    stationGroup.name = objectData[3].name;
    stationGroup.userData = objectData[3];
    scene.add(stationGroup);
    objects.push(stationGroup);

    const telescopeGroup = new THREE.Group();
    const mainBodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32);
    const mainBody = new THREE.Mesh(mainBodyGeometry, materials[4]);
    mainBody.rotation.x = Math.PI / 2;
    telescopeGroup.add(mainBody);
    
    const mirrorGeometry = new THREE.CircleGeometry(0.4, 32);
    const mirror = new THREE.Mesh(mirrorGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    mirror.position.set(0, 0, 0.6);
    mirror.rotation.x = Math.PI / 2;
    telescopeGroup.add(mirror);
    
    const telPanelGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.4);
    const telPanel1 = new THREE.Mesh(telPanelGeometry, materials[5]);
    telPanel1.position.set(0, 0.6, 0);
    telescopeGroup.add(telPanel1);
    
    const telPanel2 = new THREE.Mesh(telPanelGeometry, materials[5]);
    telPanel2.position.set(0, -0.6, 0);
    telescopeGroup.add(telPanel2);
    
    telescopeGroup.position.set(0, 0, 2);
    telescopeGroup.name = objectData[4].name;
    telescopeGroup.userData = objectData[4];
    scene.add(telescopeGroup);
    objects.push(telescopeGroup);

    const rocketGroup = new THREE.Group();
    const rocketBodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.5, 32);
    const rocketBody = new THREE.Mesh(rocketBodyGeometry, materials[5]);
    rocketGroup.add(rocketBody);
    
    const noseConeGeometry = new THREE.ConeGeometry(0.3, 0.5, 32);
    const noseCone = new THREE.Mesh(noseConeGeometry, materials[5]);
    noseCone.position.set(0, 1, 0);
    rocketGroup.add(noseCone);
    
    const finGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.4);
    for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(finGeometry, materials[5]);
        fin.position.set(0, -0.7, 0);
        fin.rotation.y = (Math.PI / 2) * i;
        fin.position.x = Math.sin(fin.rotation.y) * 0.5;
        fin.position.z = Math.cos(fin.rotation.y) * 0.5;
        rocketGroup.add(fin);
    }
    
    rocketGroup.position.set(0, 0, -2);
    rocketGroup.name = objectData[5].name;
    rocketGroup.userData = objectData[5];
    scene.add(rocketGroup);
    objects.push(rocketGroup);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        let targetObject = intersects[0].object;
        while(targetObject.parent && !objects.includes(targetObject)) {
            targetObject = targetObject.parent;
        }
        
        if (selectedObject) {
            selectedObject = null;
        }

        selectedObject = targetObject;
        document.getElementById('selected-object').textContent = `Selected: ${selectedObject.name}`;
        
        const data = selectedObject.userData;
        document.getElementById('object-data').innerHTML = `
            <table>
                <tr><td>Type:</td><td>${data.type}</td></tr>
                <tr><td>Orbit:</td><td>${data.orbit}</td></tr>
                <tr><td>Status:</td><td>${data.status}</td></tr>
            </table>
        `;
    } else {
        selectedObject = null;
        document.getElementById('selected-object').textContent = "No object selected";
        document.getElementById('object-data').innerHTML = "<p>Select an object to view details</p>";
    }
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    objects.forEach(obj => {
        obj.rotation.y += 0.005;
    });
    
    stars.forEach(starField => {
        starField.rotation.y += 0.0001;
    });

    renderWithStencil();
}

function renderWithStencil() {
    renderer.render(scene, camera);

    if (selectedObject) {
        renderer.clear(false, true, true);
        
        const gl = renderer.getContext();
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 1, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        gl.stencilMask(0xff);
        
        const originalMaterials = [];
        selectedObject.traverse(function(child) {
            if (child.isMesh) {
                originalMaterials.push({ mesh: child, material: child.material })
                const currentMaterial = child.material;
                const stencilMaterial = currentMaterial.clone();
                stencilMaterial.colorWrite = false;
                stencilMaterial.depthWrite = false;
                
                child.material = stencilMaterial;
                renderer.render(scene, camera);
                
                gl.stencilFunc(gl.NOTEQUAL, 1, 0xff);
                gl.stencilMask(0x00);
                
                const outlineMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xffff00, 
                    side: THREE.BackSide 
                });
                
                const outlineMesh = selectedObject.clone();
                outlineMesh.material = outlineMaterial;
                outlineMesh.scale.multiplyScalar(1.1);
                scene.add(outlineMesh);
                
                renderer.render(scene, camera);
                
                scene.remove(outlineMesh);
                child.material = currentMaterial;
                gl.disable(gl.STENCIL_TEST);
            }
        });
        
        originalMaterials.forEach(item => {
            item.mesh.material = item.material;
        });
    }
}

init();