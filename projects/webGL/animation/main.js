
var canvas;
var gl;

var program;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

//Initialization of uniforms for an effect within the fragment shader
var resolutionLocation = vec3(0, 0, 0);
var timeLocation = 0.0;

// The beginning of time
var time = 0.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.6, -1.6, 1.0);
var up = vec3(0.0, 1.0, 0.0);
var atZ=0;

//Variables regarding the eye vector
var eyePosition = [1, 1, 1];
var rDistance = 73.8; // the radius distance from the center of eye's rotation

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var dt = 0.0
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = true;
var controller;

// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time.
var currentRotation = [0,0,0];
//var bouncingCubePosition = [-4,-20,2];
var bouncingCubePosition = [0,-4,0];
var bouncyBallVelocity = 0;
var bouncyEnergyLoss = 0.7;
var gravity = -15;

var bouncyBallVelocity2 = 0;
var bouncyEnergyLoss2 = 0.7;
var gravity2 = -15;

var timeToDrop = false;

var frameCounter =0;
var timeCounter = 0;



// size variable to dynamically scale a sphere
var sphereSize = [1, 1, 1];
var sphereSize2 = [1, 1, 1];
var sphereSize3 = [1, 1, 1];
// initialize spherePosition
var spherePosition = [0, 0, 0];
var spherePosition2 = [0, 0, 0];
var spherePosition3 = [0, 0, 0];
var spherePosition4 = [0, 0, 0];
// initialize pupil range
var pupilMovementAmpl = 0.9;
//initialize coneRotation
var coneRotation = [0,0,0];
var conePosition = [0,0,0];
//bezier patch
var bezierRotation = [0,0,0];
var bezierPosition = [0,0,0];

var blendTextures = 0;
//initialize plane position
var planePosition = [0,0,0];
// initialize cylinderPosition for character legs
var cylinderPosition = [0,0,0];
var bouncyCharacterPosition = [0,0,0];

var blackEyeSize = [0,0,0];

var legRotation = [0,0,0];
var legBendAmpl = [0,0,0];

var armRotation = [0,0,0];

var spinningPosition = [0,0,0];

var coneFallPosition =[0,0,0];
var landscapeFallPosition=[0,0,0];

var bouncyCharacterPosition2 = [0,0,0];
var bouncyCharacterPosition3 = [0,0,0];
var bouncyCharacterPosition4 = [0,0,0];
		
// For this example we are going to store a few different textures here
var textureArray = [] ;

// Setting the colour which is needed during illumination of a surface
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition2) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

// We are going to asynchronously load actual image files this will check if that call if an async call is complete
// You can use this for debugging
function isLoaded(im) {
    if (im.complete) {
        //console.log("loaded") ;
        return true ;
    }
    else {
        //console.log("still not loaded!!!!") ;
        return false ;
    }
}

// Helper function to load an actual file as a texture
// NOTE: The image is going to be loaded asyncronously (lazy) which could be
// after the program continues to the next functions. OUCH!
function loadFileTexture(tex, filename)
{
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
}

// Once the above image file loaded with loadFileTexture is actually loaded,
// this funcion is the onload handler and will be called.
function handleTextureLoaded(textureObj) {
	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
	
	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    //console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

// Takes an array of textures and calls render if the textures are created/loaded
// This is useful if you have a bunch of textures, to ensure that those files are
// actually laoded from disk you can wait and delay the render function call
// Notice how we call this at the end of init instead of just calling requestAnimFrame like before
function waitForTextures(texs) {
    setTimeout(
		function() {
			   var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    //console.log(texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               		//console.log(wtime + " not ready yet") ;
               		waitForTextures(texs) ;
               }
               else
               {
               		// //console.log("ready to render") ;
					render(0);
               }
		},
	5) ;
}

// This will use an array of existing image data to load and set parameters for a texture
// We'll use this function for procedural textures, since there is no async loading to deal with
function loadImageTexture(tex, image) {
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();

	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);

	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true;
}

// This just calls the appropriate texture loads for this example adn puts the textures in an array
function initTexturesForExample() {
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"hands.jpg") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"painting_space.jpg") ;

}

// Turn texture use on and off
function toggleTextureBlending() {
    blendTextures = (blendTextures + 1) % 2
	gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse);
	
	// Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
	// Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
    Cube.init(program);
    Cylinder.init(20,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    // We're going to initialize a new shape that will sort of look like a terrain for fun
    p1 = [[vec3(-15,-15,0), vec3(-8,-15,0), vec3(8,-15,0), vec3(15,-15,0)],
    [vec3(-15,-8,0), vec3(-8,-8,15), vec3(8,-8,15), vec3(15,-8,0)],
    [vec3(-15,8,0), vec3(-8,8,15), vec3(8,8,15), vec3(15,8,0)],
    [vec3(-15,15,0), vec3(-8,15,0), vec3(8,15,0), vec3(15,15,0)]] ;
    gBezierPatch1 = new BezierPatch3(2.0,p1,program) ;

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
	
    // // The following are uniforms for the special effects mainImage function called within the fragment shader when blendTextures isn't 0 nor 1
    // // uniform vec3 iResolution; // viewport resolution (in pixels)
    // // uniform float iTime;      // shader playback time (in seconds)

    //Look up uniforms for an effect within the fragment shader
    resolutionLocation = gl.getUniformLocation(program, "iResolution");
    timeLocation = gl.getUniformLocation(program, "iTime");


	// Helper function just for this example to load the set of textures
    initTexturesForExample() ;

    waitForTextures(textureArray);
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Draw a Bezier patch
function drawB3(b) {
	setMV() ;
	b.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}



/* drawBigHuman: FUNCTION in order to draw a simple landscape    *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Argument: 1. pupilMovementAmpl: controls the movement of the pupil as
 *                  it moves from side to side. pupilMovementAmpl gets 
 *                  progressively smaller and eventually reaches zero so
 *                  that it looks like the bigHuman's eye is centered on
 *                  the scene within the cone.
 * Function: This function draws the bigHuman on the outside of the cone
*/
function drawBigHuman(pupilMovementAmpl){
    
    gPush();
        /* Draw HEAD */
        gScale(0.7,1.0,0.7);
        gPush();
        {
            blendTextures = 1;
            gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
            setColor(vec4(0,0.0,0.0,1.0));
            drawSphere();
            
        }
        gPop();
        /* END of HEAD */


        /* Draw EYE */
        gPush();
            gTranslate(-0.26, 0, -0.95);

            /* Draw PUPIL */
            gPush();
                gTranslate(0, 0, -0.1);
                gScale(0.1, 0.1, 0.1);

                // Make pupil go back and forth
                spherePosition[0] += 20*dt;
                gTranslate(pupilMovementAmpl*Math.cos(1/15*spherePosition[0]), spherePosition[1], spherePosition[2]);
                
                gPush();
                    // Change the color of the pupil after a certain amount of time
                    if (time > 18) {
                        blendTextures = 0;
                        gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                    }
                    setColor(vec4(0,0,0,1));
                    drawSphere();
                gPop();
            gPop();
            /* END of PUPIL */
        
            gScale(0.26, 0.13, 0.13);
            {
                blendTextures = 1;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                setColor(vec4(1,1.0,1.0,1.0));
                drawSphere(); 
            }
        gPop();
        /* END of EYE */

        /* Draw CLOSED EYE */
        gPush();
            gTranslate(0.29, 0, -0.85);
        
            gScale(0.26, 0.03, 0.13);
            
        {
            setColor(vec4(1,1.0,1.0,1.0));
            drawSphere();
            
        }
        gPop();
        /* END of CLOSED EYE */


        /* Draw MOUTH */
        gPush();
            gTranslate(0, -0.5, -0.782);
            gRotate(-20, 1, 0, 0);
            gScale(0.4, 0.2, 0.1);

            gPush();
                sphereSize[0] += 0.25*dt-0.05;
                sphereSize[1] += 3*dt-0.02;
                sphereSize[2] += 0.25*dt-0.02;
                // Make human open and close their mouth dynamically
                gScale(1/20*Math.cos(sphereSize[0])+1, 1.6*Math.sin(sphereSize[1])+1, 1/80*Math.cos(1/80*sphereSize[2])+1);
                gPush();
                    gTranslate(0, -0.05, -0.24);
                    gScale(1, 0.8, 0.8);
                    {
                        setColor(vec4(0,0.0,0.0,1.0));
                        drawSphere();
                    }
                gPop();
                {
                    setColor(vec4(1,1.0,1.0,1.0));
                    drawSphere();
                }
            gPop();
        gPop();
        /* END of MOUTH */
    gPop();

    /* Draw HAT */
    gPush();
        gTranslate(0, 1, 0);
        /* Hat Bottom */
        gPush();
            gTranslate(0, -0.5, 0);   
            gScale(1.3, 0.25, 0.8);
            {
                setColor(vec4(0,0.0,0.0,1.0));
                drawSphere(); 
            }
        gPop();
        gRotate(-90, 1, 0, 0);
        gScale(1.3, 1.3, 0.8);
        {
            setColor(vec4(0,0.0,0.0,1.0));
            drawCylinder(); 
        }
    gPop();
    /* END of HAT */
    

    /* Draw NECK */
    gTranslate(0,-0.5, 0);
    gPush();
        gRotate(90, 1, 0, 0);
        gScale(1, 1, 1);
        gPush();
        {
            setColor(vec4(0,0.0,0.0,1.0));
            drawCylinder();
            
        }
        gPop();
    gPop();
    /* END of NECK */

    /* Draw BODY */
    gTranslate(0, -3.2, 0);
    gPush();
        gScale(1.5, 3, 1.5);
        {
            setColor(vec4(0,0,0,1));
            drawSphere();
        }

    gPop();
    /* END of BODY */

}


/* drawLandscape: FUNCTION in order to draw a simple landscape    *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Argument: None.
 * Function: This function draws the landscape within the colorful cone
 *           using spheres and textures
*/
function drawLandscape(){
    gPush();
        // First hill
        gPush();
            gScale(0.8, 1.4, 0.7);
            {
                blendTextures = 3;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                setColor(vec4(0,0,0,1));
                drawSphere();
                blendTextures = 3;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
            }
        gPop();

        // Second hill
        gPush();
            gTranslate(-0.8, 0, -2.7);
            gScale(0.8, 1.3, 0.6);
            {
                blendTextures = 5;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                setColor(vec4(0,0,0,1));
                drawSphere();
                blendTextures = 5;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
            }
        gPop();

        // Third Hill
        gPush();
            gTranslate(-1, 0, -3.7);
            gScale(0.8, 3, 0.6);
            {
                blendTextures = 2;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                setColor(vec4(0,0,0,1));
                drawSphere();
                blendTextures = 2;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
            }
        gPop();

        // Fourth hill
        gPush();
            gTranslate(-0.8, 0, -3.3);
            gScale(0.5, 4, 0.6);
            {
                blendTextures = 2;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                setColor(vec4(0,0,0,1));
                drawSphere();
                blendTextures = 2;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
            }
        gPop();

        // The bottom field
        gPush();
            gTranslate(-0.8, -1.3, -0.5);
            gScale(3, 2, 5);
            {
                blendTextures = 3;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                setColor(vec4(0,0,0,1));
                drawSphere();
                blendTextures = 3;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
            }
        gPop();
    gPop();
}

/* drawBouncyCharacter: FUNCTION in order to draw a character to bounce on landscape *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ *
 * Argument: 1. CharacterHeight: used for helper functions
 *           2. bouncyBallVelocity: used for helper functions
 *           3. bendAtHip: to control if character is sitting or not
 *           4. colorOffset: to control the color of each character
 *          
 * Function: This function draws a character with arms and legs. It calls two helper
 *           functions (drawArm & drawLeg) to deal with hiearchal structures seperately
*/
function drawBouncyCharacter(characterHeight, bouncyBallVelocity, bendAtHip, colorOffset){
    gPush();
        // bouncyCharacterPosition[2] -= 20*dt;
        // gRotate(10*Math.cos(1/bouncyBallVelocity*bouncyCharacterPosition[2]),0,0,1);
        //gRotate(bouncyCharacterPosition[2],0,0,1);
        /* HEAD */
        gPush();
            {   
                setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                drawSphere();
            }
        gPop();

        /* ARMS */ 
        //Draw character's left arm:
        gPush();
            gTranslate(0, -2, -2);
            drawArm(bouncyBallVelocity, 0, colorOffset);
        gPop();
        //Draw character's right arm:
        gPush();
            gTranslate(0, -2, 2);
            drawArm(bouncyBallVelocity, -180, colorOffset);
        gPop();

        /* TORSO to HEAD connection */
        gTranslate(0,-1.2, 0);
        gPush();
            gScale(1, 1.8, 2.2);
            gPush();
                {   
                    setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                    gRotate(-90, 1, 0, 0);
                    drawCone();
                }
            gPop();
        gPop();
        
        /* TORSO */
        gTranslate(0,-2.0, 0);
        gPush();
            gScale(1, 2.4, 2.2);
                gPush();
                {
                    setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                    gRotate(90, 1,0,0);
                    drawCone();
                }
                gPop();
        gPop();
       
        /* Bottom of TORSO */
       
        gTranslate(0, -0.7, 0);
            gPush();
            gScale(0.7, 1, 1);
                gPush();
                {
                    setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                    drawSphere();
                }
            gPop();
        gPop();
        
        /* LEGS */
        gRotate(bendAtHip,0,0,1);
        //Character's left leg
        gPush();
            gRotate(-85,1,1,0);
            //call helper function to draw first leg
            gScale(1.6,1.2,1.4);
            drawLeg(characterHeight, colorOffset);
        gPop();

        //Draw character's right leg
        gPush();
            gTranslate(0, 0, -1.4);
            gRotate(-85,1,1,0);
            //call helper function to draw leg
            gScale(1.6,1.2,1.4);
            drawLeg(characterHeight, colorOffset);
        gPop();
    gPop();
}
/* drawArm: HELPER FUNCTION in order to draw a bouncyCharacter's arm *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Argument: 1. bouncyVelocity: How much the character's arms flop is 
 *                    inversely proportional to his velocity. This way 
 *                    when he looses velocity at the top he flops his 
 *                    around
 *           2. armRotAngle: To account for if we are dealing with left
 *                     or right arm
 *           3. colorOffset: To control the characters' colors
 * Function: This function draws each arm of bouncy character 
*/
function drawArm(bouncyBallVelocity, armRotAngle, colorOffset){
    
    /* 1. UPPER ARM */

    gPush();
    // Account for which arm is being handle by a rotation
    gRotate(armRotAngle,0,1,0);

    // Arms are at 45 degrees from his body
    gRotate(45, 1, 0, 0);

    // Swinging arms back & forth
    armRotation[1] = armRotation[1] + 20*dt;
    gRotate(20*Math.cos(1/100*armRotation[1]),1,0,0);

    // Want rotation to happen at the shoulder:
    gTranslate(0, -0.7, 0);
    
    
    /* ~~~ 2. DRAW FOREARM ~~~ */
    gPush();
        gTranslate(0, -1.3, 0);
        gPush();
                    // Move to the bottom of elbow
                    gTranslate(0, 0.7, 0);

                    // forearm cannot over flex
                    gRotate(40, 1, 0, 0);

                    // Move forearm back and forth
                    bouncyCharacterPosition[2] -= 20*dt;
                    gRotate(50*Math.cos(1/(bouncyBallVelocity*50)*bouncyCharacterPosition[2]),1,0,0);
                    
                    // Want rotation to happen at the elbow:
                    gTranslate(0, -0.7, 0);

                    /* ~~~ 3. DRAW HAND ~~~ */
                    gPush();
                        gTranslate(0, -0.6, 0.2);
                        gPush();
                            gScale(0.4, 1, 0.2);

                        {
                            setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                            drawSphere();
                        }
                        gPop();
                    gPop();
                    /* ~~~ END OF DRAWING HAND ~~~ */
                            
            gPush();
                gScale(0.13, 0.6, 0.12);
            
            {
                setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                drawCube();
            }
            
            gPop();
        gPop();
    gPop();
    /* ~~~ END OF DRAWING FOREARM ~~~ */
        
    /* DRAWS UPPER ARM */
    gPush();
        gScale(0.13, 0.7, 0.12);
    
    {
        setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
        drawCube();
    }
    gPop();
    /* END of DRAWING UPPER ARM */
        
gPop();
}


/* drawBouncyLeg: HELPER FUNCTION in order to draw the legs of a bouncyCharacter *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Argument: 1. characterHeight: The amplitude of how much the character's legs bend is 
 *                               dependent on the character's height. This way he always 
 *                               lands on his feet
 *           2. colorOffset: In order to make the second character a different color
 * Function: This function draws each leg of bouncy character 
*/
function drawLeg(characterHeight, colorOffset){
    /* 1. DRAW UPPER LIMB */
	gPush();
    // Move to the bottom of torso
    gTranslate(0, -0.8, 0);

    // Legs are kicking behind Man, so rotate back on x-axis
    gRotate(45, 1, 0, 0);

    
    // Kicking back & forth
    legRotation[1] = legRotation[1] + 20*dt;
    //The lower down the character is the less amplitude we want so that he lands back on his feet
    legBendAmpl[0] = characterHeight*10;
    gRotate(legBendAmpl[0]*Math.cos(1/100*legRotation[1]),1,0,0);
    
    // Want rotation to happen at the hip:
    gTranslate(0, -0.7, 0);
    
    
    /* ~~~ 2. DRAW LOWER LIMB ~~~ */
    gPush();
        gTranslate(0, -1.3, 0);
        gPush();
                    // Move to the bottom of knee
                    gTranslate(0, 0.7, 0);

                    // Lower limb cannot over flex
                    gRotate(40, 1, 0, 0);

                    // Move lower limb back and forth
                    legRotation[1] = legRotation[1] + 20*dt;
                    legBendAmpl[1] = characterHeight*5;
                    gRotate(legBendAmpl[1]*Math.cos(1/100*legRotation[1]),1,0,0);

                    // Want rotation to happen at the knee:
                    gTranslate(0, -0.7, 0);

                    /* ~~~ 3. DRAW FOOT ~~~ */
                    gPush();
                        gTranslate(0, -0.6, 0.2);
                        gPush();
                            gScale(0.14, 0.02, 0.3);

                        {
                            setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                            drawCube();
                        }
                        gPop();
                    gPop();
                    /* ~~~ END OF DRAWING FOOT ~~~ */
                            
            gPush();
                gScale(0.13, 0.6, 0.12);
            
            {
                setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
                drawCube();
            }
            
            gPop();
        gPop();
    gPop();
    /* ~~~ END OF DRAWING LOWER LIMB ~~~ */
        
    /* DRAWS UPPER LIMB */
    gPush();
        gScale(0.13, 0.7, 0.12);
    
    {
        setColor(vec4(1+(colorOffset*(0)),colorOffset*0.55,0.498+(colorOffset*(-0.498)),1));
        drawCube();
    }
    gPop();
    /* END of DRAWING UPPER LIMB */
        
gPop();
    
}



function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //eye = vec3(25,0,10);
    MS = []; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    //while rDistance > 15, then rotate closer to the scene:
    if (rDistance > 16.1) {
        eyePosition[0] += 20*dt;
        eyePosition[2] += 20*dt;
        rDistance -= 0.09;
    } // Once rDistance = 15, then stop the scene keeping the eyePos variables

    if (time > 44){ //zoom out
        atZ = -15*Math.log((time-43));
    }
    //update rDistance each frame to get progressively closer to scene:
    var eyeXposition = rDistance*Math.sin(1/20*eyePosition[0]);
    var eyeZposition = rDistance*Math.cos(1/20*eyePosition[2]);
    
    eye = vec3(eyeXposition+atZ, -9, eyeZposition);
    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);
   
    // set the projection matrix
    //projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    projectionMatrix = perspective(45, 1, near, far);

    // set all the matrices
    setAllMatrices();
    
	if( animFlag )
    {
		// dt is the change in time or delta time from the last frame to this one
		// in animation typically we have some property or degree of freedom we want to evolve over time
		// For example imagine x is the position of a thing.
		// To get the new position of a thing we do something called integration
		// the simpelst form of this looks like:
		// x_new = x + v*dt
		// That is the new position equals the current position + the rate of of change of that position (often a velocity or speed), times the change in time
		// We can do this with angles or positions, the whole x,y,z position or just one dimension. It is up to us!
		dt = (timestamp - prevTime) / 1000.0;
		prevTime = timestamp;
	}

    //update time (initially time = 0) s.t. it is incremented based on dt
    time += dt;

    /* Display the frame rate every two seconds */
    timeCounter +=dt;
    frameCounter += 1;
    if (timeCounter >= 1.999 && timeCounter <= 2.019){
        console.log("it has been: " + timeCounter + " seconds");
        console.log("FRAME RATE is: " + frameCounter/2);
        frameCounter =0;
        timeCounter =0;
    }

    //Update iResolution and iTime uniforms
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, time);
	
	// We need to bind our textures, ensure the right one is active before we draw
	//Activate a specified "texture unit".
    //Texture units are of form gl.TEXTUREi | where i is an integer.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);
	
    /* the FOLLOWING draws a cone and a human with a hat looking inside of it */
	gPush();
        {
            gTranslate(0,-3.5,0);
            gRotate(90,0,1,0);

            //Draw a human looking into the cone
            gPush();
                gTranslate(1, 0, 8.2);
                gScale(4, 4, 4);

                // Draw the actual human
                // PARAMETER: an updated amplitude for the movement of the humans pupil
                // to give a sense of him looking back and forth then centering his focus 
                // on the scene inside of the cone
                drawBigHuman(pupilMovementAmpl);
            gPop();
            // Make cone fall down once the man is hit in the eye
            if (time > 43.2){
                coneFallPosition[1] -= 1.81*(time-43.2);
                gTranslate(coneFallPosition[0],coneFallPosition[1],0);
            }
            // Cone rotates
            currentRotation[2] = currentRotation[2] + 30*dt;
            gRotate(currentRotation[2],0,0,1);


            gPush();
            {
                
                gScale(7,7,16);

                // Use a texture that is a black and white painting for the outside and modified shader
                // on the inside. This way the outside of the cone is black and white and inside is colorful
                blendTextures = 2;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                drawCone();
            }
            gPop();

        
            pupilMovementAmpl = 2*(Math.pow(3/5, time/4));
        }
	gPop();



    /* the FOLLOWING is to draw a character jumping up and down and trying to fly   *
     * Gravity and energyLoss gets updated so that he actually succeeds to fly away */
    
    // Start drawing after camera stops to rotate (time > 10.5)
    if (time > 10.5){
       
        // Update gravity and energyLoss based on time
        gravity+= 1.27*dt;
        bouncyEnergyLoss += 0.01*dt;

        gPush();
            gTranslate(-6.4,-5,0);
                
            //Make character bounce as gravity gets lighter
            bouncyBallVelocity += gravity*dt; // Update velocity using acceleration
            bouncingCubePosition[1] += bouncyBallVelocity*dt; // Update position using velocity
            
            // Check if character hits an imaginary plane at y = -2.1, and also if the velocity is INTO the plane, and if it is moving at all
            if (bouncingCubePosition[1] < -2.1 && bouncyBallVelocity < 0)
            {
                bouncyBallVelocity = -bouncyEnergyLoss*bouncyBallVelocity; // If so, reflect the velocity back but lose some energy.
                bouncingCubePosition[1] = 0; // Ball has most likely penetrated surface because we take discrete time steps, move back to cylinder surface
            }   
            gTranslate(bouncingCubePosition[0],bouncingCubePosition[1],bouncingCubePosition[2]); // Move the ball to its update position
            
            gPush();
                gScale(0.13,0.13,0.13);
                gPush();

                    // Utilize ADS so set uniform to 1
                    blendTextures = 1;
                    gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);

                    // Draw the actual character
                    // PARAMETERS: position, arms moving inverse to his velocity, no bend in hips, no color offset
                    drawBouncyCharacter(bouncingCubePosition[1], bouncyBallVelocity, 0, 0);
                gPop();
            gPop();
        gPop();
    
    }

    /* Make the first character come back this time without control */
    if (time > 30) {
        gPush();

            // Place him out of picture frame, then move him dynamically
            gTranslate(-3,3,3);
            bouncyCharacterPosition3[2] -= 3*dt;
            bouncyCharacterPosition3[1] -= 7*dt;
            bouncyCharacterPosition3[0] -= 7*dt;
            gTranslate(bouncyCharacterPosition3[0], bouncyCharacterPosition3[1],bouncyCharacterPosition3[2]);
            gPush();
                gScale(0.13,0.13,0.13);
                gRotate(-20,0,1,0);

                // Draw the actual character
                // PARAMETERS: position, arms moving fast, no bend in hips, no color offset
                drawBouncyCharacter(bouncyCharacterPosition3[2], 0.03,0, 0);
            gPop();
        gPop();
    }

    /* Make the first character come back for the last time and hit the original character in the eye */
    if (time > 41.5) {
        gPush();

            // Place him out of picture frame, then move him dynamically
            gTranslate(-8,-1.65,4.25);
            bouncyCharacterPosition4[0] += 10*dt;
            bouncyCharacterPosition4[1] -= dt;
            bouncyCharacterPosition4[2] -= 3*dt;
            gTranslate(bouncyCharacterPosition4[0], bouncyCharacterPosition4[1],bouncyCharacterPosition4[2]);
            gPush();
                gScale(0.13,0.13,0.13);

                // Make him face the right direction
                gRotate(-180,0,1,0);
                
                // Draw the actual character
                // PARAMETERS: position, arms moving fast, no bend in hips, no color offset
                drawBouncyCharacter(bouncyCharacterPosition4[2], 0.07,0, 0);
            gPop();
        gPop();
    }

    /* the FOLLOWING is to draw a black eye (in this case colorful) to the bigHuman when the
     * bouncy character hits him in the eye   */
    //Start growing the black eye after impact (time>42)                                              
    if (time > 42){
        gPush();
            gTranslate(6.2,-3.5,-0.25);
            // Dynamically scale the eye - Log is great for this since the eye starts growing when 
            // x = 0= time- 41 and it slows growth around y=3
            blackEyeSize[0] =Math.log(time-41);
            blackEyeSize[1] =Math.log(time-41);
            blackEyeSize[2] =Math.log(time-41);
            gScale(1, blackEyeSize[1], blackEyeSize[2]);

            gPush();
            {
                blendTextures = 4; 
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                drawSphere();
                blendTextures = 1; 
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
            }
            gPop();
        gPop();
    }




    /* The FOLLOWING is to draw a simple Landscape that floats up to a desired position *
     * CONTAINS: mountain features, a field and a character sitting and waving          */
                                                                                       
    //Start drawing after camera stops rotating (ie time > 10.5)
    if (time>10.5) {
        // Make the whole landscape fall down with cone at the end
        if (time > 43.2){
            landscapeFallPosition[1] -= 1.81*(time-43.2);
            gTranslate(landscapeFallPosition[0],landscapeFallPosition[1],0);
        }
        gPush();

            // Move the whole thing to the right position then dynamically move upward until it
            // comes to a halt (using an exponential equation)
            gTranslate(-5, -8.3, 1.7);
            spherePosition2[1] = -2*(Math.pow(3/5, time/4));
            gTranslate(spherePosition2[0], spherePosition2[1], spherePosition2[2]);
           
            /* Draw second character sitting on top of landscape */
            gPush();
                

                // Move the second character on top of the mountain
                gTranslate(-1.2,3.5, -3.7);
                gScale(0.13,0.13,0.13);

                // Make the second character watch the first trying to jump by rotating him
                gRotate(45,0,1,0);
                gPush();
                {
                    // Draw the actual character
                    // PARAMETERS: position; arm motion; bent legs at 45 degrees; a color offset of 1
                    drawBouncyCharacter(bouncyCharacterPosition2[0], 1,-45, 1);
                }
                gPop();
            gPop(); 

            // Draw the actual landscape
            drawLandscape();  
        gPop();
    }


    /* The FOLLOWING is to draw the sun rise up and then set */
  
    gPush();

        // Move the sun out of picture frame
        gTranslate(-3.5, 1, 0.7);

        // Move if up such that it stops in the sky at noon
        spherePosition3[1]=-85*(Math.pow(3/5, time/4));
        spherePosition3[2]=-50*(Math.pow(3/5, time/4));
        gTranslate(spherePosition3[0],spherePosition3[1],spherePosition3[2]);
        
        /* Once it is night time, then make the sun go down */
        if(time > 31) {
            //Move the sun move out of the picture frame using a formula for accelleration
            spherePosition4[1] = -((spherePosition3[1]+1.5)/2)*(time-31);
            spherePosition4[2] = ((spherePosition3[2]+1.2)/2)*(time-31);
            gTranslate(0,spherePosition4[1],spherePosition4[2]);
        }

        /* Move the sun out of the frame before zoom out */
        if (time > 43.2) {
            spherePosition4[3] += 100*dt;
            gTranslate(0,spherePosition4[3],spherePosition4[3]);
        }
        gPush();
            /* Scale the sun dynamically to give a sence of flickering */
            sphereSize2[0]= 0.07*Math.sin(1/4*time);
            sphereSize2[1]= 0.04*Math.sin(6*time);
            gScale(2-sphereSize2[0], 2-sphereSize2[1], 2);

            //Draw the actual sun
            {
                blendTextures = 4;
                gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
                drawSphere();
            }
        gPop();
    gPop();
      
    if( animFlag )
        window.requestAnimFrame(render);
}
