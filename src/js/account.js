import { API_BASE_URL } from "./config.js";


// ============================================================
// ACCOUNT DASHBOARD
// ============================================================

export function initializeAccountPage() {

    console.log(
        "ACCOUNT.JS: initializeAccountPage() started"
    );


    const loginForm =
        document.getElementById("loginForm");

    const dashboard =
        document.getElementById("accountDashboard");


    if (!loginForm && !dashboard) {
        console.log(
            "ACCOUNT.JS: Not an account page"
        );

        return;
    }


    const token =
        localStorage.getItem("access_token");


    console.log(
        "ACCOUNT.JS: token =",
        token
    );


    if (!token) {

        showLoginForm();

        return;
    }


    showAccountDashboard();

    loadDashboard();
}


// ============================================================
// SHOW DASHBOARD
// ============================================================

function showAccountDashboard() {

    const loginForm =
        document.getElementById("loginForm");

    const dashboard =
        document.getElementById("accountDashboard");


    if (loginForm) {

        loginForm.classList.add("hidden");
    }


    if (dashboard) {

        dashboard.classList.remove("hidden");

        dashboard.style.display = "block";
    }
}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLoginForm() {

    const loginForm =
        document.getElementById("loginForm");

    const dashboard =
        document.getElementById("accountDashboard");


    if (loginForm) {

        loginForm.classList.remove("hidden");

        loginForm.style.display = "";
    }


    if (dashboard) {

        dashboard.classList.add("hidden");

        dashboard.style.display = "none";
    }
}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    console.log(
        "ACCOUNT.JS: Loading dashboard data..."
    );


    const token =
        localStorage.getItem("access_token");


    if (!token) {
        return;
    }


    const headers = {

        "Authorization":
            `Bearer ${token}`,

        "Content-Type":
            "application/json"
    };


    try {

        await Promise.all([

            loadOrders(headers),

            loadCart(headers),

            loadProfile(headers),

            loadAppointments(headers)

        ]);

    }

    catch (error) {

        console.error(
            "ACCOUNT.JS: Dashboard loading error:",
            error
        );
    }
}


// ============================================================
// LOAD ORDERS
// ============================================================

async function loadOrders(headers) {

    const response =
        await fetch(
            `${API_BASE_URL}/orders`,
            {
                method: "GET",
                headers: headers
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load orders."
        );
    }


    const orders =
        await response.json();


    console.log(
        "ACCOUNT.JS: Orders:",
        orders
    );


    const orderCount =
        document.getElementById(
            "orderCount"
        );


    if (orderCount) {

        orderCount.textContent =
            orders.length;
    }


    renderRecentOrder(orders);

    renderOrders(orders);

    calculateTotalSpent(orders);
}


// ============================================================
// RECENT ORDER
// ============================================================

function renderRecentOrder(orders) {

    const container =
        document.getElementById(
            "recentOrder"
        );


    if (!container) {
        return;
    }


    if (!orders.length) {

        container.innerHTML = `

            <p class="dashboard-empty">
                You haven't placed an order yet.
            </p>

            <a
                href="shop.html"
                class="dashboard-primary-button"
            >
                Start Shopping
            </a>
        `;

        return;
    }


    const order =
        orders[0];


    container.innerHTML = `

        <div class="order-dashboard-item">

            <div class="order-dashboard-header">

                <span class="order-dashboard-id">
                    Order #${order.id}
                </span>

                <span class="order-dashboard-status">
                    ${order.status}
                </span>

            </div>

            <div class="order-dashboard-total">
                GH₵${Number(
                    order.total_amount
                ).toFixed(2)}
            </div>

        </div>
    `;
}


// ============================================================
// ALL ORDERS
// ============================================================

function renderOrders(orders) {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!container) {
        return;
    }


    if (!orders.length) {

        container.innerHTML = `

            <p class="dashboard-empty">
                You have not placed any orders yet.
            </p>
        `;

        return;
    }


    container.innerHTML =
        orders.map(function (order) {

            return `

                <div class="order-dashboard-item">

                    <div class="order-dashboard-header">

                        <span class="order-dashboard-id">
                            Order #${order.id}
                        </span>

                        <span class="order-dashboard-status">
                            ${order.status}
                        </span>

                    </div>

                    <div class="order-dashboard-total">
                        GH₵${Number(
                            order.total_amount
                        ).toFixed(2)}
                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// TOTAL SPENT
// ============================================================

function calculateTotalSpent(orders) {

    const totalSpent =
        document.getElementById(
            "totalSpent"
        );


    if (!totalSpent) {
        return;
    }


    const total =
        orders.reduce(
            function (sum, order) {

                return sum +
                    Number(
                        order.total_amount
                    );

            },
            0
        );


    totalSpent.textContent =
        `GH₵${total.toFixed(2)}`;
}


// ============================================================
// LOAD CART
// ============================================================

async function loadCart(headers) {

    const response =
        await fetch(
            `${API_BASE_URL}/cart`,
            {
                method: "GET",
                headers: headers
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load cart."
        );
    }


    const cart =
        await response.json();


    console.log(
        "ACCOUNT.JS: Cart:",
        cart
    );


    const cartItemCount =
        document.getElementById(
            "cartItemCount"
        );


    if (cartItemCount) {

        const count =
            cart.cart_items.reduce(
                function (total, item) {

                    return total +
                        item.quantity;

                },
                0
            );


        cartItemCount.textContent =
            count;
    }


    renderDashboardCart(cart);
}


// ============================================================
// CART
// ============================================================

function renderDashboardCart(cart) {

    const container =
        document.getElementById(
            "dashboardCart"
        );


    if (!container) {
        return;
    }


    if (
        !cart.cart_items ||
        !cart.cart_items.length
    ) {

        container.innerHTML = `

            <p class="dashboard-empty">
                Your cart is currently empty.
            </p>
        `;

        return;
    }


    container.innerHTML =
        cart.cart_items.map(function (item) {

            return `

                <div class="order-dashboard-item">

                    <div class="order-dashboard-header">

                        <span class="order-dashboard-id">
                            ${item.product.name}
                        </span>

                        <span>
                            × ${item.quantity}
                        </span>

                    </div>

                    <div class="order-dashboard-total">
                        GH₵${Number(
                            item.product.price
                        ).toFixed(2)}
                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadProfile(headers) {

    /*
       IMPORTANT:

       Change this endpoint if your User router
       uses a different endpoint.

       Example:
       /users/me
       /auth/me
       /users/profile
    */


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users/me`,
                {
                    method: "GET",
                    headers: headers
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load customer profile"
            );

            return;
        }


        const user =
            await response.json();


        console.log(
            "ACCOUNT.JS: User:",
            user
        );


         // ====================================================
        // DASHBOARD NAME
        // ====================================================

        const dashboardUserName =
            document.getElementById(
                "dashboardUserName"
            );

        if (dashboardUserName) {

            dashboardUserName.textContent =
                user.first_name;
        }

        // ====================================================
        // PROFILE
        // ====================================================


        const firstName =
            document.getElementById(
                "profileFirstName"
            );

        const lastName =
            document.getElementById(
                "profileLastName"
            );

        const email =
            document.getElementById(
                "profileEmail"
            );

        const dashboardName =
            document.getElementById(
                "dashboardUserName"
            );


        if (firstName) {

            firstName.textContent =
                user.first_name;
        }


        if (lastName) {

            lastName.textContent =
                user.last_name;
        }


        if (email) {

            email.textContent =
                user.email;
        }


        if (dashboardName) {

            dashboardName.textContent =
                user.first_name ||
                "Customer";
        }

    }

    catch (error) {

        console.warn(
            "Could not load profile:",
            error
        );
    }
}


// ============================================================
// LOAD APPOINTMENTS
// ============================================================

async function loadAppointments(headers) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/bookings`,
                {
                    method: "GET",
                    headers: headers
                }
            );


        if (!response.ok) {
            throw new Error(
                "Unable to load appointments"
            );

            return;
        }


        const bookings =
            await response.json();


        console.log(
            "ACCOUNT.JS: Bookings:",
            bookings
        );


        const appointmentCount =
            document.getElementById(
                "appointmentCount"
            );


        if (appointmentCount) {

            appointmentCount.textContent =
                bookings.length;
        }


        renderAppointments(bookings);

    }

    catch (error) {

        console.error(
            "Could not load appointments:",
            error
        );
    }
}


// ============================================================
// APPOINTMENTS
// ============================================================

function renderAppointments(bookings) {

    const list =
        document.getElementById(
            "appointmentsList"
        );


    const upcoming =
        document.getElementById(
            "upcomingAppointment"
        );


    if (!bookings || bookings.length === 0) {

        if (list) {

            list.innerHTML = `

                <p class="dashboard-empty">
                    You have no appointments yet.
                </p>

                <a href="booking.html"
                   class="dashboard-primary-button"
                >
                   Book an appointment
                </a>
            `;
        }

        return;
    }


    if (list) {

        list.innerHTML =
            bookings.map(function (booking) {

                return `

                    <div class="
                        appointment-dashboard-item
                    ">

                        <h3>
                            ${booking.service}
                        </h3>

                        <p>
                            Date:
                            ${booking.booking_date}
                        </p>

                        <p>
                            Time:
                            ${booking.booking_time}
                        </p>

                        <p>
                            Status:
                            ${booking.status || "Pending"}
                        </p>

                    </div>
                `;

            }).join("");
    }


    if (upcoming) {

        const booking =
            bookings[0];


        upcoming.innerHTML = `

            <div class="
                appointment-dashboard-item
            ">

                <h3>
                    ${booking.service}
                </h3>

                <p>
                    ${booking.booking_date}
                </p>

                <p>
                    ${booking.booking_time}
                </p>

                <p>
                    Status:
                    ${booking.status || "Pending"}
                </p>

            </div>
        `;
    }
}


// ============================================================
// NAVIGATION
// ============================================================

function initializeDashboardNavigation() {

    const buttons =
        document.querySelectorAll(
            "[data-section]"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const section =
                    button.dataset.section;


                document
                    .querySelectorAll(
                        ".account-section"
                    )
                    .forEach(function (element) {

                        element.classList.remove(
                            "active"
                        );
                    });


                const target =
                    document.getElementById(
                        `${section}Section`
                    );


                if (target) {

                    target.classList.add(
                        "active"
                    );
                }


                document
                    .querySelectorAll(
                        ".account-nav-item"
                    )
                    .forEach(function (navItem) {

                        navItem.classList.remove(
                            "active"
                        );
                    });


                document
                    .querySelectorAll(
                        `.account-nav-item[data-section="${section}"]`
                    )
                    .forEach(function (navItem) {

                        navItem.classList.add(
                            "active"
                        );
                    });

            }
        );

    });
}


// ============================================================
// LOGOUT
// ============================================================

function initializeDashboardLogout() {

    const logoutButton =
        document.getElementById(
            "dashboardLogoutButton"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "user_email"
            );

            localStorage.removeItem(
                "payment_id"
            );

            localStorage.removeItem(
                "order_id"
            );


            window.location.href =
                "account.html";
        }
    );
}


// ============================================================
// START DASHBOARD UI
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDashboardNavigation();

        initializeDashboardLogout();

    }
);