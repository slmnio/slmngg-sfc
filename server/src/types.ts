/* Basic types */
import { Snowflake } from "discord-api-types/globals";
import { MapObject } from "./discord/managers.js";

export type CleanAirtableID = string;
export type DirtyAirtableID = `rec${CleanAirtableID}`;
export type AnyAirtableID = DirtyAirtableID | CleanAirtableID;
export type BroadcastResolvableID = `broadcast_${DirtyAirtableID}`;
export type MatchResolvableID = `match_${DirtyAirtableID}`;
export type TeamResolvableID = `team_${DirtyAirtableID}`;
export type PlayerResolvableID = `player_${DirtyAirtableID}`;
export type EventResolvableID = `event_${DirtyAirtableID}`;
export type BracketResolvableID = `bracket_${DirtyAirtableID}`;
export type GFXResolvableID = `gfx_${DirtyAirtableID}`;
export type MatchMapResolvableID = `matchmap_${DirtyAirtableID}`;
export type PlayerRelationshipResolvableID = `playerrelationship_${DirtyAirtableID}`;
export type ReportResolvableID = `report_${DirtyAirtableID}`;
export type LogFilesResolvableID = `logfile_${DirtyAirtableID}`;
export type HeroResolvableID = `hero_${DirtyAirtableID}`;
export type SocialResolvableID = `social_${DirtyAirtableID}`;
export type ClientResolvableID = `client_${DirtyAirtableID}`;
export type NewsResolvableID = `news_${DirtyAirtableID}`;
export type AdReadResolvableID = `adread_${DirtyAirtableID}`;
export type LiveGuestResolvableID = `liveguest_${DirtyAirtableID}`;
export type ThemeResolvableID = `theme_${DirtyAirtableID}`;
export type AccoladeResolvableID = `accolade_${DirtyAirtableID}`;
export type GameMapResolvableID = `gamemap_${DirtyAirtableID}`;
export type SignupDataResolvableID = `signupdata_${DirtyAirtableID}`;
export type EventSeriesResolvableID = `eventseries_${DirtyAirtableID}`;
export type InterviewResolvableID = `interview_${DirtyAirtableID}`;

export type JSONString = `{${string}}`;
export type CSSString = string;
export type MapObjectString = MapObject["textMap"] | string;

export type ResolvedData<IDType> =
IDType extends MatchResolvableID ? Match :
IDType extends TeamResolvableID ? Team :
IDType extends PlayerResolvableID ? Player :
IDType extends EventResolvableID ? Event :
IDType extends BracketResolvableID ? Bracket :
IDType extends GFXResolvableID ? GFX :
IDType extends MatchMapResolvableID ? MatchMap :
IDType extends PlayerRelationshipResolvableID ? PlayerRelationship :
IDType extends ReportResolvableID ? Report :
IDType extends LogFilesResolvableID ? LogFile :
IDType extends HeroResolvableID ? Hero :
IDType extends SocialResolvableID ? Social :
IDType extends ClientResolvableID ? Client :
IDType extends NewsResolvableID ? News :
IDType extends AdReadResolvableID ? AdRead :
IDType extends LiveGuestResolvableID ? LiveGuest :
IDType extends ThemeResolvableID ? Theme :
IDType extends AccoladeResolvableID ? Accolade :
IDType extends GameMapResolvableID ? GameMap :
IDType extends SignupDataResolvableID ? SignupData :
IDType extends EventSeriesResolvableID ? EventSeries :
IDType extends InterviewResolvableID ? Interview :
any;

export type LimitedPlayer = string;
export type LimitedPlayersString = string;

export type DiscordUserData = {
    id: Snowflake,
    username: string,
    discriminator: string,
    global_name: string,

    avatar: string,
    banner: string,
    accent_color: number,
    banner_color: string,
    locale: string,
    premium_type: number
}


export interface Base {
    id: string;
    modified: string;
    __tableName: string;
}

export type WebsiteSettings =
    "Can edit any match"
    | "Full broadcast permissions"
    | "Can edit any event"
    | "Can edit any auction"
    | "No profile editing"

export type Game = "Overwatch" | "Valorant" | "League of Legends" | "Counter-Strike" | "Deadlock";

// /**
//  * @property member_of - Teams this player is a player of
//  */
export interface Player extends Base {
    id: PlayerResolvableID;
    __tableName: "Players";

    name?: string;
    discord_id?: string;
    discord_tag?: string;
    battletag?: string;
    pronouns?: string;
    pronunciation?: string;
    verified?: boolean;
    website_settings?: WebsiteSettings[];

    role?: string;
    staff_role?: string;
    remote_feed?: string;
    slug_override?: string;

    auction_price?: number;

    created?: string;
    favourite_hero?: HeroResolvableID[];
    live_guests?: LiveGuestResolvableID[];
    profile_picture_theme?: ThemeResolvableID[];


    ad_reads?: AdReadResolvableID[];
    casted_events?: EventResolvableID[];
    casts?: MatchResolvableID[];
    clients?: ClientResolvableID[];
    event_staff?: EventResolvableID[];
    member_of?: TeamResolvableID[];
    news?: NewsResolvableID[];
    player_relationships?: PlayerRelationshipResolvableID[];
    team_staff?: TeamResolvableID[];
    owned_teams?: TeamResolvableID[];
    captain_of?: TeamResolvableID[];

    socials?: SocialResolvableID[];
    controlled_teams?: TeamResolvableID[];
    highlighted_on?: BroadcastResolvableID[];
    mvp_matches?: MatchResolvableID[];
}
interface Bracket extends Base {

}
interface GFX extends Base {

}
export interface MatchMap extends Base {
    map?: GameMapResolvableID[]
    match?: MatchResolvableID[]
    draw?: boolean;
    mode?: string; // not sure what this does
    number?: number;
    replay_code?: string;
    score_1?: number;
    score_2?: number;
    stats?: string;

    banner?: TeamResolvableID[];
    picker?: TeamResolvableID[];
    winner?: TeamResolvableID[];

    team_1_bans?: HeroResolvableID[];
    team_2_bans?: HeroResolvableID[];
    team_1_picks?: HeroResolvableID[];
    team_2_picks?: HeroResolvableID[];
    flip_pick_ban_order?: boolean;
    public?: boolean;
}
interface PlayerRelationship extends Base {

}
export interface Report extends Base {
    id: ReportResolvableID;
    __tableName: "Reports";

    approved?: boolean;
    approved_by_team?: boolean;
    approved_by_opponent?: boolean;
    denied_by_opponent?: boolean;
    countered_by_opponent?: boolean;
    approved_by_staff?: boolean;
    denied_by_staff?: boolean;
    force_approved?: boolean;

    data?: string;
    countered_data?: string;
    message_data?: string;
    log?: string;
    type?: "Scores" | "Attributes" | "Rescheduling";

    match?: MatchResolvableID[];
    player?: PlayerResolvableID[];
    team?: TeamResolvableID[];
}

// export type ReschedulingReportMessageTypes =
//       "reschedule_opponent_approval"
//     | "reschedule_staff_preapproval"
//     | "reschedule_staff_approval"
//
//     | "reschedule_completed"
//
//     | "reschedule_opponent_denial"
//     | "reschedule_staff_denial"
//     | "reschedule_team_cancel"
//     | "reschedule_opponent_cancel" // unlikely to use this

const ReschedulingReportMessageTypes = [
    "reschedule_opponent_approval",
    "reschedule_staff_preapproval",
    "reschedule_staff_approval",
    "reschedule_completed",
    "reschedule_opponent_denial",
    "reschedule_staff_denial",
    "reschedule_team_cancel",
    "reschedule_opponent_cancel",
] as const;

export type ReschedulingReportKeys = (typeof ReschedulingReportMessageTypes)[number];


const ScoreReportingMessageTypes = [
    "report_staff_notification",
    "report_opponent_notification",
    "report_completed_public",
    "report_completed_staff"
] as const;

export type ScoreReportingReportKeys = (typeof ScoreReportingMessageTypes)[number];

interface LogFile extends Base {

}
export interface Hero extends Base {
    id: HeroResolvableID;
    __tableName: "Heroes";

    name?: string;
    role?: string;
    game?: Game;
    icon_emoji_text?: string;

    broadcasts?: BroadcastResolvableID[];
    players?: PlayerResolvableID[];

    maps?: MatchMapResolvableID[];
    maps_2?: MatchMapResolvableID[];
    maps_3?: MatchMapResolvableID[];
    maps_4?: MatchMapResolvableID[];

    icon?: CacheAttachment[];
    symbol?: CacheAttachment[];
    main_image?: CacheAttachment[];
    alternate_set_image?: CacheAttachment[];
    recolor_base?: CacheAttachment[];
    recolor_layers?: CacheAttachment[];

    pick_audio?: CacheAttachment[];
    ban_audio?: CacheAttachment[];
}
interface Social extends Base {

}
interface News extends Base {

}
interface AdRead extends Base {

}
interface LiveGuest extends Base {

}
export interface Theme extends Base {
    id: ThemeResolvableID;
    __tableName: "Themes";

    event?: EventResolvableID[];
    events_as_title_sponsor?: EventResolvableID[];
    live_guests?: LiveGuestResolvableID[];
    team?: TeamResolvableID[];

    team_blue?: TeamResolvableID[];
    team_red?: TeamResolvableID[];
    players?: PlayerResolvableID[];

    name?: string;
    description?: string;
    desk_colors?: string;
    available_for_factboxes?: boolean;

    color_accent?: `#${string}`;
    color_alt?: `#${string}`;
    color_body?: `#${string}`;
    color_dark?: `#${string}`;
    color_gradient?: `#${string}`;
    color_hero_recolor_primary?: `#${string}`;
    color_hero_recolor_secondary?: `#${string}`;
    color_logo_accent?: `#${string}`;
    color_logo_background?: `#${string}`;
    color_navbar?: `#${string}`;
    color_text_on_body?: `#${string}`;
    color_text_on_dark?: `#${string}`;
    color_text_on_logo_background?: `#${string}`;
    color_text_on_theme?: `#${string}`;
    color_theme?: `#${string}`;
    color_theme_on_dark?: `#${string}`;
    color_website_active?: `#${string}`;
    color_website_passive?: `#${string}`;

    default_logo?: CacheAttachment[];
    default_wordmark?: CacheAttachment[];
    small_logo?: CacheAttachment[];

    logo_on_dark?: CacheAttachment[];
    logo_on_light?: CacheAttachment[];
    logo_on_theme?: CacheAttachment[];
    wordmark_on_dark?: CacheAttachment[];
    wordmark_on_light?: CacheAttachment[];
    wordmark_on_theme?: CacheAttachment[];
}
interface Accolade extends Base {

}
export interface GameMap extends Base {
    audio?: CacheAttachment[];
    audio_volume?: number;
    big_image?: CacheAttachment[];
    image?: CacheAttachment[];
    video?: CacheAttachment[];

    /**
     * events - as part of a map pool
     */
    events?: EventResolvableID[];
    game?: Game;
    maps?: MatchMapResolvableID[];
    name?: string;
    short_name?: string;
    shorter_name?: string;
    type?: string;

}
interface SignupData extends Base {

}
interface EventSeries extends Base {

}

interface Interview extends Base {

}

export interface Match extends Base {
    id: MatchResolvableID;
    modified: string;
    __tableName: "Matches";

    name: string;
    alternative_vod?: string;
    brackets?: BracketResolvableID[];
    casters?: PlayerResolvableID[];
    clean_feed?: string;
    custom_name?: string;
    day?: number;
    division?: string;
    duration?: number;
    event?: EventResolvableID[];
    first_to?: number;
    flip_teams?: boolean;
    forfeit?: boolean;
    forfeit_reason?: string;
    game_version?: string;
    gfx?: GFXResolvableID[];
    live?: boolean;
    live_broadcast?: BroadcastResolvableID[];
    log_files?: LogFilesResolvableID[];
    map_set?: string;
    maps?: MatchMapResolvableID[];
    match_group?: string;
    match_number?: number;
    middle_text?: string;
    mvp?: PlayerResolvableID[];
    placeholder_right?: boolean;
    placeholder_teams?: string;
    player_relationships?: PlayerRelationshipResolvableID[];
    reports?: ReportResolvableID[];
    report_history?: ReportResolvableID[];
    round?: string;
    schedule_text?: string;
    scheduled_broadcast?: string;
    score_1?: number;
    score_2?: number;
    show_notes?: string;
    show_on_overlays?: boolean;
    show_on_secondary_overlays?: boolean;
    special_event?: boolean;
    start?: string;
    earliest_start?: string;
    latest_start?: string;
    stats?: string;
    stream_code?: string;
    sub_event?: string;
    sub_matches?: MatchResolvableID;
    teams?: TeamResolvableID[];
    use_event_thumbnail?: boolean;
    valorant?: string;
    vod?: string;
    vod_2?: string;
    week?: number;
    week_heading?: string;
    week_text?: string;
}

export interface Team extends Base {
    accolades?: AccoladeResolvableID[];
    aliases?: string;
    balance?: number;
    blue_theme?: ThemeResolvableID[];
    bpl_performance_ranking?: number;
    brand_designers?: PlayerResolvableID[];
    broadcast_interviews?: InterviewResolvableID[];
    broadcasts_highlighted?: BroadcastResolvableID[];
    captains?: PlayerResolvableID[];
    code?: string;
    control_ids?: string;
    controllers?: PlayerResolvableID[];
    description?: string;
    discord_control?: MapObjectString;
    draft_order?: number;
    event?: EventResolvableID[];
    extra_points?: number;
    hide_from_listings?: boolean;
    images?: CacheAttachment[];
    limited_players?: LimitedPlayersString;
    live_guests?: LiveGuestResolvableID[];
    maps_won?: MatchMapResolvableID[];
    maps_banned?: MatchMapResolvableID[];
    maps_picked?: MatchMapResolvableID[];
    matches?: MatchResolvableID[];
    minor_team?: boolean;
    name?: string;
    safe_twitch_name?: string;
    news_items?: NewsResolvableID[];
    owners?: PlayerResolvableID[];
    player_relationships?: PlayerRelationshipResolvableID[];
    players?: PlayerResolvableID[];
    ranking_sort?: number;
    ranking_text?: string;
    red_theme?: ThemeResolvableID[];
    report?: ReportResolvableID[];
    show_notes?: string;
    sister_teams?: TeamResolvableID[];
    small_overlay_text?: string;
    socials?: SocialResolvableID[];
    split_name?: string;
    staff?: PlayerResolvableID[];
    subdomain?: string;
    subtitle?: string;
    team_category?: string;
    team_in_other_tournaments?: TeamResolvableID[];
    theme?: ThemeResolvableID[];
    type_description?: string;
}

export type AntileakOptions = `Hide ${"all" | "teams" | "matches" | "staff" | "brackets" | "articles"}`

/* TODO: need to check what the raw data is here, then see what attachment data can be pulled from cache */
export type CacheAttachment = {
    _autoFilename: string;
    fileExtension: string;
}

export type GameOption = "Overwatch" | "Valorant" | "League of Legends" | "F1" | "Counter-Strike";
export type EventTag = "BPL community event" | "White-label" | "Tier 2" | "Tier 2/3" | "Production value example";
export type EventTier = `${"S"|"A"|"B"|"C"} Tier` | "Unranked";

export interface Event extends Base {
    id: EventResolvableID
    __tableName: "Events";

    name?: string;
    about?: string;
    accolades?: AccoladeResolvableID[];
    antileak?: AntileakOptions[];
    blocks?: JSONString;
    broadcast_css?: CSSString;
    broadcast_texture?: CacheAttachment[];
    broadcasts?: BroadcastResolvableID[];
    broadcasts_highlighted?: BroadcastResolvableID[];
    casters?: PlayerResolvableID[];
    clarify_teams?: boolean;
    discord_control?: MapObjectString;
    draftable_players?: PlayerResolvableID[];
    embed_url?: string;
    event_series?: EventSeriesResolvableID[];
    feeder_events?: EventResolvableID[];
    game?: GameOption;
    in_progress?: boolean;
    map_pool?: GameMapResolvableID[];
    matches?: MatchResolvableID[];
    navbar_events?: EventResolvableID[];
    navbar_name?: string;
    navbar_short?: string;
    news_items?: NewsResolvableID[];
    partial_subdomain?: string;
    participation_points?: number;
    player_relationships?: PlayerRelationshipResolvableID[];
    series_name?: string;
    series_subtitle?: string;
    short?: string;
    show_in_events?: boolean;
    show_public_team_details?: boolean;
    signup_data?: SignupDataResolvableID[];
    slmn_event?: boolean;
    slug?: string;
    socials?: SocialResolvableID[];
    staff?: PlayerResolvableID[];
    start_date?: string;
    subdomain?: string;
    tags?: EventTag[];
    teams?: TeamResolvableID[];
    theme?: ThemeResolvableID[];
    tier?: EventTier;
    title_sponsor?: ThemeResolvableID[];
}

export interface Client extends Base {
    id: ClientResolvableID;
    __tableName: "Clients";

    name?: string;
    key?: string;
    staff?: DirtyAirtableID[];
    /**
     * Array of linked broadcasts, but first one is the "active" one -> [0] to make it active
     */
    broadcast?: BroadcastResolvableID[];
}

export type AuthUserData = {
    discordID: Snowflake;
    airtableID: AnyAirtableID;
    user: {
        discord: DiscordUserData;
        airtable: Player;
    }
}
export type UserData = AuthUserData["user"];

export type ActionAuth = {
    user: UserData;
    client?: Client;
    isAutomation?: boolean;
}


export type EventSettings = {
    foldy?: {
        use?: boolean;
        groups?: string[];
        calculate?: ({ top: number } | { bottom: number })[]
    };
    standings?: {
        show?: string[];
        sort?: string[];
        group?: string;
        title?: string;
        key?: string;
        tieText?: string;
    }[];
    auction?: {
        money: any;
        time: any;
    };
    composition?: {
        use?: boolean;
        ctaText?: string;
        ctaLink?: string;
        useCalculator?: boolean;
        text?: string;
    };
    reporting?: {
        attributes?: never;
        score?: {
            use?: boolean;
            staffApprove?: boolean;
            opponentApprove?: boolean;

            showHeroPicks?: boolean;
            showHeroBans?: boolean;
            showMapBans?: boolean;
            allowForfeits?: boolean;
        },
        rescheduling: {
            use?: boolean;
            staffApprove?: boolean;
            opponentApprove?: boolean;
        }
    };
    logging?: {
        publicRosterChanges?: Snowflake;
        matchTimeChanges?: Snowflake;
        postMatchReports?: Snowflake;
        captainNotifications?: Snowflake;

        staffApprovalNotifications?: Snowflake;
        staffScoreReport?: Snowflake;
        staffCompletedScoreReport?: Snowflake;

        sendStaffPreapprovalNotifications?: boolean;
        hideNonStaffRosterChanges?: boolean;
    }
}
