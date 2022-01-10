<template>
  <div class="tally-block" v-bind:class="{ preview: state === 'preview', active: state === 'active' }">
    <div class="d-flex flex-column align-items-center">
      <div class="state">
        {{ state.toLocaleUpperCase() }}
      </div>
      <div class="metadata d-flex flex-column align-items-center">
        <div>
          {{ client.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: "TallyViewer",
    props: ["client"],
    sockets: {
        tally_change({ state, sceneName }) {
            this.state = state;
            this.sceneName = sceneName;
        }
    },
    data: () => ({
        state: "disconnected",
        sceneName: "N/A"
    })
};
</script>

<style scoped>
.tally-block {
  height: 100vh;
  width: 100vw;
  background-color: #000000;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 5em;
  transition: background-color 0.2s ease;
  font-family: "Industry", "SLMN-Industry", sans-serif;
}

.state {
  font-size: .75em;
}

.metadata {
  font-size: .3em;
}

@media (min-width: 700px) {
  .state {
    font-size: 1.25em;
  }

  .metadata {
    font-size: .75em;
  }
}


.tally-block.preview {
  background-color: #00ff00;
  color: #000000;
}

.tally-block.active {
  background-color: #ff0000;
}
</style>
