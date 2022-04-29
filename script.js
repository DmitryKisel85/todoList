"use strict";

const addTaskBtn = document.getElementById("add-task-btn");
const clearAllBtn = document.getElementById("clear-all");
const clearCompletedBtn = document.getElementById("clear-completed");
const deskTaskInput = document.getElementById("input-main");
const todosWrapper = document.querySelector(".todos-wrapper");
const todoNumber = document.querySelector(".todo-number");

let tasks;

// Выгрузка списка из localstorage
!localStorage.tasks ? (tasks = []) : (tasks = JSON.parse(localStorage.getItem("tasks")));

let todoItemElems = [];

class Task {
	constructor(description) {
		this.description = description;
		this.completed = false;
	}
}

const createTemplate = (task, index) => {
	return `
    <li class="todo-item ${task.completed ? "checked" : ""}" data-index="${index}">
		<input type="checkbox" id="btn-complete-${index}" class="btn-complete" ${task.completed ? "checked" : ""} />
		<label for="btn-complete-${index}"></label>
        <textarea id="input-description" class="description" data-autoresize rows="1" readonly>${task.description}</textarea>
        <button class="btn-edit" id="btn-edit" data-state='closed'><i class="far fa-edit"></i></button>
        <button class="btn-delete id="btn-delete"><i class="fas fa-times"></i></button>
    </li>

    `;
};

// Функция авторесайза textarea
function addAutoResize() {
	document.querySelectorAll("[data-autoresize]").forEach(function (element) {
		element.style.boxSizing = "border-box";
		var offset = element.offsetHeight - element.clientHeight;
		element.style.height = "auto";
		element.style.height = element.scrollHeight + offset + "px";
		element.addEventListener("input", function (event) {
			event.target.style.height = "auto";
			event.target.style.height = event.target.scrollHeight + offset + "px";
		});
		element.removeAttribute("data-autoresize");
	});
}

// Подсчитываем кол-во активных заданий
const thingsLeftTodoAmount = () => {
	const tasksToDo = tasks.filter((task) => task.completed == false);
	todoNumber.textContent = tasksToDo.length;
};

// Формируем наш туду список
const fillHtmlList = () => {
	todosWrapper.innerHTML = "";

	thingsLeftTodoAmount();

	if (tasks.length > 0) {
		// Создаем список туду
		tasks.forEach((item, index) => {
			todosWrapper.innerHTML += createTemplate(item, index);
		});
		addAutoResize();

		// Навешиваем обработчик событий на каждый туду
		todoItemElems = document.querySelectorAll(".todo-item");
		todoItemElems.forEach((elem) => {
			elem.addEventListener("click", (e) => {
				if (e.target.classList.contains("btn-complete")) {
					completeTask(elem.dataset.index);
				}
				if (e.target.closest(".btn-delete")) {
					deleteTask(elem.dataset.index);
				}
				if (e.target.closest(".btn-edit")) {
					editTask(elem.dataset.index, elem);
				}
			});
		});
	}
};
// Инициализируем список туду
fillHtmlList();

// Запись актуального списка в localstorage
const updateLocal = () => {
	localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Объединение функций обновления localstorage и формирования списка туду
const updateLocalAndFillHtmlList = () => {
	updateLocal();
	fillHtmlList();
};

// Пометка туду, как выполненное
const completeTask = (index) => {
	tasks[index].completed = !tasks[index].completed;

	if (tasks[index].completed) {
		todoItemElems[index].classList.add("checked");
	} else {
		todoItemElems[index].classList.remove("checked");
	}

	updateLocalAndFillHtmlList();
};

// Удаление туду
const deleteTask = (index) => {
	todoItemElems[index].classList.add("deleting");

	setTimeout(() => {
		tasks.splice(index, 1);
		updateLocalAndFillHtmlList();
	}, 400);
};

//========================================================================================================================================================
// РЕДАКТИРОВАНИЕ ТУДУ

// Редактирование туду
const editTask = (index, elem) => {
	const descriptionInput = elem.querySelector("#input-description");
	const editBtn = elem.querySelector("#btn-edit");

	// Включение редактирования
	const todoItemInputEnabling = () => {
		descriptionInput.removeAttribute("readonly");
		descriptionInput.focus();
		descriptionInput.style.color = "var(--input-color)";
		editBtn.innerHTML = "<i class='fas fa-check'></i>";
		editBtn.dataset.state = "open";
	};

	// Выключение редактирования
	const todoItemInputDisabling = (input) => {
		input.setAttribute("readonly", "readonly");
		input.style.color = "var(--text-color)";
		editBtn.innerHTML = "<i class='far fa-edit'></i>";
		tasks[index].description = input.value;
		editBtn.dataset.state = "closed";
		updateLocal();
	};

	if (editBtn.dataset.state == "closed") {
		todoItemInputEnabling();

		// Навешиваем обработчики на активный инпут
		descriptionInput.addEventListener("focusout", (e) => {
			todoItemInputDisabling(e.target);
		});

		descriptionInput.addEventListener("keypress", (e) => {
			if (e.key == "Enter") {
				todoItemInputDisabling(e.target);
			}
		});
	} else {
		todoItemInputDisabling(descriptionInput);
	}
};

// EVENT LISTENERS

addTaskBtn.addEventListener("click", () => {
	if (!deskTaskInput.value) return;

	tasks.push(new Task(deskTaskInput.value));
	updateLocalAndFillHtmlList();
	deskTaskInput.value = "";
});

deskTaskInput.addEventListener("keypress", (e) => {
	if (!deskTaskInput.value) return;

	if (e.key == "Enter") {
		tasks.push(new Task(deskTaskInput.value));
		updateLocalAndFillHtmlList();
		deskTaskInput.value = "";
	}
});

clearAllBtn.addEventListener("click", () => {
	todosWrapper.classList.add("deleting");

	setTimeout(() => {
		tasks = [];
		todosWrapper.classList.remove("deleting");
		updateLocalAndFillHtmlList();
	}, 400);
});

clearCompletedBtn.addEventListener("click", () => {
	const completed = document.querySelectorAll(".checked");

	completed.forEach((item) => {
		item.classList.add("deleting");
		setTimeout(() => {
			tasks = tasks.filter((task) => task.completed == false);
			updateLocalAndFillHtmlList();
		}, 400);
	});
});
