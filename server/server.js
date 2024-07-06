const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Cell = require('./public/Cell.js');
const Food = require('./public/Food.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for serving the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Dictionaries to store cells and food
let cells = {};
let foods = {};

let width = 800;
let height = 800;
let foodId = 0;
let initialRadius = 10;

// Function to update cell position
function updateCell(i, newX, newY) {
    if (cells[i]) {
        cells[i].x = newX;
        cells[i].y = newY;
        cell = cells[i]; 
        for(let id in cells)
            handleCellCellCollision(cells[id], cell); 
        for(let id in foods)
            handleCellFoodCollision(foods[id], cell); 
        // Emit an event to notify clients about the updated cell position
        io.emit('updateCell', cells[i]);
    }
}

function handleCollision (a, b)
{
    const distance = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); 
    return distance < a.radius + b.radius; 
}

function handleCellCellCollision (cell1, cell2)
{
    if(handleCollision(cell1, cell2))
    {   
        if(cell1.radius == cell2.radius)
            return ;
        if(cell1.radius < cell2.radius)
        {
            cell2.radius += cell1.radius ; 
            delete cells[cell1.id];
            io.emit('removeCell', cell1.id);
        }
        else
        {
            cell1.radius += cell2.radius ; 
            delete cells[cell2.id];
            io.emit('removeCell', cell2.id);
        }
    }
}

function handleCellFoodCollision(food , cell)
{
    console.log("HIIIII"); 
    if(handleCollision(food, cell))
    {
        cells[cell.id].radius += 1; 
        delete foods[food.id];
    }
}
// Function to create random food 
function createFood() {
    let id = foodId++;
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    let radius = 5;
    let color = "blue";
    let food = new Food(id, x, y, radius, color);
    foods[id] = food;
    io.emit('addFood', food); 
}



// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    for (let i = 0; i < 100; i++) {
        createFood();
    }

    // Create a new cell for the connected user
    const cellId = socket.id;
    const cell = new Cell(cellId, Math.random() * 500, Math.random() * 500, initialRadius, 'red');
    cells[cellId] = cell;
    io.emit('addCell', cell);

    // Handle cell movement updates
    socket.on('moveCell', (data) => {
        updateCell(data.id, data.x, data.y);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        delete cells[socket.id];
        io.emit('removeCell', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
