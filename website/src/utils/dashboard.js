import { getDataServerAddress } from "@/utils/fetch";

async function authenticatedRequest(auth, url, data) {
    const token = auth?.token;
    if (!token) return { error: true, message: "No token" };
    return await fetch(`${getDataServerAddress()}/${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authentication: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }).then(res => res.json());
}

export async function setActiveBroadcast(auth, client, broadcast) {
    if (!auth?.user) return { error: true, message: "Not authenticated" };

    return await authenticatedRequest(auth, "dashboard/set-active-broadcast", {
        client: client.id || client, broadcast: broadcast.id || broadcast
    });
}
