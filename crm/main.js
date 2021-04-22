const table = document.querySelector("tbody"),
      container = document.querySelector(".main__container"),
      modal = document.querySelector(".modal");
      
// get clients
async function getClients() {
  const response = await fetch("http://localhost:3000/api/clients/");
  if (response.ok) {
    const data = await response.json();

    return data;
  } else {
    document.querySelector(
      ".main__wait"
    ).textContent = `ошибка ${response.status}`;
  }
}

// start table rendering
(function createStartPage(data) {
  getClients().then(function (data) {
    let modifiedData = data.sort(sortID);

    setTimeout(createDom, 700, modifiedData);
  });
})();

// delete client
async function deleteClient(id) {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: "DELETE",
  });
}
// change client
async function editClient(id, object) {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(object),
  });
  return response;
}
//  edit new client
async function createClient(obj) {
  const response = await fetch(`http://localhost:3000/api/clients/`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(obj),
  });
  return response;
}

// search client

async function searchClients(value) {
  const response = await fetch(
    `http://localhost:3000/api/clients?search=${value}`
  );
  const data = await response.json();
  return data;
}
// rendering after change
function renderSearchResult(value) {
  searchClients(value).then(function (data) {
    let modifiedData = data.sort(sortID);
    changeTable(modifiedData);
  });
}
// change table
const changeTable = (arr) => {
  deleteDomElement(table);
  for (const el of arr) {
    createRow(el);
  }
};

const openModal = () => modal.classList.add('open');

const closeModal = () => {
  modal.classList.remove('open');
  modal.innerHTML = '';
}

const debounce = (callback) => {
  let timeout;
  return (argument) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(argument), 300);
  };
};

const onInput = () => {
  let value = document.querySelector(".header__input").value;
  renderSearchResult(value);
};
const debouncedOnInput = debounce(onInput);

document.querySelector(".header__input").addEventListener("input", debouncedOnInput);

// create DOM clients table

function createRow({ createdAt, updatedAt, surname, name, lastName, contacts, id }) {
  const tr = document.createElement("tr"),
  now = new Date(createdAt),
  changes = new Date(updatedAt);

  tr.classList.add('table__body');
  tr.innerHTML = `
        <td class="col1">${id}</td>
        <td class="col2">${surname} ${name} ${lastName}</td>
        <td class="col3">${now.toLocaleString("ru", { year: "numeric", month: "numeric", day: "numeric", })}
        <span class="table__time">${now.toLocaleString("ru", { hour: "numeric", minute: "numeric", })}</span></td>
        <td class="col4">${changes.toLocaleString("ru", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })}<span class="table__time">${changes.toLocaleString("ru", {
          hour: "numeric",
          minute: "numeric",
        })}</span></td>
        <td class="col5">${contacts.map(item => `<div class="contact__icon tooltip ${item.type.toLowerCase()}">
        <span class="tooltiptext">${item.type}:<a>${item.value}</a></span></div>`).join('')}</td>
        <td class="col6">
        <button class="change__btn" data-id="${id}">Изменить</button>
        <button class="delete__btn" data-id="${id}">Удалить</button></td>`

  table.append(tr)
}

container.addEventListener("click", function (e) {
  e.preventDefault();
  let id = e.target.dataset.id;
  
  // filters

    if (e.target.id == "id") {
      changeIdCell()
    
     }
    if(e.target.id == "fio") {
      changeNameCell()
    }
    if(e.target.id == 'edition'){
      createEditDateCell()
    }
    if(e.target.id == 'lastchange'){
      changelastChangeCell()
    }

    // modals 

  if (e.target == modal || e.target.classList.contains("modal__close")) {
    closeModal()
   }
  if (e.target.classList.contains("main__btn")) {
    openModal()
    const modalBody = createModal("add", "Новый клиент", "Отмена");
    modal.append(modalBody)
  }
  if (e.target.classList.contains("modal__deleteBtn")) {
    closeModal()
  }
  if (e.target.classList.contains("modal--add__addBtn")) {
    addContactsForms("add");
  }
  if (e.target.tagName === "BUTTON" && e.target.classList.contains("modal--add__saveBtn")) {
    savingClient();
  }
  if (e.target.classList.contains("cancel__btn")) {
    e.target.parentNode.remove();
  }
  // modal change client
  if (e.target.classList.contains("change__btn")) {
    fetch(`http://localhost:3000/api/clients/${id}`)
      .then((response) => {
        return response.json();
      })
      .then(({ surname, name, lastName, contacts, id }) => {
        openModal()
        const modalBody = createModalChange({ surname, name, lastName, contacts, id });
        modal.append(modalBody)
      })
  }
 
  if (e.target.classList.contains("modal--change__addBtn")) {
    addContactsForms("change");
  }
  if (e.target.classList.contains("modal--change__saveBtn")) {
      changingClient();
  }
  if (e.target.classList.contains("modal--change__cancel")) {
    const span = document.querySelector(".modal--change__id");
    let changeId = span.textContent.slice(3);
    deleteClient(changeId)
      .then(getClients)
      .then((response) => {
        let modifiedData = response.sort(sortID);
        deleteDomElement(table);
        closeModal();
        createDom(modifiedData);
      });
  }
    // modal delete client
  if (e.target.classList.contains("delete__btn")) {
    openModal()
    const modalBody = createDeleteModal(id)
    modal.append(modalBody)
  }
  
  if (e.target.classList.contains("modal--delete__btn")) {
    let idDelete = document.querySelector(".modal--delete__body").id;
    deleteClient(idDelete)
      .then(getClients)
      .then((response) => {
        let modifiedData = response.sort(sortID);
        deleteDomElement(table);
        closeModal();
        createDom(modifiedData);
      });
  }
})
// change style of input in focus
modal.addEventListener("focus",function (event) {
    if (event.target.tagName === "INPUT") {
      event.target.style = "";
    }
  },
  true
);

function createDom(response) {
  document.querySelector(".main__wait").style.display = "none";
  response.forEach((element) => {
    createRow(element);
  });
}
// create modal for delete client
function createDeleteModal(id) {
  let modalBody = document.createElement("div");
  modalBody.classList.add('modal--delete__body');
  modalBody.id = `${id}`;
  modalBody.innerHTML =
    `<h2 class="modal--delete__title">Удалить клиента</h2>
  <p class="modal--delete__p">Вы действительно хотите удалить данного клиента?</p>
  <div class="error"></div>
  <button class="purple__btn modal__saveBtn modal--delete__btn">Удалить</button>
  <button class="white__btn modal__deleteBtn modal--delete__cancel">Отмена</button>
  <button class="modal--delete__close modal__close"></button>`
  return modalBody
}
// Compare by id

function deleteDomElement(el) {
  while (el.children.length > 0) {
    el.removeChild(el.lastChild);
  }
}
// Compare by name
function sortFullName(a, b) {
  let fullnameA = (a.surname + a.name + a.middlename).toLowerCase(),
    fullnameB = (b.surname + b.name + b.middlename).toLowerCase();

  if (fullnameA < fullnameB) return -1;
  if (fullnameA > fullnameB) return 1;
  return 0;
}

// Sorting by ID
function sortID(a, b) {
  let A = a.id,
    B = b.id;
  return A - B;
}
// Sorting by date
function sortDate(a, b) {
  let c = new Date(a.date).getTime();
  let d = new Date(b.date).getTime();
  return c > d ? 1 : -1;
}
// change table after sorting
// change idCell

let btnFilterPressed = false;

function changeIdCell() {
    getClients().then(function (data) {
      if (!btnFilterPressed) {
        let modifiedData = data.sort(sortID);
        changeTable(modifiedData);
        document.querySelector(".id__svg").classList.add("rotate");
        btnFilterPressed = true;
      } else {
        modifiedData = data.sort(sortID).reverse();
        changeTable(modifiedData);
        document.querySelector(".id__svg").classList.remove("rotate");
        btnFilterPressed = false;
      }
    });
}
// change NameCell
function changeNameCell() {
    getClients().then(function (data) {
      if (!btnFilterPressed) {
        let modifiedData = data.sort(sortFullName);
        changeTable(modifiedData);
        document.querySelector(".name__svg").classList.add("rotate");
        btnFilterPressed = true;
      } else {
        modifiedData = data.sort(sortFullName).reverse();
        changeTable(modifiedData);
        document.querySelector(".name__svg").classList.remove("rotate");
        btnFilterPressed = false;
      }
    });
}
// change createDateCell

function createEditDateCell() {
  getClients().then(function (data) {

    if (!btnFilterPressed) {
      let modifiedData = data.sort(sortDate);
      changeTable(modifiedData);
      document.querySelector(".creation__svg").classList.add("rotate");
      btnFilterPressed = true;
    } else {
      modifiedData = data.sort(sortDate).reverse();
      changeTable(modifiedData);
      document.querySelector(".creation__svg").classList.remove("rotate");
      btnFilterPressed = false;
    }
  });
 }

// change lastChangeCell
function changelastChangeCell() {
  getClients().then(function (data) {

    if (!btnFilterPressed) {
      let modifiedData = data.sort(sortDate);
      changeTable(modifiedData);
      document.querySelector(".lastchange__svg").classList.add("rotate");
      btnFilterPressed = true;
    } else {
      modifiedData = data.sort(sortDate).reverse();
      changeTable(modifiedData);
      document.querySelector(".lastchange__svg").classList.remove("rotate");
      btnFilterPressed = false;
    }
  });
}

// Create contact form in modal
function createForm(param) {
  if (param == undefined) param = false;
  const form = document.createElement("div");
  form.classList.add("contact__form", `${param}`);
  form.innerHTML = `
  <select class="dropdown-menu ${param}">
  <option class="dropdown-item" value="телефон">Телефон</option>
  <option class="dropdown-item" value="Email">Email</option>
  <option class="dropdown-item" value="fb">Facebook</option>
  <option class="dropdown-item" value="vk">VK</option>
  <option class="dropdown-item" value="other">Другое</option>
  </select>
  <input class="modal__contacts--input ${param}" type="text" required="" placeholder="Введите данные контакта">
  <button class="cancel__btn"></button>`
  return form
}
// add contact forms in CreateClient modal

function addContactsForms(add) {
  let childCount = document.querySelector(`.modal--${add}__contacts`).querySelectorAll("input");
  let newInput = document.querySelector(".contact__form.new");
  if (childCount.length === 10) {
    document.querySelector(`.modal--${add}__addBtn`).style.display = "none";
    document.querySelectorAll(".contact__form.new .new").forEach((form) => form.classList.remove("new"));
    newInput.classList.remove("new");
    return;
  }
  if (newInput) {
    document.querySelectorAll(".contact__form.new .new")
      .forEach((form) => form.classList.remove("new"));
    newInput.classList.remove("new");
    newInput.style.cssText = "border-right-style:none;";
  }
  let form = createForm("new");
  let btn = document.querySelector(`.modal--${add}__addBtn`);
  document.querySelector(`.modal--${add}__contacts`).insertBefore(form, btn);
  form.querySelectorAll(".cancel__btn").forEach((item) => {
    item.addEventListener("click", () => {
      item.parentNode.remove();
    });
  });
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    const choices = new Choices(el, {
      searchEnabled: false,
    });
  });
}


let contactsValue = [];
// validation
const validate = function (input) {
  let valid = false;
  let value = input.value;
  if (value.trim()) {
    valid = true;
  } else {
    valid = false;
    input.style.borderBottom = "1px solid #F06A4D";
  }
  return valid;
};

// saving client in CreateClient modal
function savingClient() {
  let inputs = modal.querySelectorAll(".modal__contacts--input");
  let nameInput = modal.querySelector(".name");
  let surnameInput = modal.querySelector(".surname");

  contactsValue = [];
  if (validate(nameInput) && validate(surnameInput)) {
    for (let i = 0; i < inputs.length; ++i) {
      let item = inputs[i].value;
      if (!item) {
        document.querySelector(".error").textContent = `Заполните поле контактов`;
        return false;
      }
    }

    let selected = document.querySelectorAll(".dropdown-menu.choices__input");
    const form = document.querySelector(".modal--add__form");

    selected.forEach((item) => {
      let currentOption = item.value;
      let input = item.parentNode.parentNode.nextElementSibling;
      let contact = input.value;

      let contactObj = {
        type: `${currentOption}`,
        value: `${contact}`,
      };

      contactsValue.push(contactObj);
    });

    formData = new FormData(form);
    const contactObject = {};

    formData.forEach(function (value, key) {
      contactObject[key] = value;
    });

    contactObject.contacts = contactsValue;
    createClient(contactObject).then(function (response) {
      if (!response.ok) {
        throw new Error(response.status)

      } else {
        getClients().then((response) => {
          deleteDomElement(table);
          closeModal();
          let modifiedData = response.sort(sortID);
          createDom(modifiedData);
        });
      }
    })
      .catch(err => {
        document.querySelector(".error").textContent = `ошибка ${err}`;
        if (!err) {
          document.querySelector(".error").textContent = `Что-то пошло не так`;
        }

      })
  } else {
    document.querySelector(".error").textContent = `Все поля обязательны для заполнения`;
  }
}

// createModal
function createModal(add, title, btnText) {

  const modalBody = document.createElement('div');
  modalBody.classList.add(`modal--${add}__body`, 'modal_Body')
  modalBody.innerHTML = `
        <div class="modal--${add}__top">
        <h2 class="modal--${add}__title modal__title">${title}</h2>
        <form class="modal--${add}__form modal__form">
        <label class="modal--${add}__label modal__label" for="surname">Фамилия<span class="star">*</span></label> 
        <input class="modal--${add}_input modal__input surname" required="" name="surname">
        <label class="modal--${add}__label modal__label" for="name">Имя<span class="star">*</span></label>
        <input class="modal--${add}_input modal__input name" required="" name="name">
        <label class="modal--${add}__label modal__label" for="lastName">Отчество<span class="star">*</span></label>
        <input class="modal--${add}_input modal__input middlename" required="" name="lastName"></form></div>
        <form class="modal--${add}__contacts modal__contacts">
        <button class="modal--${add}__addBtn modal__addBtn">Добавить контакт</button></form>
        <div class="error"></div>
        <button class="purple__btn modal--${add}__saveBtn modal__saveBtn">Сохранить</button>
        <button class="modal--${add}__cancel white__btn modal__deleteBtn">${btnText}</button>
        <button class="modal--add__close modal__close"></button>`;
  return modalBody

}

// changeClient
function changingClient() {
  let inputs = modal.querySelectorAll(".modal__contacts--input");
  let nameInput = modal.querySelector(".name");
  let surnameInput = modal.querySelector(".surname");

  contactsValue = [];
  const span = document.querySelector(".modal--change__id");
  let result;
  let id = span.textContent.slice(3);

  if (validate(nameInput) && validate(surnameInput)) {
    for (let i = 0; i < inputs.length; ++i) {
      let item = inputs[i].value;
      if (!item) {
        document.querySelector(".error").textContent = `Заполните поле контактов`;
        return false;
      }
    }
    let selected = document.querySelectorAll(".dropdown-menu.choices__input");
    if (selected) {
      selected.forEach((item) => {
        let currentOption = item.value;
        let input = item.parentNode.parentNode.nextElementSibling;
        let contact = input.value;

        let contactObj = {
          type: `${currentOption}`,
          value: `${contact}`,
        };

        contactsValue.push(contactObj);

        result = contactsValue.reduce(
          (function (hash) {
            return function (prev, curr) {
              !hash[curr.value] && (hash[curr.value] = prev.push(curr));
              return prev;
            };
          })(Object.create(null)),
          []
        );

        return result;
      });
    }
    const form = document.querySelector(".modal--change__form");
    formData = new FormData(form);

    const object = {};
    formData.forEach(function (value, key) {
      object[key] = value;
    });
    result ? (object.contacts = result) : (object.contacts = []);

    editClient(id, object)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(response.status)
        
      } else {
        getClients().then((response) => {
          let modifiedData = response.sort(sortID);
          deleteDomElement(table);
          closeModal();
          createDom(modifiedData);
        });
      }
    })
    .catch(err => {

      document.querySelector(".error").textContent = `ошибка ${err}`;
      if (!err) {
        document.querySelector(".error").textContent = `Что-то пошло не так`;
      }

    })
  } else {
    document.querySelector(".error").textContent = `Все поля обязательны для заполнения`;
  }
}

function createModalChange({ surname, name, lastName, contacts, id }) {
  const modalBody = document.createElement('div');
  modalBody.classList.add('modal--change__body', 'modal_Body')
  modalBody.innerHTML = `
        <div class="modal--change__top">
        <h2 class="modal--change__title modal__title">Изменить данные<span class="modal--change__id modal__id">ID:${id}</span></h2>
        <form class="modal--change__form modal__form">
        <label class="modal--change__label modal__label" for="surname">Фамилия<span class="star">*</span></label> 
        <input class="modal--change_input modal__input surname" required="" name="surname" value="${surname}">
        <label class="modal--change__label modal__label" for="name">Имя<span class="star">*</span></label>
        <input class="modal--change_input modal__input name" required="" name="name" value="${name}">
        <label class="modal--change__label modal__label" for="lastName">Отчество<span class="star">*</span></label>
        <input class="modal--change_input modal__input middlename" required="" name="lastName" value="${lastName}"></form></div>
        <form class="modal--change__contacts modal__contacts">
        ${contacts.map(item => `<div class="contact__form change">
        <select class="dropdown-menu change" value="${item.type}">
        <option class="dropdown-item" value="телефон">Телефон</option>
        <option class="dropdown-item" value="Email">Email</option>
        <option class="dropdown-item" value="fb">Facebook</option>
        <option class="dropdown-item" value="vk">VK</option>
        <option class="dropdown-item" value="other">Другое</option>
        </select>
       <input class="modal__contacts--input change" type="text" required="" placeholder="Введите данные контакта" value="${item.value}">
        <button class="cancel__btn"></button></div>`).join('')}
       <button class="modal--change__addBtn modal__addBtn">Добавить контакт</button></form>
        <div class="error"></div>
        <button class="purple__btn modal--change__saveBtn modal__saveBtn">Сохранить</button>
        <button class="modal--change__cancel white__btn">Удалить клиента</button>
        <button class="modal--add__close modal__close"></button>`
        const selects = modalBody.querySelectorAll("select");
        selects.forEach((select, i) => {
        const choices = new Choices(select);
        choices.setChoiceByValue(`${contacts[i].type}`);
         choices.disable();
    })
     return modalBody
  }
