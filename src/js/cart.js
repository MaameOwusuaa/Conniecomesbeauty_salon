import { API_BASE_URL } from "./config.js";
import { getGuestSessionId } from "./guest-session.js";
import { escapeHTML, escapeAttribute, money } from "./utils.js";

async function cartRequest(url, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.delete("Authorization");
    headers.set("X-Guest-Session", getGuestSessionId());
    return fetch(url, { ...options, headers });
}

// ============================================================
// ADD TO CART BUTTONS
//
// Products and images remain inside HTML.
// ============================================================

function initializeAddToCartButtons() {
    document.addEventListener("click", async function (event) {
        const button = event.target.closest(".add-to-cart");
        if (!button) return;

        const productId = Number(button.dataset.productId);
        if (!productId) {
            console.error("Product ID is missing.");
            return;
        }

        const variantId = button.dataset.variantId ? Number(button.dataset.variantId) : null;
        const quantity = Number(button.dataset.quantity || 1);
        await addToCart(productId, button, variantId, quantity);
    });
}


// ============================================================
// ADD PRODUCT TO CART
// ============================================================

async function addToCart(
    productId,
    button,
    variantId = null,
    quantity = 1
) {

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Adding...";
    }


    try {

        const response =
            await cartRequest(
                `${API_BASE_URL}/cart/items`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",


                    },

                    body: JSON.stringify({

                        product_id:
                            productId,

                        variant_id:
                            variantId,

                        quantity:
                            quantity
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to add product to cart."
            );
        }


        alert(
            "Product added to cart."
        );


        await updateCartCount();


        if (button) {

            button.textContent =
                "Added to Cart";


            setTimeout(
                function () {

                    button.textContent =
                        "Add to Cart";

                    button.disabled =
                        false;

                },
                1500
            );
        }
    }


    catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );


        alert(
            error.message
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Add to Cart";
        }
    }
}


// ============================================================
// CART COUNT
// ============================================================

async function updateCartCount() {

    const cartCountElements =
        document.querySelectorAll(
            "#cartCount"
        );


    if (!cartCountElements.length) {
        return;
    }


    try {

        const response =
            await cartRequest(
                `${API_BASE_URL}/cart`,
                {
                    headers: {


                    }
                }
            );


        if (!response.ok) {

            cartCountElements.forEach(
                function (element) {

                    element.textContent =
                        "0";
                }
            );

            return;
        }


        const cart =
            await response.json();


        const totalQuantity =
            (
                cart.cart_items || []
            ).reduce(
                function (
                    total,
                    item
                ) {

                    return total +
                        Number(
                            item.quantity || 0
                        );
                },
                0
            );


        cartCountElements.forEach(
            function (element) {

                element.textContent =
                    totalQuantity;
            }
        );
    }


    catch (error) {

        console.error(
            "CART COUNT ERROR:",
            error
        );


        cartCountElements.forEach(
            function (element) {

                element.textContent =
                    "0";
            }
        );
    }
}


// ============================================================
// CART PAGE
// ============================================================

async function loadCartPage() {

    const cartElement =
        document.getElementById(
            "cart"
        );


    if (!cartElement) {
        return;
    }


    try {

        const response =
            await cartRequest(
                `${API_BASE_URL}/cart`,
                {
                    headers: {


                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load cart."
            );
        }


        renderCart(
            data
        );
    }


    catch (error) {

        console.error(
            "LOAD CART ERROR:",
            error
        );


        cartElement.innerHTML = `
            <div class="notice">
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;
    }
}


// ============================================================
// RENDER CART
// ============================================================

function renderCart(cart) {

    const cartElement =
        document.getElementById(
            "cart"
        );


    if (!cartElement) {
        return;
    }


    const items =
        cart.cart_items || [];


    if (!items.length) {

        cartElement.innerHTML = `
            <div class="notice">
                Your cart is empty.
                <a href="shop.html">
                    Continue shopping
                </a>.
            </div>
        `;

        return;
    }


    let total = 0;


    const itemsHTML =
        items.map(
            function (item) {

                const product =
                    item.product || {};

                const variant =
                    item.variant || null;


                const price =
                    variant && variant.price !== null
                        ? Number(variant.price)
                        : Number(product.price || 0);


                const quantity =
                    Number(
                        item.quantity || 0
                    );


                const subtotal =
                    price * quantity;


                total += subtotal;


                const image =
                    variant?.images?.[0]?.image_url ||
                    (product.image_url && !product.image_url.includes("example.com")
                        ? product.image_url
                        : "https://placehold.co/900x1100/d4b6a8/ffffff?text=Wig");


                return `
                    <div class="cart-row">

                        <div class="image-frame">

                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(
                                    product.name ||
                                    "Product"
                                )}"
                            >

                        </div>


                        <div>

                            <h3>
                                ${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}
                            </h3>

                            ${variant ? `<p class="muted">${escapeHTML(variant.color)} · ${Number(variant.length_inches)} inches</p>` : ""}

                            <div>
                                ${money(price)}
                            </div>

                        </div>


                        <div class="qty">

                            <button
                                type="button"
                                class="quantity-decrease"
                                data-cart-item-id="${item.id}"
                                data-quantity="${quantity - 1}"
                            >
                                −
                            </button>


                            <span>
                                ${quantity}
                            </span>


                            <button
                                type="button"
                                class="quantity-increase"
                                data-cart-item-id="${item.id}"
                                data-quantity="${quantity + 1}"
                            >
                                +
                            </button>

                        </div>


                        <div>
                            ${money(subtotal)}
                        </div>


                        <button
                            type="button"
                            class="remove-cart-item filter"
                            data-cart-item-id="${item.id}"
                        >
                            Remove
                        </button>

                    </div>
                `;
            }
        ).join("");


    cartElement.innerHTML = `

        <div class="cart-items">

            ${itemsHTML}

        </div>


        <div class="summary">

            <div class="summary-line">

                <span>
                    Subtotal
                </span>

                <span>
                    ${money(total)}
                </span>

            </div>


            <div class="summary-line">

                <span>
                    Delivery
                </span>

                <span>
                    Calculated at checkout
                </span>

            </div>


            <div class="total summary-line">

                <span>
                    Total
                </span>

                <span>
                    ${money(total)}
                </span>

            </div>


            <a
                class="btn"
                href="checkout.html"
            >
                Proceed to Checkout
            </a>

        </div>
    `;


    initializeCartButtons();
}


// ============================================================
// CART BUTTONS
// ============================================================

function initializeCartButtons() {

    const decreaseButtons =
        document.querySelectorAll(
            ".quantity-decrease"
        );


    decreaseButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const cartItemId =
                        Number(
                            button.dataset.cartItemId
                        );


                    const quantity =
                        Number(
                            button.dataset.quantity
                        );


                    await updateCartItem(
                        cartItemId,
                        quantity
                    );
                }
            );
        }
    );


    const increaseButtons =
        document.querySelectorAll(
            ".quantity-increase"
        );


    increaseButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const cartItemId =
                        Number(
                            button.dataset.cartItemId
                        );


                    const quantity =
                        Number(
                            button.dataset.quantity
                        );


                    await updateCartItem(
                        cartItemId,
                        quantity
                    );
                }
            );
        }
    );


    const removeButtons =
        document.querySelectorAll(
            ".remove-cart-item"
        );


    removeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const cartItemId =
                        Number(
                            button.dataset.cartItemId
                        );


                    await removeCartItem(
                        cartItemId
                    );
                }
            );
        }
    );
}


// ============================================================
// UPDATE CART ITEM
// ============================================================

async function updateCartItem(
    cartItemId,
    quantity
) {

    if (quantity < 1) {

        await removeCartItem(
            cartItemId
        );

        return;
    }


    try {

        const response =
            await cartRequest(
                `${API_BASE_URL}/cart/items/${cartItemId}`,
                {
                    method: "PUT",

                    headers: {



                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        quantity:
                            quantity
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to update cart."
            );
        }


        await loadCartPage();

        await updateCartCount();
    }


    catch (error) {

        console.error(
            "UPDATE CART ERROR:",
            error
        );


        alert(
            error.message
        );
    }
}


// ============================================================
// REMOVE CART ITEM
// ============================================================

async function removeCartItem(
    cartItemId
) {

    try {

        const response =
            await cartRequest(
                `${API_BASE_URL}/cart/items/${cartItemId}`,
                {
                    method: "DELETE",

                    headers: {


                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to remove item."
            );
        }


        await loadCartPage();

        await updateCartCount();
    }


    catch (error) {

        console.error(
            "REMOVE CART ERROR:",
            error
        );


        alert(
            error.message
        );
    }
}



export {
    initializeAddToCartButtons,
    addToCart,
    updateCartCount,
    loadCartPage,
    renderCart,
    initializeCartButtons,
    updateCartItem,
    removeCartItem
};
