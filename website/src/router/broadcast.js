export default [
    {
        path: "ingame",
        component: () => import("@/components/broadcast/roots/IngameOverlay.vue"),
        props: route => ({ codes: route.query.codes, sponsorFadeSpeed: (route.query.sponsorSpeed || route.query.sponsorFadeSpeed) })
    },
    {
        path: "cams",
        component: () => import("@/components/broadcast/cams/CamsWrapper.vue"),
        props: route => ({ params: route.query.params?.split(",") }),
        children: [
            { path: "desk", component: () => import("@/components/broadcast/cams/DeskCamsOverlay.vue") },
            { path: "ingame", component: () => import("@/components/broadcast/cams/CamsOverlay.vue") },
            {
                path: "pov",
                component: () => import("@/components/broadcast/cams/CamOverlay.vue"),
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
                component: () => import("@/components/broadcast/cams/FullCamOverlay.vue"),
                props: route => ({
                    number: route.query.number || route.query.num || 1,
                    showName: !!route.query.name,
                    showSocials: !!route.query.socials
                })
            }
        ]
    },
    {
        path: "break",
        component: () => import("@/components/broadcast/break/BreakOverlay.vue"),
        props: route => ({
            secondary: !!route.query.secondary,
            interval: route.query.interval || route.query.headlineInterval
        })
    },
    { path: "break-bar", component: () => import("@/components/broadcast/break/BreakBarOverlay.vue") },
    {
        path: "bracket",
        component: () => import("@/components/broadcast/roots/BracketOverlay.vue"),
        props: route => ({
            bracketKey: route.query.key,
            extended: !!route.query.extended || !!route.query.expanded || !!route.query.full,
            scale: route.query.scale,
            small: !!route.query.small
        })
    },
    { path: "schedule", component: () => import("@/components/broadcast/roots/ScheduleOverlay.vue"), props: route => ({ secondary: !!route.query.secondary }) },
    { path: "iframe", component: () => import("@/components/broadcast/roots/IframeOverlay.vue"), props: route => ({ url: route.query.url }) },
    { path: "standings", component: () => import("@/components/broadcast/roots/StandingsOverlay.vue"), props: route => ({ stage: route.query.stage || route.query.group }) },
    {
        path: "multi-standings",
        component: () => import("@/components/broadcast/roots/MultiStandingsOverlay.vue"),
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
        component: () => import("@/components/broadcast/roots/RosterOverlay.vue"),
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
        component: () => import("@/components/broadcast/roots/HeroRosterOverlay.vue"),
        props: route => ({
            teamNum: route.query.team || route.query.teamNum,
            playerCount: route.query.count || route.query.players || route.query.playerCount,
            showRoles: !!route.query.role || !!route.query.roles || !!route.query.icons,
            showPronouns: !!route.query.pronouns
        })
    },
    {
        path: "history",
        component: () => import("@/components/broadcast/roots/HistoryOverlay.vue"),
        props: route => ({
            max: route.query.max || 5,
            reverse: route.query.reverse !== "false"
        })
    },
    { path: "season-history", component: () => import("@/components/broadcast/roots/SeasonHistoryOverlay.vue") },
    { path: "thumbnail", component: () => import("@/components/broadcast/EventThumbnailCreator.vue") },
    {
        path: "draft",
        component: () => import("@/components/broadcast/roots/DraftOverlay.vue"),
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
        component: () => import("@/components/broadcast/CasterBackground.vue"),
        props: route => ({
            defaultMap: (route.query.map || route.query.default || "").toLowerCase() || null,
            useVideo: (route.query.video !== "false")
        })
    },
    { path: "desk", component: () => import("@/components/broadcast/desk/DeskOverlay.vue"), props: route => ({ group: "casters" }) },
    { path: "podcast", component: () => import("@/components/broadcast/roots/PodcastOverlay.vue"), props: route => ({ rows: route.query.rows }) },
    { path: "custom", component: () => import("@/components/broadcast/roots/CustomOverlay.vue") },
    { path: "info", component: () => import("@/components/broadcast/roots/InfoOverlay.vue") },
    { path: "background", component: () => import("@/components/broadcast/BroadcastBackground.vue"), props: route => ({ index: route.query.index }) },
    { path: "sponsors", component: () => import("@/components/broadcast/roots/SponsorOverlay.vue") },
    { path: "maps", component: () => import("@/components/broadcast/roots/MapsOverlay.vue"), props: route => ({ autoTitle: route.query.auto }) },
    { path: "branding", component: () => import("@/components/broadcast/roots/BrandingOverlay.vue") },
    { path: "auction", component: () => import("@/components/broadcast/auction/AuctionOverlay.vue"), props: route => ({ category: route.query.category, showCaptainInfo: !!route.query.captain }) },
    { path: "ad-read", component: () => import("@/components/broadcast/roots/AdReadOverlay.vue"), props: route => ({ extraDelay: route.query.delay }) },
    { path: "logos", component: () => import("@/components/broadcast/roots/LogoAdOverlay.vue") },
    { path: "staff", component: () => import("@/components/broadcast/roots/StaffOverlay.vue") },
    { path: "player-history", component: () => import("@/components/broadcast/PlayerHistory.vue"), props: route => ({ showMinor: route.query.minor }) },
    { path: "overview", component: () => import("@/components/broadcast/roots/OverviewOverlay.vue") },
    { path: "media", component: () => import("@/components/broadcast/roots/MediaOverlay.vue") },
    {
        path: "music",
        component: () => import("@/components/broadcast/roots/MusicOverlay.vue"),
        props: route => ({
            role: route.query.group || route.query.role,
            showTitle: ["showTitle", "showText", "text", "title", "song"].some(t => route.query[t]),
            volume: parseFloat(route.query.volume) || 0.2,
            crossfadeDuration: parseFloat(route.query.crossfade || route.query.fade) || 10,
            loopSongs: !!route.query.loop
        })
    },
    { path: "desk-graphics", component: () => import("@/components/broadcast/roots/DeskGraphicsOverlay.vue") },
    { path: "stinger", component: () => import("@/components/broadcast/roots/EmptyStingerOverlay.vue") },
    { path: "empty", redirect: "stinger" },
    { path: "broadcasts", component: () => import("@/components/broadcast/roots/OtherBroadcastsOverlay.vue") },
    { path: "mvp", component: () => import("@/components/broadcast/roots/MVPOverlay.vue") },
    {
        path: "ingame-comms",
        component: () => import("@/components/broadcast/roots/IngameCommsOverlay.vue"),
        props: route => ({
            listenInText: route.query.text,
            buffer: parseInt(route.query.buffer),
            forceTeam: route.query.team ? parseInt(route.query.team) : null
        })
    },
    { path: "map-stats", component: () => import("@/components/broadcast/roots/MapStatsOverlay.vue") },
    {
        path: "audio",
        component: () => import("@/components/broadcast/TeamAudio.vue"),
        props: route => ({
            taskKey: route.query.key,
            buffer: parseInt(route.query.buffer)
        })
    },

    /* Production staff stuff */
    { path: "clock", component: () => import("@/components/broadcast/roots/MediaClock.vue") },
    { path: "tester", component: () => import("@/components/broadcast/roots/ThemeTransitionTester.vue") },
    { path: "admin", component: () => import("@/components/broadcast/roots/ClientOverview.vue") },
    { path: "syncer", component: () => import("@/components/broadcast/roots/SyncerOverlay.vue") },
    { path: "tally-viewer", component: () => import("@/components/broadcast/roots/TallyViewer.vue") },
    {
        path: "tally-dot",
        component: () => import("@/components/broadcast/roots/TallyDot.vue"),
        props: route => ({ number: parseInt(route.query.number || route.query.number) })
    },
    { path: "quad", component: () => import("@/components/broadcast/roots/QuadTallyDot.vue") },
    {
        path: "tally-transmitter",
        component: () => import("@/components/broadcast/roots/TallyTransmitter.vue"),
        props: route => ({
            number: route.query.num || route.query.number
        })
    },
    {
        path: "websocket-transmitter",
        component: () => import("@/components/broadcast/roots/WebsocketTransmitter.vue"),
        props: route => ({
            wsUrl: route.query.url || route.query.wsUrl || route.query.wsurl || route.query.wsURL || "ws://127.0.0.1:4455",
            wsPassword: route.query.wsPassword || route.query.password || route.query.pw
        })
    }
];
