<template>
  <div>
    <div id="kvmsContainer" ref="kvmsContainer">
      <div
        class="kvmBox"
        v-for="(item, index) in [0,1,2,3]"
        :key="index"
        :class="{['b'+index]:true}"
      >
        <div class="deviceNumBox">
          <div
            v-if="kvmTasks[index]"
            :class="{destroyed:kvmTasks[index].isDestroyed}"
          >{{kvmTasks[index].deviceNum}}</div>
        </div>
        <div v-if="kvmTasks[index]" class="leftAlign">
          <div v-if="kvmTasks[index].isDestroyed" style="margin:0 1rem;">發生異常，此任務單元已終止</div>
          <div v-else class="leftAlign">
            <div style="margin:0 1rem;">
              <span style="font-weight:bold">類型：</span>
              {{kvmTasks[index].isWithLoadCsvTask?'校機':'偵測'}}
            </div>
            <div class="leftAlign">
              <div style="font-weight:bold">狀態：</div>
              <div class="signalLightBox" v-if="kvmTasks[index].isWithLoadCsvTask">
                <div
                  class="green"
                  :class="{active:kvmTasks[index]&&!kvmTasks[index].isDestroyed
        &&kvmTasks[index].ParamCheckResult&&kvmTasks[index].ParamCheckResult.isSucc}"
                ></div>
                <div
                  class="yellow"
                  :class="{active:kvmTasks[index]&&!kvmTasks[index].isDestroyed
        &&kvmTasks[index].isLoadingCsv}"
                ></div>
                <div
                  class="red"
                  :class="{active:kvmTasks[index]&&!kvmTasks[index].isDestroyed
        &&(kvmTasks[index].isLoadingCsvFailed||(kvmTasks[index].ParamCheckResult&&!kvmTasks[index].ParamCheckResult.isSucc))}"
                ></div>
              </div>
              <div v-else>{{getStatusOfOpeningIE(index)}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="logBoxWrapper center">
      <div class="logBox">
        <div class="textLine" v-for="(logObj, index) in paramCheckLogs" :key="index">
          <div class="receivedTBox">{{logObj.receivedT}}</div>

          <span>{{logObj.logMsg}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { socketLib } from '@/socket';
class ParamCheckResult {
  isSucc: boolean = false;
  msg: string = '';
  constructor() { }

}
class KvmTask {
  constructor(public deviceNum: string, public url: string) { }
  //--- load csv related
  isLoadingCsvDone = false; //直到接收到參數結果才算成功
  isLoadingCsv = false;
  isLoadingCsvFailed = false;
  isCsvFileloaded = false;
  isWithLoadCsvTask = false;

  //--- ie 
  isOpenIECalled = false;
  isKvmOpened = false;
  isIESafelyOpened = false;
  isKvmShowLongEnoughAndRemovable = false; //1.ie開完、kvm開一下子後 
  isDestroyed = false;
  isUploadRecipeTask = false;


  get canTriggerLoadCsvProcedure() {
    return !(this.isDestroyed || this.isLoadingCsv || this.isLoadingCsvDone || this.isLoadingCsvFailed)
  }
  paramCheckResult: null | ParamCheckResult = null;
  ieOpenTimeSpend = 3 * 1000;
  showKvmDuration = 5 * 1000;
  waitParamCheckResultT = 180 * 1000;
  kvmWindowName = '';
}


export default Vue.extend({
  name: 'Kvms',
  props: {
    paramCheckLogs: Array,
  },
  mounted() { },
  data() {
    return {
      kvmTasks: [] as KvmTask[]
    }
  },
  methods: {
    test() { socketLib },
    passContainerInfo() {
      // 要show出來才抓得到
      let rect = (this.$refs.kvmsContainer as HTMLElement)?.getClientRects()[0];
      let data = {
        xDisplace: Math.round(rect.width / 2),
        yDisplace: Math.round(rect.height / 2),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      }
      socketLib.emitEvent('KVM_CONTAINER_INFO', data, (kvmTasks: KvmTask[]) => {
        this.kvmTasks = kvmTasks;
      })
    },
    getStatusOfOpeningIE(index: number) {
      let kvmTask = this.kvmTasks[index];
      if (!kvmTask.isIESafelyOpened) { return '嘗試開啟IE中' }
      else if (kvmTask.isKvmOpened && !kvmTask.isKvmShowLongEnoughAndRemovable) { return '偵測中' }
      else if (kvmTask.isKvmShowLongEnoughAndRemovable) { return '偵測完成' }
      else return '異常狀態，請洽程式人員'
    }

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
#kvmsContainer {
  height: 90%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
.kvmBox {
  position: absolute;
  display: flex;
  .deviceNumBox {
    height: 30px;
    min-width: 4rem;
    border-bottom: 2px solid;
    box-sizing: border-box;
    padding: 5px 5px;
    .destroyed {
      text-decoration: line-through;
    }
  }
  .signalLightBox {
    display: flex;
    height: 30px;
    align-items: center;

    div {
      height: 20px;
      width: 20px;
      border: 1.5px solid black;
      border-radius: 50%;
      margin-left: 5px;
      opacity: 0.3;
    }
    div.red {
      background-color: red;
    }
    div.yellow {
      background-color: yellow;
    }
    div.green {
      background-color: green;
    }
    div.active {
      opacity: 1;
    }
  }
}

.kvmBox.b0 {
  top: 0;
  left: 0;
}

.kvmBox.b1 {
  top: 0;
  left: 50%;
}
.kvmBox.b2 {
  top: 50%;
  left: 0;
}
.kvmBox.b3 {
  top: 50%;
  left: 50%;
}

.logBoxWrapper {
  width: 100%;
  box-sizing: border-box;
  height: 10%;
  border: 1px transparent;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  border: inset;
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
  margin-bottom: 1rem;
  word-break: break-all; // https://stackoverflow.com/questions/22369140/html-css-force-wrap-number-displayed-in-chrome
}
.receivedTBox {
  display: inline-block;
  margin-right: 1rem;
}
</style>
