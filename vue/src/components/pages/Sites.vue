<template>
  <div class="block fullH antiMC splitV">
    <div class="blockTitle sidesAlign">
      <div>
        網頁切換
        <select name id v-model="webSetIndex" :disabled="isRunning">
          <option v-for="(wSet, index) in webSets" :key="index" :value="index">{{wSet.id}}</option>
        </select>
        <input
          type="button"
          style="margin-left:5px"
          value="新增網頁組"
          @click="clickCreateWebSet"
          :disabled="isRunning"
        />
      </div>
      <div v-if="currWebSet">
        <input
          type="button"
          class="secondaryBut butSpace"
          value="IE權限驗證"
          @click="ieAuth()"
          :class="{disabled:isRunning}"
          :disabled="isRunning"
        />
        <input
          type="button"
          class="secondaryBut butSpace"
          value="IE視窗位置設定"
          @click="isIeWindowSetting=true"
          :class="{disabled:isRunning}"
          :disabled="isRunning"
        />
        <input
          type="button"
          class="secondaryBut butSpace"
          value="網頁切換秒數設定"
          @click="isWebSwitchSetting=true"
          :class="{disabled:isRunning}"
          :disabled="isRunning"
        />
        <input
          type="button"
          class="secondaryBut butSpace"
          value="儲存網址"
          :class="{disabled:isRunning}"
          :disabled="isRunning"
          @click="saveUrls"
        />
        <input
          type="button"
          class="secondaryBut butSpace"
          value="繼續流程"
          v-if="!isRunning&&isShowContinueProcBtn"
          @click="continueProc"
        />
        <input
          type="button"
          class="secondaryBut butSpace"
          value="開始"
          v-if="!isRunning"
          :class="{disabled:isRunning}"
          :disabled="isRunning"
          @click="start"
        />
        <input
          v-if="isRunning"
          type="button"
          class="secondaryBut butSpace"
          value="中止流程"
          @click="stop"
        />
        loop:
        <input type="checkbox" v-model="isLooping" style="vertical-align: middle;" />
      </div>
    </div>
    <div class="tableBox fullH">
      <table class="urlTable" v-if="currWebSet">
        <tr>
          <th style="width:30%">
            <div id="webSetControlBox">
              <input
                :disabled="isRunning"
                type="text"
                id="webSetId"
                placeholder="網頁組ID"
                v-model="currWebSet.id"
                @change="saveUrls"
              />
              <input
                type="button"
                @click="deteleWebSet"
                value="刪除網頁組"
                class="secondaryBut"
                :class="{disabled:isRunning}"
                :disabled="isRunning"
              />
            </div>
          </th>
        </tr>
        <tr v-for="(url, index) in currWebUrlObjs" :key="index">
          <td>
            <input
              autocomplete="off"
              type="text"
              v-model="currWebUrlObjs[index].url"
              placeholder="請輸入網址"
              :disabled="isRunning"
              :class="{disabled:isRunning}"
              class="urlInput"
            />
            <input
              autocomplete="off"
              type="text"
              v-model="currWebUrlObjs[index].deviceNumber"
              placeholder="設備編號"
              :disabled="isRunning"
              :class="{disabled:isRunning}"
              class="deviceNumInput"
            />
          </td>
        </tr>
      </table>
    </div>
    <div id="webSwitchSetting" v-if="isWebSwitchSetting">
      <div class="mask"></div>
      <div class="paramInpBox">
        <div class="title">網頁切換秒數設定</div>
        <div class="paramItem" v-for="(obj, index) in webSwitchNameObjs" :key="index">
          <div>{{obj.name}}</div>:
          <input type="text" v-model="webSwitchSecondObj[obj.key]" />
        </div>
        <div class="controlBox">
          <input type="button" class="secondaryBut butSpace" value="儲存" @click="saveSeconds" />
          <input
            type="button"
            class="secondaryBut butSpace"
            value="返回"
            @click="isWebSwitchSetting=false"
          />
        </div>
      </div>
    </div>
    <div id="ieWindowSetting" v-if="isIeWindowSetting">
      <div class="mask"></div>
      <div class="paramInpBox">
        <div class="title">IE視窗位置設定</div>
        <div class="paramItem" v-for="(obj, index) in ieWindowPositionInputNameObjs" :key="index">
          <div class="narrow">{{obj.name}}</div>:
          <input type="text" v-model="ieWindowPosition[obj.key]" />
        </div>
        <div class="controlBox">
          <input type="button" class="secondaryBut butSpace" value="儲存" @click="saveIePosition" />
          <input
            type="button"
            class="secondaryBut butSpace"
            value="返回"
            @click="isIeWindowSetting=false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { socketLib } from '../../socket';
import { mainService } from '../../main-service';
import { WebSwitchSecondObj, backData, WebSet, WebUrlObj } from '../../data/back.data';
import { frontData } from '@/data/front.data';


export default Vue.extend({
  name: 'Sites',
  props: {
    webSets: Array,
    webSwitchSecondObj: Object,
    ieWindowPosition: Object,
    isRunning:Boolean,
  },
  mounted() {
    // mainService.alert('123')
    // setInterval(() => { console.log(this.currWebUrlObjs.length) }, 1000)
  },
  data() {
    return {
      isWebSwitchSetting: false,
      isIeWindowSetting: false,
      isLooping: false,
      webSetIndex: 0,
      webUrlExecIndex: -1,
      isShowContinueProcBtn: false,
      webSwitchNameObjs: [
        {
          key: 'notToCheckParam',
          name: '不比對'
        },
        {
          key: 'waitToCheckParam',
          name: '等待比對'
        }, {
          key: 'waitAfterCheckSucc',
          name: '比對成功'
        }, {
          key: 'waitAfterCheckFail',
          name: '比對失敗'
        },
        {
          key: 'execNextWebsiteInterval',
          name: '網頁切換間隔'
        },
      ],
      ieWindowPositionInputNameObjs: [
        {
          key: 'x',
          name: 'X'
        },
        {
          key: 'y',
          name: 'Y'
        },
      ]
    }
  },
  methods: {
    updateWebIndex(){
      socketLib.emitEvent('WEBSET_INDEX', this.webSetIndex); 
    },
    start() {
      if (frontData.isRunning) {
        mainService.alert('網頁切換流程進行中不得再度開始');
        return;
      }
      this.saveUrls(false).then(() => {
        this.$emit('webset-index', this.webSetIndex);
        this.runWebUrlProc();
      }).catch(mainService.alert)
    },
    continueProc() {
      this.runWebUrlProc(this.webUrlExecIndex);
    },
    runWebUrlProc(startingIndex: number | null = null) {
      this.$emit('enter-kvm-page');
      this.isShowContinueProcBtn = false;
      let initP = Promise.resolve();
      frontData.isRunning = true;
      this.currWebUrlObjs.forEach((webObj, i) => {
        // 最後一個之外，且有規範時，i>=startingIndex時會作
        if (webObj.url !== '' && (startingIndex === null || i >= startingIndex)) {
          initP = initP.then(() => {
            this.webUrlExecIndex = i;
            return this.openUrlP(webObj);
          });
        }
      });
      initP.then(() => {
        frontData.isRunning = false;
        if (this.isLooping) setTimeout(() => { this.start(); }, 100);
        // mainService.alert('流程已完成' + (this.isLooping ? "，將繼續下一輪" : "")).then(() => {

        // });
      }).catch((switchWebExecption: SwitchWebExecption) => {
        mainService.alert(switchWebExecption.msg);
        //表不但不roll back，還略過當前．作下一個
        if (switchWebExecption.rollbackCount === 1) {
          if (this.webUrlExecIndex === (this.currWebUrlObjs.length - 1)) this.webUrlExecIndex = 0;
          else this.webUrlExecIndex = this.webUrlExecIndex + 1;
        }
        this.isShowContinueProcBtn = true;
        frontData.isRunning = false;
      });
    },
    stop() {
      socketLib.stopChangingSiteProcRej({ msg: '切換網址流程中止，可選擇繼續流程(自下一個)。', rollbackCount: 1 });
    },
    openUrlP(webUrlObj: WebUrlObj): Promise<void> {
      return new Promise((res, rej: (switchWebExecption: SwitchWebExecption) => void) => {
        // no先來了就用不校對的時間去計
        socketLib.emitEvent('CHANGE_SITE', webUrlObj, (errMsg: string) => {
          if (errMsg) rej({ msg: errMsg, rollbackCount: 1 });
          else res();
        });
        socketLib.stopChangingSiteProcRej = rej;//讓使用者可以中斷流程
      })
    },
    saveUrls(isInform = true) {
      const errMsg = this.checkIfAnyDuplicate();
      if (errMsg) {
        if (isInform) mainService.alert(errMsg)
        return Promise.reject(errMsg);
      };
      return new Promise<void>((res, rej) => {
        setTimeout(() => rej('連線異常，請重新開啟程式'), 10000);
        socketLib.emitEvent('UPDATE_URLS', this.webSets, () => {
          if (isInform) mainService.inform('儲存成功');
          res();
        });
      })
    },
    saveSeconds() {
      socketLib.emitEvent('UPDATE_SECONDS', this.webSwitchSecondObj, () => {
        mainService.inform('儲存成功');
        this.isWebSwitchSetting = false
      });
    },
    deteleWebSet() {
      mainService.confirm(`確定刪除 ${this.currWebSet.id}?`).then(isToDel => {
        if (!isToDel) return;
        backData.webSets.splice(this.webSetIndex, 1);
        this.webSetIndex = 0;
        socketLib.emitEvent('UPDATE_URLS', backData.webSets, () => {
          mainService.inform('網頁組已刪除');
        })
      })
    },
    clickCreateWebSet() {
      let getName = (index: number = 1): string => {
        let name = "網頁組" + index;
        if ((this.webSets as WebSet[]).some(set => set.id === name)) return getName(index + 1);
        else return name;
      }
      let set = new WebSet();
      set.id = getName();
      backData.webSets.splice(0, 0, set);
      socketLib.emitEvent('UPDATE_URLS', backData.webSets, () => { });
    },
    saveIePosition() {
      socketLib.emitEvent('SAVE_IE_POSITION', this.ieWindowPosition, () => {
        mainService.inform('儲存成功');
        this.isIeWindowSetting = false
      });
    },
    checkIfAnyDuplicate() {
      let errMsg = '';
      const deviceNum = this.checkDuplicate('deviceNumber');
      if (deviceNum !== null) errMsg = '設備編號重複：' + deviceNum;

      const url = this.checkDuplicate('url');
      if (url !== null) errMsg = '網址重複：' + url;

      return errMsg;
    },

    checkDuplicate(keyToCheck: 'deviceNumber' | 'url') {
      let hashTable: { [key: string]: true } = {};
      let duplicateStr = null;
      this.currWebUrlObjs.forEach(obj => {
        if (hashTable[obj[keyToCheck]]) duplicateStr = obj[keyToCheck];
        else hashTable[obj[keyToCheck]] = true;
      });
      return duplicateStr; //如果回傳空字串表示有欄位未填（跟最後一列重複）
    },
    ieAuth() {
      if (frontData.isRunning) {
        mainService.alert('流程進行中');
        return;
      }
      frontData.isRunning = true;
      socketLib.emitEvent('IE_AUTH', null, () => {
        frontData.isRunning = false;
      })
    },

  },
  computed: {
    currWebSet(): WebSet {
      return (this.webSets as WebSet[])[this.webSetIndex];
    },
    currWebUrlObjs(): WebUrlObj[] {
      return this.currWebSet?.webUrlObjs || [];
    }
  },
  watch: {
    currWebUrlObjs: {
      handler(nv) {
        let ws: WebUrlObj[] = this.currWebUrlObjs;
        if (ws.length === 0 || ws[ws.length - 1].url != '') ws.push(new WebUrlObj());
        else if (ws.length > 1 && ws[ws.length - 1].url === '' && ws[ws.length - 2].url === '') ws.splice(ws.length - 1, 1);
        // console.log(nv)
      },
      deep: true,
      immediate: true,
    },
    webSetIndex(nv) {
      socketLib.emitEvent('WEBSET_INDEX', nv);
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
.urlTable {
  text-align: center;
  width: 100%;
}

.urlTable input[type="text"] {
  box-sizing: border-box;
}
.urlInput {
  width: 80%;
}
.deviceNumInput {
  margin-left: 2%;
  width: 18%;
}
.urlInput.disabled {
  opacity: 0.8;
}
#webSetControlBox {
  display: flex;
  justify-content: space-between;
}
#webSetId {
  flex-grow: 1;
  margin-right: 20px;
  box-sizing: border-box;
}

#webSwitchSetting,
#ieWindowSetting {
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
        width: 6rem;
      }
      div.narrow {
        display: inline-block;
        width: 3rem;
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
