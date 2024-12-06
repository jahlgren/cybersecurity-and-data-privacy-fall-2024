const modal = document.querySelector('.modal');
const addButton = document.querySelector('#add')
const cancelButton = document.querySelector('#cancel');

const form = document.querySelector('form');
const nameInput = document.querySelector('input[name="name"]');
const csrfTokenInput = document.querySelector('input[name="csrfToken"]');
const descriptionInput = document.querySelector('textarea');
const submitButton = document.querySelector('form button[type="submit"]')

const errorContainer = document.querySelector('#error');
const resourcesContainer = document.querySelector('#resources');

get();

addButton.addEventListener('click', () => {
  modal.classList.add('open');
  errorContainer.textContent = '';
  enableForm(true);
  validateInput();
  nameInput.value = descriptionInput.value = '';
});

cancelButton.addEventListener('click', () => {
  modal.classList.remove('open');
});

nameInput.addEventListener('input', validateInput);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!validateInput())
    return;
  await post();
});

function validateInput() {
  const valid = nameInput.value.length > 0;
  submitButton.disabled = !valid;
  return valid;
}

function enableForm(enabled) {
  nameInput.disabled = !enabled;
  descriptionInput.disabled = !enabled;
  submitButton.disabled = !enabled;
  cancelButton.disabled = !enabled;
}

async function get() {
  const response = await fetch('/api/resources');
  if(!response) {
    resourcesContainer.textContent = 'Something went wrong..';
    return;
  }
  const data = await response.json();
  if(!data || data.error || !Array.isArray(data)) {
    resourcesContainer.textContent = data.error ? data.error : 'Something went wrong..';
    return;
  }
  while (resourcesContainer.firstChild) {
    resourcesContainer.removeChild(resourcesContainer.firstChild);
  }
  for(let i = 0; i < data.length; i++)
    resourcesContainer.append(createResourceElement(data[i].id, data[i].name, data[i].description));
}

async function post() {
  enableForm(false);
  const response = await fetch('/api/resources', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: nameInput.value,
      description: descriptionInput.value,
      csrfToken: csrfTokenInput.value
    })
  });

  enableForm(true);

  if(!response) {
    errorContainer.textContent = 'Something went wrong..'
    return;
  }

  const data = await response.json();
  if(!data || data.error) {
    errorContainer.textContent = data.error ? data.error : 'Something went wrong..';
    return;
  }

  const element = createResourceElement(data.id, data.name, data.description);
  resourcesContainer.append(element);
  modal.classList.remove('open');
}

async function deleteResource(id) {
  const response = await fetch('/api/resources?id=' + id + '&csrfToken=' + csrfTokenInput.value, {
    method: 'delete'
  });
  const data = await response.json();
  return data.id;
}

function createResourceElement(id, name, description) {
  const container = document.createElement('div');
  container.classList.add('resource');

  const toolbar = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = name;
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>';
  toolbar.append(title);
  toolbar.append(deleteButton);

  container.append(toolbar);
  
  if(description) {
    const p = document.createElement('p');
    p.textContent = description;
    container.append(p);
  }
  
  deleteButton.addEventListener('click', async () => {
    deleteButton.disabled = true;
    const deletedId = await deleteResource(id);
    deleteButton.disabled = false;
    if(deletedId) {
      resourcesContainer.removeChild(container);
    }
  });

  return container;
}