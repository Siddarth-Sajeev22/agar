const socket = io();

let cells = {};
let foodItems = {};

// Handle new cell
socket.on('addCell', (cellData) => {
    cells[cellData.id] = cellData;
});

// Handle updated cell
socket.on('updateCell', (cellData) => {
    if (cells[cellData.id]) {
        cells[cellData.id].x = cellData.x;
        cells[cellData.id].y = cellData.y;
    }
});

// Handle removed cell
socket.on('removeCell', (cellId) => {
    delete cells[cellId];
});

socket.on('removeFood', (foodId) => {
    delete foodItems[foodId];
});

// Handle new food
socket.on('addFood', (foodData) => {
    foodItems[foodData.id] = foodData;
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}

function draw() {
    background(240);

    // Draw food
    for (let id in foodItems) {
        const food = foodItems[id];
        fill(food.color);
        ellipse(food.x, food.y, food.radius * 2);
    }

    // Draw cells
    for (let id in cells) {
        const cell = cells[id];
        fill(cell.color);
        ellipse(cell.x, cell.y, cell.radius * 2);
    }
}

// Handle player movement
function mouseMoved() {
    socket.emit('moveCell', { id: socket.id, x: mouseX, y: mouseY });
}


