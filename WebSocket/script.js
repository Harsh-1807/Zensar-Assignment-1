const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const status = document.getElementById('status');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function updateTaskList() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTask(index);
        
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function addTask() {
    const newTask = taskInput.value.trim();
    
    if (newTask) {
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';
        updateTaskList();
        syncTasks();
        showStatus("Task added!");
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskList();
}

function syncTasks() {
   // Simulating WebSocket synchronization
   const socket = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server URL

   socket.onopen = () => {
       socket.send(JSON.stringify({ action: 'sync', tasks }));
   };

   socket.onmessage = (event) => {
       console.log("Server response:", event.data);
   };

   socket.onclose = () => {
       console.log("WebSocket connection closed.");
   };
}

function showStatus(message) {
   status.textContent = message;
   setTimeout(() => { status.textContent = ''; }, 3000);
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
document.addEventListener('DOMContentLoaded', updateTaskList);