<template>
  <div class="block minfullH antiMC splitV">
    <div class="blockTitle sidesAlign">
      <div>Layout</div>
      <div class="center">
        <input type="checkbox" id="isEditing" v-model="isEditing" /><label
          for="isEditing"
          >編輯</label
        >
        <div v-if="isEditing" class="center" style="margin-left: 1rem">
          <div>格數:</div>
          <input
            id="deviceAmountInp"
            type="number"
            v-model.number="deviceAmount"
            min="0"
            max="200"
            step="1"
          />
        </div>
      </div>
    </div>
    <div v-if="webSetIndexFromSites === null" id="instruction">
      切換網頁流程尚未開始......
    </div>
    <div id="optionBox" v-else>
      <div
        class="option"
        v-for="(item, index) in devices"
        :key="index"
        :class="getOptionClass(index)"
        @click="clickOption(index)"
      >
        <img src="../../assets/15_1.gif" alt v-if="item.deviceNumber" />
        <input
          type="text"
          class="deviceNum"
          v-model="item.deviceNumber"
          placeholder="設備編號"
          v-if="isEditing"
        />
        <div class="deviceNum" v-else>{{ item.deviceNumber }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { socketLib } from '@/socket';
import { mainService } from '@/main-service';
import { backData, Device, WebSet } from '@/data/back.data';

function createDevices(count = 48) {
  let arr = [];
  for (let index = 0; index < count; index++)  arr.push(new Device());
  return arr
}

export default Vue.extend({
  name: 'AllKvmStates',
  props: {
    webSetIndexFromSites: Number,
    webSets: Array,
    devices: Array,
  },
  mounted() {
  },
  data() {
    return {
      isEditing: false,
      clickedIndex: null as null | number,
      deviceAmount: this.devices.length
    }
  },
  methods: {
    getOptionClass(index: number) {
      let device: Device = this.devices[index] as any;
      let isToRemindNoUrl = this.checkIfRemindNoUrl(index);

      let obj = {
        // showUrl: this.clickedIndex === index,
        // noUrl: isToRemindNoUrl,
        // running: device.deviceNumber && !isToRemindNoUrl
        vHidden: device.deviceNumber === '' && !this.isEditing,
        displaying: !this.isEditing
      };
      return obj;
    },
    clickOption(index: number) {
      return
      let device: Device = this.devices[index] as any;
      if (!device.deviceNumber) return;
      if (this.checkIfRemindNoUrl(index)) {
        mainService.alert('無偵測到相對應之url，請於網頁切換頁配置');
        return;
      }
      let confirmP = mainService.confirm('確定開啟KVM視窗?');
      // if (index === this.clickedIndex) this.clickedIndex = null;
      // else this.clickedIndex = index;
    },
    checkIfRemindNoUrl(index: number) {
      // 沒填機台號碼就不管
      let device: Device = this.devices[index] as any;
      if (device.deviceNumber) {
        let webset: WebSet = this.currWebset;
        let webUrlObj = webset.webUrlObjs.find(obj => obj.deviceNumber === device.deviceNumber);
        if (webUrlObj && webUrlObj.url) return false;
        else return true
      }
      else return false;
    },
  },
  computed: {
    currWebset(): any {
      return this.webSets[this.webSetIndexFromSites];
    },

  },
  watch: {
    currWebUrlObjs: {
      handler(nv) {
      },
      deep: true,
      immediate: true,
    },
    deviceAmount(nv: number, oldV: number) {
      if (oldV < nv) backData.devices = backData.devices.concat(createDevices(nv - oldV));
      else backData.devices = backData.devices.slice(0, nv);
    },
    isEditing(nv:boolean){
      if(!nv){
        socketLib.emitEvent('UPDATE_DEVICES',this.devices,()=>{
          mainService.inform('已儲存Layout');
        })
      }
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.blockTitle {
  label {
    user-select: none;
  }
  #deviceAmountInp {
    margin-left: 0.5rem;
    width: 2.5rem;
  }
}
#instruction {
  margin: 1rem;
}
#optionBox {
  display: flex;
  margin: 1rem;
  flex-wrap: wrap;
  .option {
    height: 4vw;
    width: 4vw;
    border: 1px solid;
    border-color: rgb(120, 120, 120);
    margin: 0.5rem;
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    padding: 0.5vw;
    margin-bottom: 2.5rem;
    input.deviceNum {
      white-space: pre-wrap;
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      transform: translate(0, 120%);
      border: 1px solid var(--border);
      border-radius: 0.25rem;
      padding: 0.2rem 0.45rem;
    }
    div.deviceNum {
      white-space: pre-wrap;
      width: 100%;
      position: absolute;
      top: 0;
      left: 50%;
      box-sizing: border-box;
      transform: translate(-50%, -10%);
      text-align: center;
      font-weight: bold;
    }
    .url {
      position: absolute;
      top: 0;
      left: 0;
      transform: translate(0, -100%);
      display: none;
      white-space: nowrap;
    }
    img {
      height: 100%;
      width: 100%;
    }
  }
  .option.showUrl {
    .url {
      display: initial;
    }
  }
  .option.noUrl {
    background-color: rgb(180, 180, 180);
  }
  .option.idle {
  }
  .option.running {
    background-color: rgb(171, 245, 81);
  }
  .option.vHidden {
    visibility: hidden;
  }
  .option.displaying {
    border-width: 0;
    border-bottom-width: 3px;
    margin-bottom: 1rem;
    border-color: steelblue;
    img {
      transform: translate(0, 10%);
    }
  }
}
</style>
