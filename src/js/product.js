// ============================================================
// CONNIECOMES BEAUTY SALON
// PRODUCT PAGE
// ============================================================

function getProductImage(category) {

    const imageLibrary =
        document.getElementById(
            "imageLibrary"
        );


    if (!imageLibrary) {
        return "";
    }


    const image =
        imageLibrary.dataset[
            category
        ];


    return image || "";
}


async function loadProductPage() {

    const productContainer =
        document.getElementById(
            "product"
        );


    if (!productContainer) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    if (!productId) {

        productContainer.innerHTML =
            "<h1>Product not found</h1>";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/products/${encodeURIComponent(productId)}`
            );


        const product =
            await response.json();


        if (!response.ok) {

            throw new Error(
                product.detail ||
                "Unable to load product."
            );
        }


        const image =
            getProductImage(
                product.category
            );


        productContainer.innerHTML = `
            <div class="split">

                <div class="image-frame">

                    <img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(product.name)}"
                    >

                </div>

                <div>

                    <p class="eyebrow">
                        ${escapeHTML(product.category)}
                    </p>

                    <h1>
                        ${escapeHTML(product.name)}
                    </h1>

                    <h2>
                        ${money(product.price)}
                    </h2>

                    <p>
                        ${escapeHTML(product.description || "")}
                    </p>

                    <p class="muted">
                        Stock availability and final pricing
                        will be validated by the backend.
                    </p>

                    <button
                        class="btn add-to-cart"
                        type="button"
                        data-product-id="${product.id}"
                    >
                        Add to cart
                    </button>

                    <a
                        class="btn btn-outline"
                        href="cart.html"
                    >
                        View cart
                    </a>

                </div>

            </div>
        `;


        initializeAddToCartButtons();

    } catch (error) {

        console.error(
            "PRODUCT PAGE ERROR:",
            error
        );


        productContainer.innerHTML = `
            <div class="notice">

                <h2>
                    Product unavailable
                </h2>

                <p>
                    ${escapeHTML(error.message)}
                </p>

                <a
                    class="btn"
                    href="shop.html"
                >
                    Return to shop
                </a>

            </div>
        `;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadProductPage
);
