// ============================================================
// NEWSLETTER
// ============================================================

import { API_BASE_URL } from "./config.js";


function initializeNewsletter() {

    const newsletterForm =
        document.getElementById(
            "newsletterForm"
        );


    if (!newsletterForm) {
        return;
    }


    newsletterForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            alert(
                "Thank you for subscribing!"
            );


            newsletterForm.reset();
        }
    );
}


// ============================================================
// NEWSLETTER AND SIMPLE FRONTEND FORMS
// ============================================================

function initializeNewsletterForms() {

    const forms =
        document.querySelectorAll(
            ".newsletter-form"
        );


    forms.forEach(
        function (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    alert(
                        "Thank you for subscribing!"
                    );

                    form.reset();
                }
            );
        }
    );
}


function initializeSimpleForms() {

    const contactForm =
        document.querySelector(
            ".js-contact-form"
        );


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                const status = document.getElementById("contactFormStatus");
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const formData = new FormData(contactForm);
                submitButton.disabled = true;
                status.textContent = "Sending your message...";
                status.classList.remove("hidden", "error");

                try {
                    const response = await fetch(`${API_BASE_URL}/contact-messages`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: formData.get("name").trim(),
                            email: formData.get("email").trim(),
                            message: formData.get("message").trim(),
                        }),
                    });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw new Error(data.detail || "Unable to send your message. Please try again.");
                    }

                    contactForm.reset();
                    status.textContent = "Your message has been sent. We’ll be in touch soon.";
                } catch (error) {
                    status.textContent = error.message;
                    status.classList.add("error");
                } finally {
                    status.classList.remove("hidden");
                    submitButton.disabled = false;
                }
            }
        );
    }


    const paymentForm =
        document.querySelector(
            ".js-payment-form"
        );


    if (paymentForm) {

        paymentForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const status =
                    document.getElementById(
                        "status"
                    );


                if (status) {

                    status.classList.remove(
                        "hidden"
                    );
                }
            }
        );
    }
}


// ============================================================
// PAYMENT METHOD
// ============================================================

function initializePaymentMethod() {

    const method =
        document.getElementById(
            "method"
        );


    if (!method) {
        return;
    }


    function switchPayment() {

        const cardFields =
            document.getElementById(
                "cardFields"
            );


        const momoFields =
            document.getElementById(
                "momoFields"
            );


        if (!cardFields || !momoFields) {
            return;
        }


        const isCard =
            method.value === "card";


        cardFields.classList.toggle(
            "hidden",
            !isCard
        );


        momoFields.classList.toggle(
            "hidden",
            isCard
        );
    }


    method.addEventListener(
        "change",
        switchPayment
    );


    switchPayment();
}



export {
    initializeNewsletter,
    initializeNewsletterForms,
    initializeSimpleForms,
    initializePaymentMethod
};
