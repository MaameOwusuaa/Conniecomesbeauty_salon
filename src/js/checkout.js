import { API_BASE_URL } from "./config.js";
import { getToken } from "./auth.js";
import { updateCartCount } from "./cart.js";

// ============================================================
// CHECKOUT
// ============================================================

function initializeCheckout() {

    const checkoutForm =
        document.getElementById(
            "checkoutForm"
        );


    if (!checkoutForm) {
        return;
    }


    checkoutForm.addEventListener(
        "submit",
        createOrder
    );
}


// ============================================================
// CREATE ORDER
// ============================================================

async function createOrder(
    event
) {

    event.preventDefault();


    const token =
        getToken();


    if (!token) {

        alert(
            "Please log in before checking out."
        );


        window.location.href =
            "account.html";


        return;
    }


    const checkoutForm =
        event.currentTarget;


    const button =
        checkoutForm.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Creating order...";
    }


    try {

        const orderResponse =
            await fetch(
                `${API_BASE_URL}/orders`,
                {
                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const order =
            await orderResponse.json();


        if (!orderResponse.ok) {

            throw new Error(
                order.detail ||
                "Unable to create order."
            );
        }


        localStorage.setItem(
            "order_id",
            order.id
        );


        if (button) {

            button.textContent =
                "Preparing payment...";
        }


        const paymentResponse =
            await fetch(
                `${API_BASE_URL}/payments`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        order_id:
                            order.id,

                        payment_method:
                            "card"
                    })
                }
            );


        const paymentData =
            await paymentResponse.json();


        if (!paymentResponse.ok) {

            throw new Error(
                paymentData.detail ||
                "Unable to initialize payment."
            );
        }


        if (
            !paymentData.payment ||
            !paymentData.payment.id
        ) {

            throw new Error(
                "Payment ID was not returned by the server."
            );
        }


        localStorage.setItem(
            "payment_id",
            paymentData.payment.id
        );


        if (
            !paymentData.authorization_url
        ) {

            throw new Error(
                "Paystack did not return an authorization URL."
            );
        }


        window.location.href =
            paymentData.authorization_url;
    }


    catch (error) {

        console.error(
            "CHECKOUT ERROR:",
            error
        );


        alert(
            error.message
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Continue to payment";
        }
    }
}


// ============================================================
// PAYMENT VERIFICATION
// ============================================================

function initializePaymentVerification() {

    const paymentSuccessPage =
        document.getElementById(
            "paymentSuccess"
        );


    if (!paymentSuccessPage) {
        return;
    }


    const token =
        getToken();


    const paymentId =
        localStorage.getItem(
            "payment_id"
        );


    const orderId =
        localStorage.getItem(
            "order_id"
        );


    if (
        !token ||
        !paymentId
    ) {

        showPaymentError(
            "Payment information is missing. Please return to checkout."
        );

        return;
    }


    verifyPayment(
        token,
        paymentId,
        orderId
    );
}


// ============================================================
// VERIFY PAYMENT
// ============================================================

async function verifyPayment(
    token,
    paymentId,
    orderId
) {

    const paymentLoading =
        document.getElementById(
            "paymentLoading"
        );


    const paymentSuccess =
        document.getElementById(
            "paymentSuccess"
        );


    const paymentError =
        document.getElementById(
            "paymentError"
        );


    const paymentTitle =
        document.getElementById(
            "paymentTitle"
        );


    const paymentMessage =
        document.getElementById(
            "paymentMessage"
        );


    const errorMessage =
        document.getElementById(
            "errorMessage"
        );


    const successOrderId =
        document.getElementById(
            "successOrderId"
        );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/payments/${paymentId}/verify`,
                {
                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Payment verification failed."
            );
        }


        if (paymentLoading) {

            paymentLoading.hidden =
                true;
        }


        if (paymentSuccess) {

            paymentSuccess.hidden =
                false;
        }


        if (paymentError) {

            paymentError.hidden =
                true;
        }


        if (paymentTitle) {

            paymentTitle.textContent =
                "Payment Successful";
        }


        if (paymentMessage) {

            paymentMessage.textContent =
                "Your payment has been confirmed.";
        }


        if (successOrderId) {

            successOrderId.textContent =
                orderId ||
                data.order_id ||
                "";
        }


        localStorage.removeItem(
            "payment_id"
        );


        localStorage.removeItem(
            "order_id"
        );


        await updateCartCount();
    }


    catch (error) {

        console.error(
            "PAYMENT VERIFICATION ERROR:",
            error
        );


        showPaymentError(
            error.message
        );
    }
}


// ============================================================
// PAYMENT ERROR
// ============================================================

function showPaymentError(
    message
) {

    const paymentLoading =
        document.getElementById(
            "paymentLoading"
        );


    const paymentError =
        document.getElementById(
            "paymentError"
        );


    const paymentTitle =
        document.getElementById(
            "paymentTitle"
        );


    const paymentMessage =
        document.getElementById(
            "paymentMessage"
        );


    const errorMessage =
        document.getElementById(
            "errorMessage"
        );


    if (paymentLoading) {

        paymentLoading.hidden =
            true;
    }


    if (paymentError) {

        paymentError.hidden =
            false;
    }


    if (paymentTitle) {

        paymentTitle.textContent =
            "Payment Verification Failed";
    }


    if (paymentMessage) {

        paymentMessage.textContent =
            "We could not confirm your payment.";
    }


    if (errorMessage) {

        errorMessage.textContent =
            message;
    }
}



export {
    initializeCheckout,
    createOrder,
    initializePaymentVerification,
    verifyPayment,
    showPaymentError
};
