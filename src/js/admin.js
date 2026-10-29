import { API_BASE_URL } from "./config.js";
import { getToken } from "./auth.js";
import { escapeAttribute, escapeHTML, money } from "./utils.js";
import { initializeNavigation } from "./navigation.js";


const categoryNames = new Map();
let categories = [];
let products = [];
let services = [];
let bookings = [];
let orders = [];
let customers = [];
let contactMessages = [];
let managedProduct = null;
let editingProduct = null;


async function apiRequest(path, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || `Request failed (${response.status}).`);
    }
    return data;
}


function showNotice(message, isError = false) {
    const notice = document.getElementById("adminNotice");
    if (!notice) return;
    notice.textContent = message;
    notice.classList.toggle("error", isError);
    notice.classList.remove("hidden");
    window.clearTimeout(showNotice.timeout);
    showNotice.timeout = window.setTimeout(() => notice.classList.add("hidden"), 5000);
}


function setRows(id, html, emptyMessage, columnCount = 8) {
    const target = document.getElementById(id);
    if (!target) return;
    target.innerHTML = html || `<tr><td class="admin-empty" colspan="${columnCount}">${escapeHTML(emptyMessage)}</td></tr>`;
}


function imageSource(path) {
    if (!path) return "";
        if (/^(https?:|data:)/i.test(path) || path.startsWith("../")) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}


function createVariantEditor(variant = null, initialLength = null) {
        const editor = document.createElement("article");
        editor.className = "admin-variant-editor";
        editor.dataset.variantId = variant?.id || "";
        if (initialLength !== null) {
            editor.dataset.generatedLength = String(initialLength);
        }
        editor.innerHTML = `
            <div class="admin-variant-fields">
                <label>Color<input data-field="color" list="variantColorOptions" value="${escapeAttribute(variant?.color || "")}" required maxlength="80"></label>
                <label>Length (in)<input data-field="length_inches" type="number" min="8" max="32" step="2" value="${variant?.length_inches ?? initialLength ?? ""}" required></label>
                <label>Price override<input data-field="price" type="number" min="0.01" step="0.01" value="${variant?.price ?? ""}" placeholder="Use base price"></label>
                <label>Stock<input data-field="stock_quantity" type="number" min="0" step="1" value="${variant?.stock_quantity ?? 0}" required></label>
            </div>
            <label class="admin-variant-active"><input data-field="is_active" type="checkbox" ${variant?.is_active === false ? "" : "checked"}> Active</label>
            <div class="admin-variant-images">${(variant?.images || []).map((image) => `
                <figure class="admin-variant-image" data-image-url="${escapeAttribute(image.image_url)}">
                    <img src="${escapeAttribute(imageSource(image.image_url))}" alt="${escapeAttribute(`${variant.color} ${variant.length_inches} inch variant image`)}">
                    <button type="button" data-remove-variant-image aria-label="Remove variant image">×</button>
                </figure>`).join("")}</div>
            <label class="admin-wide">Add images<input class="admin-variant-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple></label>
            <div class="admin-variant-actions">
                <button class="admin-button" type="button" data-save-variant>Save variant</button>
                ${variant ? `<button class="admin-button secondary" type="button" data-delete-variant="${variant.id}">Delete permanently</button>` : `<button class="admin-button secondary" type="button" data-remove-variant-row>Remove row</button>`}
            </div>`;
        return editor;
}


function syncInitialVariantLengths() {
    const picker = document.getElementById("productLengths");
    const selectedLengths = Array.from(picker.querySelectorAll('input[type="checkbox"]:checked'))
        .map((input) => Number(input.value));
    const selectedSet = new Set(selectedLengths);
    const rows = document.getElementById("initialVariantRows");
    const existingRows = new Map();

    rows.querySelectorAll(".admin-variant-editor[data-generated-length]").forEach((editor) => {
        const length = Number(editor.dataset.generatedLength);
        if (!selectedSet.has(length)) {
            editor.remove();
            return;
        }
        existingRows.set(length, editor);
    });

    selectedLengths.forEach((length) => {
        if (!existingRows.has(length)) {
            rows.append(createVariantEditor(null, length));
        }
    });

    const selectedCount = selectedLengths.length;
    picker.querySelector("summary").textContent = selectedCount
        ? `Choose inches (${selectedCount} selected)`
        : "Choose inches";
}


function updateCategoryPickerSummary(picker) {
    const selectedCount = picker.querySelectorAll('input[name="category_ids"]:checked').length;
    picker.querySelector("summary").textContent = selectedCount
        ? `Select categories (${selectedCount} selected)`
        : categories.length
            ? "Select categories"
            : "No categories available";
}


function selectedCategoryIds(form) {
    return Array.from(form.querySelectorAll('input[name="category_ids"]:checked'))
        .map((input) => Number(input.value));
}


function renderProducts() {
    setRows("productsRows", products.map((product) => `
        <tr>
          <td>${escapeHTML(product.name)}<span class="muted">${escapeHTML(product.external_id)}</span></td>
          <td>${escapeHTML((product.categories || [product.category].filter(Boolean)).map((category) => category.name).join(", ") || categoryNames.get(product.category_id) || "Uncategorized")}</td>
          <td>${money(product.price)}</td>
          <td>${Number(product.stock_quantity)}</td>
          <td>${(product.variants || []).length}</td>
          <td><button class="admin-button secondary" type="button" data-edit-product="${product.id}">Edit</button></td>
          <td><button class="admin-button secondary" type="button" data-manage-variants="${product.id}">Manage variants</button></td>
          <td><button class="admin-button" type="button" data-delete-product="${product.id}">Remove</button></td>
        </tr>`).join(""), "No active products found.");
    document.getElementById("productTotal").textContent = String(products.length);
}


function renderServices() {
    setRows("servicesRows", services.map((service) => `
        <tr>
          <td>${escapeHTML(service.name)}</td>
          <td>${escapeHTML(service.description || "")}</td>
          <td><button class="admin-button" type="button" data-delete-service="${service.id}">Remove</button></td>
        </tr>`).join(""), "No active services found.");
}


function renderBookings() {
    const rows = bookings.map((booking) => `
      <tr>
        <td>${escapeHTML(booking.customer_name)}<span class="muted">${escapeHTML(booking.customer_email)}</span></td>
        <td>${escapeHTML(booking.service)}</td>
        <td>${escapeHTML(booking.booking_date)}<span class="muted">${escapeHTML(String(booking.booking_time).slice(0, 5))}</span></td>
        <td>${escapeHTML(booking.notes || "")}</td>
        <td><select class="admin-select" data-booking-status="${booking.id}" aria-label="Booking status for ${escapeHTML(booking.customer_name)}">
          ${["pending", "confirmed", "completed", "cancelled"].map((status) => `<option value="${status}" ${booking.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select></td>
      </tr>`).join("");
    setRows("bookingsRows", rows, "No bookings have been made.");
    document.getElementById("bookingTotal").textContent = String(bookings.length);
    setRows("recentBookingsRows", bookings.slice(0, 5).map((booking) => `
      <tr><td>${escapeHTML(booking.customer_name)}<span class="muted">${escapeHTML(booking.customer_email)}</span></td>
      <td>${escapeHTML(booking.service)}</td><td>${escapeHTML(booking.booking_date)} ${escapeHTML(String(booking.booking_time).slice(0, 5))}</td><td>${escapeHTML(booking.status)}</td></tr>`).join(""), "No recent bookings.");
}


function renderOrders() {
    const paidOrders = orders.filter((order) => order.payment_status === "successful");
    setRows("ordersRows", paidOrders.map((order) => `
      <tr>
        <td>${escapeHTML(order.buyer_name)}<span class="muted">${escapeHTML(order.buyer_email || "No email provided")}</span><span class="muted">${escapeHTML(order.buyer_phone || "No phone provided")}</span></td>
        <td>${escapeHTML(order.delivery_address || "No address provided")}<span class="muted">${escapeHTML(order.delivery_region || "")}</span><span class="muted">${escapeHTML(order.delivery_option || "")}</span></td>
        <td class="order-products">${order.items.map((item) => `${escapeHTML(item.product_name)}${item.variant_color ? ` · ${escapeHTML(item.variant_color)} · ${Number(item.variant_length_inches)} in` : ""} × ${Number(item.quantity)}`).join("<br>")}</td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>${escapeHTML(order.payment_status)}</td>
        <td><select class="admin-select" data-delivery-status="${order.id}" aria-label="Delivery status for order ${order.id}">
          ${[
              ["pending", "Pending"],
              ["preparing", "Preparing"],
              ["out_for_delivery", "Out for delivery"],
              ["delivered", "Delivered"],
              ["delivery_failed", "Delivery issue"],
          ].map(([value, label]) => `<option value="${value}" ${order.delivery_status === value ? "selected" : ""}>${label}</option>`).join("")}
        </select></td>
        <td>${money(order.total_amount)}</td>
      </tr>`).join(""), "No successful purchases found.");
    document.getElementById("paidOrderTotal").textContent = String(paidOrders.length);
}


function exportSalesCsv() {
    const paidOrders = orders.filter((order) => order.payment_status === "successful");
    const columns = [
        "Order ID", "Purchased", "Customer", "Email", "Phone", "Address", "Region",
        "Delivery option", "Products", "Payment status", "Delivery status", "Amount (GHS)",
    ];
    const rows = paidOrders.map((order) => {
        const products = (order.items || []).map((item) => {
            const variant = item.variant_color ? ` (${item.variant_color}${item.variant_length_inches ? `, ${Number(item.variant_length_inches)} in` : ""})` : "";
            return `${item.product_name || "Removed product"}${variant} x ${Number(item.quantity)}`;
        }).join("; ");
        return [
            order.id,
            new Date(order.created_at).toISOString(),
            order.buyer_name || "",
            order.buyer_email || "",
            order.buyer_phone || "",
            order.delivery_address || "",
            order.delivery_region || "",
            order.delivery_option || "",
            products,
            order.payment_status || "",
            order.delivery_status || "",
            Number(order.total_amount).toFixed(2),
        ];
    });
    const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conniecomes-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}


function renderContactMessages() {
    setRows("contactMessagesRows", contactMessages.map((message) => `
      <tr>
        <td>${escapeHTML(message.name)}<span class="muted">${escapeHTML(message.email)}</span></td>
        <td class="contact-message">${escapeHTML(message.message)}</td>
        <td>${new Date(message.created_at).toLocaleString()}</td>
      </tr>`).join(""), "No contact messages received.");
}


function renderCustomers() {
        setRows("customersRows", customers.map((customer) => `
            <tr>
                <td><button class="customer-name" type="button" data-customer-id="${escapeAttribute(customer.id)}">${escapeHTML(`${customer.first_name} ${customer.last_name}`)}</button><span class="muted">${escapeHTML(customer.email)}</span></td>
                <td>${customer.is_guest ? "Guest customer" : customer.is_active ? "Active account" : "Inactive account"}<span class="muted">${customer.is_guest ? "No registration" : customer.email_verified ? "Email verified" : "Email not verified"}</span></td>
                <td>${customer.order_count}</td>
                <td>${customer.booking_count}</td>
                <td>${money(customer.paid_sales)}</td>
                <td>${customer.open_order_count}</td>
            </tr>`).join(""), "No customers found.", 6);
}


async function showCustomerDetails(customerId) {
        const details = document.getElementById("customerDetails");
        const customerList = document.getElementById("customerListView");
        details.innerHTML = '<p class="admin-empty">Loading customer details...</p>';
        details.classList.remove("hidden");
        customerList.classList.add("hidden");

        try {
                const customer = await apiRequest(`/admin/customers/${encodeURIComponent(customerId)}`);
                const paidOrders = customer.orders.filter((order) => order.payment_status === "successful");
                const paidSales = paidOrders.reduce((total, order) => total + Number(order.total_amount), 0);
                const phones = [...new Set([
                    ...customer.orders.map((order) => order.phone),
                    ...customer.bookings.map((booking) => booking.phone),
                ].filter(Boolean))];
                const openOrders = customer.orders.filter((order) =>
                        order.payment_status !== "successful" || order.delivery_status !== "delivered",
                ).length;
                const transactions = customer.orders.filter((order) => order.payment).map((order) => `
                    <tr>
                        <td>${new Date(order.payment.created_at).toLocaleString()}</td>
                        <td>#${order.id}</td>
                        <td>${escapeHTML(order.payment.method)}</td>
                        <td>${escapeHTML(order.payment.reference || "No reference")}</td>
                        <td>${escapeHTML(order.payment.status)}</td>
                        <td>${money(order.payment.amount)}</td>
                    </tr>`).join("");
                const sales = customer.orders.map((order) => `
                    <tr>
                        <td>#${order.id}<span class="muted">${new Date(order.created_at).toLocaleString()}</span></td>
                        <td class="order-products">${order.items.map((item) => `${escapeHTML(item.product_name)}${item.variant_color ? ` · ${escapeHTML(item.variant_color)} · ${Number(item.variant_length_inches)} in` : ""} × ${Number(item.quantity)} (${money(item.line_total)})`).join("<br>") || "No line items"}</td>
                        <td>${escapeHTML(order.status)}</td>
                        <td>${escapeHTML(order.payment_status)}</td>
                        <td>${escapeHTML(order.delivery_status)}</td>
                        <td>${money(order.total_amount)}<span class="muted">${escapeHTML([order.delivery_address, order.delivery_region, order.delivery_option].filter(Boolean).join(" · "))}</span></td>
                    </tr>`).join("");
                const customerBookings = customer.bookings.map((booking) => `
                    <tr>
                        <td>${escapeHTML(booking.service)}</td>
                        <td>${escapeHTML(booking.booking_date)} ${escapeHTML(String(booking.booking_time).slice(0, 5))}</td>
                        <td>${escapeHTML(booking.status)}</td>
                        <td>${escapeHTML(booking.phone || "")}</td>
                        <td>${escapeHTML(booking.notes || "")}</td>
                    </tr>`).join("");

                details.innerHTML = `
                    <header class="admin-section-heading customer-detail-heading">
                        <div><p class="eyebrow">Customer account</p><h3>${escapeHTML(`${customer.first_name} ${customer.last_name}`)}</h3></div>
                        <button id="backToCustomers" class="admin-button secondary" type="button">Back to customers</button>
                    </header>
                    <dl class="customer-account">
                        <div><dt>Email</dt><dd>${escapeHTML(customer.email)}</dd></div>
                        <div><dt>Phone numbers on orders/bookings</dt><dd>${escapeHTML(phones.join(", ") || "Not provided")}</dd></div>
                        <div><dt>Account</dt><dd>${customer.is_guest ? "Guest customer" : customer.is_active ? "Active account" : "Inactive account"}</dd></div>
                        <div><dt>Email verification</dt><dd>${customer.is_guest ? "Registration not required" : customer.email_verified ? "Verified" : "Not verified"}</dd></div>
                        <div><dt>${customer.is_guest ? "First activity" : "Registered"}</dt><dd>${new Date(customer.created_at).toLocaleString()}</dd></div>
                        <div><dt>Last updated</dt><dd>${new Date(customer.updated_at).toLocaleString()}</dd></div>
                    </dl>
                    <div class="admin-stats customer-stats">
                        <article class="stat-block"><span>Paid sales</span><strong>${money(paidSales)}</strong></article>
                        <article class="stat-block"><span>Successful transactions</span><strong>${paidOrders.length}</strong></article>
                        <article class="stat-block"><span>Open orders</span><strong>${openOrders}</strong></article>
                        <article class="stat-block"><span>Bookings</span><strong>${customer.bookings.length}</strong></article>
                    </div>
                    <div class="admin-section-heading"><div><p class="eyebrow">Payments linked to orders</p><h3>Transaction history</h3></div></div>
                    <div class="table-scroll"><table class="admin-table"><thead><tr><th>Date</th><th>Order</th><th>Method</th><th>Reference</th><th>Status</th><th>Amount</th></tr></thead><tbody>${transactions || '<tr><td class="admin-empty" colspan="6">No transactions found.</td></tr>'}</tbody></table></div>
                    <div class="admin-section-heading"><div><p class="eyebrow">All orders and item sales</p><h3>Sales history and current orders</h3></div></div>
                    <div class="table-scroll"><table class="admin-table"><thead><tr><th>Order</th><th>Products</th><th>Order status</th><th>Payment</th><th>Delivery</th><th>Total and delivery</th></tr></thead><tbody>${sales || '<tr><td class="admin-empty" colspan="6">No sales or orders found.</td></tr>'}</tbody></table></div>
                    <div class="admin-section-heading"><div><p class="eyebrow">Appointments</p><h3>Booking history</h3></div></div>
                    <div class="table-scroll"><table class="admin-table"><thead><tr><th>Service</th><th>Appointment</th><th>Status</th><th>Phone</th><th>Notes</th></tr></thead><tbody>${customerBookings || '<tr><td class="admin-empty" colspan="5">No bookings found.</td></tr>'}</tbody></table></div>`;
                document.getElementById("backToCustomers").addEventListener("click", () => {
                        details.classList.add("hidden");
                        customerList.classList.remove("hidden");
                });
        } catch (error) {
                details.innerHTML = `<p class="admin-notice error">${escapeHTML(error.message)}</p><button id="backToCustomers" class="admin-button secondary" type="button">Back to customers</button>`;
                document.getElementById("backToCustomers").addEventListener("click", () => {
                        details.classList.add("hidden");
                        customerList.classList.remove("hidden");
                });
        }
}


function renderCategoryPickers() {
    ["productCategories", "editProductCategories"].forEach((id) => {
        const picker = document.getElementById(id);
        const options = picker.querySelector(".admin-category-options");
        options.innerHTML = categories.length
            ? categories.map((category) => `
                <label><input type="checkbox" name="category_ids" value="${category.id}"> ${escapeHTML(category.name)}</label>
            `).join("")
            : "<p>No categories are available.</p>";
        updateCategoryPickerSummary(picker);
    });
}


async function openVariantManager(productId) {
    const product = products.find((item) => item.id === Number(productId));
    if (!product) throw new Error("Product not found.");
    const variants = await apiRequest(`/products/${product.id}/variants/manage`);
    managedProduct = product;
    document.getElementById("variantManagerTitle").textContent = `${product.name} variants`;
    const rows = document.getElementById("managedVariantRows");
    rows.replaceChildren(...variants.map((variant) => createVariantEditor(variant)));
    document.getElementById("variantManager").classList.remove("hidden");
    document.getElementById("variantManager").scrollIntoView({ behavior: "smooth", block: "start" });
}


function openProductEditor(productId) {
    editingProduct = products.find((item) => item.id === Number(productId));
    if (!editingProduct) throw new Error("Product not found.");

    const form = document.getElementById("editProductForm");
    const data = new FormData();
    data.set("name", editingProduct.name);
    data.set("price", String(editingProduct.price));
    data.set("stock_quantity", String(editingProduct.stock_quantity));
    data.set("length_inches", editingProduct.length_inches || "");
    data.set("description", editingProduct.description || "");
    form.reset();
    for (const [name, value] of data) {
        if (form.elements[name]) form.elements[name].value = value;
    }
    const selectedIds = editingProduct.categories?.length
        ? editingProduct.categories.map((category) => category.id)
        : [editingProduct.category_id];
    form.querySelectorAll('input[name="category_ids"]').forEach((input) => {
        input.checked = selectedIds.includes(Number(input.value));
    });
    updateCategoryPickerSummary(document.getElementById("editProductCategories"));
    document.getElementById("editProductTitle").textContent = `Edit ${editingProduct.name}`;
    document.getElementById("editProductPanel").classList.remove("hidden");
    document.getElementById("editProductPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}


function renderRevenue(analytics, chartId, totalId) {
    document.getElementById(totalId).textContent = money(analytics.total_revenue);
    const chart = document.getElementById(chartId);
    const maximum = Math.max(0, ...analytics.chart.map((item) => Number(item.amount)));
    chart.innerHTML = analytics.chart.map((item) => {
        const ratio = maximum > 0 ? Number(item.amount) / maximum : 0;
        const height = Number(item.amount) > 0 ? Math.max(12, ratio * 100) : 2;
        return `<div class="revenue-bar" style="--bar-height:${height}%" title="${escapeHTML(item.label)}: ${escapeHTML(money(item.amount))}"><span>${escapeHTML(item.label)}</span></div>`;
    }).join("");
}


async function loadAnalytics(period = "monthly") {
    const analytics = await apiRequest(`/admin/analytics?period=${encodeURIComponent(period)}`);
    renderRevenue(analytics, "revenueChart", "revenueTotal");
    renderRevenue(analytics, "salesRevenueChart", "salesRevenueTotal");
}


async function loadDashboard() {
    const categoryResponse = await fetch(`${API_BASE_URL}/categories`);
    if (!categoryResponse.ok) {
        throw new Error("Unable to load product categories.");
    }
    categories = await categoryResponse.json();
    categoryNames.clear();
    categories.forEach((category) => categoryNames.set(category.id, category.name));
    renderCategoryPickers();

    const [productData, serviceData, bookingData, orderData, contactMessageData, customerData] = await Promise.all([
        fetch(`${API_BASE_URL}/products`).then(async (response) => {
            if (!response.ok) throw new Error("Unable to load products.");
            return response.json();
        }),
        apiRequest("/services"),
        apiRequest("/admin/bookings"),
        apiRequest("/admin/orders"),
        apiRequest("/admin/contact-messages"),
        apiRequest("/admin/customers"),
    ]);

    products = productData;
    services = serviceData;
    bookings = bookingData;
    orders = orderData;
    contactMessages = contactMessageData;
    customers = customerData;

    renderProducts();
    renderServices();
    renderBookings();
    renderOrders();
    renderContactMessages();
    renderCustomers();
    await loadAnalytics(document.getElementById("overviewPeriod").value);
}


function readImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result));
        reader.addEventListener("error", () => reject(new Error("Could not read the selected image.")));
        reader.readAsDataURL(file);
    });
}


async function uploadImage(file) {
    const dataUrl = await readImage(file);
    const result = await apiRequest("/admin/uploads", {
        method: "POST",
        body: JSON.stringify({ data_url: dataUrl }),
    });
    return result.image_url;
}


async function collectVariantPayload(editor) {
    const images = Array.from(editor.querySelectorAll(".admin-variant-image"))
        .map((figure, index) => ({ image_url: figure.dataset.imageUrl, sort_order: index }));
    const files = Array.from(editor.querySelector(".admin-variant-image-input").files);
    for (const file of files) {
        images.push({ image_url: await uploadImage(file), sort_order: images.length });
    }

    return {
        color: editor.querySelector('[data-field="color"]').value.trim(),
        length_inches: Number(editor.querySelector('[data-field="length_inches"]').value),
        price: editor.querySelector('[data-field="price"]').value
            ? Number(editor.querySelector('[data-field="price"]').value)
            : null,
        stock_quantity: Number(editor.querySelector('[data-field="stock_quantity"]').value),
        is_active: editor.querySelector('[data-field="is_active"]').checked,
        images,
    };
}


function initializeImagePreview(inputName, previewId, formId) {
    const input = document.querySelector(`#${formId} input[name="${inputName}"]`);
    const preview = document.getElementById(previewId);
    input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) {
            preview.classList.add("hidden");
            preview.removeAttribute("src");
            return;
        }
        preview.src = URL.createObjectURL(file);
        preview.classList.remove("hidden");
    });
}


function initializeAdmin() {
    initializeNavigation();
    const dashboard = document.getElementById("adminDashboard");
    const loading = document.getElementById("adminLoading");
    const denied = document.getElementById("adminDenied");

    document.querySelectorAll("[data-admin-section]").forEach((button) => {
        button.addEventListener("click", () => showSection(button.dataset.adminSection));
    });
    document.querySelectorAll("[data-open-section]").forEach((button) => {
        button.addEventListener("click", () => showSection(button.dataset.openSection));
    });
    document.getElementById("customersRows").addEventListener("click", (event) => {
        const button = event.target.closest("[data-customer-id]");
        if (button) showCustomerDetails(button.dataset.customerId);
    });

    document.getElementById("overviewPeriod").addEventListener("change", (event) => {
        loadAnalytics(event.target.value).catch((error) => showNotice(error.message, true));
    });
    document.getElementById("salesPeriod").addEventListener("change", (event) => {
        loadAnalytics(event.target.value).catch((error) => showNotice(error.message, true));
    });
    document.getElementById("exportSalesCsv").addEventListener("click", exportSalesCsv);
    document.getElementById("printSales").addEventListener("click", () => window.print());
    document.getElementById("clearTransactions").addEventListener("click", async () => {
        const firstConfirmation = window.confirm("Clear all successful sales and transaction history? This permanently removes paid orders from the admin dashboard.");
        if (!firstConfirmation) return;
        const secondConfirmation = window.confirm("This action cannot be undone. Continue clearing the transaction history?");
        if (!secondConfirmation) return;
        try {
            const result = await apiRequest("/admin/transactions/cleared", { method: "DELETE" });
            await loadDashboard();
            showNotice(`Cleared ${result.deleted_orders} successful order(s), ${result.deleted_payments} payment(s), and ${result.deleted_order_items} item(s).`);
        } catch (error) {
            showNotice(error.message, true);
        }
    });

    document.getElementById("refreshAdmin").addEventListener("click", async () => {
        try {
            await loadDashboard();
            showNotice("Dashboard data refreshed.");
        } catch (error) {
            showNotice(error.message, true);
        }
    });

    document.getElementById("adminSignOut").addEventListener("click", () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        window.location.href = "admin-login.html";
    });

    document.getElementById("closeProductEditor").addEventListener("click", () => {
        document.getElementById("editProductPanel").classList.add("hidden");
        editingProduct = null;
    });

    document.getElementById("addInitialVariant").addEventListener("click", () => {
        document.getElementById("initialVariantRows").append(createVariantEditor());
    });
    document.getElementById("productLengths").addEventListener("change", syncInitialVariantLengths);
    ["productCategories", "editProductCategories"].forEach((id) => {
        const picker = document.getElementById(id);
        picker.addEventListener("change", () => updateCategoryPickerSummary(picker));
    });
    document.getElementById("addManagedVariant").addEventListener("click", () => {
        document.getElementById("managedVariantRows").append(createVariantEditor());
    });
    document.getElementById("closeVariantManager").addEventListener("click", () => {
        document.getElementById("variantManager").classList.add("hidden");
        managedProduct = null;
    });

    initializeImagePreview("image", "productImagePreview", "productForm");
    initializeImagePreview("image", "serviceImagePreview", "serviceForm");
    initializeImagePreview("image", "editProductImagePreview", "editProductForm");

    document.getElementById("editProductForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!editingProduct) return;
        const form = event.currentTarget;
        const button = form.querySelector('button[type="submit"]');
        const data = new FormData(form);
        button.disabled = true;
        try {
            const categoryIds = selectedCategoryIds(form);
            if (!categoryIds.length) {
                throw new Error("Select at least one product category.");
            }
            const image = data.get("image").size > 0 ? await uploadImage(data.get("image")) : editingProduct.image_url;
            await apiRequest(`/products/${editingProduct.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: data.get("name").trim(),
                    description: data.get("description").trim() || null,
                    price: Number(data.get("price")),
                    stock_quantity: Number(data.get("stock_quantity")),
                    length_inches: data.get("length_inches") ? Number(data.get("length_inches")) : null,
                    image_url: image,
                    category_id: categoryIds[0],
                    category_ids: categoryIds,
                }),
            });
            const id = editingProduct.id;
            await loadDashboard();
            openProductEditor(id);
            showNotice("Product details saved. Variants were left unchanged.");
        } catch (error) {
            showNotice(error.message, true);
        } finally {
            button.disabled = false;
        }
    });

    document.getElementById("productForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector('button[type="submit"]');
        const data = new FormData(form);
        const initialVariants = Array.from(document.querySelectorAll("#initialVariantRows .admin-variant-editor"));
        button.disabled = true;
        try {
            const categoryIds = selectedCategoryIds(form);
            if (!categoryIds.length) {
                throw new Error("Select at least one product category.");
            }
            if (initialVariants.some((editor) => editor.querySelector(".admin-variant-image-input").files.length === 0)) {
                throw new Error("Each initial variant needs at least one image.");
            }
            const image = await uploadImage(data.get("image"));
            const externalId = globalThis.crypto?.randomUUID?.() || `admin-${Date.now()}`;
            const createdProduct = await apiRequest("/products", {
                method: "POST",
                body: JSON.stringify({
                    external_id: externalId,
                    name: data.get("name").trim(),
                    description: data.get("description").trim() || null,
                    price: Number(data.get("price")),
                    stock_quantity: Number(data.get("stock_quantity")),
                    length_inches: null,
                    image_url: image,
                    category_id: categoryIds[0],
                    category_ids: categoryIds,
                }),
            });
            for (const editor of initialVariants) {
                const variant = await collectVariantPayload(editor);
                await apiRequest(`/products/${createdProduct.id}/variants`, {
                    method: "POST",
                    body: JSON.stringify(variant),
                });
            }
            form.reset();
            document.querySelectorAll("#productCategories input[name=\"category_ids\"]").forEach((input) => {
                input.checked = false;
            });
            updateCategoryPickerSummary(document.getElementById("productCategories"));
            document.getElementById("productImagePreview").classList.add("hidden");
            document.getElementById("initialVariantRows").replaceChildren();
            syncInitialVariantLengths();
            await loadDashboard();
            showNotice("Product and variants added to the database catalog.");
        } catch (error) {
            showNotice(error.message, true);
        } finally {
            button.disabled = false;
        }
    });

    document.getElementById("serviceForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector('button[type="submit"]');
        const data = new FormData(form);
        button.disabled = true;
        try {
            const image = await uploadImage(data.get("image"));
            await apiRequest("/services", {
                method: "POST",
                body: JSON.stringify({
                    name: data.get("name").trim(),
                    description: data.get("description").trim() || null,
                    image_url: image,
                }),
            });
            form.reset();
            document.getElementById("serviceImagePreview").classList.add("hidden");
            await loadDashboard();
            showNotice("Service added to the salon menu.");
        } catch (error) {
            showNotice(error.message, true);
        } finally {
            button.disabled = false;
        }
    });

    document.addEventListener("click", async (event) => {
        const editProductButton = event.target.closest("[data-edit-product]");
        if (editProductButton) {
            try {
                openProductEditor(editProductButton.dataset.editProduct);
            } catch (error) {
                showNotice(error.message, true);
            }
            return;
        }

        const manageButton = event.target.closest("[data-manage-variants]");
        if (manageButton) {
            try {
                await openVariantManager(manageButton.dataset.manageVariants);
            } catch (error) {
                showNotice(error.message, true);
            }
            return;
        }

        const removeImageButton = event.target.closest("[data-remove-variant-image]");
        if (removeImageButton) {
            removeImageButton.closest(".admin-variant-image").remove();
            return;
        }

        const removeVariantRow = event.target.closest("[data-remove-variant-row]");
        if (removeVariantRow) {
            removeVariantRow.closest(".admin-variant-editor").remove();
            return;
        }

        const saveVariantButton = event.target.closest("[data-save-variant]");
        if (saveVariantButton) {
            const editor = saveVariantButton.closest(".admin-variant-editor");
            const productId = managedProduct?.id;
            saveVariantButton.disabled = true;
            try {
                const payload = await collectVariantPayload(editor);
                const variantId = editor.dataset.variantId;
                const method = variantId ? "PUT" : "POST";
                const path = variantId
                    ? `/products/${productId}/variants/${variantId}`
                    : `/products/${productId}/variants`;
                await apiRequest(path, { method, body: JSON.stringify(payload) });
                await loadDashboard();
                await openVariantManager(productId);
                showNotice("Variant saved.");
            } catch (error) {
                showNotice(error.message, true);
            } finally {
                saveVariantButton.disabled = false;
            }
            return;
        }

        const deleteVariantButton = event.target.closest("[data-delete-variant]");
        if (deleteVariantButton) {
            if (!window.confirm("Permanently delete this variant? Existing order snapshots will be kept; variants in unpaid orders cannot be deleted.")) return;
            const productId = managedProduct?.id;
            deleteVariantButton.disabled = true;
            try {
                await apiRequest(`/products/${productId}/variants/${deleteVariantButton.dataset.deleteVariant}`, { method: "DELETE" });
                await loadDashboard();
                await openVariantManager(productId);
                showNotice("Variant deleted. Order snapshots were preserved.");
            } catch (error) {
                showNotice(error.message, true);
                deleteVariantButton.disabled = false;
            }
            return;
        }

        const productButton = event.target.closest("[data-delete-product]");
        const serviceButton = event.target.closest("[data-delete-service]");
        const target = productButton || serviceButton;
        if (!target) return;

        const itemType = productButton ? "product" : "service";
        if (!window.confirm(`Remove this ${itemType} from the storefront?`)) return;
        target.disabled = true;
        try {
            if (productButton) {
                await apiRequest(`/products/${target.dataset.deleteProduct}`, { method: "DELETE" });
            } else {
                await apiRequest(`/services/${target.dataset.deleteService}`, { method: "DELETE" });
            }
            await loadDashboard();
            showNotice(`${itemType[0].toUpperCase()}${itemType.slice(1)} removed.`);
        } catch (error) {
            target.disabled = false;
            showNotice(error.message, true);
        }
    });

    document.addEventListener("change", async (event) => {
        const deliverySelect = event.target.closest("[data-delivery-status]");
        if (deliverySelect) {
            deliverySelect.disabled = true;
            try {
                const result = await apiRequest(`/admin/orders/${deliverySelect.dataset.deliveryStatus}/delivery-status`, {
                    method: "PATCH",
                    body: JSON.stringify({ delivery_status: deliverySelect.value }),
                });
                const order = orders.find((item) => String(item.id) === deliverySelect.dataset.deliveryStatus);
                if (order) order.delivery_status = result.delivery_status;
                const label = deliverySelect.selectedOptions[0].textContent;
                showNotice(`Order delivery status updated to ${label}.`);
            } catch (error) {
                showNotice(error.message, true);
                await loadDashboard();
            } finally {
                deliverySelect.disabled = false;
            }
            return;
        }

        const select = event.target.closest("[data-booking-status]");
        if (!select) return;
        select.disabled = true;
        try {
            const result = await apiRequest(`/admin/bookings/${select.dataset.bookingStatus}`, {
                method: "PATCH",
                body: JSON.stringify({ status: select.value }),
            });
            const booking = bookings.find((item) => String(item.id) === select.dataset.bookingStatus);
            if (booking) booking.status = select.value;
            if (!result.notifications) {
                showNotice("Booking status is unchanged; no notification was sent.");
                return;
            }

            const delivery = Object.entries(result.notifications)
                .map(([channel, outcome]) => `${channel}: ${outcome.sent ? "sent" : outcome.error}`)
                .join("; ");
            const allSent = Object.values(result.notifications).every((outcome) => outcome.sent);
            showNotice(
                allSent
                    ? "Booking status updated. Customer notified by email and SMS."
                    : `Booking status updated, but customer notifications were incomplete (${delivery}).`,
                !allSent,
            );
        } catch (error) {
            showNotice(error.message, true);
            await loadDashboard();
        } finally {
            select.disabled = false;
        }
    });

    const token = getToken();
    if (!token) {
        loading.classList.add("hidden");
        denied.classList.remove("hidden");
        document.getElementById("adminDeniedMessage").textContent = "Sign in with the authorized administrator account to manage Conniecomes.";
        return;
    }

    apiRequest("/users/me")
        .then((user) => {
            if (!user.is_admin) {
                throw new Error("This account does not have administrator access.");
            }
            loading.classList.add("hidden");
            denied.querySelector('a[href="admin-login.html"]')?.remove();
            dashboard.classList.remove("hidden");
            loadDashboard().catch((error) => {
                showNotice(`Could not load dashboard data: ${error.message}`, true);
            });
        })
        .catch((error) => {
            loading.classList.add("hidden");
            denied.classList.remove("hidden");
            document.getElementById("adminDeniedMessage").textContent = error.message;
        });
}


function showSection(name) {
    document.querySelectorAll("[data-admin-section]").forEach((button) => {
        button.classList.toggle("active", button.dataset.adminSection === name);
    });
    document.querySelectorAll("[data-admin-view]").forEach((section) => {
        section.classList.toggle("active", section.dataset.adminView === name);
    });
    const title = document.querySelector(`[data-admin-section="${name}"]`);
    document.getElementById("adminViewTitle").textContent = title?.textContent || "Overview";
}


document.addEventListener("DOMContentLoaded", initializeAdmin);