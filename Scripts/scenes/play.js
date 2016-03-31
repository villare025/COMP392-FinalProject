var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _this = this;
/**
 * The Scenes module is a namespace to reference all scene objects
 *
 * @module scenes
 */
var scenes;
(function (scenes) {
    /**
     * The Play class is where the main action occurs for the game
     *
     * @class Play
     * @param havePointerLock {boolean}
     */
    var Play = (function (_super) {
        __extends(Play, _super);
        /**
         * @constructor
         */
        function Play() {
            _super.call(this);
            this.time = performance.now();
            this.delta = (time - this.prevTime) / 1000;
            this._initialize();
            this.start();
        }
        // PRIVATE METHODS ++++++++++++++++++++++++++++++++++++++++++
        /**
         * Sets up the initial canvas for the play scene
         *
         * @method setupCanvas
         * @return void
         */
        Play.prototype._setupCanvas = function () {
            canvas.setAttribute("width", config.Screen.WIDTH.toString());
            canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
            canvas.style.backgroundColor = "#000000";
        };
        /**
         * The initialize method sets up key objects to be used in the scene
         *
         * @method _initialize
         * @returns void
         */
        Play.prototype._initialize = function () {
            this.isGameOver = false;
            // Create to HTMLElements
            this.blocker = document.getElementById("blocker");
            this.instructions = document.getElementById("instructions");
            this.blocker.style.display = "block";
            // setup canvas for menu scene
            this._setupCanvas();
            this.prevTime = 0;
            this.stage = new createjs.Stage(canvas);
            this.velocity = new Vector3(0, 0, 0);
            // setup a THREE.JS Clock object
            this.clock = new Clock();
            // Instantiate Game Controls
            this.keyboardControls = new objects.KeyboardControls();
            this.mouseControls = new objects.MouseControls();
        };
        /**
         * This method sets up the scoreboard for the scene
         *
         * @method setupScoreboard
         * @returns void
         */
        Play.prototype.setupScoreboard = function () {
            // initialize  score and lives values
            this.scoreValue = 0;
            this.livesValue = 1;
            // Add Lives Label
            this.livesLabel = new createjs.Text("LIVES: " + this.livesValue, "40px Consolas", "#ffffff");
            this.livesLabel.x = config.Screen.WIDTH * 0.1;
            this.livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.stage.addChild(this.livesLabel);
            console.log("Added Lives Label to stage");
            // Add Score Label
            this.scoreLabel = new createjs.Text("SCORE: " + this.scoreValue, "40px Consolas", "#ffffff");
            this.scoreLabel.x = config.Screen.WIDTH * 0.8;
            this.scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.stage.addChild(this.scoreLabel);
            console.log("Added Score Label to stage");
        };
        /**
         * Add a spotLight to the scene
         *
         * @method addSpotLight
         * @return void
         */
        Play.prototype.addSpotLight = function () {
            // Spot Light
            this.spotLight = new SpotLight(0xffffff);
            this.spotLight.position.set(20, 40, -15);
            this.spotLight.castShadow = true;
            this.spotLight.intensity = 2;
            this.spotLight.lookAt(new Vector3(0, 0, 0));
            this.spotLight.shadowCameraNear = 2;
            this.spotLight.shadowCameraFar = 200;
            this.spotLight.shadowCameraLeft = -5;
            this.spotLight.shadowCameraRight = 5;
            this.spotLight.shadowCameraTop = 5;
            this.spotLight.shadowCameraBottom = -5;
            this.spotLight.shadowMapWidth = 2048;
            this.spotLight.shadowMapHeight = 2048;
            this.spotLight.shadowDarkness = 0.5;
            this.spotLight.name = "Spot Light";
            this.add(this.spotLight);
            console.log("Added spotLight to scene");
        };
        /**
         * Add a ground plane to the scene
         *
         * @method addGround
         * @return void
         */
        Play.prototype.addGround = function () {
            this.groundTexture = new THREE.TextureLoader().load('../../Assets/images/GravelCobble.jpg');
            this.groundTexture.wrapS = THREE.RepeatWrapping;
            this.groundTexture.wrapT = THREE.RepeatWrapping;
            this.groundTexture.repeat.set(8, 8);
            this.groundTextureNormal = new THREE.TextureLoader().load('../../Assets/images/GravelCobbleNormal.png');
            this.groundTextureNormal.wrapS = THREE.RepeatWrapping;
            this.groundTextureNormal.wrapT = THREE.RepeatWrapping;
            this.groundTextureNormal.repeat.set(8, 8);
            this.groundMaterial = new PhongMaterial();
            this.groundMaterial.map = this.groundTexture;
            this.groundMaterial.bumpMap = this.groundTextureNormal;
            this.groundMaterial.bumpScale = 0.2;
            this.groundGeometry = new BoxGeometry(32, 1, 32);
            this.groundPhysicsMaterial = Physijs.createMaterial(this.groundMaterial, 0, 0);
            this.ground = new Physijs.ConvexMesh(this.groundGeometry, this.groundPhysicsMaterial, 0);
            this.ground.receiveShadow = true;
            this.ground.name = "Ground";
            this.add(this.ground);
            console.log("Added Burnt Ground to scene");
        };
        /**
         * Adds the player controller to the scene
         *
         * @method addPlayer
         * @return void
         */
        Play.prototype.addPlayer = function () {
            // Player Object
            this.playerGeometry = new BoxGeometry(2, 4, 2);
            this.playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);
            this.player = new Physijs.BoxMesh(this.playerGeometry, this.playerMaterial, 1);
            this.player.position.set(0, 30, 10);
            this.player.receiveShadow = true;
            this.player.castShadow = true;
            this.player.name = "Player";
            this.add(this.player);
            console.log("Added Player to Scene");
        };
        /**
         * Add the death plane to the scene
         *
         * @method addDeathPlane
         * @return void
         */
        Play.prototype.addDeathPlane = function () {
            this.deathPlaneGeometry = new BoxGeometry(100, 1, 100);
            this.deathPlaneMaterial = Physijs.createMaterial(new MeshBasicMaterial({ color: 0xff0000 }), 0.4, 0.6);
            this.deathPlane = new Physijs.BoxMesh(this.deathPlaneGeometry, this.deathPlaneMaterial, 0);
            this.deathPlane.position.set(0, -10, 0);
            this.deathPlane.name = "DeathPlane";
            this.add(this.deathPlane);
        };
        /**
         * This method creates the coins
         *
         * @method setCoinMesh
         * @return void
         */
        Play.prototype.setCoinMesh = function () {
            this.coinLoader = new THREE.JSONLoader().load("../../Assets/Models/coin.json", function (coinGeometry) {
                this.phongMaterial = new PhongMaterial({ color: 0xE7AB32 });
                this.phongMaterial.emissive = new THREE.Color(0xE7AB32);
                this.coinMaterial = Physijs.createMaterial((this.phongMaterial), 0.4, 0.6);
                this.this.coin1 = new Physijs.ConvexMesh(this.coinGeometry, this.coinMaterial);
                this.this.coin2 = new Physijs.ConvexMesh(this.coinGeometry, this.coinMaterial);
                this.this.coin3 = new Physijs.ConvexMesh(this.coinGeometry, this.coinMaterial);
                this.coin1.receiveShadow = true;
                this.coin1.castShadow = true;
                this.coin2.receiveShadow = true;
                this.coin2.castShadow = true;
                this.coin3.receiveShadow = true;
                this.coin3.castShadow = true;
                this.coin1.name = "this.Coin1";
                this.coin2.name = "this.Coin2";
                this.coin3.name = "this.Coin3";
                if (this.door1.position.set(60, 5, -51)) {
                    this.coin1.position.set(60, 5, 50);
                    this.coin2.position.set(-60, 5, -50);
                    this.coin3.position.set(-60, 5, 50);
                }
                if (this.door1.position.set(-60, 5, -51)) {
                    this.coin1.position.set(60, 5, -50);
                    this.coin2.position.set(60, 5, 50);
                    this.coin3.position.set(-60, 5, 50);
                }
                if (this.door1.position.set(60, 5, 51)) {
                    this.coin1.position.set(60, 5, -50);
                    this.coin2.position.set(-60, 5, -50);
                    this.coin3.position.set(-60, 5, 50);
                }
                if (this.door1.position.set(-60, 5, 51)) {
                    this.coin1.position.set(60, 5, -50);
                    this.coin2.position.set(-60, 5, -50);
                    this.coin3.position.set(60, 5, 50);
                }
                scene.add(this.coin1);
                scene.add(this.coin2);
                scene.add(this.coin3);
            });
        };
        /**
         * Event Handler method for any pointerLockChange events
         *
         * @method pointerLockChange
         * @return void
         */
        Play.prototype.pointerLockChange = function (event) {
            if (document.pointerLockElement === this.element) {
                // enable our mouse and keyboard controls
                this.keyboardControls.enabled = true;
                this.mouseControls.enabled = true;
                this.blocker.style.display = 'none';
            }
            else {
                if (this.livesValue <= 0) {
                    this.blocker.style.display = 'none';
                    this.keyboardControls.enabled = false;
                    this.mouseControls.enabled = false;
                    document.removeEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
                    document.removeEventListener('mozpointerlockchange', this.pointerLockChange.bind(this), false);
                    document.removeEventListener('webkitpointerlockchange', this.pointerLockChange.bind(this), false);
                    document.removeEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
                    document.removeEventListener('mozpointerlockerror', this.pointerLockError.bind(this), false);
                    document.removeEventListener('webkitpointerlockerror', this.pointerLockError.bind(this), false);
                }
                else {
                    // disable our mouse and keyboard controls
                    this.keyboardControls.enabled = false;
                    this.mouseControls.enabled = false;
                    this.blocker.style.display = '-webkit-box';
                    this.blocker.style.display = '-moz-box';
                    this.blocker.style.display = 'box';
                    this.instructions.style.display = '';
                    console.log("PointerLock disabled");
                }
            }
        };
        /**
         * Event handler for PointerLockError
         *
         * @method pointerLockError
         * @return void
         */
        Play.prototype.pointerLockError = function (event) {
            this.instructions.style.display = '';
            console.log("PointerLock Error Detected!!");
        };
        // Check Controls Function
        /**
         * This method updates the player's position based on user input
         *
         * @method checkControls
         * @return void
         */
        Play.prototype.checkControls = function () {
            if (this.keyboardControls.enabled) {
                this.velocity = new Vector3();
            }
        };
        Play.prototype.if = ;
        return Play;
    }(scenes.Scene));
    scenes.Play = Play;
    this.isGrounded;
    {
        direction = new Vector3(0, 0, 0);
        if (this.keyboardControls.moveForward) {
            this.velocity.z -= 400.0 * delta;
        }
        if (this.keyboardControls.moveLeft) {
            this.velocity.x -= 400.0 * delta;
        }
        if (this.keyboardControls.moveBackward) {
            this.velocity.z += 400.0 * delta;
        }
        if (this.keyboardControls.moveRight) {
            this.velocity.x += 400.0 * delta;
        }
        if (this.keyboardControls.jump) {
            this.velocity.y += 4000.0 * delta;
            if (this.player.position.y > 4) {
                this.isGrounded = false;
                createjs.Sound.play("jump");
            }
        }
        this.player.setDamping(0.7, 0.1);
        // Changing player's rotation
        this.player.setAngularVelocity(new Vector3(0, this.mouseControls.yaw, 0));
        direction.addVectors(direction, this.velocity);
        direction.applyQuaternion(this.player.quaternion);
        if (Math.abs(this.player.getLinearVelocity().x) < 20 && Math.abs(this.player.getLinearVelocity().y) < 10) {
            this.player.applyCentralForce(direction);
        }
        this.cameraLook();
    } // isGrounded ends
    //reset Pitch and Yaw
    this.mouseControls.pitch = 0;
    this.mouseControls.yaw = 0;
    this.prevTime = time;
})(scenes || (scenes = {})); // Controls Enabled ends
{
    this.player.setAngularVelocity(new Vector3(0, 0, 0));
}
_simulateScene();
void {
    this: .simulate(undefined, 2)
};
start();
void {
    // Set Up Scoreboard
    this: .setupScoreboard(),
    //check to see if pointerlock is supported
    this: .havePointerLock = 'pointerLockElement' in document ||
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document,
    // Check to see if we have pointerLock
    if: function () { }, this: .havePointerLock };
{
    this.element = document.body;
    this.instructions.addEventListener('click', function () {
        // Ask the user for pointer lock
        console.log("Requesting PointerLock");
        _this.element.requestPointerLock = _this.element.requestPointerLock ||
            _this.element.mozRequestPointerLock ||
            _this.element.webkitRequestPointerLock;
        _this.element.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
    document.addEventListener('mozpointerlockchange', this.pointerLockChange.bind(this), false);
    document.addEventListener('webkitpointerlockchange', this.pointerLockChange.bind(this), false);
    document.addEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
    document.addEventListener('mozpointerlockerror', this.pointerLockError.bind(this), false);
    document.addEventListener('webkitpointerlockerror', this.pointerLockError.bind(this), false);
}
// Scene changes for Physijs
this.name = "Main";
this.fog = new THREE.Fog(0xffffff, 0, 750);
this.setGravity(new THREE.Vector3(0, -10, 0));
this.addEventListener('update', this._simulateScene);
console.log("Start simulation");
// Add Spot Light to the scene
this.addSpotLight();
// Ground Object
this.addGround();
// Add player controller
this.addPlayer();
// Add custom coin imported from Blender
this.addCoinMesh();
// Add death plane to the scene
this.addDeathPlane();
// Collision Check
this.player.addEventListener('collision', function (eventObject) {
    if (eventObject.name === "Ground") {
        this.isGrounded = true;
        createjs.Sound.play("land");
    }
    if (eventObject.name === "Coin") {
        createjs.Sound.play("coin");
        this.remove(eventObject);
        this.setCoinPosition(eventObject);
        this.scoreValue += 100;
        this.scoreLabel.text = "SCORE: " + this.scoreValue;
    }
    if (eventObject.name === "DeathPlane") {
        createjs.Sound.play("hit");
        this.livesValue--;
        if (this.livesValue <= 0) {
            //Game over yeaaAAAHHH H H H H HH
            document.exitPointerLock();
            this.children = []; //Clean up children objects
            console.log(this);
            currentScene = config.Scene.OVER;
            changeScene();
        }
        else {
            //Reset player, update lives
            this.livesLabel.text = "LIVES: " + this.livesValue;
            this.remove(this.player);
            this.player.position.set(0, 30, 10);
            this.add(this.player);
        }
    }
}.bind(this));
// create parent-child relationship with camera and player
this.player.add(camera);
camera.position.set(0, 1, 0);
cameraLook();
void {
    zenith: number = THREE.Math.degToRad(90),
    nadir: number = THREE.Math.degToRad(-90),
    cameraPitch: number = camera.rotation.x + this.mouseControls.pitch,
    // Constrain the Camera Pitch
    camera: .rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith)
};
update();
void {
    this: .coins.forEach(function (coin) {
        coin.setAngularFactor(new Vector3(0, 0, 0));
        coin.setAngularVelocity(new Vector3(0, 1, 0));
    }),
    this: .checkControls(),
    this: .stage.update(),
    this: .simulate()
};
resize();
void {
    canvas: .style.width = "100%",
    this: .livesLabel.x = config.Screen.WIDTH * 0.1,
    this: .livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20,
    this: .scoreLabel.x = config.Screen.WIDTH * 0.8,
    this: .scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20,
    this: .stage.update()
};

//# sourceMappingURL=play.js.map
