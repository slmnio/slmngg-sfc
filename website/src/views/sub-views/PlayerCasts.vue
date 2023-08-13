<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="cast-match col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-for="match in casts" :key="match.id">
                    <Match :hydrated-match="match"/>
                </div>
            </div>
            <div class="casting-partners mt-2" v-if="partners?.length">
                <h2 id="partners">Casting Partners</h2>
                <table class="table table-bordered table-dark table-sm">
                    <tr>
                        <th>Partner</th>
                        <th>Casts together</th>
                        <th>Last cast together</th>
                    </tr>
                    <tr v-for="partner in partners" :key="partner.caster.id">
                        <td><router-link :to="`/player/${partner.caster.id}/casts`">{{ partner.caster.name }}</router-link></td>
                        <td>{{ partner.casts }}</td>
                        <td>{{ formatTime(partner.lastMatch.start, {format: "{day} {date-ordinal} {month} {year}", tz: $store.state.timezone, use24HourTime: $store.state.use24HourTime}) }} -
                            <span v-if="partner.lastMatch?.event"><router-link :to="url('event', partner.lastMatch?.event)">{{ partner.lastMatch?.event?.name }}</router-link> - </span>
                            <router-link :to="url('match', partner.lastMatch)">{{ partner.lastMatch?.name}}</router-link></td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { formatTime, url } from "../../utils/content-utils";

export default {
    name: "PlayerCasts",
    methods: { url, formatTime },
    props: ["player"],
    components: { Match },
    computed: {
        casts() {
            if (!this.player?.casts) return [];
            return ReactiveArray("casts", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                casters: ReactiveArray("casters")
            })(this.player).sort(sortMatches);
        },
        partners() {
            const partners = new Map();
            this.casts.forEach((match) => {
                console.log(match.casters);
                (match.casters || []).forEach(caster => {
                    if (!caster?.name) return;
                    if (caster.id === this.player?.id) return;
                    if (!partners.has(caster.id)) {
                        partners.set(caster.id, { caster, casts: 0, lastMatch: match });
                    }
                    const data = partners.get(caster.id);
                    data.casts++;
                    if (new Date(data.lastMatch.start) < new Date(match.start)) {
                        data.lastMatch = match;
                    }
                    partners.set(caster.id, data);
                });
            });
            return [...partners.values()].sort((a, b) => {
                const diff = b.casts - a.casts;
                if (diff !== 0) return diff;
                return new Date(b.lastMatch?.start) - new Date(a.lastMatch?.start);
            });
        }
    }
};
</script>

<style scoped>

</style>
