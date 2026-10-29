// ============================================================
// MOBILE NAVIGATION
// ============================================================

function initializeNavigation() {

    const toggle =
        document.querySelector(
            ".menu-toggle"
        );


    const nav =
        document.querySelector(
            ".nav"
        );


    if (!nav) {
        return;
    }

    if (!nav.querySelector(".nav-search")) {
        const searchForm = document.createElement("form");
        searchForm.className = "nav-search";
        searchForm.setAttribute("role", "search");
        searchForm.innerHTML = '<label class="nav-search-label"><span class="nav-search-icon" aria-hidden="true">⌕</span><input type="search" name="q" placeholder="Search products" aria-label="Search products"></label>';
        const params = new URLSearchParams(window.location.search);
        searchForm.querySelector("input").value = params.get("q") || "";
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = searchForm.querySelector("input").value.trim();
            const shopUrl = window.location.pathname.includes("/pages/")
                ? `shop.html?q=${encodeURIComponent(query)}`
                : `pages/shop.html?q=${encodeURIComponent(query)}`;
            window.location.href = shopUrl;
        });
        nav.append(searchForm);
    }

    if (!toggle) {
        return;
    }


    toggle.addEventListener(
        "click",
        function () {

            nav.classList.toggle(
                "open"
            );
        }
    );
}



export { initializeNavigation };
