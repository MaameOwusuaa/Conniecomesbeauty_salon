import { API_BASE_URL } from "./config.js";
import { getGuestSessionId } from "./guest-session.js";
import { escapeHTML } from "./utils.js";


function initializeBookingPage() {
    const form = document.querySelector(".js-booking-form");
    const serviceSelect = document.getElementById("bookingService");
    const status = document.getElementById("bookingStatus");

    if (!form) {
        return;
    }

    if (serviceSelect) {
        fetch(`${API_BASE_URL}/services`)
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((services) => {
                serviceSelect.innerHTML = services.length
                    ? `<option value="">Choose a service</option>${services.map((service) => `<option value="${escapeHTML(service.name)}">${escapeHTML(service.name)}</option>`).join("")}`
                    : '<option value="">No services available</option>';
            })
            .catch(() => {
                serviceSelect.innerHTML = '<option value="">Services unavailable</option>';
            });
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const button = form.querySelector('button[type="submit"]');
        const phone = String(data.get("phone") || "").trim();
        const notes = String(data.get("notes") || "").trim();
        if (button) {
            button.disabled = true;
            button.textContent = "Sending request...";
        }

        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: "POST",
                headers: {
                    "X-Guest-Session": getGuestSessionId(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customer_name: `${String(data.get("first_name") || "").trim()} ${String(data.get("last_name") || "").trim()}`.trim(),
                    customer_email: data.get("email"),
                    customer_phone: phone,
                    service: data.get("service"),
                    booking_date: data.get("booking_date"),
                    booking_time: data.get("booking_time"),
                    notes: [phone ? `Phone: ${phone}` : "", notes].filter(Boolean).join("\n") || null,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || "Could not save your appointment request.");
            }

            if (status) {
                status.textContent = "Your appointment request has been sent to the salon.";
                status.classList.remove("hidden");
            }
            form.reset();
        } catch (error) {
            if (status) {
                status.textContent = error.message;
                status.classList.remove("hidden");
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Request appointment";
            }
        }
    });
}


export { initializeBookingPage };