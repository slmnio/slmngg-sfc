import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {getDataServerAddress, getMainDomain} from "@/utils/fetch";

export const useAuthStore = defineStore("auth", () => {

    const token = ref<string | null>(null);
    const authNext = ref<string | null>(null);
    const user = ref<any | null>(null);
    const auth = computed(() => ({
        token: token.value,
        user: user.value
    }))

    const isAuthenticated = computed(() => !!user.value);
    const isProduction = computed(() => {
        return !!user.value?.clients?.length
    })

    async function authenticateWithDiscord(code: string) {
        if (!code) return {error: true, errorMessage: "Empty authentication request"};

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
            return {error: true, errorMessage: authenticationRequest.message};
        }
        // TODO this should be cookies
        token.value = authenticationRequest.token;
        user.value = authenticationRequest.user;

        return {
            error: false
        };
    }

    function setAuthNext(path: string) {
        const url = path.startsWith("http") ? path : ((window.location.origin === getMainDomain() ? "" : window.location.origin) + path);

        console.log("[auth] Setting auth_next", url, "via", getMainDomain());
        console.trace("[auth] Setting auth_next");

        authNext.value = url;
    }

    function getAuthNext(noRemove?: boolean) {
        const next = authNext.value;
        console.log(`[auth] Getting ${noRemove ? "" : "& removing "}auth_next`, next);

        if (!noRemove) {
            authNext.value = null;
        }
        return next;
    }

    async function authenticateWithToken(newToken: string) {
        if (!newToken) return {error: true, errorMessage: "Empty authentication request"};
        console.log("Authenticating with SLMN.GG token");

        const authenticationRequest = await fetch(`${getDataServerAddress()}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: newToken
            })
        }).then(res => res.json());

        console.log("[Auth]", authenticationRequest);

        if (authenticationRequest.error) {
            console.warn("Authentication error:", authenticationRequest.for_a_developer);

            if (authenticationRequest.message === "Unknown token") {
                console.log("[Auth] removing token since the server doesn't recognise it.");
                token.value = null;
            }

            return {error: true, errorMessage: authenticationRequest.message};
        }

        user.value = authenticationRequest.user;
        token.value = newToken;
        return {
            error: false
        };
    }

    return {
        token,
        user,
        auth,
        isAuthenticated,
        isProduction,
        authenticateWithDiscord,
        setAuthNext,
        getAuthNext,
        authenticateWithToken
    }


}, {persist: true});
