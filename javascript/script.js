document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const dueDateInput = document.getElementById("due-date-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("search-input");

  const deleteModal = document.getElementById("deleteModal");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const confirmDeleteBtn = document.getElementById("confirmDelete");

  let editingTaskRow = null;
  let taskToDelete = null;

  const showError = (message) => {
    taskInput.classList.add("error");
    taskInput.placeholder = message;

    setTimeout(() => {
      taskInput.classList.remove("error");
      taskInput.placeholder = "Masukkan Kegiatan Anda...";
    }, 3000);
  };

  const clearError = () => {
    taskInput.classList.remove("error");
    taskInput.placeholder = "Masukkan Kegiatan Anda...";
  };

  taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
      clearError();
    }
  });

  const showDeleteModal = (taskRow) => {
    taskToDelete = taskRow;
    deleteModal.classList.add("show");
  };

  const hideDeleteModal = () => {
    deleteModal.classList.remove("show");
    taskToDelete = null;
  };

  cancelDeleteBtn.addEventListener("click", hideDeleteModal);

  confirmDeleteBtn.addEventListener("click", () => {
    if (taskToDelete) {
      taskList.removeChild(taskToDelete);
      saveTasks();
      hideDeleteModal();
    }
  });

  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      hideDeleteModal();
    }
  });

  const updateDashboard = () => {
    const allTasks = document.querySelectorAll(".task-item");
    const completedTasks = document.querySelectorAll(".task-item.completed");
    const pendingTasks = allTasks.length - completedTasks.length;

    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers[0].textContent = pendingTasks;
    statNumbers[1].textContent = completedTasks.length;
    statNumbers[2].textContent = allTasks.length;
  };

  const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      addTaskToDOM(task.text, task.dueDate, task.completed);
    });
    updateDashboard();
  };

  const saveTasks = () => {
    const tasks = [];
    document.querySelectorAll(".task-item").forEach((taskItem) => {
      tasks.push({
        text: taskItem.querySelector(".task-text").textContent,
        dueDate: taskItem.querySelector(".due-date").textContent,
        completed: taskItem.classList.contains("completed"),
      });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateDashboard();
  };

  const addTaskToDOM = (taskText, dueDate, isCompleted = false) => {
    const taskRow = document.createElement("tr");
    taskRow.className = "task-item";
    if (isCompleted) {
      taskRow.classList.add("completed");
    }

    const statusText = isCompleted ? "Completed" : "Pending";
    const statusClass = isCompleted ? "status-completed" : "status-pending";

    taskRow.innerHTML = `
        <td class="task-text">${taskText}</td>
        <td class="due-date">${dueDate || "No due date"}</td>
        <td class="task-status">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td>
          <div class="task-buttons">
            <button class="edit-btn">Edit</button>
            <button class="complete-btn">Complete</button>
            <button class="delete-btn">Delete</button>
          </div>
        </td>
      `;

    taskRow.querySelector(".edit-btn").addEventListener("click", () => {
      const taskTextElement = taskRow.querySelector(".task-text");
      const dueDateElement = taskRow.querySelector(".due-date");

      const currentText = taskTextElement.textContent;
      const currentDate = dueDateElement.textContent === "No due date" ? "" : dueDateElement.textContent;

      taskInput.value = currentText;
      dueDateInput.value = currentDate;

      editingTaskRow = taskRow;

      addTaskBtn.textContent = "Update";
      addTaskBtn.style.backgroundColor = "#28a745";

      clearError();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    taskRow.querySelector(".complete-btn").addEventListener("click", () => {
      taskRow.classList.toggle("completed");

      const statusBadge = taskRow.querySelector(".status-badge");
      if (taskRow.classList.contains("completed")) {
        statusBadge.textContent = "Completed";
        statusBadge.className = "status-badge status-completed";
      } else {
        statusBadge.textContent = "Pending";
        statusBadge.className = "status-badge status-pending";
      }

      saveTasks();
    });

    taskRow.querySelector(".delete-btn").addEventListener("click", () => {
      showDeleteModal(taskRow);
    });

    taskList.appendChild(taskRow);
  };

  addTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText === "") {
      showError("⚠️ Tolong Masukkin Kegiatan Anda!");
      return;
    }

    if (editingTaskRow) {
      const taskTextElement = editingTaskRow.querySelector(".task-text");
      const dueDateElement = editingTaskRow.querySelector(".due-date");

      taskTextElement.textContent = taskText;
      dueDateElement.textContent = dueDate || "No due date";

      editingTaskRow = null;
      addTaskBtn.textContent = "Tambah";
      addTaskBtn.style.backgroundColor = "";

      saveTasks();
    } else {
      addTaskToDOM(taskText, dueDate);
      saveTasks();
    }

    taskInput.value = "";
    dueDateInput.value = "";
    clearError();
  });

  const filterTasks = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    document.querySelectorAll(".task-item").forEach((taskRow) => {
      const taskText = taskRow.querySelector(".task-text").textContent.toLowerCase();
      const isCompleted = taskRow.classList.contains("completed");

      let matchesSearch = taskText.includes(searchTerm);
      let matchesStatus = true;

      if (statusValue === "pending") {
        matchesStatus = !isCompleted;
      } else if (statusValue === "completed") {
        matchesStatus = isCompleted;
      }

      taskRow.style.display = matchesSearch && matchesStatus ? "" : "none";
    });
  };

  searchInput.addEventListener("input", filterTasks);
  statusFilter.addEventListener("change", filterTasks);

  loadTasks();
});
