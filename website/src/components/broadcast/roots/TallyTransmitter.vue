<template>
  <div class="text-white">
  </div>
</template>

<script>
export default {
    name: "TallyTransmitter",
    props: ["client"],
    data: () => ({
        active: false,
        visible: false
    }),
    computed: {
        state() {
            if (this.active && this.visible) {
                return "active";
            } else if (this.visible) {
                return "preview";
            } else {
                return "inactive";
            }
        }
    },

    methods: {
        transmitState() {
            this.$socket.client.emit("tally_change", { clientName: this.client.key, state: this.state, sceneName: this?.$root?.activeScene?.name });
        }
    },
    mounted() {
        window.addEventListener("obsSourceActiveChanged", (e) => {
            if (!this.client) return;
            this.active = e.detail.active;
            this.transmitState();
        });

        window.addEventListener("obsSourceVisibleChanged", (e) => {
            if (!this.client) return;
            this.visible = e.detail.visible;
            this.transmitState();
        });
    }
};
</script>
