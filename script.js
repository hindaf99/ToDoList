let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskTitleInput = document.getElementById("taskTitle");
const taskPriorityInput = document.getElementById("taskPriority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filters button");
const taskCounter = document.getElementById("taskCounter");

let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const title = taskTitleInput.value.trim();
  if (title === "") return;

  const newTask = {
    id: Date.now(),
    title: title,
    completed: false,
    priority: taskPriorityInput.value
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskTitleInput.value = "";
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (currentFilter === "active") {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add(`priority-${task.priority}`);
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <span>${task.title}</span>
      <div>
        <button onclick="toggleTask(${task.id})">✔</button>
        <button onclick="deleteTask(${task.id})">✖</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;
  const total = tasks.length;
  taskCounter.textContent = `Complétées: ${completed} / ${total}`;
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

addTaskBtn.addEventListener("click", addTask);

renderTasks();