<template>
  <div class="block fullH antiMC splitV">
    <div class="blockTitle sidesAlign">
      <div>自動化流程測試</div>
      <div>
        <!-- <input type="button" class="secondaryBut butSpace" value="儲存路徑" @click="saveAutomationInfo" /> -->
        <input type="button" class="secondaryBut butSpace" value="上傳Recipe" @click="replaceRecipe" :disabled="isDisabled"/>
        <!-- <input type="button" class="secondaryBut butSpace" value="新增程式" @click="addNewProc" /> -->
      </div>
    </div>
    <div class="centerV">
      <!-- <div class="dataRow">
        <div class="optionTitle">Phindows路徑:</div>
        <input type="text" v-model="automationInfo.phindowsPath" placeholder='須包含至程式副檔名，且不可有 " 符號' />
      </div>
      <div class="dataRow">
        <div class="optionTitle">Ftttp路徑:</div>
        <input type="text" v-model="automationInfo.ftttpPath" placeholder='須包含至程式副檔名，且不可有 " 符號' />
      </div> -->
      <div class>
        <div class="dataRow">
          <div class="optionTitle">網頁組:</div>
          <select name id v-model="webSetIndex" >
            <option v-for="(wSet, index) in webSets" :key="index" :value="index">{{wSet.id}}
            </option>
          </select>
          </div>
        <div class="dataRow">
          <div class="optionTitle">Recipe名稱:</div>
          <input type="text" v-model="recipeName" />
        </div>
        <div class="dataRow">
          <div class="optionTitle">設備編號:</div>
           <select name id v-model="deviceNum" >
            <option v-for="(deviceNumber, index) in currWebSet.webUrlObjs.map(obj=>obj.deviceNumber).filter(dn=>dn!=='')" :key="index" :value="deviceNumber">{{deviceNumber}}
            </option>
          </select>
        </div>
      </div>
      <br />
      <br />
      <br />
      <div>
        <div style="font-weight:bold;margin-bottom:10px;">注意事項(於Qnx Server環境):</div>
        <div>1.執行前勿開啟phindows與ftttp程式。</div>
        <div>2.請使用英文輸入法，即英文（美國），否則phindows的ctrl組合鍵可能會失效。</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mainService } from '@/main-service';
import { socket, socketLib } from '@/socket';
import { WebSet } from '@/data/back.data';
import { Prop } from 'vue/types/options';
interface AutomationInfo {
  msg: string,
  deviceNum: string
}

export default Vue.extend({
  name: 'Automation',
  props: {
    automationInfo: Object,
    webSets: Array as Prop<WebSet[]>,
  },
  data() {
    return {
      recipeName: '',
      deviceNum: '',
      webSetIndex: 0,
      isDisabled:false
    }
  },
  methods: {
    replaceRecipe() {
      if (!this.checkIfDataFilled()) return;
      this.isDisabled=true;
      socketLib.emitEvent('WEBSET_INDEX', this.webSetIndex); 
      setTimeout(()=>{
        this.$emit('upload-recipe');
        let data: AutomationInfo = {
          msg: this.recipeName,
          deviceNum: this.deviceNum,
        };
        socketLib.emitEvent('EXEC_AUTOMATION', data);
        this.isDisabled=false;
      },500)
    },
    // addNewProc() {
    //   if (!this.checkIfDataFilled()) return;

    //   let data: AutomationInfo = {
    //     msg: this.automationInfo.recipeName,
    //     ftttpPath: this.automationInfo.ftttpPath,
    //     phindowsPath: this.automationInfo.phindowsPath
    //   };
    //   socketLib.emitEvent('EXEC_AUTOMATION', data)
    // },
    saveAutomationInfo() {
      socketLib.emitEvent('UPDATE_AUTOMATION_INFO', this.automationInfo, () => {
        mainService.inform('成功');
      })
    },
    checkIfDataFilled() {
      const arr = [ this.recipeName, this.deviceNum];
      let isAllFilled = arr.every(str => str !== '');
      if (!isAllFilled) mainService.alert('每個欄位皆須填寫')
      return isAllFilled;
    }
  },
  computed: {
    currWebSet(): WebSet {
      return (this.webSets as WebSet[])[this.webSetIndex];
    },
  },


});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.dataRow {
  margin-top: 2rem;
  input {
    width: 25rem;
  }
}
.optionTitle {
  display: inline-block;
  width: 8rem;
}
</style>
