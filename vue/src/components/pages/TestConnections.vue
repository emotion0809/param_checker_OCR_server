<template>
  <div class="block fullH antiMC splitV">
    <div class="blockTitle sidesAlign">
      <div>連線檢測</div>
      <div>
        <input
          type="button"
          class="secondaryBut butSpace"
          value="儲存IP"
          :class="{disabled:isRunning}"
          :disabled="isRunning"
          @click="saveIps"
        />
        <input
          type="button"
          class="secondaryBut butSpace"
          value="開始檢測"
          v-if="!isRunning"
          :class="{disabled:isRunning}"
          :disabled="isRunning"
          @click="start"
        />
        <input
          v-if="isRunning"
          type="button"
          class="secondaryBut butSpace"
          value="中止檢測"
          @click="stop"
        />
      </div>
    </div>
    <div class="tableBox fullH">
      <table id="ipTable">
        <tr v-for="(ip, index) in ips" :key="index">
          <td>
            <div class="leftAlign">
              <div
                class="state"
                :class="{connecting:isValids[index]===true&&ips[index]!=='',disconnecting:isValids[index]===false}"
              ></div>
              <input
                autocomplete="off"
                type="text"
                v-model="ips[index]"
                placeholder="請輸入IP"
                :disabled="isRunning"
                :class="{disabled:isRunning}"
                class="ipInput"
              />
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mainService } from '../../main-service';
import { socketLib } from '../../socket';

export default Vue.extend({
  name: 'TestConnections',
  props: {
    ips: Array,
  },
  data() {
    return {
      isRunning: false,
      isValids: [] as boolean[],
      stopTestConnectionRej: (msg: string) => { }
    }
  },
  methods: {
    start() {
      let initP = Promise.resolve();
      this.isRunning = true;
      new Promise((res: (isValids: boolean[]) => void, rej) => {
        this.stopTestConnectionRej = rej;
        socketLib.emitEvent('TEST_CONNECTION', this.ips, (isValids: boolean[]) => {
          if (isValids === null) rej('檢測流程異常，請重新嘗試');
          res(isValids);
        });
      }).then(isValids => {
        this.isValids = isValids;
        for (let i = 0; i < isValids.length; i++) {
          if (isValids[i] === false) {
            mainService.inform(this.ips[i] + '連線異常', true);
            break;
          }
        }
        this.start();
      }).catch(err => {
        this.isRunning = false;
        this.isValids = [];
        mainService.alert(err);
      });
    },
    stop() {
      this.stopTestConnectionRej('檢測中止');
    },
    saveIps() {
      socketLib.emitEvent('SAVE_IPS', this.ips, () => {
        mainService.inform('儲存成功');
      });
    },
  },
  watch: {
    ips: {
      handler(nv) {
        let ips = this.ips;
        if (ips[ips.length - 1] != '') ips.push('');
        else if (ips.length > 1 && ips[ips.length - 1] === '' && ips[ips.length - 2] === '') ips.splice(ips.length - 1, 1);
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
#ipTable {
  text-align: center;
  width: 100%;
}
#ipTable input[type="text"] {
  box-sizing: border-box;
  width: 100%;
}
#ipTable .state {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  margin: auto 10px;
  border-radius: 50%;
  background-color: gray;
}
#ipTable .state.connecting {
  background-color: greenyellow;
}
#ipTable .state.disconnecting {
  background-color: red;
}

#ipTable .state {
}
.ipInput.disabled {
  opacity: 0.8;
}
#ipControlBox {
  display: flex;
  justify-content: space-between;
}
#webSetId {
  flex-grow: 1;
  margin-right: 20px;
  box-sizing: border-box;
}
#webSwitchSetting {
  position: relative;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  .paramInpBox {
    border-radius: 5px;
    height: 50vh;
    width: 50vw;
    background-color: white;
    z-index: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
      font-weight: bold;
      font-size: 1.2rem;
      margin-bottom: 20px;
    }
    .paramItem {
      margin-bottom: 5px;
      div {
        display: inline-block;
        width: 4rem;
      }
    }
    input {
      text-align: center;
      width: 5rem;
      margin-left: 5px;
    }
  }
  .controlBox {
    margin-top: 20px;
  }
  .mask {
    position: fixed;
    height: 100vh;
    width: 100vw;
    background-color: black;
    opacity: 0.4;
    top: 0;
    left: 0;
  }
}
</style>
