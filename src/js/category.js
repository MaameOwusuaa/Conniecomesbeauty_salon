// ============================================================
// CATEGORY PAGE
// ============================================================

function initializeCategoryPage() {

    const products =
        document.querySelectorAll(
            ".category-product"
        );


    if (!products.length) {
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


    // --------------------------------------------------------
    // ALL PRODUCTS
    // --------------------------------------------------------

    if (!category || category === "all") {

        products.forEach(
            function (product) {

                product.classList.remove(
                    "hidden"
                );
            }
        );


        if (categoryTitle) {

            categoryTitle.textContent =
                "All Products";
        }


        if (categoryDescription) {

            categoryDescription.textContent =
                "Explore our complete collection of premium hair.";
        }


        return;
    }


    // --------------------------------------------------------
    // CATEGORY NAMES
    // --------------------------------------------------------

    const categoryNames = {

        wigs:
            "Wigs",

        frontals:
            "Frontals",

        closures:
            "Closures",

        bundles:
            "Bundles",

        straight:
            "Straight Hair",

        curly:
            "Curly Hair"
    };


    // --------------------------------------------------------
    // CATEGORY DESCRIPTIONS
    // --------------------------------------------------------

    const categoryDescriptions = {

        wigs:
            "Explore our collection of ready-made wigs.",

        frontals:
            "Shop premium frontals in different sizes and styles.",

        closures:
            "Discover premium closures for your perfect hairstyle.",

        bundles:
            "Shop our human hair bundles in deifferent lengths",   

        straight:
            "Explore our premium straight human hair collection.",

        curly:
            "Shop beautiful curly human hair for a natural look."
    };


    // --------------------------------------------------------
    // FILTER PRODUCTS
    // --------------------------------------------------------

    products.forEach(
        function (product) {

            const productCategory =
                product.dataset.category;


            if (
                productCategory ===
                category
            ) {

                product.classList.remove(
                    "hidden"
                );

            } else {

                product.classList.add(
                    "hidden"
                );
            }
        }
    );


    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    if (categoryTitle) {

        categoryTitle.textContent =
            categoryNames[category] ||
            "Products";
    }


    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    if (categoryDescription) {

        categoryDescription.textContent =
            categoryDescriptions[category] ||
            "Explore our premium hair collection.";
    }
}



export { initializeCategoryPage };
