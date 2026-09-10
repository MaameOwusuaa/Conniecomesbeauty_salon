// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

function getToken() {
    return localStorage.getItem("access_token");
}


function isLoggedIn() {
    return Boolean(getToken());
}


// ============================================================
// EMAIL VALIDATION
// ============================================================

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return emailPattern.test(email);
}


// ============================================================
// LOGOUT
// ============================================================

function logoutUser() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("payment_id");
    localStorage.removeItem("order_id");

    console.log("User logged out.");

    window.location.href = "account.html";
}


// ============================================================
// AUTH UI
// ============================================================

function updateAuthUI() {

    const loggedIn = isLoggedIn();

    // --------------------------------------------------------
    // CART LINKS
    // --------------------------------------------------------

    document
        .querySelectorAll(".cart-link")
        .forEach(function (element) {

            element.classList.toggle(
                "is-hidden",
                !loggedIn
            );
        });


    // --------------------------------------------------------
    // REMOVE EXISTING LOGOUT LINKS
    // --------------------------------------------------------

    document
        .querySelectorAll(".logout-link")
        .forEach(function (element) {

            element.remove();
        });


    if (!loggedIn) {
        return;
    }


    // --------------------------------------------------------
    // ADD LOGOUT LINK
    // --------------------------------------------------------

    document
        .querySelectorAll(".nav")
        .forEach(function (nav) {

            if (nav.querySelector(".logout-link")) {
                return;
            }


            const logoutLink =
                document.createElement("a");


            logoutLink.href = "#";

            logoutLink.className =
                "logout-link";

            logoutLink.textContent =
                "Logout";


            logoutLink.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    logoutUser();
                }
            );


            nav.appendChild(logoutLink);
        });
}


// ============================================================
// ACCOUNT PAGE
// LOGIN FORM + CUSTOMER DASHBOARD
// ============================================================




export {
    getToken,
    isLoggedIn,
    isValidEmail,
    logoutUser,
    updateAuthUI,
};
