document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.project-slider');
    const projects = document.querySelectorAll('.project');
    const projectWidth = projects[0].offsetWidth;

    // Clone the original projects to the end of the slider
    projects.forEach(project => {
        const clone = project.cloneNode(true);
        slider.appendChild(clone);
    });

    let isHovering = false;
    let scrollInterval;
    let scrollDirection = 1; // 1 for right, -1 for left

    function startScrolling() {
        scrollInterval = setInterval(() => {
            if (!isHovering) {
                slider.scrollLeft += scrollDirection;
                if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
                    slider.scrollLeft = 0;
                } else if (slider.scrollLeft <= 0) {
                    slider.scrollLeft = slider.scrollWidth - slider.clientWidth;
                }
            }
        }, 20); // Adjust the interval as needed
    }

    slider.addEventListener('mouseenter', () => {
        isHovering = true;
        clearInterval(scrollInterval);
    });

    slider.addEventListener('mouseleave', () => {
        isHovering = false;
        startScrolling();
    });

    slider.addEventListener('mousemove', (e) => {
        const sliderRect = slider.getBoundingClientRect();
        const mouseX = e.clientX - sliderRect.left;
        const sliderWidth = sliderRect.width;
        const leftZoneWidth = sliderWidth / 4; // Define the width of the left and right zones
        const rightZoneStart = sliderWidth - leftZoneWidth;
        const scrollSpeed = 2; // Adjust scroll speed as needed

        if (mouseX < leftZoneWidth) {
            // Hovering over the left zone
            isHovering = true;
            slider.scrollLeft -= scrollSpeed;
            scrollDirection = -1;
        } else if (mouseX > rightZoneStart) {
            // Hovering over the right zone
            isHovering = true;
            slider.scrollLeft += scrollSpeed;
            scrollDirection = 1;
        } else {
            // Hovering over the center zone
            isHovering = false;
        }
    });

    startScrolling();
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

    if (!gl) {
        console.error('WebGL 2 not supported');
        return;
    }

    let mouse = [0, 0];  // normalized mouse coords
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse[0] = (e.clientX - rect.left) / rect.width;
        mouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    });

    // Globals for program and buffers
    let program = null;
    let positionBuffer = null;

    // Uniform and attribute locations
    let positionAttributeLocation = null;
    let resolutionUniformLocation = null;
    let timeUniformLocation = null;
    let uMouseLocation = null;

    let animationFrameId = null;

    // Your shader sources
    const vertexShaderSource = document.getElementById('vertex-shader').textContent;
    const fragmentShaderSource = document.getElementById('fragment-shader').textContent;

    // Initialize shaders and buffers
    function initShaderProgram() {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) return false;

        const newProgram = createProgram(gl, vertexShader, fragmentShader);
        if (!newProgram) return false;

        program = newProgram;

        gl.useProgram(program);

        positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        timeUniformLocation = gl.getUniformLocation(program, 'u_time');
        uMouseLocation = gl.getUniformLocation(program, 'u_mouse');

        if (resolutionUniformLocation === -1 || timeUniformLocation === -1 || uMouseLocation === -1) {
            console.error('Failed to get uniform location');
            return false;
        }
        return true;
    }

    function initBuffers() {
        positionBuffer = gl.createBuffer();
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
    }

    function cleanupWebGL() {
        // Delete buffers, program, and clear canvas
        if (positionBuffer) {
            gl.deleteBuffer(positionBuffer);
            positionBuffer = null;
        }
        if (program) {
            gl.deleteProgram(program);
            program = null;
        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    function resetWebGL() {
        cleanupWebGL();
        if (!initShaderProgram()) {
            console.error("Failed to reset shaders");
            return;
        }
        initBuffers();
    }

    function render(time) {
        time *= 0.001; // Convert to seconds

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(timeUniformLocation, time);
        gl.uniform2f(uMouseLocation, mouse[0], mouse[1]);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
    }

    function startRendering() {
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(render);
        }
    }

    function stopRendering() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // Initialize everything at start
    if (!initShaderProgram()) {
        console.error("Failed to initialize shaders");
        return;
    }
    initBuffers();

    // Handle tab visibility change to pause/resume rendering
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopRendering();
            cleanupWebGL();
        } else {
            resetWebGL();
            startRendering();
        }
    });

    startRendering();
}

main();

