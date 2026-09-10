// ============================================================
// NEWSLETTER
// ============================================================

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
            function (event) {

                event.preventDefault();

                alert(
                    "Message ready to connect to your backend."
                );
            }
        );
    }


    const bookingForm =
        document.querySelector(
            ".js-booking-form"
        );


    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const status =
                    document.getElementById(
                        "bookingStatus"
                    );


                if (status) {

                    status.classList.remove(
                        "hidden"
                    );
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
