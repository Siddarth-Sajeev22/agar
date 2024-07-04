import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import Cell from './Cell.js';
import Food from './Food.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);
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

let width = 800 ; 
let height = 800 ; 
let foodId = 0; 
let initialRadius = 10; 

// Function to update cell position
function updateCell(id, newX, newY) {
    if (cells[id]) {
        cells[id].x = newX;
        cells[id].y = newY;
        // Emit an event to notify clients about the updated cell position
        io.emit('updateCell', cells[id]);
    }
}


//Function to create random food 
function createFood()
{
    let id = foodId ++ ; 
    let x = Math.floor(Math.random() * width); 
    let y = Math.floor(Math.random() * height); 
    let radius = 5 ;
    let color = "blue"; 
    let food = new Food(id, x, y, radius , color); 
    foods[id] = food ; 

}

for(let i = 0; i<100 ; i++)
{
        createFood(); 
}


// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // Create a new cell for the connected user
    const cellId = socket.id;
    const cell = new Cell(cellId, Math.random() * 500, Math.random() * 500, initialRadius, 'blue');
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
