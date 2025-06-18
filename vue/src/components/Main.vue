<template>
  <div class="mainBox">
    <div class="headerBox">
      <div class="logoBox">
        <img @click="clickIcon" src="../assets/logo1.jpg" />HHC Auto Co.,Ltd
      </div>
      <div v-if="user" class="headerRightBox">
        <div>{{ user.accountName }}</div>
        <input type="button" value="登出" class="butSpace" @click="logout" />
      </div>
      <div class="headerRightBox" v-if="testClickCount === 100">
        <select
          name
          id
          v-model="devTestFeatureIndex"
          style="margin-right: 1rem"
        >
          <option
            v-for="(fName, index) in devTestFeatures"
            :value="index"
            :key="index"
          >
            {{ fName }}
          </option>
        </select>
        <div v-if="devTestFeatures[devTestFeatureIndex] === '傳送比對結果'">
          <input
            type="text"
            name
            id
            placeholder="比對失敗訊息"
            v-model="devObj.傳送比對結果.failMsg"
          />
          <button class="butSpace" 　@click="devEmit('傳送比對結果')">Send</button>
        </div>
        <div v-else-if="devTestFeatures[devTestFeatureIndex] === 'OCR偵測'">
          <select name id v-model="devObj.OCR偵測.ocrNum">
            <option v-for="(i, index) in [1, 2, 3, 4]" :value="i" :key="index">
              OCR{{ i }}
            </option>
          </select>
          <button class="butSpace" @click="devEmit('OCR偵測')">Detect</button>
        </div>
      </div>
    </div>
    <div class="bodyBox">
      <div class="sideBox">
        <div
          class="sideOption"
          v-for="(fName, index) in featureNames"
          :key="index"
          @click="clickSideOpt(fName)"
          :class="{ selected: currFeature === featureEnum[fName] }"
        >
          {{ fName }}
        </div>
        <div class="centerV" style="margin-top: 50px">
          <button v-if="isRunning" @click="stop">STOP</button>
          <button v-else @click="auto">AUTO</button>
        </div>
        <div style="display: flex; align-items: center; margin-left: 10px; margin-top: 10px;">
          <label class="switch">
          <input type="checkbox" v-model="testSwitch">
          <span class="slider"></span>
          </label>
          <span class="switch-label">測試模式</span>
        </div>
      </div>
      <div class="pageBox">
        <!-- <transition name="fade" mode="out-in"> -->
        <!-- <PageVue v-show="featureEnum['儀表板']===currFeature" /> -->

        <!-- <AccountsVue v-show="featureEnum['帳戶管理']===currFeature" v-bind="{users:users}" /> -->
        <AllKvmStatesVue
          v-show="featureEnum['Layout'] === currFeature"
          v-bind="{
            webSets: webSets,
            webSetIndexFromSites: webSetIndexFromSites,
            devices:devices,
          }"
        />
        <ParamCheckVue
          v-show="featureEnum['參數管理'] === currFeature"
          v-bind="{ paramSets: paramSets }"
        />
        <SitesVue
          ref="sites"
          @enter-kvm-page="enterKvmPage"
          @webset-index="handleWebsetIndex"
          v-show="featureEnum['網頁切換'] === currFeature"
          v-bind="{
            webSets: webSets,
            webSwitchSecondObj: webSwitchSecondObj,
            ieWindowPosition: ieWindowPosition,
            isRunning: isRunning,
          }"
        />
        <TestConnectionsVue
          v-show="featureEnum['連線檢測'] === currFeature"
          v-bind="{ ips: ips }"
        />
        <LogsVue
          v-show="featureEnum['Log'] === currFeature"
          v-bind="{ logs: logs }"
        />
        <AutomaitonVue
          v-show="featureEnum['Automation'] === currFeature"
          v-bind="{ automationInfo: automationInfo, webSets: webSets, }"
          @upload-recipe="enterKvmPage"
        />
        <InitialProgramsVue
          v-show="featureEnum['初始程式清單'] === currFeature"
          v-bind="{ initialPrograms: initialPrograms }"
        />
        <KvmsVue
          v-show="featureEnum['機台畫面'] === currFeature"
          v-bind="{ paramCheckLogs: paramCheckLogs }"
          ref="kvms"
        />
        <!-- VMZ設定 -->
        <!-- </transition> -->
      </div>
    </div>
    <LoaderVue :isLoading="loader.isLoading" :text="loader.text">
      <!-- <template v-slot:defaut>123</template> -->
    </LoaderVue>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import PageVue from './pages/Page.vue';


import { backData } from '../data/back.data';
import LogsVue from './pages/Logs.vue';
import AccountsVue from './pages/Accounts.vue';
import SitesVue from './pages/Sites.vue';
import ParamCheckVue from './pages/ParamCheck.vue';
import TestConnectionsVue from './pages/TestConnections.vue';
import AutomaitonVue from './pages/Automation.vue';
import InitialProgramsVue from './pages/InitialPrograms.vue';
import KvmsVue from './pages/Kvms.vue';
import AllKvmStatesVue from './pages/AllKvmStates.vue';
import { AuthType, frontData } from '@/data/front.data';
import LoaderVue from './elements/Loader.vue';
import { mainService } from '@/main-service';
import { socketLib } from '@/socket';


// Component內Name的命名可隨意
export enum Feature {
  // 儀表板,
  // 系統配置,
  Layout,
  參數管理,
  網頁切換,
  連線檢測,
  Log,
  Automation,
  初始程式清單,
  機台畫面,

  // 帳戶管理,
  // VMZ設定
}



function getFeatureNameArr() {
  let arr = [];
  for (let member in Feature) if (isNaN(parseInt(member, 10))) arr.push(member);
  return arr;
}

export default Vue.extend({
  name: 'Main',
  components: {
    PageVue,
    LogsVue,
    AccountsVue,
    SitesVue,
    ParamCheckVue,
    TestConnectionsVue,
    AutomaitonVue,
    InitialProgramsVue,
    KvmsVue,
    LoaderVue,
    AllKvmStatesVue
  },
  props: {
    user: Object,
    users: Array,
    logs: Array,
    isSystemRunning: Boolean,
    paramSets: Array,
    webSets: Array,
    webSwitchSecondObj: Object,
    ips: Array,
    ieWindowPosition: Object,
    initialPrograms: Array,
    automationInfo: Object,
    isLockInKvmPage: Boolean,
    paramCheckLogs: Array,
    isRunning: Boolean,
       devices: Array,
  },
  data() {
    return {
      currFeature: Feature.參數管理,
      featureNames: getFeatureNameArr(),
      featureEnum: Feature,
      authEnum: AuthType,
      loader: {
        isLoading: false,
        text: ''
      },
      webSetIndexFromSites: 0 as  number,
      devTestFeatureIndex: 0,
      devObj: {
        傳送比對結果: {
          failMsg: ''
        },
        OCR偵測: {
          ocrNum: 1
        },
      },
      testClickCount: 0,
      testSwitch: true,
    }
  },
  mounted() {
    mainService.loader(true, '嘗試連線至OCR...');
    setInterval(() => {
      if (this.currFeature === Feature.機台畫面) {
        (this.$refs.kvms as any).passContainerInfo();
      }
    }, 2500)
  },
  methods: {
    logout() {
      frontData.user = null;
    },
    auto() {
      this.currFeature = Feature.機台畫面;
      (this.$refs.sites as any).start();
    },
    stop() {
      (this.$refs.sites as any).stop();
    },
    clickSideOpt(fName: any) {
      if (this.isLockInKvmPage && fName !== '機台畫面') {
        mainService.alert('流程進行中，尚不可切換畫面');
        return;
      }
      this.currFeature = this.featureEnum[fName] as any
    },
    handleWebsetIndex(data: number) {
      this.webSetIndexFromSites = data;
    },
    enterKvmPage() {
      this.currFeature = Feature.機台畫面
    },
    clickIcon() {
      if (this.testClickCount === 0) {
        setTimeout(() => {
          if (this.testClickCount === 5) this.testClickCount = 100;
          else this.testClickCount = 0;
        }, 1000)
      }
      this.testClickCount++;
      if (this.testClickCount > 100) this.testClickCount = 0;
    },
    devEmit(type: DevType) {
      let info: DevInfo = { type: type, data: null };
      const devObj = this.devObj;
      if (type === '傳送比對結果') info.data = devObj[type].failMsg;
      else if (type === 'OCR偵測') info.data = devObj[type].ocrNum;
         socketLib.emitEvent('DEV_CMD', info);
    },
  },
  computed: {
    devTestFeatures(): Array<string> {
      return Object.keys(this.devObj);
    },
  },
  watch: {
    testSwitch(newVal) {
      socketLib.emitEvent('switchTestModel',newVal);
    },
    currFeature(nv) {
      if (Feature[nv] === '機台畫面')
        this.$nextTick(() => (this.$refs.kvms as any).passContainerInfo())
      else if(Feature[nv]==='網頁切換')(this.$refs.sites as any).updateWebIndex();
    },
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.switch-label {
  margin-left: 10px;
  font-size: 16px;
  color: #ffffff; /* 可根據你的背景顏色調整 */
  vertical-align: middle;
}
.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  margin-left: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:checked + .slider:before {
  transform: translateX(14px);
}
.headerBox {
  height: 7vh;
  background-color: white;
  box-shadow: 0 2px 2px 0 rgba(60, 75, 100, 0.14),
    0 3px 1px -2px rgba(60, 75, 100, 0.12), 0 1px 5px 0 rgba(60, 75, 100, 0.2);
  display: flex;
}
.logoBox {
  display: flex;
  align-items: center;
  height: 100%;
}
.logoBox > img {
  margin: 0 0.5rem;
  height: 100%;
}
.headerRightBox {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.bodyBox {
  height: 93vh;
  display: flex;
}
.sideBox {
  background-color: #2f353a;
  width: 10rem;
  height: 100%;
}
.sideOption {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  padding: 1rem;
  transition: 0.3s;
  cursor: pointer;
}

.sideOption.selected {
  background: #3a4248;
}
.sideOption:hover {
  color: white;
  background: var(--primary);
}
.mainBox {
  position: relative;
}
.pageBox {
  width: 100%;
  padding: 2rem;
  overflow: auto;
  position: relative; //為了讓機台頁可以掛到
}
</style>
