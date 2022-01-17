<template>
  <div class="hero-card d-flex flex-column flex-center" v-if="hero">
    <div class="hero-name d-flex flex-row text-center font-weight-bold"><span v-if="roleIcon" class="icon" v-html="roleIcon"></span> {{heroName}}</div>
    <div class="hero-role d-flex flex-row text-center">{{heroRole}}</div>
    <div class="hero-portrait d-flex flex-row flex-center" v-if="heroPortraitURL"><img :src="heroPortraitURL"/></div>
  </div>
</template>

<script>

export default {
    name: "PlayerHero",
    props: ["hero"],
    computed: {
        heroName() {
            if (!this.hero?.name) return null;
            return this.hero.name;
        },
        heroRole() {
            if (!this.hero?.name) return null;
            return this.hero.role;
        },
        roleIcon() {
            switch (this.heroRole) {
            case "Tank":
                return "<i class=\"fas fa-shield-alt\"></i>";
            case "Support":
                return "<i class=\"fas fa-plus-circle\"></i>";
            case "DPS":
                return "<i class=\"fas fa-crosshairs\"></i>";
            }
            return null;
        },
        heroPortraitURL() {
            if (!this.hero?.main_image) return null;
            return this.hero?.main_image[0].url;
        }
    }


};
</script>

<style scoped>
  .hero-card {
    margin: 10px;
  }
  .hero-name {
    font-size: 3em;
  }
  .hero-role {
    font-size: 1.2em;
  }
  .icon {
    margin-right: 5px;
  }
  .hero-portrait {
    height: auto;
    width: 300px;
  }

</style>
