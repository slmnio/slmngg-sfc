import { getDataServerAddress } from "@/utils/fetch";
import { Notyf } from "notyf";
import { type AnyAirtableID, useAuthStore } from "@/stores/authStore";

const notyf = new Notyf({ duration: 5000, position: { x: "right", y: "top" }, dismissible: true });

type ActionKey = "create-live-guest" |
    "manage-prediction" |
    "multi-map-win" |
    "resolve-entire-bracket" |
    "set-active-broadcast" |
    "set-match-overlays" |
    "set-observer-setting" |
    "set-title" |
    "start-commercial" |
    "toggle-flip-teams" |
    "update-break-automation" |
    "update-break-display" |
    "update-broadcast" |
    "update-gfx-index" |
    "update-map-data" |
    "update-match-data" |
    "update-profile-data" |
    "set-player-relationships" |
    "adjust-match-broadcast"

type RequestUrl = `actions/${ActionKey}`

type NoRequestData = never
type CreateLiveGuestData = NoRequestData

interface LockResolvePredictionData {
    predictionType: "match" | "map"
    predictionAction: "lock" | "resolve"
}
interface CreatePredictionData {
    predictionAction: "create"
    predictionType: "match" | "map"
    autoLockAfter: number
}
interface CancelPredictionData {
    predictionAction: "cancel"
}

type ManagePredictionData = (CancelPredictionData | LockResolvePredictionData | CreatePredictionData)

interface MultiMapWinData {
    teamNum: 1 | 2
    unsetMapAttack?: boolean
}

interface ResolveEntireBracketData {
    bracketID: AnyAirtableID
}

interface SetActiveBroadcastData {
    broadcast: AnyAirtableID
    client: AnyAirtableID
}

interface SetMatchOverlaysData {
    match: AnyAirtableID
    overlayType: "primary" | "secondary"
    state: boolean
}

interface SetObserverSettingData {
    setting: string
    value: boolean | "toggle"
}

type SetTitleData = NoRequestData;

interface StartCommercialData {
    commercialDuration: 30 | 60 | 90 | 120 | 150 | 180
}

type ToggleFlipTeamsData = NoRequestData

type BreakAutomationOption =
    "use: Schedule" |
    "use: Standings" |
    "use: Image" |
    "use: Staff" |
    "use: Bracket" |
    "use: Matchup" |
    "use: Title" |
    "use: Other Info" |
    "setting: Always do 30s Matchup" |
    "setting: Always do 30s Schedule";

interface UpdateBreakAutomationData {
    options: BreakAutomationOption[]
}

type UpdateBreakDisplayOptions =
    "Automated" |
    "Schedule" |
    "Standings" |
    "Image" |
    "Bracket" |
    "Staff" |
    "Matchup" |
    "Title" |
    "Other Streams" |
    "Other Info";

interface UpdateBreakDisplayData {
    option: UpdateBreakDisplayOptions
}

interface UpdateBroadcastData {
    match?: AnyAirtableID
    advertise?: boolean
    playerCams?: boolean
    showLiveMatch?: boolean
    mapAttack?: null | "Left" | "Right" | "Both"
    title?: string
    manualGuests?: string
    deskDisplayMode?: null | "Match" | "Predictions" | "Maps" | "Notice (Team 1)" | "Notice (Team 2)" | "Notice (Event)" | "Scoreboard" | "Drafted Maps" | "Interview" | "Hidden" | "Casters"
    deskDisplayText?: string
    countdownEnd?: any
    highlightTeamID?: AnyAirtableID
    highlightHeroID?: AnyAirtableID
    highlightPlayerID?: AnyAirtableID
    highlightMediaID?: AnyAirtableID
}

interface UpdateGfxIndexData {
    gfxID: AnyAirtableID
    index: number
}

interface UpdateMapDataData {
    matchID: AnyAirtableID
    mapData: Array<{
        map?: string
        existingID?: string
        winner?: string
        banner?: string
        picker?: string
        score_1?: number
        score_2?: number
        draw?: boolean
    }>
}

interface UpdateMatchDataData {
    matchID: AnyAirtableID
    updatedData: {
        special_event?: string
        custom_name?: string
        score_1?: number
        score_2?: number
        start?: any
        forfeit?: boolean
        forfeit_reason?: string
        vod?: string
        vod_2?: string
    }
}

interface UpdateProfileDataData {
    profileData: {
        pronouns?: string
        role?: "DPS" | "Support" | "Tank" | "Flex"
        favourite_hero?: AnyAirtableID
        profile_picture_theme?: AnyAirtableID
        pronunciation?: string
    }
}

interface SetPlayerRelationshipsData {
    matchID: AnyAirtableID
    roles: Array<{
        [singular_name: string]: {
            selected: AnyAirtableID[]
            /** @deprecated **/ count: number
        }
    }>
}

interface AdjustMatchBroadcastData {
    mode: "add" | "remove"
    broadcastID: AnyAirtableID
    matchID: AnyAirtableID
}


type ActionRequestData<U> =
    U extends "actions/create-live-guest" ? CreateLiveGuestData :
    U extends "actions/manage-prediction" ? ManagePredictionData :
    U extends "actions/multi-map-win" ? MultiMapWinData :
    U extends "actions/resolve-entire-bracket" ? ResolveEntireBracketData :
    U extends "actions/set-active-broadcast" ? SetActiveBroadcastData :
    U extends "actions/set-match-overlays" ? SetMatchOverlaysData :
    U extends "actions/set-observer-setting" ? SetObserverSettingData :
    U extends "actions/set-title" ? SetTitleData :
    U extends "actions/start-commercial" ? StartCommercialData :
    U extends "actions/toggle-flip-teams" ? ToggleFlipTeamsData :
    U extends "actions/update-break-automation" ? UpdateBreakAutomationData :
    U extends "actions/update-break-display" ? UpdateBreakDisplayData :
    U extends "actions/update-broadcast" ? UpdateBroadcastData :
    U extends "actions/update-gfx-index" ? UpdateGfxIndexData :
    U extends "actions/update-map-data" ? UpdateMapDataData :
    U extends "actions/update-match-data" ? UpdateMatchDataData :
    U extends "actions/update-profile-data" ? UpdateProfileDataData :
    U extends "actions/set-player-relationships" ? SetPlayerRelationshipsData :
    U extends "actions/adjust-match-broadcast" ? AdjustMatchBroadcastData :
    any;


export async function authenticatedRequest<U extends RequestUrl>(url: U, data?: ActionRequestData<U>) {
    const auth = useAuthStore();

    if ((auth?.user) == null) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }

    const token = auth?.token;
    if (token == null) return { error: true, errorMessage: "No token" };

    try {
        const request = await fetch(`${getDataServerAddress()}/${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authentication: `Bearer ${token}`
            },
            body: JSON.stringify(data ?? {})
        }).then(async res => await res.json()).catch((error: Error) => {
            notyf.error({ message: `Request error: ${error.message}` });
            console.error("Fetch error", error);
        });
        console.log(request);
        if (request.error) {
            notyf.error({
                message: request.errorMessage
            });
        }
        return request;
    } catch (e: any) {
        console.error(e);
        return { error: true, errorMessage: e.errorMessage };
    }
}
