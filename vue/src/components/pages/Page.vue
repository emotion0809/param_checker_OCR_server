<template>
  <div class>空白頁</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { socketLib } from '@/socket';

export default Vue.extend({
  name: 'Page',
  props: {
    names: Array,
  },
  mounted(){},
  data() {
    return {

    }
  },
  methods: {
    test() { socketLib }
  },
  computed: {
    currA(): any {
      return this;
    },

  },
  watch: {
    currWebUrlObjs: {
      handler(nv) {
      },
      deep: true,
      immediate: true,
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
