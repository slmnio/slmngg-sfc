<template>
    <div class="container player-partners">
        <h2 id="partners">Production Partners</h2>

        <b-form-select v-model="chosenPartnerType" class="w-auto mb-1" :options="partnerTypes" />

        <div v-if="chosenPartnerType" class="d-flex gap-2 mb-2">
            <div>{{ source?.length }} match{{ source?.length === 1 ? "" : "es" }}</div>
            <div>•</div>
            <div>{{ partners?.length }} partner{{ partners?.length === 1 ? "" : "s" }}</div>
        </div>
        <table v-if="chosenPartnerType" class="table table-bordered table-dark table-sm">
            <thead>
                <tr>
                    <th>Partner</th>
                    <th>Matches together</th>
                    <th>First match together</th>
                    <th>Last match together</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="partner in partners" :key="partner.player.id">
                    <td>
                        <router-link :to="`/player/${partner.player.id}/partners`">
                            {{
                                partner.player.name
                            }}
                        </router-link>
                    </td>
                    <td>{{ partner.matches }}</td>
                    <td v-for="match in [partner.firstMatch, partner.lastMatch]" :key="match.id">
                        {{
                            match?.start ? `${formatTime(match.start, {
                                format: "{day} {date-ordinal} {month} {year}",
                                tz: useSettingsStore().timezone,
                                use24HourTime: useSettingsStore().use24HourTime
                            })} ${diff(match.start)}` : ""
                        }}<br v-if="match?.start">
                        <span v-if="match?.event">
                            <router-link :to="url('event', match?.event)">{{
                                match?.event?.name || "..."
                            }}</router-link> -
                        </span>
                        <router-link :to="url('match', match)">{{ match?.name || "..." }}</router-link>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
import { cleanID } from "shared";
import { formatTime, url } from "@/utils/content-utils";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { useSettingsStore } from "@/stores/settingsStore";
import spacetime from "spacetime";

export default {
    name: "PlayerPartners",
    props: ["player"],
    data: () => ({
        chosenPartnerType: null
    }),
    computed: {
        partnerTypes() {
            const types = [];
            types.push({
                value: null,
                disabled: true,
                text: "Partner type"
            });
            if (this.player?.player_relationships?.length) {
                types.push({
                    value: {
                        from: "Production",
                        to: "Production"
                    },
                    text: "Production ↔ Production"
                });
                types.push({
                    value: {
                        from: "Production",
                        to: "Caster"
                    },
                    text: "Production ↔ Casters"
                });
            }
            if (this.player?.casts?.length) {
                types.push({
                    value: {
                        from: "Caster",
                        to: "Caster"
                    },
                    text: "Caster ↔ Casters"
                });
                types.push({
                    value: {
                        from: "Caster",
                        to: "Production"
                    },
                    text: "Caster ↔ Production"
                });
            }
            return types;
        },
        casts() {
            if (!this.player?.casts?.length) return [];
            return ReactiveArray("casts", {
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                }),
                casters: ReactiveArray("casters"),
                event: ReactiveThing("event")
            })(this.player);
        },
        relationships() {
            if (!this.player?.player_relationships?.length) return [];
            return ReactiveArray("player_relationships", {
                matches: ReactiveArray("matches", {
                    casters: ReactiveArray("casters"),
                    event: ReactiveThing("event"),
                    player_relationships: ReactiveArray("player_relationships", {
                        player: ReactiveThing("player")
                    })
                })
            })(this.player);
        },
        playerRelationshipMatches() {
            let matches = [];

            (this.relationships || []).forEach(rel => {
                if (!["Producer", "Observer", "Replay Producer", "Observer Director", "Lobby Admin", "Tournament Admin", "Graphics Operator", "Stats Producer"].includes(rel.singular_name)) return;
                matches = [...matches, ...(rel.matches || [])];
            });

            return matches.filter((v, i, a) => a.findIndex(x => cleanID(x?.id) === cleanID(v?.id)) === i);
        },
        source() {
            return this.chosenPartnerType.from === "Caster" ? this.casts : this.playerRelationshipMatches;
        },
        partners() {
            if (!this.chosenPartnerType) return [];

            const partners = new Map();

            const addPartner = (id, player, match) => {
                if (!player?.name || id === this.player.id) return;
                if (!partners.has(id)) {
                    partners.set(id, {
                        player,
                        matches: 0,
                        lastMatch: match,
                        firstMatch: match
                    });
                }
                const data = partners.get(id);
                data.matches++;

                if (match.start && new Date(data.lastMatch.start) < new Date(match.start)) {
                    data.lastMatch = match;
                }
                if (match.start && new Date(data.firstMatch.start) > new Date(match.start)) {
                    data.firstMatch = match;
                }
                partners.set(id, data);
            };

            this.source.forEach(match => {
                const processedPartnersThisMatch = new Set();

                if (this.chosenPartnerType.to === "Caster") {
                    // match.casters
                    (match.casters || []).forEach(caster => {
                        if (processedPartnersThisMatch.has(caster?.id)) return;
                        addPartner(caster.id, caster, match);
                        processedPartnersThisMatch.add(caster?.id);
                    });
                } else {
                    // match.player_relationships[]
                    (match.player_relationships || []).forEach(rel => {
                        if (!["Producer", "Observer", "Replay Producer", "Observer Director", "Lobby Admin", "Tournament Admin", "Graphics Operator", "Stats Producer"].includes(rel.singular_name)) return;

                        if (processedPartnersThisMatch.has(rel.player?.id)) return;
                        addPartner(rel.player.id, rel.player, match);
                        processedPartnersThisMatch.add(rel.player?.id);
                    });
                }
            });

            return [...partners.values()].sort((a, b) => {
                const diff = b.matches - a.matches;
                if (diff !== 0) return diff;
                return new Date(b.lastMatch?.start) - new Date(a.lastMatch?.start);
            });
        }
    },
    methods: {
        useSettingsStore,
        url,
        formatTime,
        diff(timeString) {
            const diff = spacetime((new Date(timeString)).getTime()).diff(spacetime.now());
            console.log(diff);
            // return diff.days;
            return `(${diff.days} day${diff.days === 1 ? "" : "s"} ago)`;
        }
    }
};
</script>
<style scoped>

</style>
