import { fetchThings } from "@/utils/fetch";

export async function getSubdomain() {
    const host = window.location.hostname;
    const domains = ["slmn.gg", "localslmn", "localhost"].map(d => ({
        main: d,
        r: new RegExp(`(?:^|(.*)\\.)${d.replace(".", "\\.")}(?:$|\\n)`)
    }));

    let subdomain: string | null = null;

    for (const { r } of domains) {
        const result = host.match(r);
        if (result?.[1] && !["dev", "live"].includes(result[1])) {
            if (result[1].endsWith(".dev")) {
                result[1] = result[1].slice(0, -4);
            }
            if (result[1].endsWith(".live")) {
                result[1] = result[1].slice(0, -5);
            }
            subdomain = result[1];
        }
    }

    if (!subdomain) {
        console.log("[subdomain]", "no subdomain, using default routes");
        return { subdomain: null, subID: null };
    }


    console.log("[subdomain]", `found ${subdomain}, checking for minisite`);

    const data = await fetchThings([`subdomain-${subdomain}`]);

    if (!data?.[0]?.id) {
        console.log("[subdomain]", "no valid minisite");
        return { subdomain: null, subID: null };
    }

    const subID = data[0]._original_data_id || data[0].id;

    console.log("[subID]", subID);

    return {
        subdomain, subID
    };
}
