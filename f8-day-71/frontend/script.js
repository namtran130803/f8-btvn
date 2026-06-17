const healthStatus = document.querySelector('#healthStatus');
const itemsList = document.querySelector('#itemsList');
const itemForm = document.querySelector('#itemForm');
const itemName = document.querySelector('#itemName');
const message = document.querySelector('#message');
const reloadButton = document.querySelector('#reloadButton');

const apiBaseUrl = '/api';

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

function createEmptyItem(text) {
  const emptyItem = document.createElement('li');
  emptyItem.className = 'empty';
  emptyItem.textContent = text;
  return emptyItem;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

async function checkHealth() {
  try {
    const response = await fetch(`${apiBaseUrl}/health`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Backend error');
    }

    healthStatus.textContent = `DB: ${data.db}`;
    healthStatus.className = 'status connected';
  } catch (error) {
    healthStatus.textContent = 'Backend disconnected';
    healthStatus.className = 'status error';
  }
}

async function loadItems() {
  try {
    const response = await fetch(`${apiBaseUrl}/items`);
    const items = await response.json();

    if (!response.ok) {
      throw new Error(items.error || 'Cannot load items');
    }

    if (items.length === 0) {
      itemsList.replaceChildren(createEmptyItem('Chưa có item nào trong database.'));
      return;
    }

    const itemElements = items.map((item) => {
      const itemElement = document.createElement('li');
      itemElement.className = 'item';

      const itemNameElement = document.createElement('span');
      itemNameElement.className = 'item-name';
      itemNameElement.textContent = item.name;

      const itemDateElement = document.createElement('span');
      itemDateElement.className = 'item-date';
      itemDateElement.textContent = formatDate(item.created_at);

      itemElement.append(itemNameElement, itemDateElement);
      return itemElement;
    });

    itemsList.replaceChildren(...itemElements);
  } catch (error) {
    itemsList.replaceChildren(createEmptyItem(error.message));
  }
}

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = itemName.value.trim();
  if (!name) {
    setMessage('Vui lòng nhập tên item.', true);
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Cannot create item');
    }

    itemName.value = '';
    setMessage(`Đã thêm "${data.name}" vào database.`);
    await loadItems();
  } catch (error) {
    setMessage(error.message, true);
  }
});

reloadButton.addEventListener('click', () => {
  checkHealth();
  loadItems();
});

checkHealth();
loadItems();
