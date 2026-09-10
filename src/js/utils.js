// ============================================================
// HTML SAFETY HELPERS
// ============================================================

function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );
}


// ============================================================
// CURRENCY
// ============================================================

function money(
    amount
) {

    return new Intl.NumberFormat(
        "en-GH",
        {
            style: "currency",
            currency: "GHS"
        }
    ).format(
        Number(
            amount || 0
        )
    );
}



export { escapeHTML, escapeAttribute, money };
