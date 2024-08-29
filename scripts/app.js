const spaceId = window.config.CONTENTFUL_SPACE_ID;
const accessToken = window.config.CONTENTFUL_ACCESS_TOKEN;
const environment = window.config.CONTENTFUL_ENVIRONMENT;

const apiUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?access_token=${accessToken}`;

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos de la API:', data);
        if (data.items) {
            renderProducts(data.items);
        } else {
            console.error('No se encontraron productos');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function getImageUrl(assetId) {
    const assetUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/assets/${assetId}?access_token=${accessToken}`;
    const response = await fetch(assetUrl);
    if (!response.ok) {
        throw new Error(`Error fetching asset: ${response.status}`);
    }
    const assetData = await response.json();
    return assetData.fields.file.url; 
}

async function renderProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; 

    for (const product of products) {
        const { fields } = product;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        let imageUrl = '';
        if (fields.imagen && fields.imagen.sys && fields.imagen.sys.id) {
            imageUrl = await getImageUrl(fields.imagen.sys.id);
        } else {
            console.warn('Imagen no disponible para el producto:', fields.nombreDelProducto);
        }

        productCard.innerHTML = `
            <img src="${imageUrl}" alt="${fields.nombreDelProducto}" />
            <h2>${fields.nombreDelProducto}</h2>
            <p>Precio: $${fields.precio}</p>
            <p>Categoría: ${fields.categoria}</p>
            <p>${fields.descripcion}</p>
            <button>Ver detalles</button>
        `;

        productCard.onclick = function() {
            openModal(
                product.sys.id,
                imageUrl,
                fields.nombreDelProducto,
                fields.descripcion,
                fields.precio
            );
        };

        productList.appendChild(productCard);
    }
}

function openModal(productId, imageUrl, nombre, descripcion, precio) {
    const modal = document.getElementById('product-detail-modal');
    document.getElementById('detail-product-image').src = imageUrl; 
    document.getElementById('detail-product-name').textContent = nombre;
    document.getElementById('detail-product-description').textContent = descripcion;
    document.getElementById('detail-product-price').textContent = `Precio: $${precio}`;

    if (typeof gtag === 'function') {
        gtag('event', 'details', {
            'name': nombre
        });
    } else {
        console.error('gtag no está definido');
    }

    const buyButton = document.getElementById('buy-button');
    buyButton.onclick = function() {
        if (typeof gtag === 'function') {
            gtag('event', 'sells', {
                'name': nombre,
                'id': productId,
                'value': precio,
            });
        } else {
            console.error('gtag no está definido');
        }
        alert(`${nombre} ha sido agregado al carrito!`);
    };

    modal.style.display = 'block';
}

document.getElementById('close-detail-modal').onclick = function() {
    document.getElementById('product-detail-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('product-detail-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

fetchProducts();
