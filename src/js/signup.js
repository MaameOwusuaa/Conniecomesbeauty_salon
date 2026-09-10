import { API_BASE_URL } from "./config.js";
import { isValidEmail } from "./auth.js";

// ============================================================
// SIGNUP
// ACCOUNT CREATED → LOGIN PAGE
// ============================================================

function initializeSignup() {

    const signupForm =
        document.getElementById(
            "signupForm"
        );


    if (!signupForm) {
        return;
    }


    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // GET FORM FIELDS
            // ------------------------------------------------

            const firstNameInput =
                signupForm.querySelector(
                    'input[name="first_name"]'
                );


            const lastNameInput =
                signupForm.querySelector(
                    'input[name="last_name"]'
                );


            const emailInput =
                signupForm.querySelector(
                    'input[type="email"]'
                );


            const passwordInput =
                signupForm.querySelector(
                    "#signupPassword"
                );


            const confirmPasswordInput =
                signupForm.querySelector(
                    "#confirmPassword"
                );


            const message =
                document.getElementById(
                    "signupMessage"
                );


            if (
                !firstNameInput ||
                !lastNameInput ||
                !emailInput ||
                !passwordInput ||
                !confirmPasswordInput
            ) {

                console.error(
                    "Signup fields were not found."
                );

                return;
            }


            const firstName =
                firstNameInput.value.trim();


            const lastName =
                lastNameInput.value.trim();


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            const confirmPassword =
                confirmPasswordInput.value;


            if (
                !firstName ||
                !lastName ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                if (message) {

                    message.textContent =
                        "Please complete all fields.";
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


            if (password !== confirmPassword) {

                if (message) {

                    message.textContent =
                        "Passwords do not match.";
                }

                confirmPasswordInput.focus();

                return;
            }


            if (password.length < 8) {

                if (message) {

                    message.textContent =
                        "Password must be at least 8 characters.";
                }

                passwordInput.focus();

                return;
            }


            if (password.length > 71) {

                if (message) {

                    message.textContent =
                        "Password must not exceed 71 characters.";
                }

                passwordInput.focus();

                return;
            }


            if (message) {

                message.textContent =
                    "Creating account...";
            }


            // ------------------------------------------------
            // SEND REGISTRATION REQUEST
            // ------------------------------------------------

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                first_name:
                                    firstName,

                                last_name:
                                    lastName,

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
                    "SIGNUP RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // HANDLE REGISTRATION ERROR
                // ------------------------------------------------

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Registration failed."
                    );
                }


                // ------------------------------------------------
                // IMPORTANT:
                //
                // DO NOT SAVE access_token HERE.
                //
                // The user has created an account,
                // but still needs to log in.
                // ------------------------------------------------

                if (message) {

                    message.textContent =
                        "Account created successfully!";
                }


                alert(
                    "Account created successfully. Please sign in."
                );


                // ------------------------------------------------
                // REDIRECT TO LOGIN PAGE
                // ------------------------------------------------

                console.log(
                    "ACCOUNT CREATED — REDIRECTING TO LOGIN"
                );

                window.location.href =
                    "account.html";

                return;
            }


            catch (error) {

                console.error(
                    "SIGNUP ERROR:",
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



export { initializeSignup };
