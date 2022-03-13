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

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  // coloque seu código aqui
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
        resolve(xhr.response);
      }
    };

    xhr.open(`${verb}`, `${url}${query}`);
    xhr.send();
  });
}

function setItemsInContainer(response) {
  if (response === undefined) return;

  const itemContainer = document.querySelector('.items');
  const jsonResponse = JSON.parse(response);
  jsonResponse.results.forEach((item) => {
    const contract = {
      sku: item.id,
      name: item.title,
      image: item.thumbnail,
    };
    itemContainer.appendChild(createProductItemElement(contract));
  });
}

function fetchListItems(verb = 'GET', query = 'computador') {
  const fetch = sendRequest('GET',
      'https://api.mercadolibre.com/sites/MLB/search',
      `?q=${query}&sort=id_asc`)
      .then((response) => setItemsInContainer(response));
}

window.onload = () => {
  fetchListItems();
};
