const addButton = document.querySelector('#add');

const modal = document.querySelector('.modal');
const errorContainer = document.querySelector('#error');
const reservationsContainer = document.querySelector('#reservations');

const form = document.querySelector('form');
const cancelButton = document.querySelector('#cancel');
const resourceInput = document.querySelector('select[name="resource"]');
const fromInput = document.querySelector('input[name="from"]');
const toInput = document.querySelector('input[name="to"]');
const submitButton = document.querySelector('#submit');
const csrfTokenInput = document.querySelector('#csrfToken');

loadReservations();

if(addButton) {
  addButton.addEventListener('click', async () => {
    enableForm(false);
    errorContainer.textContent = '';
    if(!await loadResources()) {
      return;
    }
    fromInput.value = '';
    toInput.value = '';
    enableForm(true);
    modal.classList.add('open');
  });
}

cancelButton.addEventListener('click', () => {
  modal.classList.remove('open');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const response = await fetch('/api/reservations', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      csrfToken: csrfTokenInput.value,
      resourceId: resourceInput.value,
      from: fromInput.value,
      to: toInput.value
    })
  });
  try {
    const data = await response.json();
    if(!data || data.error) {
      errorContainer.textContent = data.error ? data.error : 'Something went wrong'
      return;
    }
    reservationsContainer.append(createReservationElement(data));
    modal.classList.remove('open');
  }
  catch {
    errorContainer.textContent = 'Something went wrong'
  }
});

function enableForm(enabled) {
  resourceInput.disabled = !enabled;
  fromInput.disabled = !enabled;
  toInput.disabled = !enabled;
  submitButton.disabled = !enabled;
  cancelButton.disabled = !enabled;
}

async function loadResources() {
  const response = await fetch('/api/resources');
  const data = await response.json();
  if(!Array.isArray(data) || data.error) {
    alert('Something went wrong loading resources..');
    return false;
  }
  if(data.length === 0) {
    alert('No resources available');
    return;
  }
  resourceInput.innerHTML = data.map(resource => `
    <option value="${resource.id}">${resource.name}</option>
  `);
  return true;
}

async function loadReservations() {
  const response = await fetch('/api/reservations');
  if(!response) {
    alert('Could not load reservations');
    return;
  }
  const data = await response.json();
  if(!data || data.error || !Array.isArray(data)) {
    reservationsContainer.textContent = data.error ? data.error : 'Something went wrong loading reservations..';
    return;
  }
  while (reservationsContainer.firstChild) {
    reservationsContainer.removeChild(reservationsContainer.firstChild);
  }
  for(let i = 0; i < data.length; i++) {
    const element = createReservationElement(data[i]);
    reservationsContainer.append(element);
  }
}

function createReservationElement(reservation) {
  const container = document.createElement('div');
  container.classList.add('reservation');

  const toolbar = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = reservation.resourceName;
  toolbar.append(title);

  if(reservation.reserver) {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>';
    toolbar.append(deleteButton);
    
    deleteButton.addEventListener('click', async () => {
      deleteButton.disabled = true;
      const deletedId = await deleteReservation(reservation.id);
      deleteButton.disabled = false;
      if(deletedId) {
        reservationsContainer.removeChild(container);
      }
    });
  }

  container.append(toolbar);

  const dateContainer = document.createElement('p');
  dateContainer.innerHTML = `
    <span><strong>From:</strong> ${toYearMonthDay(new Date(reservation.startDate))}</span>
    <span><strong>To:</strong> ${toYearMonthDay(new Date(reservation.endDate))}</span>
  `;
  container.append(dateContainer);

  if(reservation.reserver) {
    const reserverContainer = document.createElement('p');
    reserverContainer.innerHTML = `<strong>Reserver:</strong> ${reservation.reserver}`
    container.append(reserverContainer)
  }

  return container;
}

function toYearMonthDay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function deleteReservation(id) {
  const response = await fetch('/api/reservations?id=' + id, {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfTokenInput.value
    }
  });
  const data = await response.json();
  console.log(data);
  return data.id;
}
