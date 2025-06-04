const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const completedBox = document.getElementById("completed-tasks");
const removeCheckedBtn = document.getElementById("remove-checked");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Load tasks on startup
renderTasks();

// Add new task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskText = taskInput.value.trim();

  if (taskText === "") return;

  // Check for duplicate (case-insensitive)
  const isDuplicate = tasks.some(
    (task) => task.text.toLowerCase() === taskText.toLowerCase()
  );

  if (isDuplicate) {
    showToast("Task already exists!", "error");
    return;
  }

  tasks.push({ text: taskText, completed: false });
  taskInput.value = "";
  showToast("Task added successfully!", "success");
  saveTasks();
  renderTasks();
});

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";
  taskList.setAttribute("role", "list");

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div role="listitem" class="text-center text-gray-500 dark:text-gray-400">
        No tasks found.
      </div>
    `;
    completedBox.textContent = "0 of 0 tasks done";
    return;
  }

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className =
      "flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded mb-2 transition-colors duration-300";
    taskDiv.setAttribute("role", "listitem");
    taskDiv.setAttribute("aria-label", `Task: ${task.text}`);
    taskDiv.setAttribute("tabindex", "0");

    taskDiv.innerHTML = `
      <div class="flex-1 flex items-center gap-2">
        <input type="checkbox"
          class="cursor-pointer accent-blue-500 dark:accent-blue-400 focus:outline-none focus-visible:ring-2 rounded"
          ${task.completed ? "checked" : ""}
          data-index="${index}"
          aria-checked="${task.completed}"
          aria-label="Mark task as ${
            task.completed ? "incomplete" : "complete"
          }"
        >
        <span class="task-text ${
          task.completed
            ? "line-through text-gray-400 dark:text-gray-500"
            : "text-gray-900 dark:text-gray-100"
        }" data-index="${index}">${task.text}</span>
        <input
          class="hidden task-input w-full border border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
          data-index="${index}"
          aria-label="Edit task text"
        />
      </div>
      <div class="flex gap-2 ml-2">
        <button
          class="focus:outline-none focus-visible:ring-2 rounded px-1"
          data-action="edit"
          data-index="${index}"
          aria-label="Edit task"
          tabindex="0"
        >
          <i class="ri-edit-2-line text-green-600 dark:text-green-400  cursor-pointer"></i>
        </button>
        <button
          class="focus:outline-none focus-visible:ring-2 rounded px-1"
          data-action="delete"
          data-index="${index}"
          aria-label="Delete task"
          tabindex="0"
        >
          <i class="ri-delete-bin-5-line text-red-600 dark:text-red-400 cursor-pointer"></i>
        </button>
      </div>
    `;

    taskList.appendChild(taskDiv);
  });

  updateCompletedCount();
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Handle clicks inside taskList
taskList.addEventListener("click", (e) => {
  const actionBtn = e.target.closest("[data-action]");
  if (!actionBtn && e.target.type !== "checkbox") return;

  if (e.target.type === "checkbox") {
    const index = e.target.dataset.index;
    tasks[index].completed = e.target.checked;
    saveTasks();
    renderTasks();
    return;
  }

  if (actionBtn) {
    const action = actionBtn.dataset.action;
    const index = actionBtn.dataset.index;

    if (action === "edit") {
      const parent = actionBtn.closest("div").parentElement;
      const span = parent.querySelector(".task-text");
      const input = parent.querySelector(".task-input");

      input.value = tasks[index].text;
      span.classList.add("hidden");
      input.classList.remove("hidden");
      input.focus();
    }

    if (action === "delete") {
      if (confirm("Are you sure you want to delete this task?")) {
        tasks.splice(index, 1);
        showToast("Task deleted!", "error");
        saveTasks();
        renderTasks();
      }
    }
  }
});

// Inline edit - save on Enter
taskList.addEventListener("keydown", (e) => {
  if (e.target.classList.contains("task-input") && e.key === "Enter") {
    e.preventDefault();
    saveEdit(e.target);
  }
});

taskList.addEventListener(
  "blur",
  (e) => {
    if (e.target.classList.contains("task-input")) {
      saveEdit(e.target);
    }
  },
  true
);

function saveEdit(inputEl) {
  const index = inputEl.dataset.index;
  const newText = inputEl.value.trim();

  if (
    tasks.some(
      (t, i) => i !== +index && t.text.toLowerCase() === newText.toLowerCase()
    )
  ) {
    showToast("Task already exists!", "error");
    renderTasks();
    return;
  }

  if (newText !== "") {
    tasks[index].text = newText;
    saveTasks();
    renderTasks();
  } else {
    renderTasks();
  }
}

// Remove all checked tasks
removeCheckedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

// Update completed task counter
function updateCompletedCount() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.completed).length;
  completedBox.textContent = `${done} of ${total} task${
    total !== 1 ? "s" : ""
  } done`;
}
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  toast.className =
    "fixed top-5 right-5 px-4 py-2 rounded shadow-md z-50 transition-opacity duration-500";

  if (type === "success") {
    toast.classList.add(
      "toast-success",
      "bg-green-500",
      "dark:bg-green-600",
      "text-white"
    );
  } else if (type === "error") {
    toast.classList.add(
      "toast-error",
      "bg-red-500",
      "dark:bg-red-600",
      "text-white"
    );
  }

  toast.style.opacity = "1";
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 500);
  }, 3000);
}
