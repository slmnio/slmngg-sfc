import { getDataServerAddress } from "@/utils/fetch";

export async function authenticateWithDiscord(app, code) {
    if (!app || !code) return { error: true, errorMessage: "Empty authentication request" };

    const authenticationRequest = await fetch(`${getDataServerAddress()}/auth/discord-login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code
        })
    }).then(res => res.json());

    console.log("[Auth]", authenticationRequest);

    if (authenticationRequest.error) {
        console.warn("Authentication error:", authenticationRequest.for_a_developer);
        return { error: true, errorMessage: authenticationRequest.message };
    }

    app.auth.token = authenticationRequest.token;
    app.$cookies.set("token", authenticationRequest.token, "3d");
    app.auth.user = authenticationRequest.user;

    return {
        error: false
    };
}

export async function authenticateWithToken(app, token) {
    if (!app || !token) return { error: true, errorMessage: "Empty authentication request" };
    console.log("Authenticating with SLMN.GG token");

    const authenticationRequest = await fetch(`${getDataServerAddress()}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token
        })
    }).then(res => res.json());

    console.log("[Auth]", authenticationRequest);

    if (authenticationRequest.error) {
        console.warn("Authentication error:", authenticationRequest.for_a_developer);

        if (authenticationRequest.message === "Unknown token") {
            console.log("[Auth] removing token since the server doesn't recognise it.");
            app.$cookies.remove("token");
        }

        return { error: true, errorMessage: authenticationRequest.message };
    }

    app.auth.user = authenticationRequest.user;
    app.auth.token = token;
    return {
        error: false
    };
}

export async function getAuthenticationRedirect() {
    // redirect to Discord for auth
}

export function isAuthenticated(app) {
    return !!app.auth?.user;
}
