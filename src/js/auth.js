// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

function getToken() {
    return localStorage.getItem("access_token");
}

export { getToken };
