// ============================================================
// CONNIECOMES BEAUTY SALON
// APPLICATION ENTRY POINT
// ============================================================

import {
    updateAuthUI
} from "./auth.js";

import {
    initializeAccountPage
} from "./account.js";

import {
    initializeNavigation
} from "./navigation.js";

import {
    initializeLogin
} from "./login.js";

import {
    initializeSignup
} from "./signup.js";

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

        updateAuthUI();
        initializeNavigation();


        // ----------------------------------------------------
        // AUTHENTICATION
        // ----------------------------------------------------

        initializeLogin();
        initializeSignup();
        initializeAccountPage();


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


        // ----------------------------------------------------
        // CATEGORY PAGE
        // ----------------------------------------------------

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
