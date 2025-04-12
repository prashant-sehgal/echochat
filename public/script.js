// Get DOM elements by their IDs
const statusEl = document.getElementById('status')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const messageList = document.getElementById('messages')

// Extract the username from the URL query parameters
const username = new URLSearchParams(window.location.search).get('username')

// Establish a socket connection with the server
const socket = io('/', {
  query: {
    username, // Pass the username to the server via query
  },
})

// Function to update the status bar with connection info
function updateStatus() {
  statusEl.innerText = '' // Clear previous status
  statusEl.insertAdjacentHTML(
    'beforeend',
    `<b>Status: </b>Connected, <b>Username:</b> ${username}`
  )
}

// Handle message form submission
if (messageForm)
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault() // Prevent form from refreshing the page

    const message = messageInput.value // Get message input

    // Emit the message to the server
    socket.emit('message:sent', {
      username,
      message,
    })

    // Display the sent message in the chat window
    const messageHTML = `<p class="message sent">
                          <b>You: </b>
                          ${message}
                       </p>`

    messageList.insertAdjacentHTML('beforeend', messageHTML)
    messageList.scrollTop = messageList.scrollHeight // Scroll to latest message

    // Clear input field and remove focus
    messageInput.value = ''
    messageInput.blur()
  })

// Handle successful socket connection
socket.on('connect', () => {
  updateStatus()
})

// Handle receiving messages from other users
socket.on('message:received', (data) => {
  const messageHTML = `<p class="message">
                          <b>${data.username}: </b>
                          ${data.message}
                       </p>`

  messageList.insertAdjacentHTML('beforeend', messageHTML)
  messageList.scrollTop = messageList.scrollHeight
})

// Handle notification when a new user joins the chat
socket.on('user:joined', (data) => {
  const messageHTML = `<p class="message info">
                          <b>${data.username} joined the chat</b>
                       </p>`

  messageList.insertAdjacentHTML('beforeend', messageHTML)
  messageList.scrollTop = messageList.scrollHeight
})
