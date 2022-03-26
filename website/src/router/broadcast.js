import IngameOverlay from "@/components/broadcast/roots/IngameOverlay";
import BreakOverlay from "@/components/broadcast/break/BreakOverlay";
import BracketOverlay from "@/components/broadcast/roots/BracketOverlay";
import ScheduleOverlay from "@/components/broadcast/roots/ScheduleOverlay";
import StandingsOverlay from "@/components/broadcast/roots/StandingsOverlay";
import RosterOverlay from "@/components/broadcast/roots/RosterOverlay";
import EventThumbnailCreator from "@/components/broadcast/EventThumbnailCreator";
import DraftOverlay from "@/components/broadcast/roots/DraftOverlay";
import DeskOverlay from "@/components/broadcast/desk/DeskOverlay";
import CustomOverlay from "@/components/broadcast/roots/CustomOverlay";
import InfoOverlay from "@/components/broadcast/roots/InfoOverlay";
import BroadcastBackground from "@/components/broadcast/BroadcastBackground";
import SponsorOverlay from "@/components/broadcast/roots/SponsorOverlay";
import MapsOverlay from "@/components/broadcast/roots/MapsOverlay";
import BreakBarOverlay from "@/components/broadcast/break/BreakBarOverlay";
import PodcastOverlay from "@/components/broadcast/roots/PodcastOverlay";
import BrandingOverlay from "@/components/broadcast/roots/BrandingOverlay";
import AuctionOverlay from "@/components/broadcast/auction/AuctionOverlay";
import AdReadOverlay from "@/components/broadcast/roots/AdReadOverlay";
import SyncerOverlay from "@/components/broadcast/roots/SyncerOverlay";
import LogoAdOverlay from "@/components/broadcast/roots/LogoAdOverlay";
import HistoryOverlay from "@/components/broadcast/roots/HistoryOverlay";
import CamsOverlay from "@/components/broadcast/cams/CamsOverlay";
import CamOverlay from "@/components/broadcast/cams/CamOverlay";
import DeskCamsOverlay from "@/components/broadcast/cams/DeskCamsOverlay";
import StaffOverlay from "@/components/broadcast/roots/StaffOverlay";
import CamsWrapper from "@/components/broadcast/cams/CamsWrapper";
import SeasonHistoryOverlay from "@/components/broadcast/roots/SeasonHistoryOverlay";
import IframeOverlay from "@/components/broadcast/roots/IframeOverlay";
import TallyTransmitter from "@/components/broadcast/roots/TallyTransmitter";
import TallyViewer from "@/components/broadcast/roots/TallyViewer";
import PlayerHistory from "@/components/broadcast/PlayerHistory";
import OverviewOverlay from "@/components/broadcast/roots/OverviewOverlay";
import MediaOverlay from "@/components/broadcast/roots/MediaOverlay";
import MediaClock from "@/components/broadcast/roots/MediaClock";
import FullCamOverlay from "@/components/broadcast/cams/FullCamOverlay";
import CasterBackground from "@/components/broadcast/CasterBackground";
import MusicOverlay from "@/components/broadcast/roots/MusicOverlay";
import ThemeTransitionTester from "@/components/broadcast/roots/ThemeTransitionTester";
import DeskGraphicsOverlay from "@/components/broadcast/roots/DeskGraphicsOverlay";
import EmptyStingerOverlay from "@/components/broadcast/roots/EmptyStingerOverlay";

export default [
    { path: "ingame", component: IngameOverlay, props: route => ({ codes: route.query.codes }) },
    {
        path: "cams",
        component: CamsWrapper,
        props: route => ({ params: route.query.params?.split(",") }),
        children: [
            { path: "desk", component: DeskCamsOverlay },
            { path: "ingame", component: CamsOverlay },
            {
                path: "pov",
                component: CamOverlay,
                props: route => ({
                    number: route.query.number || route.query.player,
                    full: !!route.query.full || !!route.query.relay,
                    alwaysShow: !!route.query.alwaysShow || !!route.query.relay,
                    relay: !!route.query.relay
                })
            },
            {
                path: "full",
                component: FullCamOverlay,
                props: route => ({
                    number: route.query.number || route.query.num || 1,
                    showName: !!route.query.name,
                    showSocials: !!route.query.socials
                })
            }
        ]
    },
    { path: "break", component: BreakOverlay, props: route => ({ secondary: !!route.query.secondary }) },
    { path: "syncer", component: SyncerOverlay },
    { path: "tally-transmitter", component: TallyTransmitter, props: route => ({ number: route.query.num || route.query.number }) },
    { path: "tally-viewer", component: TallyViewer },
    { path: "break-bar", component: BreakBarOverlay },
    {
        path: "bracket",
        component: BracketOverlay,
        props: route => ({
            bracketKey: route.query.key,
            extended: !!route.query.extended || !!route.query.expanded || !!route.query.full,
            scale: route.query.scale,
            small: !!route.query.small
        })
    },
    { path: "schedule", component: ScheduleOverlay, props: route => ({ secondary: !!route.query.secondary }) },
    { path: "iframe", component: IframeOverlay, props: route => ({ url: route.query.url }) },
    { path: "standings", component: StandingsOverlay, props: route => ({ stage: route.query.stage || route.query.group }) },
    { path: "roster", redirect: "rosters" },
    { path: "rosters", component: RosterOverlay, props: route => ({ showRoles: route.query.roles, sort: route.query.sort }) },
    { path: "history", component: HistoryOverlay, props: route => ({ max: route.query.max || 5 }) },
    { path: "season-history", component: SeasonHistoryOverlay },
    { path: "thumbnail", component: EventThumbnailCreator },
    {
        path: "draft",
        component: DraftOverlay,
        props: route => ({
            columns: route.query.columns || 1,
            icons: route.query.icons !== "false",
            showStaff: route.query.staff !== "false",
            teamRows: route.query.rows || route.query.teamRows || 1
        })
    },
    { path: "casters", redirect: "desk" },
    {
        path: "caster-bg",
        component: CasterBackground,
        props: route => ({
            defaultMap: (route.query.map || route.query.default || "").toLowerCase() || null,
            useVideo: (route.query.video !== "false")
        })
    },
    { path: "desk", component: DeskOverlay, props: route => ({ group: "casters" }) },
    { path: "podcast", component: PodcastOverlay, props: route => ({ rows: route.query.rows }) },
    { path: "custom", component: CustomOverlay },
    { path: "info", component: InfoOverlay },
    { path: "background", component: BroadcastBackground, props: route => ({ index: route.query.index }) },
    { path: "sponsors", component: SponsorOverlay },
    { path: "maps", component: MapsOverlay, props: route => ({ autoTitle: route.query.auto }) },
    { path: "branding", component: BrandingOverlay },
    { path: "auction", component: AuctionOverlay, props: route => ({ category: route.query.category }) },
    { path: "ad-read", component: AdReadOverlay, props: route => ({ extraDelay: route.query.delay }) },
    { path: "logos", component: LogoAdOverlay },
    { path: "staff", component: StaffOverlay },
    { path: "player-history", component: PlayerHistory, props: route => ({ showMinor: route.query.minor }) },
    { path: "overview", component: OverviewOverlay },
    { path: "media", component: MediaOverlay },
    { path: "clock", component: MediaClock },
    {
        path: "music",
        component: MusicOverlay,
        props: route => ({
            role: route.query.group || route.query.role,
            showTitle: ["showTitle", "showText", "text", "title", "song"].some(t => route.query[t]),
            volume: parseFloat(route.query.volume) || 0.2,
            crossfadeDuration: parseFloat(route.query.crossfade || route.query.fade) || 10
        })
    },
    { path: "tester", component: ThemeTransitionTester },
    { path: "desk-graphics", component: DeskGraphicsOverlay },
    { path: "stinger", component: EmptyStingerOverlay },
    { path: "empty", redirect: "stinger" }
];
