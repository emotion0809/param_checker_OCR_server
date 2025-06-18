<template>
  <div class="loaderMask" v-if="isLoading">
    <div id="loadingAnimationBox">
      <div class="lds-hourglass"></div>
      <div class="loaderText">{{text}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Loader',
  props: {
    isLoading: Boolean,
    text: String,

  },
  data() {
    return {}
  },
  methods: {

  },
  computed: {

  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.loaderMask {
  position: fixed;
  background-color: rgba($color: #000000, $alpha: 0.3);
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 1;
  #loadingAnimationBox {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .loaderText {
      text-align: center;
      color: white;
      font-weight: bold;
      text-shadow: 1px 1px 1px black;
      font-size: 1.2rem;
      animation: blinker 3s linear infinite;
    }

    @keyframes blinker {
      50% {
        opacity: 0.5;
      }
    }
  }
}

.lds-hourglass {
  display: inline-block;
  position: relative;
  width: 30vh;
  height: 30vh;
}
.lds-hourglass:after {
  content: " ";
  display: block;
  border-radius: 50%;
  width: 0;
  height: 0;
  margin: 3vh;
  box-sizing: border-box;
  border: 12vh solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: lds-hourglass 1.2s infinite;
}
@keyframes lds-hourglass {
  0% {
    transform: rotate(0);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  50% {
    transform: rotate(900deg);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    transform: rotate(1800deg);
  }
}
</style>
