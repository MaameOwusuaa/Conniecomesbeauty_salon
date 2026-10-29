function getGuestSessionId() {
    let sessionId = localStorage.getItem("guest_session_id");
    if (!sessionId) {
        sessionId = globalThis.crypto?.randomUUID?.();
        if (!sessionId) {
            throw new Error("This browser cannot create a secure guest session.");
        }
        localStorage.setItem("guest_session_id", sessionId);
    }
    return sessionId;
}


function guestHeaders(headers = {}) {
    return {
        ...headers,
        "X-Guest-Session": getGuestSessionId(),
    };
}


export { getGuestSessionId, guestHeaders };
