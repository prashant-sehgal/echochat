// Load environment variables from a .env file into process.env
require('dotenv').config()

// Import required modules
const express = require('express')
const { createServer } = require('node:http') // Native Node.js HTTP server
const { Server } = require('socket.io') // Socket.IO for real-time communication
const morgan = require('morgan') // HTTP request logger middleware
const expressLayouts = require('express-ejs-layouts') // Layout support for EJS templates

// Initialize Express app
const app = express()
// Create an HTTP server using Express
const server = createServer(app)
// Initialize Socket.IO with the HTTP server
const io = new Server(server)

// Set EJS as the view engine
app.set('view engine', 'ejs')
// Set the views directory
app.set('views', `${__dirname}/views`)
// Set the layout file to be used by EJS
app.set('layout', 'layouts/main')
// Use express-ejs-layouts middleware
app.use(expressLayouts)

// Serve static files from the /public directory
app.use(express.static(`${__dirname}/public`))

// Use morgan logger only in non-production environments
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

// Route: Home page
app.get('/', (req, res) => {
  res.render('index') // Render views/index.ejs
})

// Route: Chat page
app.get('/chat', (req, res) => {
  res.render('chat') // Render views/chat.ejs
})

// Handle WebSocket connections
io.on('connection', (socket) => {
  // Log new connection in non-production environments
  if (process.env.NODE_ENV !== 'production')
    console.log(`[INFO] ${socket.id} connected`)

  // If a valid username is passed, notify other clients
  if (socket.handshake.query.username !== 'null') {
    socket.broadcast.emit('user:joined', {
      username: socket.handshake.query.username,
    })
  }

  // Relay received message to all clients except the sender
  socket.on('message:sent', (data) =>
    socket.broadcast.emit('message:received', data)
  )

  // handle user disconnection
  socket.on('disconnect', () => {
    if (process.env.NODE_ENV !== 'production')
      console.log(`[INFO] ${socket.id} disconnected`)
  })
})

// Start the server on the port defined in environment variables
server.listen(process.env.PORT, function () {
  console.log(`[INFO] server is running on port ${process.env.PORT}`)
})
