import { API_BASE_URL } from "./config.js";
import { escapeAttribute, escapeHTML, money } from "./utils.js";


function imageUrl(value) {
    if (!value) return "";
    if (/^(https?:|data:)/i.test(value)) return value;
    if (value.startsWith("../")) return value;
    return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}


async function loadProduct() {
    const container = document.getElementById("product");
    if (!container) return;

    const productId = new URLSearchParams(location.search).get("id");
    if (!productId) {
        showError(container, "Choose a product from the shop to view its details.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`);
        const product = await response.json();
        if (!response.ok) throw new Error(product.detail || "Unable to load this product.");
        renderProduct(container, product);
    } catch (error) {
        showError(container, error.message);
    }
}


function showError(container, message) {
    container.innerHTML = `<div class="notice"><h2>Product unavailable</h2><p>${escapeHTML(message)}</p><a class="btn" href="shop.html">Return to shop</a></div>`;
}


function renderProduct(container, product) {
    const categoryNames = (product.categories || []).map((category) => category.name);
    if (!categoryNames.length && product.category?.name) {
        categoryNames.push(product.category.name);
    }
    const categoryLabel = categoryNames.join(" · ") || "Conniecomes Collection";
    const variants = (product.variants || []).filter((variant) =>
        variant.is_active && variant.images && variant.images.length,
    );
    let selectedVariant = variants[0] || null;
    let selectedImage = "";

    function swatchKey(color) {
        return color.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    function availableColors() {
        return [...new Set(variants.map((variant) => variant.color))];
    }

    function render() {
        const activeColor = selectedVariant?.color;
        const activeImages = selectedVariant?.images || (product.image_url ? [{ image_url: product.image_url }] : []);
        if (!activeImages.some((image) => image.image_url === selectedImage)) {
            selectedImage = activeImages[0]?.image_url || "";
        }

        const colors = availableColors();
        const allLengths = [...new Set(variants.map((variant) => variant.length_inches))].sort((a, b) => a - b);
        const stock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
        const price = selectedVariant?.price ?? product.price;
        const selectedTitle = selectedVariant
            ? `${selectedVariant.color} · ${selectedVariant.length_inches} inches`
            : "Standard product";
        const imagesHtml = activeImages.length
            ? `<div class="variant-gallery">
                <div class="variant-gallery-main"><img id="variantMainImage" src="${escapeAttribute(imageUrl(selectedImage))}" alt="${escapeAttribute(`${product.name} ${selectedTitle}`)}"></div>
                <div class="variant-gallery-thumbs" aria-label="Product images">${activeImages.map((image, index) => `<button type="button" class="variant-thumb ${image.image_url === selectedImage ? "active" : ""}" data-gallery-image="${escapeAttribute(image.image_url)}" aria-label="View product image ${index + 1}"><img src="${escapeAttribute(imageUrl(image.image_url))}" alt=""></button>`).join("")}</div>
              </div>`
            : `<div class="image-frame"><img src="${escapeAttribute(imageUrl(product.image_url))}" alt="${escapeAttribute(product.name)}"></div>`;

        container.innerHTML = `
          <div class="product-detail-layout">
            <div class="product-detail-gallery">${imagesHtml}</div>
            <div class="product-detail-info">
              <p class="eyebrow">${escapeHTML(categoryLabel)}</p>
              <h1>${escapeHTML(product.name)}</h1>
              <p class="product-detail-description">${escapeHTML(product.description || "")}</p>
              <p class="product-detail-price">${money(price)}</p>
              ${variants.length ? `
                <fieldset class="variant-fieldset">
                  <legend>Color <span>${escapeHTML(activeColor || "")}</span></legend>
                  <div class="variant-color-options">${colors.map((color) => {
                                        return `<button type="button" class="variant-color ${color === activeColor ? "selected" : ""}" data-variant-color="${escapeAttribute(color)}" aria-pressed="${color === activeColor}" title="${escapeAttribute(color)}"><span class="variant-swatch" data-swatch="${escapeAttribute(swatchKey(color))}"></span><span>${escapeHTML(color)}</span></button>`;
                  }).join("")}</div>
                </fieldset>
                <fieldset class="variant-fieldset">
                  <legend>Length <span>${selectedVariant ? `${selectedVariant.length_inches} inches` : ""}</span></legend>
                  <div class="variant-length-options">${allLengths.map((length) => {
                    const combination = variants.find((variant) => variant.color === activeColor && variant.length_inches === length);
                    const isSelected = selectedVariant?.length_inches === length;
                    return `<button type="button" class="variant-length ${isSelected ? "selected" : ""}" data-variant-length="${length}" aria-pressed="${isSelected}" ${combination ? "" : "disabled aria-disabled=\"true\""}>${length}&quot;</button>`;
                  }).join("")}</div>
                </fieldset>
                <p class="variant-selected">Selected: <strong>${escapeHTML(selectedTitle)}</strong></p>
              ` : ""}
              <p class="variant-stock ${stock > 0 ? "" : "out-of-stock"}">${stock > 0 ? `${stock} available` : "Out of stock"}</p>
              <div class="variant-purchase-row">
                <label for="productQuantity">Qty</label>
                <input id="productQuantity" type="number" min="1" max="${Math.max(stock, 1)}" value="1" ${stock > 0 ? "" : "disabled"}>
                <button class="btn add-to-cart" type="button" data-product-id="${product.id}" ${selectedVariant ? `data-variant-id="${selectedVariant.id}"` : ""} data-quantity="1" ${stock > 0 ? "" : "disabled"}>Add to Cart</button>
              </div>
              <a class="btn btn-outline" href="cart.html">View Cart</a>
            </div>
          </div>`;

        container.querySelectorAll("[data-gallery-image]").forEach((button) => {
            button.addEventListener("click", () => {
                selectedImage = button.dataset.galleryImage;
                render();
            });
        });

        container.querySelectorAll("[data-variant-color]").forEach((button) => {
            button.addEventListener("click", () => {
                const color = button.dataset.variantColor;
                const sameLength = variants.find((variant) =>
                    variant.color === color && variant.length_inches === selectedVariant?.length_inches,
                );
                selectedVariant = sameLength || variants.find((variant) => variant.color === color);
                selectedImage = "";
                render();
            });
        });

        container.querySelectorAll("[data-variant-length]:not(:disabled)").forEach((button) => {
            button.addEventListener("click", () => {
                selectedVariant = variants.find((variant) =>
                    variant.color === activeColor && variant.length_inches === Number(button.dataset.variantLength),
                );
                selectedImage = "";
                render();
            });
        });

        const quantityInput = container.querySelector("#productQuantity");
        const addButton = container.querySelector(".add-to-cart");
        quantityInput?.addEventListener("input", () => {
            const quantity = Math.max(1, Math.min(stock, Number(quantityInput.value) || 1));
            quantityInput.value = quantity;
            addButton.dataset.quantity = String(quantity);
            addButton.disabled = stock < 1;
        });
    }

    render();
}


document.addEventListener("DOMContentLoaded", loadProduct);