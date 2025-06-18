<template>
  <div class="block fullH leftAlign">
    <div class="logBoxWrapper center">
      <div class="logBox">
        <div class="textLine" v-for="(logObj, index) in logs" :key="index">
          <div class="receivedTBox">{{logObj.receivedT}}</div>

          <span>{{logObj.logMsg}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { socketLib } from '../../socket';
import { mainService } from '../../main-service';

export default Vue.extend({
  name: 'Log',
  props: {
    logs: Array,
  },
  mounted() { console.log(this.logs) },
  data() {
    return {
      // isErrLog: true,
      // isDataLog: true,
    }
  },
  methods: {

  },
  watch: {

  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.rootBox {
  display: flex;
  width: 100%;
}
// .tagBox{
// height: 2rem;
// width: 10rem;
//   background-color: var(--light-legacy-theme);
// }
.logBoxWrapper {
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  border: 1px transparent; //prevent margin collapse
  // padding: 2rem;
  overflow: hidden;
  // padding-top: 1rem;
}
.logBox {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  // margin: 2rem;
  overflow: auto;
  border: var(--border) 1px solid;
  padding: 1rem;
  background-color: #272822;
  color: white;
}
.textLine {
  // white-space:pre; //會造成不換行
  // user-select: none;
  margin-bottom: 0.5rem;
  word-break: break-all; // https://stackoverflow.com/questions/22369140/html-css-force-wrap-number-displayed-in-chrome
}
.receivedTBox {
  display: inline-block;
  margin-right: 1rem;
}
</style>
