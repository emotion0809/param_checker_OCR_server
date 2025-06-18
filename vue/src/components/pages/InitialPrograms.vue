<template>
  <div class="block fullH antiMC splitV">
    <div class="blockTitle sidesAlign">
      <div>初始程式清單</div>
      <div>
        <input type="button" class="secondaryBut butSpace" value="儲存" @click="save" />
        <input type="button" class="secondaryBut" value="開啟" @click="open" />
      </div>
    </div>
    <div class="tableBox fullH">
      <table id="urlTable">
        <tr v-for="(url, index) in initialPrograms" :key="index">
          <td>
            <input
              autocomplete="off"
              type="text"
              v-model="initialPrograms[index].path"
              placeholder="請輸入路徑"
              class="pathInput"
            />
            <input
              autocomplete="off"
              type="text"
              v-model="initialPrograms[index].windowTitle"
              placeholder="視窗名稱"
              class="titleInput"
            />
          </td>
        </tr>
      </table>
      <div class="center instruction">PS：具視窗名稱者會在程式關閉時自動關閉</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { socketLib } from '@/socket';
import { mainService } from '@/main-service';
import { InitProgramInfo } from '@/data/back.data';

export default Vue.extend({
  name: 'InitialPrograms',
  props: {
    initialPrograms: Array,
  },
  mounted() {
    this.open();

  },
  data() {
    return {

    }
  },
  methods: {
    save() {
      socketLib.emitEvent('UPDATE_INIT_PROC_PATHES', this.initialPrograms, () => {
        mainService.inform('儲存成功')
      });
    },
    open() {
      socketLib.emitEvent('OPEN_INIT_PROC_PATHES', this.initialPrograms, () => {
      });
    },
  },
  computed: {
    currA(): any {
      return this;
    },

  },
  watch: {
    initialPrograms: {
      handler(nv) {
        let ps: InitProgramInfo[] = this.initialPrograms as any;
        if (ps.length === 0 || ps[ps.length - 1].path != '') ps.push(new InitProgramInfo());
        else if (ps.length > 1 && ps[ps.length - 1].path === '' && ps[ps.length - 2].path === '') ps.splice(ps.length - 1, 1);
      },
      deep: true,
      immediate: true,
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.tableBox {
  padding: 2rem;
  overflow: auto;
}
#urlTable {
  text-align: center;
  width: 100%;
  td {
    display: flex;
    justify-content: space-between;
  }
  .pathInput {
    width: 68%;
  }
  .titleInput {
    width: 30%;
  }
}

#urlTable input[type="text"] {
  box-sizing: border-box;
}

.instruction{
  margin-top: 3rem;
}
</style>
