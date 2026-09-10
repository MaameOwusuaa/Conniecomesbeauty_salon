import { API_BASE_URL } from "./config.js";
import { isValidEmail } from "./auth.js";
import { initializeAccountPage } from "./account.js";

// ============================================================
// LOGIN
// LOGIN SUCCESS → ACCOUNT DASHBOARD
// ============================================================

function initializeLogin() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // GET FORM FIELDS
            // ------------------------------------------------

            const emailInput =
                document.getElementById(
                    "loginEmail"
                );


            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            const message =
                document.getElementById(
                    "loginMessage"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                console.error(
                    "Login inputs were not found."
                );

                return;
            }


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (!email || !password) {

                if (message) {

                    message.textContent =
                        "Please enter your email and password.";
                }

                return;
            }


            if (!isValidEmail(email)) {

                if (message) {

                    message.textContent =
                        "Please enter a valid email address.";
                }

                emailInput.focus();

                return;
            }


            if (message) {

                message.textContent =
                    "Logging in...";
            }


            // ------------------------------------------------
            // SEND LOGIN REQUEST
            // ------------------------------------------------

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email:
                                    email,

                                password:
                                    password
                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "LOGIN RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // HANDLE LOGIN ERROR
                // ------------------------------------------------

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Login failed."
                    );
                }


                // ------------------------------------------------
                // MAKE SURE TOKEN EXISTS
                // ------------------------------------------------

                if (!data.access_token) {

                    throw new Error(
                        "Login succeeded, but the server did not return an access token."
                    );
                }


                // ------------------------------------------------
                // SAVE LOGIN
                // ------------------------------------------------

                localStorage.setItem(
                    "access_token",
                    data.access_token
                );


                localStorage.setItem(
                    "user_email",
                    email
                );


                console.log(
                    "Login information saved."
                );


                if (message) {

                    message.textContent =
                        "Login successful. Redirecting...";
                }

                initializeAccountPage();


                // ------------------------------------------------
                // REDIRECT TO ACCOUNT PAGE
                // ------------------------------------------------

                window.location.hash =
                    "dashboard";

                return;
            }




            catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                if (message) {

                    message.textContent =
                        error.message;
                }
            }
        }
    );
}



export { initializeLogin };
