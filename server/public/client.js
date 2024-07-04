import Cell from './Cell.js';
import Food from './Food.js';

const socket = io();

let cells = {};
let foodItems = {};

// Handle new cell
socket.on('addCell', (cellData) => {
    const cell = new Cell(cellData.id, cellData.x, cellData.y, cellData.radius, cellData.color);
    cells[cellData.id] = cell;
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

// Handle new food
socket.on('addFood', (foodData) => {
    const food = new Food(foodData.id, foodData.x, foodData.y, foodData.radius, foodData.color);
    foodItems[foodData.id] = food;
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
