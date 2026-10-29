import { API_BASE_URL } from "./config.js";
import { escapeHTML } from "./utils.js";


function imageURL(value) {
    if (!value) {
        return "";
    }

    if (/^(https?:|data:)/i.test(value) || value.startsWith("../")) {
        return value;
    }

    return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}


function typeForCategory(name) {
    const value = String(name || "").toLowerCase();
    if (value.includes("frontal")) return "frontal";
    if (value.includes("closure")) return "closure";
    if (value.includes("bundle")) return "bundle";
    if (value.includes("wig")) return "wig-cap";
    return "all";
}


function initializeCatalogPages() {
    const shopGrid = document.getElementById("productGrid");
    const categoryGrid = document.getElementById("categoryProducts");
    const serviceGrid = document.getElementById("serviceGrid");
    if (shopGrid || categoryGrid) {
        const grids = [shopGrid, categoryGrid].filter(Boolean);
        grids.forEach((grid) => grid.replaceChildren());
        fetch(`${API_BASE_URL}/products`)
            .then(async (response) => {
                if (!response.ok) throw new Error("Could not load products.");
                return response.json();
            })
            .then((products) => {
            grids.forEach((grid) => {
                grid.replaceChildren();
                products.forEach((product) => {
                    const categoryNames = (product.categories || []).map((category) => category.name);
                    if (!categoryNames.length && product.category?.name) {
                        categoryNames.push(product.category.name);
                    }
                    const categoryName = product.category?.name || categoryNames[0] || "Product";
                    const colors = [...new Set((product.variants || []).map((variant) => variant.color))];
                    const lengths = (product.variants || []).map((variant) => variant.length_inches);
                    const searchableText = [
                        product.name,
                        product.description,
                        categoryNames.join(" "),
                        categoryName,
                        colors.join(" "),
                    ].filter(Boolean).join(" ").toLowerCase();
                    const inferTexture = () => {
                        if (searchableText.includes("straight") || searchableText.includes("bone straight")) return "straight";
                        if (searchableText.includes("body wave") || searchableText.includes("bodywave") || searchableText.includes("body-wave")) return "bodywave";
                        if (searchableText.includes("curly") || searchableText.includes("deep wave") || searchableText.includes("deepwave") || searchableText.includes("pixie") || searchableText.includes("burmese")) return "curly";
                        return "all";
                    };
                    const inferStyle = () => {
                        const texture = inferTexture();
                        if (texture === "curly") {
                            if (searchableText.includes("pixie")) return "pixie";
                            if (searchableText.includes("deep wave") || searchableText.includes("deepwave")) return "deepwave";
                            if (searchableText.includes("burmese")) return "burmese";
                        }
                        if (texture === "bodywave") {
                            if (searchableText.includes("super double drawn") || searchableText.includes("sdd")) return "sdd";
                            if (searchableText.includes("double drawn") || searchableText.includes(" dd")) return "dd";
                            if (searchableText.includes("single drawn")) return "single-drawn";
                        }
                        if (texture === "straight") {
                            if (searchableText.includes("silky straight") && (searchableText.includes("super double drawn") || searchableText.includes("sdd"))) return "silky-straight-sdd";
                            if (searchableText.includes("silky straight") && (searchableText.includes("double drawn") || searchableText.includes("dd"))) return "silky-straight-dd";
                            if (searchableText.includes("bone straight") || searchableText.includes("bonestraight")) return "bone-straight";
                        }
                        return "all";
                    };
                    const variantSummary = colors.length
                        ? `<p class="muted">${colors.length} colors · ${Math.min(...lengths)}–${Math.max(...lengths)} in</p>`
                        : "";
                    const card = document.createElement("article");
                    card.className = "product-card category-product";
                    card.dataset.productId = product.id;
                    card.dataset.type = typeForCategory(categoryNames.join(" ") || categoryName);
                    card.dataset.price = product.price;
                    card.dataset.length = product.length_inches || "";
                    card.dataset.lengths = (product.variants || []).map((variant) => variant.length_inches).join(",");
                    card.dataset.search = searchableText;
                    card.dataset.texture = inferTexture();
                    card.dataset.style = inferStyle();
                    card.dataset.category = categoryName.toLowerCase().replaceAll(" ", "-");
                    card.dataset.categories = categoryNames
                        .map((name) => name.toLowerCase().replaceAll(" ", "-"))
                        .join(",");
                    const source = imageURL(product.image_url);
                    card.innerHTML = `
                        <div class="product-image${source ? "" : " image-placeholder"}">${source ? `<img src="${escapeHTML(source)}" alt="${escapeHTML(product.name)}">` : ""}</div>
                        <div class="product-info">
                            <p class="eyebrow">${escapeHTML(categoryNames.join(" · ") || categoryName || "Product")}</p>
                            <h3><a href="product.html?id=${product.id}">${escapeHTML(product.name)}</a></h3>
                            <p>${escapeHTML(product.description || "Premium Conniecomes product.")}</p>
                            ${variantSummary}
                            <strong>GHS ${Number(product.price).toFixed(2)}</strong>
                            <a class="text-button" href="product.html?id=${product.id}">View product</a>
                            ${(product.variants || []).length
                                ? `<a class="btn" href="product.html?id=${product.id}">Choose options</a>`
                                : `<button class="btn add-to-cart" type="button" data-product-id="${product.id}">Add to Cart</button>`}
                        </div>`;
                    const searchQuery = new URLSearchParams(window.location.search).get("q")?.trim().toLowerCase() || "";
                    if (grid === shopGrid && searchQuery) {
                        card.classList.toggle("hidden", !searchableText.includes(searchQuery));
                    }
                    grid.append(card);
                });
                if (!products.length) {
                    const emptyState = document.createElement("p");
                    emptyState.className = "dashboard-empty catalog-empty";
                    emptyState.textContent = "No products are currently available.";
                    grid.append(emptyState);
                }
            });
            document.dispatchEvent(new Event("catalog-updated"));
        }).catch((error) => {
            grids.forEach((grid) => {
                const errorState = document.createElement("p");
                errorState.className = "notice catalog-error";
                errorState.textContent = "Product catalog is unavailable. Please try again later.";
                grid.replaceChildren(errorState);
            });
            console.warn("Could not load database products:", error);
        });
    }

    if (serviceGrid) {
        fetch(`${API_BASE_URL}/services`)
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((services) => {
                serviceGrid.innerHTML = services.map((service) => {
                    const source = imageURL(service.image_url);
                    return `<article class="product-card">
                        <div class="image-frame">${source ? `<img src="${escapeHTML(source)}" alt="${escapeHTML(service.name)}">` : ""}</div>
                        <div class="product-info"><h3>${escapeHTML(service.name)}</h3><p class="muted">${escapeHTML(service.description || "Professional Conniecomes service.")}</p><a class="btn" href="booking.html">Book</a></div>
                    </article>`;
                }).join("");
            })
            .catch((error) => console.warn("Could not load database services:", error));
    }
}


export { initializeCatalogPages };