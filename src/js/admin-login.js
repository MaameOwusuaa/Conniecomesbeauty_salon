import { API_BASE_URL } from "./config.js";
import { initializeNavigation } from "./navigation.js";


function initializeAdminLogin() {
    initializeNavigation();
    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = document.getElementById("adminLoginMessage");
        const button = form.querySelector('button[type="submit"]');
        const email = form.elements.email.value.trim();
        const password = form.elements.password.value;
        message.textContent = "Signing in...";
        message.classList.remove("hidden", "error");
        button.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.access_token) {
                throw new Error(data.detail || "Admin sign in failed.");
            }

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("user_email", email);
            window.location.href = "admin.html";
        } catch (error) {
            message.textContent = error.message;
            message.classList.add("error");
            button.disabled = false;
        }
    });
}


document.addEventListener("DOMContentLoaded", initializeAdminLogin);