function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  const buttonAddCart = createCustomElement('button', 'item__add', ' ');

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  section.appendChild(buttonAddCart);
  buttonAddCart.addEventListener('click', addInCart);
  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  const element = event.target;
  const skuText = element.textContent.split('|');

  const local = JSON.parse(localStorage.getItem('cart'));
  const sku = local.find((item) => item.sku === skuText[0].substring(4).trim());

  local.splice(local.indexOf(sku), 1);
  localStorage.setItem('cart', JSON.stringify(local));

  setItemsInCart();
}

function setLoadDisplay(bool = true) {
  const container = document.querySelector('.container-items');
  if (bool) {
    container.prepend(createCustomElement('section', 'loading', 'Loading'));
  } else {
    document.querySelector('.loading').remove();
  }
}

function asyncSum() {
  const items = localStorage.getItem('cart');
  const elementTotalPrice = document.querySelector('.total-price');

  if (items === null || items === '' || items === undefined) {
    elementTotalPrice.textContent = 0;
    return;
  }

  const sumPromise = () => new Promise((resolve, reject) => {
    resolve(JSON.parse(items).reduce((acum, item) => acum + item.salePrice, 0));
  });
  sumPromise()
      .then(function (response) {
        elementTotalPrice.textContent = response;
      }).catch((error) => console.log(error));
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function sendRequest(verb, url, query) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        setLoadDisplay(false);
        resolve(JSON.parse(xhr.response));
      }
    };

    xhr.open(`${verb}`, `${url}${query}`);
    xhr.send();
  });
}

function setItemsInContainer(response) {
  if (response === undefined) return;

  const itemContainer = document.querySelector('.items');

  response.results.forEach((item) => {
    const contract = {
      sku: item.id,
      name: item.title,
      image: item.thumbnail,
    };
    itemContainer.appendChild(createProductItemElement(contract));
  });
}

function fetchListItems(verb = 'GET', query = 'computador') {
  setLoadDisplay();
  sendRequest('GET',
      'https://api.mercadolibre.com/sites/MLB/search',
      `?q=${query}&sort=id_asc`)
      .then((response) => setItemsInContainer(response));
}

function setItemsInCart() {
  const cartDom = document.querySelector('.cart__items');
  const itemsInStorage = localStorage.getItem('cart');
  const cartItems = itemsInStorage !== null ? JSON.parse(itemsInStorage) : [];
  cartDom.innerHTML = '';

  cartItems.forEach((item) => {
    cartDom.appendChild(createCartItemElement(item));
  });

  asyncSum();
}

function setItemInStorage(response) {
  const getItemsInStorage = localStorage.getItem('cart');
  const itemsInStorage = getItemsInStorage !== null ? JSON.parse(getItemsInStorage) : [];

  const find = itemsInStorage.find((item) => item.sku === response.id);

  if (!find) {
    itemsInStorage.push({
      sku: response.id,
      salePrice: response.price,
      name: response.title,
    });

    localStorage.setItem('cart', JSON.stringify(itemsInStorage));
    setItemsInCart();
  }
}

function getItem(item) {
  setLoadDisplay();
  sendRequest('GET',
      `https://api.mercadolibre.com/items/${item}`,
      '')
      .then((response) => setItemInStorage(response));
}

function addInCart(event) {
  const parent = event.target.parentElement;
  getItem(getSkuFromProductItem(parent));
}

window.onload = () => {
  setItemsInCart();
  fetchListItems();

  document.querySelector('.empty-cart').addEventListener('click', () => {
    localStorage.removeItem('cart');
    setItemsInCart();
  });
};
