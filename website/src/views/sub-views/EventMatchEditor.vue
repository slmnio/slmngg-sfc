<template>
    <div class="event-match-editor">
        <MatchEditor class="mt-2" :match="match"/>
        <BracketImplications class="mt-4" :match="match" show-resolve-button />
    </div>
</template>

<script>
import MatchEditor from "@/components/website/dashboard/MatchEditor.vue";
import BracketImplications from "@/components/website/dashboard/BracketImplications.vue";

export default {
    name: "EventMatchEditor",
    props: ["match"],
    components: { BracketImplications, MatchEditor }
};
</script>

<style scoped>

</style>
