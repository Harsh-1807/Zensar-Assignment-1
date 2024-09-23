const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let tool = 'brush';
let drawing = false;
let prevX = 0;
let prevY = 0;
let savedImageData;
let history = [];
let redoStack = [];

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
ctx.lineWidth = brushSize.value;
ctx.strokeStyle = colorPicker.value;

colorPicker.addEventListener('input', () => {
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;
});

brushSize.addEventListener('input', () => {
    ctx.lineWidth = brushSize.value;
});

document.getElementById("brushTool").addEventListener('click', () => tool = 'brush');
document.getElementById("eraserTool").addEventListener('click', () => tool = 'eraser');
document.getElementById("textTool").addEventListener('click', () => tool = 'text');
document.getElementById("rectangleTool").addEventListener('click', () => tool = 'rectangle');
document.getElementById("circleTool").addEventListener('click', () => tool = 'circle');

document.getElementById("clearCanvas").addEventListener('click', clearCanvas);
document.getElementById("saveCanvas").addEventListener('click', saveCanvas);
document.getElementById("undo").addEventListener('click', undo);
document.getElementById("redo").addEventListener('click', redo);

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(e) {
    drawing = true;
    prevX = e.offsetX;
    prevY = e.offsetY;
    if (tool === 'text') {
        addText(e);
        drawing = false;
    } else {
        saveState();
    }
}

function stopDrawing() {
    drawing = false;
    prevX = 0;
    prevY = 0;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;

    if (tool === 'brush') {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    } else if (tool === 'eraser') {
        ctx.strokeStyle = '#fff';
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.strokeStyle = colorPicker.value;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    } else if (tool === 'rectangle') {
        drawRectangle(prevX, prevY, e.offsetX - prevX, e.offsetY - prevY);
    } else if (tool === 'circle') {
        drawCircle(prevX, prevY, Math.hypot(e.offsetX - prevX, e.offsetY - prevY));
    }
}

function addText(e) {
    const text = prompt("Enter text:");
    if (text) {
        ctx.font = `${brushSize.value * 2}px Arial`;
        ctx.fillText(text, e.offsetX, e.offsetY);
    }
}

function drawRectangle(x, y, width, height) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(savedImageData, 0, 0);
    ctx.strokeRect(x, y, width, height);
}

function drawCircle(x, y, radius) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(savedImageData, 0, 0);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
}

function saveCanvas() {
    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = data;
    link.download = "drawing.png";
    link.click();
}

function undo() {
    if (history.length > 0) {
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const previousState = history.pop();
        ctx.putImageData(previousState, 0, 0);
    }
}

function redo() {
    if (redoStack.length > 0) {
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const nextState = redoStack.pop();
        ctx.putImageData(nextState, 0, 0);
    }
}

function saveState() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (redoStack.length) redoStack = [];
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}
document.getElementById("gradientTool").addEventListener('click', () => tool = 'gradient');

function drawGradient(x, y, width, height) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(savedImageData, 0, 0);
    
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'blue');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
}

canvas.addEventListener('mousemove', (e) => {
    if (!drawing || tool !== 'gradient') return;
    drawGradient(prevX, prevY, e.offsetX - prevX, e.offsetY - prevY);
});
