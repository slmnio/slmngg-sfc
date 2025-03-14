<template>
    <div class="container">
        <section>
            <h2>Intro to SLMN.GG Productions</h2>
            <p>Hundreds of hours of development time and <a href="https://github.com/slmnio/slmngg-sfc" target="_blank">thousands of commits</a> have built up the SLMN.GG platform. It functions as a public facing website, and a system of graphics for productions.</p>
            <h3>Why SLMN.GG?</h3>
            <p>The goals driving SLMN.GG are <b>consistency</b> and <b>automation</b>. All broadcasts in the same event look identical, running at the same time across multiple production teams. Every match has the same level of polish as the last. Team designs are consistent across the broadcast, and styling affects each component for a fully unique themed experience.</p>
            <p>There is always the data you need to tell the story you need to tell. Rosters are always there, ready for display, and with full details for casters so they can be accurate. Schedules, standings and brackets are updated live across every component. You won't need to run with outdated data or depend on an external bracket or provider.</p>
            <p>The more we design, the more becomes available for subsequent broadcasts. New components are built broadcast-agnostic to keep pushing the broadcast quality higher.</p>
            <p>We have scene collection generators and automatic broadcast changing so our producers can work on the most important parts of the broadcast, not fiddling with scene collections every time they start something new.</p>
            <h3>What works best?</h3>
            <p>SLMN.GG works best when you use it multiple times. Long tournaments like leagues are ideal for our comparison graphics. Groups stages can be effortlessly calculated with our built-in automatic scenarios generator. Follow teams throughout a tournament and tell their story.</p>
            <p>SLMN.GG is not ideal for one-off streams. There is some effort required to set up a broadcast with its theming and customisation, and you lose out on some of the benefits of pre-set data and comparisons. It is not really built as a generic broadcasting tool for individual games.</p>
            <p>However, SLMN.GG is <a href="https://github.com/slmnio/slmngg-sfc/graphs/commit-activity" target="_blank">always evolving</a>, more features are being added, and more control delegated to event staff and producers.</p>
        </section>
        <section>
            <h2>Setting Up</h2>
            <ul>
                <li>SLMN.GG is designed to work in <a href="https://obsproject.com/download" target="_blank">OBS Studio</a>. Download the latest version for the best results.</li>
                <li>Our <router-link :to="{'name': 'companion-module'}">Companion module</router-link> works directly with our servers to give you ultimate control of your broadcast.</li>
                <li>Download the latest <router-link :to="{'name':'obs-scene-collections'}">SLMN.GG OBS Scene Collection</router-link> for our newest broadcast package changes.</li>
            </ul>
        </section>
    </div>
</template>

<script>
export default {
    name: "ProducingGuideIntro",
};
</script>

<style scoped>

</style>
