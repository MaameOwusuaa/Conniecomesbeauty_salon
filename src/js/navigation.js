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


    if (!toggle || !nav) {
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
