import { API_BASE_URL } from "./config.js";
import { getGuestSessionId } from "./guest-session.js";
import { updateCartCount } from "./cart.js";

async function guestRequest(url, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.delete("Authorization");
    headers.set("X-Guest-Session", getGuestSessionId());
    return fetch(url, { ...options, headers });
}

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
        const formData = new FormData(checkoutForm);

        const orderResponse =
            await guestRequest(
                `${API_BASE_URL}/orders`,
                {
                    method: "POST",

                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customer_name: `${formData.get("first_name")} ${formData.get("last_name")}`.trim(),
                        customer_email: formData.get("email"),
                        customer_phone: formData.get("phone"),
                        delivery_address: formData.get("delivery_address"),
                        region: formData.get("region"),
                        delivery_option: formData.get("delivery_option"),
                    }),
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
        localStorage.setItem("guest_access_token", order.guest_access_token);


        if (button) {

            button.textContent =
                "Preparing payment...";
        }


        const paymentResponse =
            await guestRequest(
                `${API_BASE_URL}/payments`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                    },

                    body: JSON.stringify({

                        order_id:
                            order.id,

                        payment_method:
                            "card",

                        guest_access_token:
                            order.guest_access_token
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

    const returnParams = new URLSearchParams(window.location.search);
    const returnStatus = (returnParams.get("status") || "").toLowerCase();
    const cancelledFlag = (returnParams.get("cancelled") || returnParams.get("canceled") || "").toLowerCase();
    if (["cancelled", "canceled"].includes(returnStatus) || ["true", "1"].includes(cancelledFlag)) {
        showPaymentError("You cancelled the payment. No payment was confirmed. Return to checkout if you would like to try again.", "Payment Cancelled");
        return;
    }
    if (["failed", "failure", "error"].includes(returnStatus)) {
        showPaymentError("The payment was declined or could not be completed. Check with your bank or mobile money provider, then try again.", "Payment Unsuccessful");
        return;
    }


    const paymentId =
        localStorage.getItem(
            "payment_id"
        );


    const orderId =
        localStorage.getItem(
            "order_id"
        );


    if (!paymentId || !localStorage.getItem("guest_access_token")) {

        showPaymentError(
            "Payment information is missing. Please return to checkout."
        );

        return;
    }


    verifyPayment(
        paymentId,
        orderId
    );
}


// ============================================================
// VERIFY PAYMENT
// ============================================================

async function verifyPayment(
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
            await guestRequest(
                `${API_BASE_URL}/payments/${paymentId}/verify`,
                {
                    method: "POST",

                    headers: {
                        "X-Guest-Access-Token": localStorage.getItem("guest_access_token"),
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

        // Honor an explicit provider status if the API includes one.
        const verifiedStatus = String(data.status || data.payment?.status || "").toLowerCase();
        if (verifiedStatus && !["success", "successful", "paid", "completed"].includes(verifiedStatus)) {
            const failed = ["failed", "failure", "declined", "cancelled", "canceled"].includes(verifiedStatus);
            throw new Error(failed
                ? "The payment was declined or cancelled. No payment was confirmed. Please return to checkout to try again."
                : "Your payment is still being processed. Please wait and check again before trying another payment.");
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
    message,
    title = "Payment Could Not Be Confirmed"
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
            title;
    }


    if (paymentMessage) {

        paymentMessage.textContent =
            "Your order is not confirmed until payment succeeds.";
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
