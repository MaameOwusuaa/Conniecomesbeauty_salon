// ============================================================
// CONNIECOMES BEAUTY SALON
// APPLICATION ENTRY POINT
// ============================================================

import {
    initializeNavigation
} from "./navigation.js";

import {
    initializeAddToCartButtons,
    updateCartCount,
    loadCartPage
} from "./cart.js";

import {
    initializeCheckout,
    initializePaymentVerification
} from "./checkout.js";

import {
    initializeNewsletter,
    initializeNewsletterForms,
    initializeSimpleForms,
    initializePaymentMethod
} from "./forms.js";

import {
    initializeCategoryPage
} from "./category.js";

import { initializeBookingPage } from "./booking-page.js";
import { initializeCatalogPages } from "./catalog.js";



console.log(
    "CONNIECOMES APP.JS LOADED"
);


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Conniecomes application initialized."
        );

        // ----------------------------------------------------
        // GLOBAL UI
        // ----------------------------------------------------

        initializeNavigation();


        // ----------------------------------------------------
        // AUTHENTICATION
        // ----------------------------------------------------


        // ----------------------------------------------------
        // SHOP / CART
        // ----------------------------------------------------

        initializeAddToCartButtons();


        // ----------------------------------------------------
        // CHECKOUT / PAYMENT
        // ----------------------------------------------------

        initializeCheckout();
        initializePaymentVerification();


        // ----------------------------------------------------
        // OTHER FORMS
        // ----------------------------------------------------

        initializeNewsletter();
        initializeNewsletterForms();
        initializeSimpleForms();
        initializePaymentMethod();
        initializeBookingPage();


        // ----------------------------------------------------
        // CATEGORY PAGE
        // ----------------------------------------------------

        initializeCatalogPages();
        initializeCategoryPage();


        // ----------------------------------------------------
        // CART PAGE
        // ----------------------------------------------------

        const cartElement =
            document.getElementById(
                "cart"
            );


        if (cartElement) {
            await loadCartPage();
        }


        // ----------------------------------------------------
        // CART COUNT
        // ----------------------------------------------------

        await updateCartCount();
    }
);
