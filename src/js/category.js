// ============================================================
// CATEGORY PAGE
// ============================================================

function initializeCategoryPage() {

    if (!document.getElementById("categoryProducts")) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const category =
        params.get("category");


    const categoryTitle =
        document.getElementById(
            "categoryTitle"
        );


    const categoryDescription =
        document.getElementById(
            "categoryDescription"
        );

    const typeFilter =
        document.getElementById(
            "typeFilter"
        );

    const priceFilter =
        document.getElementById(
            "priceFilter"
        );

    const lengthFilter =
        document.getElementById(
            "lengthFilter"
        );

    const textureFilter = document.getElementById("textureFilter");
    const styleFilter = document.getElementById("styleFilter");
    const searchQuery = new URLSearchParams(window.location.search).get("q")?.trim().toLowerCase() || "";


    const categoryNames = {

        all:
            "All Products",

        wigs:
            "Custom Made Wig Caps",

        frontals:
            "Frontals",

        closures:
            "Closures",

        bundles:
            "Bundles",

        bodywave:
            "Body Wave",

        straight:
            "Straight Hair",

        curly:
            "Curly Hair"
    };


    const categoryDescriptions = {

        all:
            "Explore our complete collection of premium hair.",

        wigs:
            "Explore our collection of custom made wig caps and wigs.",

        frontals:
            "Shop premium frontals in different sizes and styles.",

        closures:
            "Discover premium closures for your perfect hairstyle.",

        bundles:
            "Shop our human hair bundles in different lengths.",

        bodywave:
            "Browse our soft body wave styles for a natural, full look.",

        straight:
            "Explore our premium straight human hair collection.",

        curly:
            "Shop beautiful curly human hair for a natural look."
    };


    function applyFilters() {

        const activeCategory =
            category && category !== "all"
                ? category
                : "all";

        const showAllWigs = activeCategory === "wigs";
        const activeType =
            !showAllWigs && typeFilter ? typeFilter.value : "all";

        const activePrice =
            !showAllWigs && priceFilter ? priceFilter.value : "all";

        const activeLength =
            !showAllWigs && lengthFilter ? lengthFilter.value : "all";
        const activeTexture = textureFilter ? textureFilter.value : "all";
        const activeStyle = styleFilter ? styleFilter.value : "all";

        if (styleFilter && textureFilter) {
            const styleOptions = {
                curly: [["pixie", "Pixie"], ["deepwave", "Deepwave"], ["burmese", "Burmese"]],
                bodywave: [["single-drawn", "Single drawn"], ["dd", "Double drawn (DD)"], ["sdd", "Super double drawn (SDD)"]],
                straight: [["bone-straight", "Bone straight"], ["silky-straight-dd", "Silky straight double drawn (DD)"], ["silky-straight-sdd", "Silky straight super double drawn (SDD)"]],
            };
            const desiredOptions = styleOptions[activeTexture] || [];
            const currentValue = styleFilter.value;
            styleFilter.innerHTML = '<option value="all">All styles</option>' + desiredOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
            styleFilter.value = desiredOptions.some(([value]) => value === currentValue) ? currentValue : "all";
            styleFilter.disabled = activeTexture === "all";
        }


        document.querySelectorAll(".category-product").forEach(
            function (product) {

                const productCategories =
                    (product.dataset.categories || product.dataset.category || "")
                        .split(",");

                const productType =
                    product.dataset.type || "all";

                const productPrice =
                    Number(product.dataset.price || 0);

                const productLength =
                    Number(product.dataset.length || 0);

                const productLengths =
                    (product.dataset.lengths || "")
                        .split(",")
                        .map(Number);

                const matchesCategory =
                    activeCategory === "all" ||
                    (showAllWigs
                        ? productType === "wig-cap" ||
                            productCategories.some((name) => name.includes("wig"))
                        : productCategories.includes(activeCategory));

                const matchesType =
                    activeType === "all" ||
                    productType === activeType;

                let matchesPrice = true;

                if (activePrice !== "all") {
                    if (activePrice === "under-300") {
                        matchesPrice = productPrice < 300;
                    } else if (activePrice === "300-500") {
                        matchesPrice =
                            productPrice >= 300 &&
                            productPrice <= 500;
                    } else if (activePrice === "500-700") {
                        matchesPrice =
                            productPrice > 500 &&
                            productPrice <= 700;
                    } else if (activePrice === "700-plus") {
                        matchesPrice = productPrice > 700;
                    }
                }

                const matchesLength =
                    activeLength === "all" ||
                    productLength === Number(activeLength) ||
                    productLengths.includes(Number(activeLength));
                const productTexture = product.dataset.texture || "all";
                const productStyle = product.dataset.style || "all";
                const matchesTexture = activeTexture === "all" || productTexture === activeTexture;
                const matchesStyle = activeStyle === "all" || productStyle === activeStyle;
                const matchesSearch = !searchQuery || (product.dataset.search || product.textContent.toLowerCase()).includes(searchQuery);

                product.classList.toggle(
                    "hidden",
                    !(matchesCategory && matchesType && matchesPrice && matchesLength && matchesTexture && matchesStyle && matchesSearch)
                );
            }
        );
    }


    if (categoryTitle) {
        categoryTitle.textContent =
            categoryNames[category || "all"] || "Products";
    }

    if (categoryDescription) {
        categoryDescription.textContent =
            categoryDescriptions[category || "all"] || "Explore our premium hair collection.";
    }

    [typeFilter, textureFilter, styleFilter, priceFilter, lengthFilter].forEach(
        function (filter) {
            if (filter) {
                if (category === "wigs") {
                    filter.value = "all";
                    filter.disabled = true;
                }
                filter.addEventListener(
                    "change",
                    applyFilters
                );
            }
        }
    );

    document.addEventListener("catalog-updated", applyFilters);
    applyFilters();
}


export { initializeCategoryPage };
