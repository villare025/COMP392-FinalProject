var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
         * Adds lava floor to the scene
         *
         * @method addLavaFloor
         * @return void
         */
        Play.prototype.addLavaFloor = function () {
            this.groundTexture = new THREE.TextureLoader().load('../../Assets/images/lava.gif');
            this.groundTexture.wrapS = THREE.RepeatWrapping;
            this.groundTexture.wrapT = THREE.RepeatWrapping;
            this.groundTexture.repeat.set(50, 50);
            this.groundTextureNormal = new THREE.TextureLoader().load('../../Assets/images/RockErodeNormal.png');
            this.groundTextureNormal.wrapS = THREE.RepeatWrapping;
            this.groundTextureNormal.wrapT = THREE.RepeatWrapping;
            this.groundTextureNormal.repeat.set(50, 50);
            this.groundMaterial = new PhongMaterial();
            this.groundMaterial.map = this.groundTexture;
            //this.groundMaterial.bumpMap = this.groundTextureNormal;
            this.groundMaterial.bumpScale = 0.2;
            this.groundGeometry = new BoxGeometry(150, 1, 150);
            this.groundPhysicsMaterial = Physijs.createMaterial(this.groundMaterial, 0, 0);
            this.ground = new Physijs.ConvexMesh(this.groundGeometry, this.groundPhysicsMaterial, 0);
            this.ground.receiveShadow = true;
            this.ground.name = "Lava floor";
            this.ground.position.set(0, -50, 0);
            scene.add(this.ground);
            console.log("Added Lava floor to scene");
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
         *Adds paths to scene
         *
         *@method addRoads
         *@return void
         */
        Play.prototype.addRoads = function () {
            // Road Components
            this.roadMainTexture = new THREE.TextureLoader().load('../../Assets/images/RockSediment.jpg');
            this.roadMainTexture.wrapS = THREE.RepeatWrapping;
            this.roadMainTexture.wrapT = THREE.RepeatWrapping;
            this.roadMainTexture.repeat.set(15, 15);
            this.roadMainMaterial = new PhongMaterial();
            this.roadMainMaterial.map = this.roadMainTexture;
            this.roadMainMaterial.bumpScale = 0.2;
            // Road One
            this.road1Geometry = new BoxGeometry(2.5, 4, 50);
            this.road1PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road1 = new Physijs.BoxMesh(this.road1Geometry, this.road1PhysicsMaterial, 0);
            this.road1.receiveShadow = true;
            this.road1.castShadow = true;
            this.road1.position.set(40, 0, 0);
            this.road1.name = "Road1";
            scene.add(this.road1);
            console.log("Added a Road 1 to the scene");
            //Road Two
            this.road2Geometry = new BoxGeometry(2.5, 4, 50);
            this.road2PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road2 = new Physijs.BoxMesh(this.road2Geometry, this.road2PhysicsMaterial, 0);
            this.road2.receiveShadow = true;
            this.road2.castShadow = true;
            this.road2.position.set(-40, 0, 0);
            this.road2.name = "Road2";
            scene.add(this.road2);
            console.log("Added a Road 2 to the scene");
            // Road Three
            this.road3Geometry = new BoxGeometry(82.5, 4, 1.7);
            this.road3PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road3 = new Physijs.BoxMesh(this.road3Geometry, this.road3PhysicsMaterial, 0);
            this.road3.receiveShadow = true;
            this.road3.castShadow = true;
            this.road3.position.set(0, 0, -25);
            this.road3.name = "Road3";
            scene.add(this.road3);
            console.log("Added a Road 3 to the scene");
            // Road Four
            this.road4Geometry = new BoxGeometry(82.5, 4, 1.7);
            this.road4PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road4 = new Physijs.BoxMesh(this.road4Geometry, this.road4PhysicsMaterial, 0);
            this.road4.receiveShadow = true;
            this.road4.castShadow = true;
            this.road4.position.set(0, 0, 25);
            this.road4.name = "Road4";
            scene.add(this.road4);
            console.log("Added a Road 4 to the scene");
            // Road Five
            this.road5Geometry = new BoxGeometry(110, 4, 3.5);
            this.road5PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road5 = new Physijs.BoxMesh(this.road5Geometry, this.road5PhysicsMaterial, 0);
            this.road5.receiveShadow = true;
            this.road5.castShadow = true;
            this.road5.position.set(20, 0, 69);
            this.road5.name = "Road5";
            scene.add(this.road5);
            console.log("Added a Road 5 to the scene");
            // Road Six
            this.road6Geometry = new BoxGeometry(110, 4, 3.5);
            this.road6PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road6 = new Physijs.BoxMesh(this.road6Geometry, this.road6PhysicsMaterial, 0);
            this.road6.receiveShadow = true;
            this.road6.castShadow = true;
            this.road6.position.set(-20, 0, -74);
            this.road6.name = "Road6";
            scene.add(this.road6);
            console.log("Added a Road 6 to the scene");
            // Road Seven
            this.road7Geometry = new BoxGeometry(110, 4, 1);
            this.road7PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road7 = new Physijs.BoxMesh(this.road7Geometry, this.road7PhysicsMaterial, 0);
            this.road7.receiveShadow = true;
            this.road7.castShadow = true;
            this.road7.position.set(20, 0, -40);
            this.road7.name = "Road7";
            scene.add(this.road7);
            console.log("Added a Road 7 to the scene");
            // Road Eight
            this.road8Geometry = new BoxGeometry(50, 4, 3);
            this.road8PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road8 = new Physijs.BoxMesh(this.road8Geometry, this.road8PhysicsMaterial, 0);
            this.road8.receiveShadow = true;
            this.road8.castShadow = true;
            this.road8.position.set(30, 0, -15);
            this.road8.name = "Road8";
            scene.add(this.road8);
            console.log("Added a Road 8 to the scene");
            // Road Nine
            this.road9Geometry = new BoxGeometry(50, 4, 3);
            this.road9PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road9 = new Physijs.BoxMesh(this.road9Geometry, this.road9PhysicsMaterial, 0);
            this.road9.receiveShadow = true;
            this.road9.castShadow = true;
            this.road9.position.set(-30, 0, 15);
            this.road9.name = "Road9";
            scene.add(this.road9);
            console.log("Added a Road 9 to the scene");
            // Road Ten
            this.road10Geometry = new BoxGeometry(35, 4, 2.5);
            this.road10PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road10 = new Physijs.BoxMesh(this.road10Geometry, this.road10PhysicsMaterial, 0);
            this.road10.receiveShadow = true;
            this.road10.castShadow = true;
            this.road10.position.set(18, 0, 22);
            this.road10.name = "Road10";
            scene.add(this.road10);
            console.log("Added a Road 10 to the scene");
            // Road Eleven
            this.road11Geometry = new BoxGeometry(2, 4, 50);
            this.road11PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road11 = new Physijs.BoxMesh(this.road11Geometry, this.road11PhysicsMaterial, 0);
            this.road11.receiveShadow = true;
            this.road11.castShadow = true;
            this.road11.position.set(35, 0, 35);
            this.road11.name = "Road11";
            scene.add(this.road11);
            console.log("Added a Road 11 to the scene");
            // Road Twelve
            this.road12Geometry = new BoxGeometry(1.5, 4, 50);
            this.road12PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road12 = new Physijs.BoxMesh(this.road12Geometry, this.road12PhysicsMaterial, 0);
            this.road12.receiveShadow = true;
            this.road12.castShadow = true;
            this.road12.position.set(25, 0, -20);
            this.road12.name = "Road12";
            scene.add(this.road12);
            console.log("Added a Road 12 to the scene");
            // Road Thirteen
            this.road13Geometry = new BoxGeometry(1, 4, 50);
            this.road13PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road13 = new Physijs.BoxMesh(this.road13Geometry, this.road13PhysicsMaterial, 0);
            this.road13.receiveShadow = true;
            this.road13.castShadow = true;
            this.road13.position.set(-35, 0, 20);
            this.road13.name = "Road13";
            scene.add(this.road13);
            console.log("Added a Road 13 to the scene");
            // Road Fourteen
            this.road14Geometry = new BoxGeometry(1.5, 4, 50);
            this.road14PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road14 = new Physijs.BoxMesh(this.road14Geometry, this.road14PhysicsMaterial, 0);
            this.road14.receiveShadow = true;
            this.road14.castShadow = true;
            this.road14.position.set(-55, 0, 40);
            this.road14.name = "Road14";
            scene.add(this.road14);
            console.log("Added a Road 14 to the scene");
            // Road Fifteen
            this.road15Geometry = new BoxGeometry(40, 4, 1.25);
            this.road15PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road15 = new Physijs.BoxMesh(this.road15Geometry, this.road15PhysicsMaterial, 0);
            this.road15.receiveShadow = true;
            this.road15.castShadow = true;
            this.road15.position.set(-55, 0, 60);
            this.road15.name = "Road15";
            scene.add(this.road15);
            console.log("Added a Road 15 to the scene");
            // Road Sixteen
            this.road16Geometry = new BoxGeometry(40, 4, 2.15);
            this.road16PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road16 = new Physijs.BoxMesh(this.road16Geometry, this.road16PhysicsMaterial, 0);
            this.road16.receiveShadow = true;
            this.road16.castShadow = true;
            this.road16.position.set(35, 0, 55);
            this.road16.name = "Road16";
            scene.add(this.road16);
            console.log("Added a Road 16 to the scene");
            // Road Seventeen
            this.road17Geometry = new BoxGeometry(40, 4, 2.5);
            this.road17PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road17 = new Physijs.BoxMesh(this.road17Geometry, this.road17PhysicsMaterial, 0);
            this.road17.receiveShadow = true;
            this.road17.castShadow = true;
            this.road17.position.set(-17, 0, 52);
            this.road17.name = "Road17";
            scene.add(this.road17);
            console.log("Added a Road 17 to the scene");
            // Road Eighteen
            this.road18Geometry = new BoxGeometry(40, 4, 2);
            this.road18PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road18 = new Physijs.BoxMesh(this.road18Geometry, this.road18PhysicsMaterial, 0);
            this.road18.receiveShadow = true;
            this.road18.castShadow = true;
            this.road18.position.set(55, 0, 10);
            this.road18.name = "Road18";
            scene.add(this.road18);
            console.log("Added a Road 18 to the scene");
            // Road Nineteen
            this.road19Geometry = new BoxGeometry(1.1, 4, 60);
            this.road19PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road19 = new Physijs.BoxMesh(this.road19Geometry, this.road19PhysicsMaterial, 0);
            this.road19.receiveShadow = true;
            this.road19.castShadow = true;
            this.road19.position.set(55, 0, 10);
            this.road19.name = "Road19";
            scene.add(this.road19);
            console.log("Added a Road 19 to the scene");
            // Road Twenty
            this.road20Geometry = new BoxGeometry(3.5, 4, 70);
            this.road20PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road20 = new Physijs.BoxMesh(this.road20Geometry, this.road20PhysicsMaterial, 0);
            this.road20.receiveShadow = true;
            this.road20.castShadow = true;
            this.road20.position.set(-73, 0, 10);
            this.road20.name = "Road20";
            scene.add(this.road20);
            console.log("Added a Road 20 to the scene");
            // Road Twenty-One
            this.road21Geometry = new BoxGeometry(2.15, 4, 70);
            this.road21PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road21 = new Physijs.BoxMesh(this.road21Geometry, this.road21PhysicsMaterial, 0);
            this.road21.receiveShadow = true;
            this.road21.castShadow = true;
            this.road21.position.set(-50, 0, -30);
            this.road21.name = "Road21";
            scene.add(this.road21);
            console.log("Added a Road 21 to the scene");
            // Road Twenty-Two
            this.road22Geometry = new BoxGeometry(0.5, 4, 55);
            this.road22PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road22 = new Physijs.BoxMesh(this.road22Geometry, this.road22PhysicsMaterial, 0);
            this.road22.receiveShadow = true;
            this.road22.castShadow = true;
            this.road22.position.set(50, 0, -48);
            this.road22.name = "Road22";
            scene.add(this.road22);
            console.log("Added a Road 22 to the scene");
            // Road Twenty-Three
            this.road23Geometry = new BoxGeometry(55, 4, 0.5);
            this.road23PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road23 = new Physijs.BoxMesh(this.road23Geometry, this.road23PhysicsMaterial, 0);
            this.road23.receiveShadow = true;
            this.road23.castShadow = true;
            this.road23.position.set(0, 0, 0);
            this.road23.name = "Road23";
            scene.add(this.road23);
            console.log("Added a Road 23 to the scene");
            // Road Twenty-Four
            this.road24Geometry = new BoxGeometry(70, 4, 0.75);
            this.road24PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road24 = new Physijs.BoxMesh(this.road24Geometry, this.road24PhysicsMaterial, 0);
            this.road24.receiveShadow = true;
            this.road24.castShadow = true;
            this.road24.position.set(-25, 0, -60);
            this.road24.name = "Road24";
            scene.add(this.road24);
            console.log("Added a Road 24 to the scene");
            // Road Twenty-Five
            this.road25Geometry = new BoxGeometry(30, 4, 1.75);
            this.road25PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road25 = new Physijs.BoxMesh(this.road25Geometry, this.road25PhysicsMaterial, 0);
            this.road25.receiveShadow = true;
            this.road25.castShadow = true;
            this.road25.position.set(-60, 0, -40);
            this.road25.name = "Road25";
            scene.add(this.road25);
            console.log("Added a Road 25 to the scene");
            // Road Twenty-Six
            this.road26Geometry = new BoxGeometry(30, 4, 0.5);
            this.road26PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road26 = new Physijs.BoxMesh(this.road26Geometry, this.road26PhysicsMaterial, 0);
            this.road26.receiveShadow = true;
            this.road26.castShadow = true;
            this.road26.position.set(-60, 0, -10);
            this.road26.name = "Road26";
            scene.add(this.road26);
            console.log("Added a Road 26 to the scene");
            // Road Twenty-Seven
            this.road27Geometry = new BoxGeometry(0.5, 4, 35);
            this.road27PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road27 = new Physijs.BoxMesh(this.road27Geometry, this.road27PhysicsMaterial, 0);
            this.road27.receiveShadow = true;
            this.road27.castShadow = true;
            this.road27.position.set(-60, 0, -25);
            this.road27.name = "Road27";
            scene.add(this.road27);
            console.log("Added a Road 27 to the scene");
            // Road Twenty-Eight
            this.road28Geometry = new BoxGeometry(1.5, 4, 35);
            this.road28PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road28 = new Physijs.BoxMesh(this.road28Geometry, this.road28PhysicsMaterial, 0);
            this.road28.receiveShadow = true;
            this.road28.castShadow = true;
            this.road28.position.set(70, 0, -25);
            this.road28.name = "Road28";
            scene.add(this.road28);
            console.log("Added a Road 28 to the scene");
            // Road Twenty-Nine
            this.road29Geometry = new BoxGeometry(1.5, 4, 35);
            this.road29PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road29 = new Physijs.BoxMesh(this.road29Geometry, this.road29PhysicsMaterial, 0);
            this.road29.receiveShadow = true;
            this.road29.castShadow = true;
            this.road29.position.set(70, 0, 50);
            this.road29.name = "Road29";
            scene.add(this.road29);
            console.log("Added a Road 29 to the scene");
            // Road Thirty
            this.road30Geometry = new BoxGeometry(45, 4, 1.5);
            this.road30PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road30 = new Physijs.BoxMesh(this.road30Geometry, this.road30PhysicsMaterial, 0);
            this.road30.receiveShadow = true;
            this.road30.castShadow = true;
            this.road30.position.set(50, 0, 40);
            this.road30.name = "Road30";
            scene.add(this.road30);
            console.log("Added a Road 30 to the scene");
            // Road Thirty-One
            this.road31Geometry = new BoxGeometry(45, 4, 1.5);
            this.road31PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road31 = new Physijs.BoxMesh(this.road31Geometry, this.road31PhysicsMaterial, 0);
            this.road31.receiveShadow = true;
            this.road31.castShadow = true;
            this.road31.position.set(40, 0, -65);
            this.road31.name = "Road31";
            scene.add(this.road31);
            console.log("Added a Road 31 to the scene");
            // Road Thirty-Two
            this.road32Geometry = new BoxGeometry(0.5, 4, 60);
            this.road32PhysicsMaterial = Physijs.createMaterial(this.roadMainMaterial, 0, 0);
            this.road32 = new Physijs.BoxMesh(this.road32Geometry, this.road32PhysicsMaterial, 0);
            this.road32.receiveShadow = true;
            this.road32.castShadow = true;
            this.road32.position.set(-40, 0, -45);
            this.road32.name = "Road32";
            scene.add(this.road32);
            console.log("Added a Road 32 to the scene");
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
                this.coin1 = new Physijs.ConvexMesh(this.coinGeometry, this.coinMaterial);
                this.coin2 = new Physijs.ConvexMesh(this.coinGeometry, this.coinMaterial);
                this.coin3 = new Physijs.ConvexMesh(this.coinGeometry, this.coinMaterial);
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
                var time = performance.now();
                var delta = (time - this.prevTime) / 1000;
                if (this.isGrounded) {
                    var direction = new Vector3(0, 0, 0);
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
            } // Controls Enabled ends
            else {
                this.player.setAngularVelocity(new Vector3(0, 0, 0));
            }
        };
        // PUBLIC METHODS +++++++++++++++++++++++++++++++++++++++++++
        /**
         * The start method is the main method for the scene class
         *
         * @method start
         * @return void
         */
        Play.prototype._simulateScene = function () {
            this.simulate(undefined, 2);
        };
        Play.prototype.start = function () {
            var _this = this;
            // Set Up Scoreboard
            this.setupScoreboard();
            //check to see if pointerlock is supported
            this.havePointerLock = 'pointerLockElement' in document ||
                'mozPointerLockElement' in document ||
                'webkitPointerLockElement' in document;
            // Check to see if we have pointerLock
            if (this.havePointerLock) {
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
            this.addLavaFloor();
            // Add player controller
            this.addPlayer();
            // Add custom coin imported from Blender
            this.setCoinMesh();
            // Add death plane to the scene
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
        };
        /**
         * Camera Look function
         *
         * @method cameraLook
         * @return void
         */
        Play.prototype.cameraLook = function () {
            var zenith = THREE.Math.degToRad(90);
            var nadir = THREE.Math.degToRad(-90);
            var cameraPitch = camera.rotation.x + this.mouseControls.pitch;
            // Constrain the Camera Pitch
            camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
        };
        /**
         * @method update
         * @returns void
         */
        Play.prototype.update = function () {
            this.checkControls();
            this.stage.update();
            this.simulate();
        };
        /**
         * Responds to screen resizes
         *
         * @method resize
         * @return void
         */
        Play.prototype.resize = function () {
            canvas.style.width = "100%";
            this.livesLabel.x = config.Screen.WIDTH * 0.1;
            this.livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.scoreLabel.x = config.Screen.WIDTH * 0.8;
            this.scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.stage.update();
        };
        return Play;
    }(scenes.Scene));
    scenes.Play = Play;
})(scenes || (scenes = {}));

//# sourceMappingURL=play.js.map
