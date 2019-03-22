var uniFold = './Universe/';
var starsFold = './Stars Textures/';
var planetsFold =  './Planets Textures/';
var satsFold = './Satellites Textures/';
var coresFold = './Cores/';
var orbitsFold = './Orbits/';

// Crea le orbite dei vari corpi celesti
var makeOrbit = function (center, celDistance, orbitDim, img) {

    var geometry = new THREE.RingGeometry( celDistance - orbitDim/2, celDistance + orbitDim/2, 512 );
    var texture = new THREE.TextureLoader().load(img);
    var material = new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } );
    var orbit = new THREE.Mesh( geometry, material );

    center.celShape.add( orbit );
    orbit.rotation.x = 3.141592653589793 / 2; // di default e' verticale, percio' la ruoto di 90 gradi
    return orbit;
}

// E' l'oggetto che definisce tutti i corpi celesti
var baseCelBody = Object.defineProperties( {}, {

    // Raggio sfera
    dim: { value: 0, writable: true, enumerable: false, configurable: false },
    shadow: { value: false, writable: true, enumerable: false, configurable: false },
    // Moltiplicatore velocita' del moto di rotazione
    daySpeedMod: { value: 0, writable: true, enumerable: false, configurable: false },
    // Moltiplicatore velocita' del moto di rivoluzione
    yearSpeedMod: { value: 0, writable: true, enumerable: false, configurable: false },
    // Distanza rispetto al suo centro di gravita'
    distance: { value: 0, writable: true, enumerable: false, configurable: false },
    // Il suo centro di gravita'
    gravCenter: { value: null, writable: true, enumerable: false, configurable: false },
    // La sua orbita
    orbit: { value: null, writable: true, enumerable: false, configurable: false },
    // L'oggetto 3D che viene effettivamente aggiunto alla scena, la Mesh
    celShape: { value: null, writable: true, enumerable: false, configurable: false },

    // Crea le animazioni di tutti i moti di tutti i corpi celesti e di tutti i "focus"
    motion: { writable: false, enumerable: false, configurable: false, value:
        function (minSpeed) {
            if (this.daySpeedMod > 0 && this.yearSpeedMod == 0) {   // Entra in questo caso se e' il Sole
                var rot = new THREE.Matrix4().makeRotationY(minSpeed*this.daySpeedMod);
                this.celShape.matrix = rot.multiply(rot);
            } else {
                // number*true = number /---/ number*false = 0
                // Se e' un pianeta, il moto di rivoluzione e' calcolato moltiplicando la velocita'
                // minima standard per il proprio modificatore sottraendo la velocita' di rotazione del
                // proprio centro gravitazionale che altrimenti andrebbe a sommarsi.
                // Se si tratta di un "focus" tengo conto che potrebbe essere quello del sole che non
                // possiede un gravCenter esattamente come il Sole.
                var rev = new THREE.Matrix4().makeRotationY(minSpeed*this.yearSpeedMod -
                                                            (minSpeed*this.gravCenter.daySpeedMod || 0) *
                                                            ( ((this.gravCenter.yearSpeedMod || 0) == 0) ? 2 : 1) );
                // E' 0 per tutti i "focus" che
                var rot = new THREE.Matrix4().makeRotationY(minSpeed*this.daySpeedMod);
                var tras = new THREE.Matrix4().makeTranslation((this.gravCenter.dim || 0) + this.distance, 0, 0);
                this.celShape.matrix = rev.multiply(tras.multiply(rot));
            }
        }
    }
});

var CelestialBody = function (dim, img, shadow, daySpeedMod, yearSpeedMod, distance, gravCenter, name) {

    // Sovrascrivo il valore di default con quello presente nel campo, se c'e'
    this.dim = dim;
    this.daySpeedMod = daySpeedMod;
    this.yearSpeedMod = yearSpeedMod;
    this.distance = distance;
    this.gravCenter = gravCenter;
    this.shadow = shadow;
    this.name = name;

    // Creo l'lemento di scena
    var geometry = new THREE.SphereGeometry( dim, 64, 64 );
    var texture = new THREE.TextureLoader().load(img);
    var material;
    if (shadow) {   // se non e' il Sole o un focus, creo un "LambertMaterial" e la sua orbita
        material = new THREE.MeshLambertMaterial( {map: texture} );
        this.orbit = makeOrbit(this.gravCenter, this.distance + this.gravCenter.dim, 0.05, orbitsFold + 'orbit.jpg');
    }
    else
        material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide} );   // e' il Sole

    this.celShape = new THREE.Mesh( geometry, material );
    this.celShape.matrixAutoUpdate = false;
    // A seconda del parametro shadow, riceve e fa' ombra
    this.celShape.castShadow = this.celShape.receiveShadow = shadow;

    // val1 || val2 = val1 /---/ undefined || val2 = val2
    (this.gravCenter.celShape || this.gravCenter).add(this.celShape);
}
CelestialBody.prototype = baseCelBody;
