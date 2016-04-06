var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var scenes;
(function (scenes) {
    /**
     * The Instruction scene extends scene.Scene superclass is used to
     * create an instruction scene for the THREEJS Game
     *
     * @class Scene
     * @extends scene.Scene
     * @param blocker {HTMLElement}
     * @param _stage {createjs.Stage}
     * @param _gameLabel {createjs.Text}
     * @param _startButton {createjs.Bitmap}
     * @param _exitButton {createjs.Bitmap}
     */
    var Instructions = (function (_super) {
        __extends(Instructions, _super);
        /**
         * @constructor
         */
        function Instructions() {
            _super.call(this);
            this._initialize();
            this.start();
        }
        // PRIVATE METHODS ++++++++++++++++++++++++++++++++++++++++++++++
        Instructions.prototype._setupCanvas = function () {
            canvas.style.width = "100%";
            canvas.setAttribute("height", config.Screen.HEIGHT.toString());
            canvas.style.backgroundColor = "#ffffff";
        };
        /**
        * This method sets up default values for class member variables
        * and objects
        *
        * @method _initialize
        * @return void
        */
        Instructions.prototype._initialize = function () {
            // Create to HTMLElements
            this._blocker = document.getElementById("blocker");
            this._blocker.style.display = "none";
            // setup canvas for menu scene
            this._setupCanvas();
            // setup a stage on the canvas
            this._stage = new createjs.Stage(canvas);
            this._stage.enableMouseOver(20);
        };
        //PUBLIC METHODS +++++++++++++++++++++++++++++++++++++++++++++++
        /**
         * The start method is the main method for the scene class
         *
         * @method start
         * @return void
         */
        Instructions.prototype.start = function () {
            this._gameLabel = new createjs.Text("INSTRUCTIONS", "80px Consolas", "#000000");
            this._gameLabel.regX = this._gameLabel.getMeasuredWidth() * 0.5;
            this._gameLabel.regY = this._gameLabel.getMeasuredLineHeight() * 0.5;
            this._gameLabel.x = config.Screen.WIDTH * 0.5;
            this._gameLabel.y = config.Screen.HEIGHT * 0.5;
            this._stage.addChild(this._gameLabel);
            this._startButton = new createjs.Bitmap(assets.getResult("StartButton"));
            this._startButton.regX = this._startButton.getBounds().width * 0.5;
            this._startButton.regY = this._startButton.getBounds().height * 0.5;
            this._startButton.x = config.Screen.WIDTH * 0.5;
            this._startButton.y = (config.Screen.HEIGHT * 0.5) + 100;
            this._stage.addChild(this._startButton);
            this._startButton.on("mouseover", function (event) {
                event.target.alpha = 0.7;
            });
            this._startButton.on("mouseout", function (event) {
                event.target.alpha = 1.0;
            });
            this._startButton.on("click", function (event) {
                currentScene = config.Scene.PLAY;
                changeScene();
            });
            this._exitButton = new createjs.Bitmap(assets.getResult("ExitButton"));
            this._exitButton.regX = this._exitButton.getBounds().width * 0.5;
            this._exitButton.regY = this._exitButton.getBounds().height * 0.5;
            this._exitButton.x = config.Screen.WIDTH * 0.2;
            this._exitButton.y = (config.Screen.HEIGHT * 0.5) + 100;
            this._stage.addChild(this._exitButton);
            this._exitButton.on("mouseover", function (event) {
                event.target.alpha = 0.7;
            });
            this._exitButton.on("mouseout", function (event) {
                event.target.alpha = 1.0;
            });
            this._exitButton.on("click", function (event) {
                currentScene = config.Scene.INSTRUCTIONS;
                changeScene();
            });
        };
        /**
         * The update method updates the animation loop and other objects
         *
         * @method update
         * @return void
         */
        Instructions.prototype.update = function () {
            this._stage.update();
        };
        /**
         * The resize method is a procedure that sets variables and objects on screen resize
         *
         * @method resize
         * @return void
         */
        Instructions.prototype.resize = function () {
            this._setupCanvas();
        };
        return Instructions;
    })(Physijs.Scene);
    scenes.Instructions = Instructions;
})(scenes || (scenes = {}));
//# sourceMappingURL=instructions.js.map