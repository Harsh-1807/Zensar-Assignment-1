// Get the canvas element and initialize WebGL context
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Set the canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth - 250; // Adjust width based on sidebar
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();

// Set the clear color to white
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Set up vertex shader
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 5.0;
    }
`;

// Set up fragment shader
const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

// Create and compile shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

// Create program and link shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
}

// Use the program
gl.useProgram(program);

// Get attribute and uniform locations
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

// Create a buffer for vertex positions
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Store drawn points and current settings
let points = [];
let history = [];
let currentColor = [0.0, 0.0, 0.0, 1.0]; // Default color (black)
let isDrawing = false;
let currentLineWidth = 5;
let drawMode = 'points'; // Default draw mode

// Draw points on the canvas
function drawPoints() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4fv(colorUniformLocation, currentColor);

    if (drawMode === 'points') {
        for (let i = 0; i < points.length; i += 2) {
            const positions = new Float32Array(points.slice(i, i + 2));
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    } else if (drawMode === 'lines') {
        for (let i = 0; i < points.length; i += 4) {
            const linePositions = new Float32Array(points.slice(i, i + 4));
            gl.bufferData(gl.ARRAY_BUFFER, linePositions, gl.STATIC_DRAW);
            gl.drawArrays(gl.LINES, 0, 2); // Draw lines between pairs of points
        }
    } else if (drawMode === 'rectangles') {
        for (let i = 0; i < points.length; i += 4) {
            const rectPositions = new Float32Array(points.slice(i, i + 4));
            // Draw rectangle using two triangles
            const rectangleVertices = new Float32Array([
                rectPositions[0], rectPositions[1], // Bottom-left
                rectPositions[2], rectPositions[1], // Bottom-right
                rectPositions[2], rectPositions[3], // Top-right
                rectPositions[0], rectPositions[3], // Top-left
            ]);
            gl.bufferData(gl.ARRAY_BUFFER, rectangleVertices, gl.STATIC_DRAW);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // Draw rectangle
        }
    } else if (drawMode === 'circles') {
        for (let i = 0; i < points.length; i += 3) {
            const circleCenterX = points[i];
            const circleCenterY = points[i + 1];
            const radius = Math.abs(points[i + 2]); // Use third point as radius

            const circleVertices = [];
            const segments = 30; // Number of segments for the circle

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const xPos = circleCenterX + Math.cos(angle) * radius;
                const yPos = circleCenterY + Math.sin(angle) * radius;
                circleVertices.push(xPos);
                circleVertices.push(yPos);
            }

            const circleArrayBuffer = new Float32Array(circleVertices);
            gl.bufferData(gl.ARRAY_BUFFER, circleArrayBuffer, gl.STATIC_DRAW);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 1); // Draw circle
        }
    }
}

// Convert screen coordinates to WebGL coordinates
function toWebGLCoords(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        -((y / canvas.height) * 2 - 1)
    ];
}

// Mouse event handlers for drawing
canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    if (drawMode === 'lines' || drawMode === 'rectangles') {
        const [x1, y1] = toWebGLCoords(event.clientX - canvas.offsetLeft,
                                         event.clientY - canvas.offsetTop);
        points.push(x1, y1); // Store starting point

        if (drawMode === 'rectangles') {
            points.push(x1 + currentLineWidth / canvas.width * 2,
                        y1 - currentLineWidth / canvas.height * 2); // Add dummy point for rectangle height/width control
        }
        
        drawPoints();
    } else if (drawMode === 'circles') {
        const [xCenter,yCenter] = toWebGLCoords(event.clientX - canvas.offsetLeft,
                                                 event.clientY - canvas.offsetTop);
        points.push(xCenter,yCenter,currentLineWidth / canvas.width); // Store center and radius
        drawPoints();
    } else { // Default mode is points
        const [x,y] = toWebGLCoords(event.clientX - canvas.offsetLeft,
                                    event.clientY - canvas.offsetTop);
        points.push(x,y);
        drawPoints();
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;

    if (drawMode === 'lines' || drawMode === 'rectangles') {
        const [x2,y2] = toWebGLCoords(event.clientX - canvas.offsetLeft,
                                       event.clientY - canvas.offsetTop);

        if (drawMode === 'lines') {
            points.push(x2,y2); // Store end point for line drawing
            drawPoints();
        } else if (drawMode === 'rectangles') {
            points[points.length - 2] = x2; // Update dummy point with new x position for rectangle width control
            points[points.length - 1] = y2; // Update dummy point with new y position for rectangle height control
            drawPoints();
        }
        
    } else if (drawMode === 'circles') {
        // Update last point with new mouse position as center of the circle.
        let lastPointIndex=points.length-3;
        let [xCenter,yCenter]=toWebGLCoords(event.clientX-canvas.offsetLeft,event.clientY-canvas.offsetTop)
        
        points[lastPointIndex]=xCenter;
        points[lastPointIndex+1]=yCenter;
        
       drawPoints();
   }
});

// Mouse up event handler to finalize shape drawing.
canvas.addEventListener('mouseup', () => {
   isDrawing=false;

   if(drawMode==='lines'){
       history.push([...points]); // Save current line's start and end points to history.
   }else if(drawMode==='rectangles'){
       history.push([...points]); // Save current rectangle's start and end points to history.
   }else if(drawMode==='circles'){
       history.push([...points]); // Save current circle's center and radius to history.
   }
});

// Mouse leave event handler.
canvas.addEventListener('mouseleave', () => { 
   isDrawing=false; 
});

// Color picker event listener.
document.getElementById('colorPicker').addEventListener('input', (event) => { 
   const hexColor=event.target.value; 
   currentColor=hexToRgb(hexColor); 
});

// Convert hex color to RGB array function.
function hexToRgb(hex) { 
   const bigint=parseInt(hex.slice(1),16); 
   return [((bigint>>16)&255)/255,
           ((bigint>>8)&255)/255,
           (bigint&255)/255,
           1.0]; 
}

// Clear Canvas button event listener.
document.getElementById('clearCanvas').addEventListener('click', () => { 
   points=[]; 
   history=[]; 
   gl.clear(gl.COLOR_BUFFER_BIT); 
});

// Undo button event listener.
document.getElementById('undo').addEventListener('click', () => { 
   if(history.length>0){ 
       points=history.pop(); 
       drawPoints(); 
   } 
});

// Line width slider event listener.
document.getElementById('lineWidth').addEventListener('input', (event) => { 
   currentLineWidth=parseInt(event.target.value); 
   document.getElementById('lineWidthValue').textContent=currentLineWidth; 
});

// Save button event listener.
document.getElementById('saveCanvas').addEventListener('click', () => { 
   const dataURL=canvas.toDataURL('image/png'); 
   const link=document.createElement('a'); 
   link.href=dataURL; 
   link.download='drawing.png'; 
   link.click(); 
});

// Resize canvas when window is resized.
window.addEventListener('resize', () => { 
   resizeCanvas(); 
   drawPoints(); 
});

// Mode selection functionality.
document.getElementById('modeSelector').addEventListener('change', function() {
   drawMode=this.value;
});