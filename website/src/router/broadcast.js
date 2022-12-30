const TeamAudio = () => import("@/components/broadcast/TeamAudio");
const MapStatsOverlay = () => import("@/components/broadcast/roots/MapStatsOverlay");
const IngameCommsOverlay = () => import("@/components/broadcast/roots/IngameCommsOverlay");
const MVPOverlay = () => import("@/components/broadcast/roots/MVPOverlay");
const MultiStandingsOverlay = () => import("@/components/broadcast/roots/MultiStandingsOverlay");
const ClientOverview = () => import("@/components/broadcast/roots/ClientOverview");

const IngameOverlay = () => import("@/components/broadcast/roots/IngameOverlay");
const BreakOverlay = () => import("@/components/broadcast/break/BreakOverlay");
const BracketOverlay = () => import("@/components/broadcast/roots/BracketOverlay");
const ScheduleOverlay = () => import("@/components/broadcast/roots/ScheduleOverlay");
const StandingsOverlay = () => import("@/components/broadcast/roots/StandingsOverlay");
const RosterOverlay = () => import("@/components/broadcast/roots/RosterOverlay");
const EventThumbnailCreator = () => import("@/components/broadcast/EventThumbnailCreator");
const DraftOverlay = () => import("@/components/broadcast/roots/DraftOverlay");
const DeskOverlay = () => import("@/components/broadcast/desk/DeskOverlay");
const CustomOverlay = () => import("@/components/broadcast/roots/CustomOverlay");
const InfoOverlay = () => import("@/components/broadcast/roots/InfoOverlay");
const BroadcastBackground = () => import("@/components/broadcast/BroadcastBackground");
const SponsorOverlay = () => import("@/components/broadcast/roots/SponsorOverlay");
const MapsOverlay = () => import("@/components/broadcast/roots/MapsOverlay");
const BreakBarOverlay = () => import("@/components/broadcast/break/BreakBarOverlay");
const PodcastOverlay = () => import("@/components/broadcast/roots/PodcastOverlay");
const BrandingOverlay = () => import("@/components/broadcast/roots/BrandingOverlay");
const AuctionOverlay = () => import("@/components/broadcast/auction/AuctionOverlay");
const AdReadOverlay = () => import("@/components/broadcast/roots/AdReadOverlay");
const SyncerOverlay = () => import("@/components/broadcast/roots/SyncerOverlay");
const LogoAdOverlay = () => import("@/components/broadcast/roots/LogoAdOverlay");
const HistoryOverlay = () => import("@/components/broadcast/roots/HistoryOverlay");
const CamsOverlay = () => import("@/components/broadcast/cams/CamsOverlay");
const CamOverlay = () => import("@/components/broadcast/cams/CamOverlay");
const DeskCamsOverlay = () => import("@/components/broadcast/cams/DeskCamsOverlay");
const StaffOverlay = () => import("@/components/broadcast/roots/StaffOverlay");
const CamsWrapper = () => import("@/components/broadcast/cams/CamsWrapper");
const SeasonHistoryOverlay = () => import("@/components/broadcast/roots/SeasonHistoryOverlay");
const IframeOverlay = () => import("@/components/broadcast/roots/IframeOverlay");
const TallyTransmitter = () => import("@/components/broadcast/roots/TallyTransmitter");
const WebsocketTransmitter = () => import("@/components/broadcast/roots/WebsocketTransmitter");
const TallyViewer = () => import("@/components/broadcast/roots/TallyViewer");
const TallyDot = () => import("@/components/broadcast/roots/TallyDot");
const QuadTallyDot = () => import("@/components/broadcast/roots/QuadTallyDot");
const PlayerHistory = () => import("@/components/broadcast/PlayerHistory");
const OverviewOverlay = () => import("@/components/broadcast/roots/OverviewOverlay");
const MediaOverlay = () => import("@/components/broadcast/roots/MediaOverlay");
const MediaClock = () => import("@/components/broadcast/roots/MediaClock");
const FullCamOverlay = () => import("@/components/broadcast/cams/FullCamOverlay");
const CasterBackground = () => import("@/components/broadcast/CasterBackground");
const MusicOverlay = () => import("@/components/broadcast/roots/MusicOverlay");
const ThemeTransitionTester = () => import("@/components/broadcast/roots/ThemeTransitionTester");
const DeskGraphicsOverlay = () => import("@/components/broadcast/roots/DeskGraphicsOverlay");
const EmptyStingerOverlay = () => import("@/components/broadcast/roots/EmptyStingerOverlay");
const OtherBroadcastsOverlay = () => import("@/components/broadcast/roots/OtherBroadcastsOverlay");
const HeroRosterOverlay = () => import("@/components/broadcast/roots/HeroRosterOverlay");

export default [
    {
        path: "admin",
        component: ClientOverview
    },
    {
        path: "ingame",
        component: IngameOverlay,
        props: route => ({ codes: route.query.codes, sponsorFadeSpeed: (route.query.sponsorSpeed || route.query.sponsorFadeSpeed) })
    },
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
                    number: route.query.number || route.query.num || route.query.player,
                    full: !!route.query.full || !!route.query.relay,
                    alwaysShow: !!route.query.alwaysShow || !!route.query.relay,
                    alwaysShowBox: !!route.query.alwaysShowBox || !!route.query.box,
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
    {
        path: "tally-transmitter",
        component: TallyTransmitter,
        props: route => ({
            number: route.query.num || route.query.number
        })
    }, {
        path: "websocket-transmitter",
        component: WebsocketTransmitter,
        props: route => ({
            wsUrl: route.query.url || route.query.wsUrl || route.query.wsurl || route.query.wsURL || "ws://127.0.0.1:4455",
            wsPassword: route.query.wsPassword || route.query.password || route.query.pw,
            wsSceneNameOverride: route.query.sceneName || route.query.scene
        })
    },
    { path: "tally-viewer", component: TallyViewer },
    { path: "tally-dot", component: TallyDot, props: route => ({ number: parseInt(route.query.number) }) },
    { path: "quad", component: QuadTallyDot },
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
    {
        path: "multi-standings",
        component: MultiStandingsOverlay,
        props: route => ({
            stageCodes: (route.query.stage || route.query.group || route.query.stages || route.query.groups || "").split(",").filter(t => t),
            useCodes: !!route.query.codes,
            showColumns: (route.query.columns || route.query.show || "").split(",").filter(t => t)
        })
    },
    { path: "multistandings", redirect: "multi-standings" },
    { path: "roster", redirect: "rosters" },
    {
        path: "rosters",
        component: RosterOverlay,
        props: route => ({
            showRoles: route.query.roles,
            sort: route.query.sort,
            showStaff: route.query.staff,
            showBadges: route.query.badge || route.query.badges,
            splitPlayers: route.query.split ? parseInt(route.query.split) : null
        })
    },
    { path: "hero-rosters", redirect: "hero-roster" },
    {
        path: "hero-roster",
        component: HeroRosterOverlay,
        props: route => ({
            teamNum: route.query.team || route.query.teamNum,
            playerCount: route.query.players || route.query.playerCount,
            showRoles: !!route.query.roles || !!route.query.icons,
            showPronouns: !!route.query.pronouns
        })
    },
    { path: "history", component: HistoryOverlay, props: route => ({ max: route.query.max || 5 }) },
    { path: "season-history", component: SeasonHistoryOverlay },
    { path: "thumbnail", component: EventThumbnailCreator },
    {
        path: "draft",
        component: DraftOverlay,
        props: route => ({
            columns: route.query.columns || route.query.cols || 1,
            icons: route.query.icons !== "false",
            showStaff: route.query.staff !== "false",
            showLogos: route.query.logos !== "false",
            teamRows: route.query.rows || route.query.teamRows || 1,
            eachTeam: route.query.eachTeam || route.query.players
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
    { path: "auction", component: AuctionOverlay, props: route => ({ category: route.query.category, showCaptainInfo: !!route.query.captain }) },
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
            crossfadeDuration: parseFloat(route.query.crossfade || route.query.fade) || 10,
            loopSongs: !!route.query.loop
        })
    },
    { path: "tester", component: ThemeTransitionTester },
    { path: "desk-graphics", component: DeskGraphicsOverlay },
    { path: "stinger", component: EmptyStingerOverlay },
    { path: "empty", redirect: "stinger" },
    { path: "broadcasts", component: OtherBroadcastsOverlay },
    { path: "mvp", component: MVPOverlay },
    {
        path: "ingame-comms",
        component: IngameCommsOverlay,
        props: route => ({
            listenInText: route.query.text,
            buffer: parseInt(route.query.buffer),
            forceTeam: route.query.team ? parseInt(route.query.team) : null
        })
    },
    { path: "map-stats", component: MapStatsOverlay },
    {
        path: "audio",
        component: TeamAudio,
        props: route => ({
            taskKey: route.query.key,
            buffer: parseInt(route.query.buffer)
        })
    }
];
