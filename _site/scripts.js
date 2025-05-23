document.addEventListener('DOMContentLoaded', function () {
    const slider = document.querySelector('.project-slider');
    const btnLeft = document.querySelector('.arrow-left');
    const btnRight = document.querySelector('.arrow-right');
    const scrollAmount = 320; // Slightly more than one card's width to show progress

    btnLeft.addEventListener('click', () => {
        slider.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    btnRight.addEventListener('click', () => {
        slider.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
});





// WebGL setup
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function main() {
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl2');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    let mouse = [0, 0];  // normalized mouse coords

    canvas.addEventListener('mousemove', (e) => {
      //console.log("mousemove event");  // ← this should fire
      const rect = canvas.getBoundingClientRect();
      mouse[0] = (e.clientX - rect.left) / rect.width;
      mouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    });

    //let clicked = false;

    //canvas.addEventListener('click', () => {
    //  clicked = !clicked;
    //});




    if (!gl) {
        console.error('WebGL 2 not supported');
        return;
    }


    const vertexShaderSource = document.getElementById('vertex-shader').textContent;
    const fragmentShaderSource = document.getElementById('fragment-shader').textContent;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        return;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);

    if (!program) {
        return;
    }

    // Ensure the program is used before retrieving uniform locations
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const uMouseLocation = gl.getUniformLocation(program, "u_mouse");
    //const uClickLocation = gl.getUniformLocation(program, "u_clicked");



    // Log uniform locations to ensure they are valid
    //console.log("Resolution Uniform Location:", resolutionUniformLocation);
    //console.log("Time Uniform Location:", timeUniformLocation);

    if (resolutionUniformLocation === -1 || timeUniformLocation === -1) {
        // console.error('Failed to get uniform location');
        return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    function render(time) {
        time *= 0.001; // Convert time to seconds
        //console.log("Time:", time); // Log time for debugging

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);


        gl.useProgram(program);

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        //console.log("Setting resolution:", gl.canvas.width, gl.canvas.height);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        //console.log("Setting time:", time);
        gl.uniform1f(timeUniformLocation, time);
        // In your render/draw function
        gl.uniform2f(uMouseLocation, mouse[0], mouse[1]);
        //console.log("mouse coords: ",mouse[0], mouse[1]);
        //gl.uniform1i(uClickLocation, clicked ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    
        requestAnimationFrame(render);
        
    }
    requestAnimationFrame(render);
}

main();
