window.onload = function() {

	// Scena
	var scene = new THREE.Scene();

	// Camera
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);

	// Aggiunta suono
	/*
	var listener = new THREE.AudioListener();	// camera.add( listener ); --> lo faccio in switchCamera
	var sound = new THREE.PositionalAudio( listener );
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( starsFold + 'sun_sound.wav', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setRefDistance(50);
		sound.play();
	});
	*/

	// Renderer
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

	// Controlli camera tramite mouse input
	var controls = new THREE.OrbitControls( camera );

	var actualView; // --> celBodies[0] --> sun
	// Cambia il "focus" della camera
	var switchCamera = function(before, after) {

		focus[before].celShape.remove(camera);
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
		controls = new THREE.OrbitControls( camera );
		controls.enabled = (after == 0);	// orbitControls si attiva solo se si sta puntando al sole
		// camera.add( listener );
		focus[after].celShape.add(camera);
		actualView = after;
		camera.position.y = celBodies[actualView].dim / 3;
		camera.position.z = celBodies[actualView].dim * 3;

		try {
			celBodies[actualView].orbit.visible = false;
			celBodies[before].orbit.visible = true;
		} catch(e) {}

	};

	// Fa' puntare la camera al corpo celeste precedente
	var prevCel = function() {
		var after = (actualView>0 ? actualView-1 : focus.length-1);
		switchCamera(actualView, after);
	}

	// Fa puntare la camera al corpo celeste successivo
	var nextCel = function() {
		var after = (actualView+1)%focus.length;
		switchCamera(actualView, after);
	}

	// Raddoppia la velocita' di tutti i moti dei corpi celesti
	var faster = function() { mod *= 2; }

	// Dimezza la velocita' di tutti i moti dei corpi celesti
	var slower = function() { mod /= 2; }

	// Associa l'input del click sui pulsanti alle relative funzioni
	var button = document.getElementsByClassName("button");
	button[0].addEventListener("click", prevCel);
	button[1].addEventListener("click", nextCel);
	button[2].addEventListener("click", faster);
	button[3].addEventListener("click", slower);

	// Aggiunge lo sfondo stellato
	var starsGeometry = new THREE.Geometry();

	for ( x = -750; x < 750; x+=500)	// 26 cubi --> il 27esimo e' quello centrale
		for ( y = -750; y < 750; y+=500)
			for ( z = -750; z < 750; z+=500)
				for ( var i = 0; i < 1000; i ++ )
					if (! (x==y && x==z && x==-250)) {	// se non e' il cubo centrale crea stelle
						var star = new THREE.Vector3();
						star.x = THREE.Math.randFloat( x, x+500);
						star.y = THREE.Math.randFloat( y, y+500);
						star.z = THREE.Math.randFloat( z, z+500);
						starsGeometry.vertices.push( star );
					}

	var starsMaterial = new THREE.PointsMaterial( { color: 0x888888 } );
	var starField = new THREE.Points( starsGeometry, starsMaterial );
	scene.add( starField )

    var celBodies = [];	// Insieme dei corpi celesti
	var focus = [];		// Insieme dei punti a cui la camera deve puntare

	var milkyBackground = new CelestialBody(1600, starsFold + 'milky_way.jpg', false, 0, 0, 0, scene);
	scene.add(milkyBackground);

	// Creazione dei vari corpi celesti e dei relativi "focus" per mezzo di CelestialBody.js
	celBodies.push( sun = new CelestialBody(50.5, starsFold + 'sun.jpg', false, 365*165/25, 0, 0, scene) );
	// sun.celShape.add(sound);	// Aggiunge il suono direzionale al Sole
	focus.push( sun_focus = new CelestialBody(sun.dim/2, coresFold + 'core.png', false, 0, 0, 0, scene) );

	celBodies.push( merc = new CelestialBody(0.2, planetsFold + 'mercury.jpg', true, 365*165/58.65, 365*165/88, 14, sun) );
	focus.push( merc_focus = new CelestialBody(merc.dim/2, coresFold + 'core.png', false, 0, 365*165/88, 14, sun) );
	celBodies.push( venus = new CelestialBody(0.2, planetsFold + 'venus.jpg', true, 365*165/116.75, 365*165/225, 20, sun) );
	focus.push( venus_focus = new CelestialBody(venus.dim/2, coresFold + 'core.png', false, 0, 365*165/225, 20, sun) );
	celBodies.push( earth = new CelestialBody(0.5, planetsFold + 'earth.jpg', true, 365*165, 165, 26, sun) );
	focus.push( earth_focus = new CelestialBody(earth.dim/2, coresFold + 'core.png', false, 0, 165, 26, sun) );
	celBodies.push( moon = new CelestialBody(0.1, satsFold + 'moon.jpg', true, 0, 365*165/27.5, 0.3, earth) );
	focus.push( moon_focus = new CelestialBody(moon.dim/2, coresFold + 'core.png', false, 0, 365*165/27.5, 0.3, earth) );
	celBodies.push( mars = new CelestialBody(0.45, planetsFold + 'mars.jpg', true, 365*165/1.06, 165/1.9, 34, sun) );
	focus.push( mars_focus = new CelestialBody(mars.dim/2, coresFold + 'core.png', false, 0, 165/1.9, 34, sun) );
	celBodies.push( jup = new CelestialBody(5, planetsFold + 'jupiter.jpg', true, (24/10)*365*165, 165/12, 44, sun) );
	focus.push( jup_focus = new CelestialBody(jup.dim/2, coresFold + 'core.png', false, 0, 165/12, 44, sun) );
	celBodies.push( gan = new CelestialBody(0.25, satsFold + 'ganymede.jpg', true, 0, 165*365/7, 3.8, jup) );
	focus.push( gan_focus = new CelestialBody(gan.dim/2, coresFold + 'core.png', false, 0, 165*365/7, 3.8, jup) );
	celBodies.push( saturn = new CelestialBody(4.8, planetsFold + 'saturn.jpg', true, (24/11)*365*165, 165/29, 63, sun) );
	focus.push( saturn_focus = new CelestialBody(saturn.dim/2, coresFold + 'core.png', false, 0, 165/29, 63, sun) );
	celBodies.push( uranus = new CelestialBody(2.1, planetsFold + 'uranus.jpg', true, (24/17)*365*165, 165/84, 84, sun) );
	focus.push( uranus_focus = new CelestialBody(uranus.dim/2, coresFold + 'core.png', false, 0, 165/84, 84, sun) );
	celBodies.push( nep = new CelestialBody(2.1, planetsFold + 'neptune.jpg', true, (24/16)*365*165, 1, 110, sun) );
	focus.push( nep_focus = new CelestialBody(nep.dim/2, coresFold + 'core.png', false, 0, 1, 110, sun) );
	celBodies.push( triton = new CelestialBody(0.1, satsFold + 'triton.png', true, 0, -(365*165/6), 1.6, nep) );
	focus.push( triton_focus = new CelestialBody(triton.dim/2, coresFold + 'core.png', false, 0, -(365*165/6), 1.6, nep) );
	celBodies.push( pluto = new CelestialBody(0.1, planetsFold + 'pluto.jpg', true, 365*165/8.3, 0.67, 141, sun) );
	focus.push( pluto_focus = new CelestialBody(pluto.dim/2, coresFold + 'core.png', false, 0, 0.67, 141, sun) );

	// Creazione dell'anello di saturno, fatto sfruttanso la stessa funzione che crea le orbite
	makeOrbit(saturn, 6.7, 1.8, satsFold + 'saturn_ring.png');

	// Inizialmente la camera punta al focus del Sole che e' in celBodies[0]
	switchCamera(0, 0);

	// Crezione della luce direzionale del Sole
    var bulbGeometry = new THREE.SphereBufferGeometry( 0.02, 16, 8 );
    var bulbLight = new THREE.PointLight( 0xffee88, 1, 0, 2 );
    var bulbMat = new THREE.MeshStandardMaterial( {
        emissive: 0xffffee,
        emissiveIntensity: 10,
        color: 0x000000
    } );
    bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
    bulbLight.position.set( 0, 0, 0 );
    bulbLight.castShadow = true;
    scene.add(bulbLight);

	// Luce ambientale --> e' possibile vedere un pianeta anche se nascosto per migliorare
	// la visualizzazione del progetto
    var softLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(softLight);

	var mod = 1;	// Viene raddoppiato da "faster" e dimezzato "slower"
					// Tutte le volocita' dei moti vengono moltiplicate per questo valore

	// Render
    var render_scene = function() {

		// Aggiunge le ombre
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        var now = Date.now();
        var dt = now - (render_scene.time||now);
        render_scene.time = now;

        renderer.render(scene, camera);

		// Lascio che il browser decida con quale frame rate renderizzare la scena
        requestAnimationFrame(render_scene);

		// Velocita' base, quella del moto piu' lento fra quelli che sono considerati pianeti
		// del sistema solare, ossia il moto di rivoluzione di Nettuno
		var standardSpeed = 0.0000005*now;
		var minSpeed = standardSpeed*mod;

		// Chiama motion su tutti i corpi celesti e i "focus", dando loro le velocita' adeguate
		// e la giusta distanza rispetto al loro gravity center (gravCenter)
      	for (var i = 0; i < celBodies.length; i++) {
            celBodies[i].motion(minSpeed);
			focus[i].motion(minSpeed);
		}

		// Ridimensionamento della scena in caso di ridimensionamento della finestra
		window.addEventListener( 'resize', onWindowResize, false );

		function onWindowResize(){
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

        console.log("Rendering");

    }

    render_scene();	// Ricorsione
}
