// save as server.js (replace your old file)
// npm install express ws axios fca-mafiya body-parser

const fs = require('fs');
const express = require('express');
const wiegine = require('fca-mafiya');
const WebSocket = require('ws');
const axios = require('axios'); 
const bodyParser = require('body-parser'); // To parse form data

// --- SECURITY SETTING ---
// यह वह नाम है जिसे सही डालने पर ही कंट्रोल पैनल खुलेगा
const SECURE_NAME = "MR PRINCE XD"; 
// -------------------------

// Initialize Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse form data

// --- Task Management System ---
let tasks = [];

// Function to generate a random, unique 5-digit Task ID (10000 - 99999)
function generateTaskKey() {
    let result;
    do {
        // Generate a random number between 10000 and 99999
        result = Math.floor(10000 + Math.random() * 90000); 
    } while (findTask(result)); // Keep generating if the ID already exists
    
    return result;
}

// Function to find a task by its ID
function findTask(id) {
    // Note: ID is now a number, ensure comparison is correct
    return tasks.find(t => t.id === id);
}

// Function to create a new task object
function createNewTask(threadID, delay, prefix, messages, cookieContent) {
    const taskId = generateTaskKey();
    const newTask = {
        id: taskId,
        status: 'Starting', // Starting, Running, Stopped, Error
        threadID: threadID,
        delay: delay,
        prefix: prefix,
        messages: messages,
        currentIndex: 0,
        loopCount: 0,
        api: null,
        cookieContent: cookieContent
    };
    tasks.push(newTask);
    return newTask;
}
// --- End Task Management System ---


// WebSocket server placeholder
let wss;

// --- 1. LOGIN PAGE HTML (NO CHANGE) ---
// Login page is now a function to allow passing req object for error message
const htmlLoginPage = (req) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Login - MR PRINCE XD</title>
<style>
  *{box-sizing:border-box;font-family:Inter,system-ui,Arial,sans-serif}
  html,body{height:100%;margin:0;color:#cfcfcf}
  body{
    background: #00001f; 
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    position: relative;
  }
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2; 
    background: linear-gradient(135deg, #0f002d, #001f66, #330044, #001f66);
    background-size: 400% 400%;
    animation: gradientShift 20s infinite ease;
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .login-container {
    background: rgba(0, 30, 0, 0.9); 
    border: 3px solid #00ffcc; 
    border-radius: 15px;
    backdrop-filter: blur(5px); 
    padding: 30px;
    width: 90%;
    max-width: 400px; 
    box-shadow: 0 0 30px rgba(0, 255, 204, 0.4); 
    text-align: center;
  }
  .title {
    font-size: 30px;
    color: #00ffcc; 
    text-shadow: 0 0 10px #00ffcc, 0 0 20px #00aaff;
    font-weight: bold;
    margin-bottom: 25px;
  }
  input[type="text"] {
    width:100%; 
    padding: 12px 15px; 
    border-radius: 15px; 
    border:2px solid #ffcc00; 
    background: #000a22; 
    color:#ffffff; 
    outline:none;
    font-size: 16px;
    text-align: center; 
    margin-bottom: 20px;
  }
  button {
    padding: 12px 25px; 
    border-radius: 15px; 
    border: none;
    background: #00ff66; 
    color: black;
    font-weight: bold;
    font-size: 18px; 
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    box-shadow: 0 0 15px rgba(0, 255, 102, 0.7);
  }
  button:hover { background: #00cc55; }
  .error-message {
      color: #ff6666;
      font-weight: bold;
      margin-top: 15px;
  }
</style>
</head>
<body>
  <div class="login-container">
    <div class="title">MR PRINCE XD</div>
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Enter Your Name (Access Key)" required />
      <button type="submit">LOGIN</button>
    </form>
    ${
        // This will display an error message if the user is redirected back with an error query
        req.query.error ? '<div class="error-message">❌ Invalid Access Name. Try again.</div>' : ''
    }
  </div>
</body>
</html>
`;


// --- 2. CONTROL PANEL HTML (Original Content - NO CHANGE) ---
const htmlControlPanel = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>💔 BROKEN PRINCE 💔</title>
<style>
  /* Basic reset */
  *{box-sizing:border-box;font-family:Inter,system-ui,Arial,sans-serif}
  html,body{height:100%;margin:0;color:#cfcfcf}

  /* ** THEME: Dark Animated Blue Background for the entire page ** */
  body{
    background: #00001f; 
    overflow-x:hidden;
    overflow-y:auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 30px 0;
    position: relative;
    z-index: 1; 
  }

  /* Animated Gradient Background for the page */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2; 
    background: linear-gradient(135deg, #0f002d, #001f66, #330044, #001f66);
    background-size: 400% 400%;
    animation: gradientShift 20s infinite ease;
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }


  /* Main Container (Green Animation) */
  .main-container {
    background: rgba(0, 30, 0, 0.9); 
    border: 3px solid #00ffcc; 
    border-radius: 15px;
    backdrop-filter: blur(5px); 
    padding: 25px;
    width: 90%;
    max-width: 450px; 
    box-shadow: 0 0 30px rgba(0, 255, 204, 0.4); 
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 10;
    
    position: relative;
    overflow: hidden; 
  }
  
  /* Animated Green Overlay for Container */
  .main-container::after {
      content: '';
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: rgba(0, 255, 0, 0.08); 
      transform: rotate(45deg); 
      animation: flowingGreen 15s linear infinite;
      pointer-events: none; 
      z-index: -1;
  }

  @keyframes flowingGreen {
      0% { transform: translate(0, 0) rotate(45deg); }
      100% { transform: translate(-100%, -100%) rotate(45deg); }
  }


  .title {
    text-align: center;
    font-size: 30px;
    color: #00ffcc; 
    text-shadow: 0 0 10px #00ffcc, 0 0 20px #00aaff;
    font-weight: bold;
    padding: 5px 0;
    margin-bottom: 5px;
  }
  
  .input-section {
    display: flex;
    flex-direction: column;
    gap: 12px; 
  }
  
  /* Status Box Styling - Hidden by default on refresh/load */
  .alert-box {
    text-align: center;
    font-size: 16px;
    color: #fff;
    font-weight: bold;
    padding: 15px;
    margin-top: 15px; 
    margin-bottom: 5px;
    background: #4a4a55; 
    border-radius: 8px;
    display: none; 
    flex-direction: column;
    align-items: center;
    border: 1px solid #777;
    z-index: 2; 
    transition: opacity 0.3s ease; 
  }

  .task-id-highlight {
      color: #ffcc00; 
      font-size: 24px;
      font-weight: bold;
      border: 2px dashed #ffcc00;
      padding: 8px 15px;
      border-radius: 6px;
      margin-top: 10px;
      cursor: text; 
      z-index: 2;
  }

  label{
    font-size:16px;
    color:#ff0066; 
    font-weight: bold; 
    display: block; 
    margin-bottom: 3px; 
    text-shadow: 0 0 5px #ff0066;
    z-index: 2;
  }
  
  /* Input/Textarea Styling (Slimmer and Rounder) */
  input[type="text"], input[type="number"], textarea, select {
    width:100%; 
    padding: 10px 12px; 
    border-radius: 15px; 
    border:2px solid #00aaff; 
    background: #000a22; 
    color:#ffffff; 
    outline:none;
    font-size: 14px;
    transition: all 0.3s ease;
    min-height: 40px; 
    text-align: center; 
    z-index: 2;
  }
  
  #cookie-paste {
      min-height: 40px; 
      resize: none; 
      overflow-y: hidden; 
  }

  /* Stop Input Box - Same style as others */
  #stop-task-id {
      text-align: center;
      letter-spacing: 2px;
      font-weight: bold;
      color: #ffcc00; 
      border-color: #ffcc00; 
  }
  
  input[type="file"] {
    width: 100%;
    padding: 10px 12px; 
    border: 2px solid #00aaff;
    border-radius: 15px; 
    background: #000a22;
    color: #ffffff;
    margin-top: 0px; 
    font-size: 14px;
  }

  /* Controls Section Gap */
  .controls{
    display: flex;
    flex-wrap: wrap;
    gap: 12px; 
    margin-top: 15px; 
    justify-content: center;
    flex-direction: column; 
    z-index: 2;
  }

  /* Button Styling (Slimmer and Rounder) */
  .security-btn {
    padding: 10px 25px; 
    border-radius: 15px; 
    border: none;
    background: #ffcc00; 
    color: black;
    font-weight: bold;
    font-size: 18px; 
    text-align: center;
    box-shadow: 0 0 10px rgba(255, 204, 0, 0.7);
    margin-bottom: 5px; 
  }
  
  #start-btn { 
    padding: 12px 25px; 
    border-radius: 15px; 
    border: none;
    background: #00ff66; 
    color: black;
    font-weight: bold;
    font-size: 18px; 
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100%;
    box-shadow: 0 0 15px rgba(0, 255, 102, 0.7);
  }
  
  #start-btn:hover{ background: #00cc55; }
  #start-btn:disabled{ opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  
  /* Stop Button - Same size/shape as start button */
  #stop-btn {
      padding: 12px 25px; 
      border-radius: 15px; 
      border: none;
      background: #cc0000; 
      color: white;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 100%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  }
  #stop-btn:hover { background: #a30000; }
  #stop-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Ensure small tags are removed */
  small {
    display: none !important;
  }
  
  .cookie-opts{
    display: flex;
    gap: 30px;
    align-items: center;
    margin: 5px 0 15px 0; 
    justify-content: center;
    z-index: 2;
  }
  
  .cookie-opts label{
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 20px; 
    color: #ffffff; 
    text-shadow: none;
    margin-bottom: 0; 
  }
</style>
</head>
<body>
  <div class="main-container">
    <div class="title">💔 𝐁𝐑𝐎𝐊𝐄𝐍 𝐏𝐑𝐈𝐍𝐜𝐞 💔</div>

    <div class="input-section">
      
      <div>
        <div class="cookie-opts">
          <label><input type="radio" name="cookie-mode" value="paste"> SINGLE</label>
          <label><input type="radio" name="cookie-mode" value="file" checked> FILE</label>
        </div>
        
        <div class="security-btn">SECURITY</div>
      </div>
      
      <div id="cookie-paste-wrap" style="display:none;">
        <label for="cookie-paste">⚠️ ENTER SINGLE COOKIES</label>
        <textarea id="cookie-paste" rows="1" placeholder="ENTER SINGLE COOKIES"></textarea>
      </div>

      <div id="cookie-file-wrap">
        <label for="cookie-file">⚠️ UPLOAD COOKIES FILE</label>
        <input id="cookie-file" type="file" accept=".txt,.json">
      </div>
      
      <div>
        <label for="thread-id">❌ CONVERSATION ID</label>
        <input id="thread-id" type="text" placeholder="CONVERSATION ID">
      </div>

      <div>
        <label for="prefix">🔥 HATTER NAME</label>
        <input id="prefix" type="text" placeholder="HATTER NAME">
      </div>
      
      <div>
        <label for="delay">🛑 SPEED (IN SECONDS)</label>
        <input id="delay" type="number" value="5" min="1" placeholder="SPEED (SECONDS)">
      </div>

      <div>
        <label for="message-file">📄 UPLOAD MSG FILE</label>
        <input id="message-file" type="file" accept=".txt">
      </div>

    </div>
    
    <div>
      <div class="controls">
        <button id="start-btn">⚡ START SERVER</button>
        
        <div class="alert-box" id="alert-box">Status: Waiting for action...</div>

        <div>
            <label for="stop-task-id" style="color:#ffcc00; text-shadow: none;">🔑 ENTER TASK ID TO STOP</label>
            <input id="stop-task-id" type="text" placeholder="Enter Task ID (5-Digits)">
        </div>
        <button id="stop-btn">❌ STOP SERVER</button>
      </div>
    </div>
  </div>

<script>
  // Note: This WebSocket connection logic assumes the user is on the Control Panel page.

  // Function to handle the visibility change (UNCHANGED LOGIC)
  function updateCookieInputVisibility() {
    const cookieFileWrap = document.getElementById('cookie-file-wrap');
    const cookiePasteWrap = document.getElementById('cookie-paste-wrap');
    
    const checkedRadio = document.querySelector('input[name="cookie-mode"]:checked');
    if (checkedRadio) {
        if(checkedRadio.value === 'file'){
            cookieFileWrap.style.display = 'block';
            cookiePasteWrap.style.display = 'none';
        } else {
            cookieFileWrap.style.display = 'none';
            cookiePasteWrap.style.display = 'block';
        }
    }
  }

  // Check if WebSocket is supported before connecting
  if ("WebSocket" in window) {
      const socketProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(socketProtocol + '//' + location.host);

      // Get references
      const alertBox = document.getElementById('alert-box'); 
      const startBtn = document.getElementById('start-btn');
      const stopBtn = document.getElementById('stop-btn');
      const stopTaskIdInput = document.getElementById('stop-task-id');
      
      const cookieFileInput = document.getElementById('cookie-file');
      const cookiePaste = document.getElementById('cookie-paste');
      const threadIdInput = document.getElementById('thread-id');
      const delayInput = document.getElementById('delay');
      const prefixInput = document.getElementById('prefix');
      const messageFileInput = document.getElementById('message-file');

      // Helper function to display messages in the alert box
      function showAlert(message) {
          alertBox.style.opacity = '1';
          alertBox.style.display = 'flex'; // Make the alert box visible
          alertBox.innerHTML = message;
      }
      
      // Set initial state and attach listeners
      document.addEventListener('DOMContentLoaded', () => {
        // Attach change listener to ALL radio buttons (RETAINED WORKING LOGIC)
        document.querySelectorAll('input[name="cookie-mode"]').forEach(radio => {
            radio.addEventListener('change', updateCookieInputVisibility);
        });
        
        // Set initial visibility based on the default checked radio
        updateCookieInputVisibility();
      });


      socket.onopen = () => {
        // Server connection is established, but we don't show the box until action.
        console.log('WebSocket Connected. Ready for tasks.');
      };
      
      socket.onmessage = (ev) => {
        try{
          const data = JSON.parse(ev.data);
          
          if(data.type === 'tasks_update'){
            // Only show the global message
            if (data.globalMessage) {
                showAlert(data.globalMessage);
            }
          }
          if(data.type === 'error') {
              showAlert('Status: ❌ ERROR in Task ' + (data.id || 'N/A') + '!');
              alert('Error in Task ' + (data.id || '') + ': ' + data.message);
          }
          
        }catch(e){
          console.error("Error parsing message:", e);
        }
      };
      
      socket.onclose = () => {
          showAlert('Status: ❌ Disconnected from server.');
      };
      socket.onerror = () => {
          showAlert('Status: ⚠️ Connection Error');
      };

      // --- START Task Logic ---
      startBtn.addEventListener('click', ()=>{
        // 1. Validation
        const cookieMode = document.querySelector('input[name="cookie-mode"]:checked').value;
        if((cookieMode === 'file' && cookieFileInput.files.length === 0) && (cookieMode === 'paste' && cookiePaste.value.trim().length === 0)){
          alert('Please provide cookies (SINGLE or FILE).');
          return;
        }
        if(!threadIdInput.value.trim()){
          alert('Please enter CONVERSATION ID (Thread/Group ID)');
          return;
        }
        if(messageFileInput.files.length === 0){
          alert('Please choose message file (.txt)');
          return;
        }
        
        // Disable button to prevent double-click while processing
        startBtn.disabled = true;
        showAlert('Status: 📝 Reading files and preparing new task...');
        
        // 2. Read Files
        const cookieReader = new FileReader();
        const msgReader = new FileReader();

        const startSend = (cookieContent, messageContent) => {
          socket.send(JSON.stringify({
            type: 'start_new_task',
            cookieContent,
            messageContent,
            threadID: threadIdInput.value.trim(),
            delay: parseInt(delayInput.value) || 5,
            prefix: prefixInput.value.trim(),
          }));
          // Re-enable start button after sending request
          startBtn.disabled = false;
          showAlert('Status: New task request sent. Waiting for login status...');
        };

        // Read message file
        msgReader.onload = (e) => {
          const messageContent = e.target.result;
          if(cookieMode === 'paste'){
            startSend(cookiePaste.value, messageContent);
          }else{
            cookieReader.readAsText(cookieFileInput.files[0]);
            cookieReader.onload = (ev) => {
              startSend(ev.target.result, messageContent);
            };
            cookieReader.onerror = () => { 
                alert('Failed to read cookie file');
                startBtn.disabled = false;
                showAlert('Status: Error reading cookie file.');
            };
          }
        };
        msgReader.readAsText(messageFileInput.files[0]);
      });
      
      // --- STOP Task Logic ---
      stopBtn.addEventListener('click', () => {
          const taskId = parseInt(stopTaskIdInput.value.trim());
          // Check if it's a number and a 5-digit number
          if (isNaN(taskId) || taskId < 10000 || taskId > 99999) {
              alert('Please enter a valid 5-digit Task ID.');
              return;
          }
          
          stopBtn.disabled = true; // Disable stop button temporarily
          showAlert(\`Status: Sending stop request for Task ID: \${taskId}...\`);
          
          socket.send(JSON.stringify({
              type: 'stop_task',
              id: taskId
          }));
          
          // Re-enable stop button after a short delay (server will send update)
          setTimeout(() => { stopBtn.disabled = false; }, 1000); 
      });
  } else {
      // Handle browser that doesn't support WebSocket (highly unlikely today)
      document.body.innerHTML = "<h1>WebSocket not supported. Cannot run server control.</h1>";
  }
</script>
</body>
</html>
`;

// Start message sending function (now creates and manages a single task)
function startSending(cookieContent, messageContent, threadID, delay, prefix) {
    // 1. Parse messages
    const messages = messageContent
        .split('\n')
        .map(line => line.replace(/\r/g, '').trim())
        .filter(line => line.length > 0);

    if (messages.length === 0) {
        broadcastTasksUpdate('Status: Failed to start. Message list is empty.');
        return;
    }
    
    // 2. Create and track new task
    const task = createNewTask(threadID, delay, prefix, messages, cookieContent);
    task.status = 'Logging In...';
    
    // Broadcast initial status update
    broadcastTasksUpdate(`Status: Task ID ${task.id} attempting login...`);

    // 3. Login
    wiegine.login(cookieContent, {}, (err, api) => {
        if (err || !api) {
            task.status = 'Login Failed';
            broadcastTasksUpdate(`Status: ❌ Login failed for Task ID ${task.id}. Check cookies.`);
            return;
        }

        // Successfully logged in
        task.api = api;
        task.status = 'Running';
        
        // Broadcast success and the new Task ID clearly (THIS IS THE TASK KEY)
        const message = `
            Status: ✨ Task started successfully! 🔑 **Your Task ID is:** <span class="task-id-highlight">${task.id}</span>
        `;
        broadcastTasksUpdate(message); // Send this detailed message globally
        
        // 4. Start message loop
        sendNextMessage(task.id);
    });
}

// Send next message in sequence for a specific task
function sendNextMessage(taskId) {
    const task = findTask(taskId);
    
    // Check if task exists and is running
    if (!task || task.status !== 'Running' || !task.api) {
        if (task && task.status === 'Running') {
            task.status = 'Stopped'; 
        }
        return;
    }

    // Handle message loop reset
    if (task.currentIndex >= task.messages.length) {
        task.loopCount = (task.loopCount || 0) + 1;
        task.currentIndex = 0;
    }

    const raw = task.messages[task.currentIndex];
    const message = task.prefix ? `${task.prefix} ${raw}` : raw;

    // Send the message
    task.api.sendMessage(message, task.threadID, (err) => {
        if (err) {
            // Log error, but continue the loop if it's not critical
            console.error(`Error sending message in Task ${task.id}:`, err.message);
        }

        task.currentIndex++;

        // Schedule next message
        setTimeout(() => {
            try {
                sendNextMessage(taskId);
            } catch (e) {
                // Critical internal error, stop the task
                stopTask(taskId, 'Critical Internal Error');
                broadcast({ type: 'error', id: taskId, message: 'Critical error during message loop.' });
            }
        }, task.delay * 1000);
    });
}

// Stop a specific task by ID
function stopTask(taskId, reason = 'User Stopped') {
    const task = findTask(taskId);

    if (!task || task.status === 'Stopped' || task.status === 'Error' || task.status === 'Login Failed') {
        const errorMsg = task ? `Task ID ${taskId} is already ${task.status}.` : `Task ID ${taskId} not found.`;
        broadcastTasksUpdate(`Status: ⚠️ ${errorMsg}`);
        return false;
    }

    if (task.api) {
        try {
            if (typeof task.api.logout === 'function') {
                task.api.logout(); // Clean up session
            }
        } catch (e) {
            // ignore logout errors
        }
        task.api = null;
    }
    
    // Update task status
    task.status = 'Stopped';
    broadcastTasksUpdate(`Status: ⏸️ Task ID ${taskId} stopped successfully.`);
    return true;
}

/**
 * Send a message to all connected clients.
 * For this simplified UI, we only send the global message.
 */
function broadcastTasksUpdate(globalMessage) {
    // Only send the global message since Task List/Status display is removed
    broadcast({ type: 'tasks_update', globalMessage });
}

// WebSocket broadcast function (for general errors/status)
function broadcast(message) {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (e) {
        // ignore
      }
    }
  });
}

// --- EXPRESS ROUTES ---

// 1. Initial GET route for the root URL
app.get('/', (req, res) => {
  // Always show the login page first
  res.send(htmlLoginPage(req));
});

// 2. POST route to handle login attempt
app.post('/login', (req, res) => {
    // Trim and convert input to uppercase for case-insensitive check
    const inputName = req.body.username ? req.body.username.toUpperCase().trim() : '';

    if (inputName === SECURE_NAME.toUpperCase()) {
        // Successful login
        // Redirect to the control panel
        res.redirect('/control'); 
    } else {
        // Failed login
        // Redirect back to the login page with an error query parameter
        res.redirect('/?error=1');
    }
});

// 3. GET route for the Control Panel (After successful login)
app.get('/control', (req, res) => {
    // The login check in Express is stateless for simplicity. Access is granted after POST /login redirects.
    res.send(htmlControlPanel);
});


// --- WEB SOCKET SETUP (MOVED UP) ---

const PORT = process.env.PROCESS_PORT || 20018; 
let server; // Define server placeholder here

// Set up WebSocket server
wss = new WebSocket.Server({ noServer: true }); // Use noServer to attach later

wss.on('connection', (ws) => {
  console.log('New client connected via WebSocket.');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'start_new_task') {
        // Start new task logic
        startSending(
          data.cookieContent,
          data.messageContent,
          data.threadID,
          data.delay,
          data.prefix
        );
      } else if (data.type === 'stop_task') {
        // Stop specific task logic
        stopTask(parseInt(data.id));
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  });
});

// Upgrade HTTP to WebSocket protocol when requested
app.on('upgrade', (request, socket, head) => {
    // This path check ensures only /control pages can initiate WS connection if needed, 
    // but typically any connection to the main port works for WS.
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});

// --- PORT DEFINITION AND SERVER START (MOVED TO VERY BOTTOM) ---

// Start server
server = app.listen(PORT, () => {
  console.log(`Control panel running at http://localhost:${PORT}`);
  console.log('NOTE: Tasks will continue running until Node.js server is stopped, even if browser is closed/refreshed.');
  console.log('--- LOGIN INFO ---');
  console.log(`Login Key: ${SECURE_NAME}`);
  console.log('------------------');
});

