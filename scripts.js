// function createShader(gl, type, source) {
//     const shader = gl.createShader(type);
//     gl.shaderSource(shader, source);
//     gl.compileShader(shader);
//     if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//         console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
//         gl.deleteShader(shader);
//         return null;
//     }
//     return shader;
// }

// function createProgram(gl, vertexShader, fragmentShader) {
//     const program = gl.createProgram();
//     gl.attachShader(program, vertexShader);
//     gl.attachShader(program, fragmentShader);
//     gl.linkProgram(program);
//     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//         console.error('Error linking program:', gl.getProgramInfoLog(program));
//         gl.deleteProgram(program);
//         return null;
//     }
//     return program;
// }

// function main() {
//     const canvas = document.getElementById('glcanvas');
//     const gl = canvas.getContext('webgl2');

//     if (!gl) {
//         console.error('WebGL 2not supported');
//         return;
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const vertexShaderSource = document.getElementById('vertex-shader').textContent;
//     const fragmentShaderSource = document.getElementById('fragment-shader').textContent;

//     const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
//     const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

//     if (!vertexShader || !fragmentShader) {
//         return;
//     }

//     const program = createProgram(gl, vertexShader, fragmentShader);

//     if (!program) {
//         return;
//     }

//     const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
//     const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
//     const timeUniformLocation = gl.getUniformLocation(program, 'u_time');

//     console.log("Resolution Uniform Location:", resolutionUniformLocation);
//     console.log("Time Uniform Location:", timeUniformLocation);

//     const positionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

//     const positions = [
//         -1.0, -1.0,
//         1.0, -1.0,
//         -1.0, 1.0,
//         -1.0, 1.0,
//         1.0, -1.0,
//         1.0, 1.0,
//     ];
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
//     gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
//     function render(time) {
//         time *= 0.001; // convert time to seconds
        
//         gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//         gl.clear(gl.COLOR_BUFFER_BIT);

//         gl.useProgram(program);

//         gl.enableVertexAttribArray(positionAttributeLocation);
//         gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//         gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

//         gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
//         gl.uniform1f(timeUniformLocation, time);
//         console.log("Time passed to shader:", time); 
//         console.log("Canvas width and height passed to shader", gl.canvas.width, gl.canvas.height); 

//         gl.drawArrays(gl.TRIANGLES, 0, 6);

//         requestAnimationFrame(render);
//     }
//     requestAnimationFrame(render);
// }

// main();
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

    // Log uniform locations to ensure they are valid
    console.log("Resolution Uniform Location:", resolutionUniformLocation);
    console.log("Time Uniform Location:", timeUniformLocation);

    if (resolutionUniformLocation === -1 || timeUniformLocation === -1) {
        console.error('Failed to get uniform location');
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
        console.log("Time:", time); // Log time for debugging

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        console.log("Setting resolution:", gl.canvas.width, gl.canvas.height);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        console.log("Setting time:", time);
        gl.uniform1f(timeUniformLocation, time);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();
