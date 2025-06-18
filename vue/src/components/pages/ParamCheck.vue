<template>
  <div class="block fullH antiMC splitV">
    <div class="blockTitle sidesAlign">
      <div>
        參數管理
        <select name id v-model="setIndex">
          <option v-for="(pSet, index) in paramSets" :key="index" :value="index">{{pSet.id}}</option>
        </select>
        <input type="button" style="margin-left:5px" value="新增參數組" @click="clickCreateParamSet" />
      </div>
      <div style="text-align:right" class="addNewParamBoxWrapper" v-if="currParamSet">
        <div class="managePasswordBox" v-if="!isManagementPasswordVarified">
          <div>
            <input
              class="paramInfoInput wide"
              type="password"
              placeholder="欲新增、刪除參數請驗證管理密碼"
              v-model="managementPassword"
            />
            <button class="butSpace secondaryBut" @click="submitManagementPassword">確定</button>
          </div>
        </div>
        <div class="addNewParamBox" v-else>
          <input
            class="paramInfoInput narrow"
            type="text"
            placeholder="參數名"
            v-model="createParamData.name"
          />
          <input
            class="paramInfoInput narrow"
            type="number"
            placeholder="下限"
            v-model.number="createParamData.lowerBound"
          />
          <input
            class="paramInfoInput narrow"
            type="number"
            placeholder="上限"
            v-model.number="createParamData.upperBound"
          />

          <button class="butSpace secondaryBut" @click="clickAdd">新增參數</button>
             <button class="butSpace secondaryBut" @click="isManagementPasswordVarified=false;managementPassword=null">登出</button>
        </div>
      </div>
    </div>
    <div class="paramBox fullH">
      <table class="paramTable" v-if="currParamSet">
        <tr>
          <td colspan="4">
            <div id="paramSetControlBox">
              <input
                type="text"
                id="paramSetId"
                placeholder="參數組ID"
                v-model="currParamSet.id"
                @blur="updateParamSetId"
              />
              <input type="button" @click="deteleParamSet" value="刪除參數組" class="secondaryBut" />
            </div>
          </td>
        </tr>
        <tr>
          <th style="width:30%">參數名稱</th>
          <th style="width:15%">下限</th>
          <th style="width:15%">上限</th>
          <th style="width:40%">操作</th>
        </tr>
        <tr v-for="(param, index) in currParamSet.params" :key="index">
          <td>{{param.name}}</td>

          <td>
            <div>{{param.lowerBound}}</div>
          </td>
          <td>
            <div>{{param.upperBound}}</div>
          </td>
          <td>
            <div v-if="isEditBounds&&usingIndex===index">
              <div class>
                <input
                  class="paramInfoInput narrow marBottom"
                  type="number"
                  placeholder="下限"
                  v-model.number="editBoundsObj.lowerBound"
                />
                <input
                  class="paramInfoInput narrow marBottom"
                  type="number"
                  placeholder="上限"
                  v-model.number="editBoundsObj.upperBound"
                />
              </div>

              <div class="editBoundsControl">
                <button class="butSpace secondaryBut" @click="confirmEditingBounds()">確定</button>
                <button class="butSpace secondaryBut" @click="isEditBounds=false">取消</button>
              </div>
            </div>
            <div v-else @click.capture="usingIndex=index">
              <button class="butSpace secondaryBut" @click="clickEditBounds()">修改</button>
              <button
                v-if="isManagementPasswordVarified"
                class="butSpace secondaryBut"
                @click="deleteParam()"
              >刪除參數</button>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {  backData, Param, ParamSet } from '../../data/back.data';
import { mainService } from '../../main-service';
import { socketLib } from '../../socket';
import { AuthType } from '@/data/front.data';

export default Vue.extend({
  name: 'Params',
  props: {
    paramSets: Array,
    users: Array,
  },
  data() {
    return {
      setIndex: 0,
      createParamData: {
        name: '' as string,
        lowerBound: '' as number | '',
        upperBound: '' as number | '',
      },
      managementPassword: null,
      isManagementPasswordVarified: false,
      editBoundsObj: {
        lowerBound: '' as number | '',
        upperBound: '' as number | '',
      },
      authEnum: AuthType,
      isEditBounds: false,
      usingIndex: 0,
      tempParamSetId: '',
    }
  },
  methods: {
    submitManagementPassword() {
      if (!this.managementPassword) {
        mainService.alert('尚未輸入密碼');
        return
      }
      socketLib.emitEvent('CHECK_MANAGE_PS', this.managementPassword, (isVerified: boolean) => {
        if (isVerified) this.isManagementPasswordVarified = true;
        else mainService.alert('密碼有誤，請重新輸入');
      })
    },
    clickCreateParamSet() {
      let getName = (index: number = 1): string => {
        let name = "參數組ID" + index;
        if ((this.paramSets as ParamSet[]).some(set => set.id === name)) return getName(index + 1);
        else return name;
      }

      let set = new ParamSet();
      set.id = getName();
      backData.paramSets.splice(0, 0, set);
      socketLib.emitEvent('UPDATE_PARAMS', this.paramSets, () => {
      });
    },
    clickAdd() {
      let params: Param[] = this.currParamSet.params as any;
      console.log(this.createParamData)
      if (Object.keys(this.createParamData).some(key => (this.createParamData as any)[key] === '')) {
        mainService.alert('欄位不得為空且上下限須為數字');
        return
      }

      if (params.some(p => p.name === this.createParamData.name)) {
        mainService.alert('參數名重複');
        return
      }

      let createParamData = this.createParamData as any;
      if (createParamData.upperBound < createParamData.lowerBound) {
        mainService.alert('下限不得大於上限');
        return
      }

      params.push(JSON.parse(JSON.stringify(this.createParamData)));
      socketLib.emitEvent('UPDATE_PARAMS', this.paramSets, () => {
        mainService.inform('創建成功');
        Object.keys(this.createParamData).forEach(key => (this.createParamData as any)[key] = '');
      })

    },
    clickEditBounds() {
      Object.keys(this.editBoundsObj).forEach(key => (this.editBoundsObj as any)[key] = '');
      this.isEditBounds = true;
    },
    confirmEditingBounds() {
      if (Object.keys(this.editBoundsObj).some(key => (this.editBoundsObj as any)[key] === '')) {
        mainService.alert('欄位不得為空且上下限須為數字');
        return
      }

      let editBoundsObj = this.editBoundsObj as any;
      if (editBoundsObj.upperBound <= editBoundsObj.lowerBound) {
        mainService.alert('上限應大於下限');
        return
      }

      this.currParam.upperBound = this.editBoundsObj.upperBound as number;
      this.currParam.lowerBound = this.editBoundsObj.lowerBound as number;

      socketLib.emitEvent('UPDATE_PARAMS', this.paramSets, () => {
        mainService.inform('修改成功');
        this.isEditBounds = false;
      })
    },
    deleteParam() {
      mainService.confirm(`確定刪除 ${this.currParam.name} ?`).then(isToDel => {
        if (isToDel) {
          let params: Param[] = this.currParamSet.params as any;
          params.splice(params.findIndex(p => p.name === this.currParam.name), 1);
          socketLib.emitEvent('UPDATE_PARAMS', this.paramSets, () => {
            mainService.inform('刪除成功');
            this.isEditBounds = false;
          })
        }
      });
    },
    updateParamSetId() {
      if (this.tempParamSetId === this.currParamSet.id) return;

      if ((this.paramSets as ParamSet[]).some(set => this.currParamSet !== set && set.id === this.currParamSet.id)) {
        mainService.alert('不得重複命名').then(() => {
          this.currParamSet.id = this.tempParamSetId;
        });
        return
      };

      if (this.currParamSet.id === '') {
        mainService.alert('ID不得為空').then(() => {
          this.currParamSet.id = this.tempParamSetId;
        });
        return
      };

      this.tempParamSetId = this.currParamSet.id;
      socketLib.emitEvent('UPDATE_PARAMS', this.paramSets, () => {
        mainService.inform('參數組ID已更新');
      })


    },
    deteleParamSet() {
      mainService.confirm(`確定刪除 ${this.currParamSet.id}?`).then(isToDel => {
        if (!isToDel) return;
        backData.paramSets.splice(this.setIndex, 1);
        this.setIndex = 0;
        socketLib.emitEvent('UPDATE_PARAMS', backData.paramSets, () => {
          mainService.inform('參數組已刪除');
        })
      })

    }
  },
  computed: {
    currParamSet(): ParamSet {
      let paramSet = (this.paramSets as any)[this.setIndex]
      return paramSet
    },
    currParam(): Param {
      return (this.currParamSet.params as any)[this.usingIndex];
    }
  },
  watch: {
    "currParamSet"(nv) {
      this.tempParamSetId = nv.id;
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.addNewParamBox {
  margin-left: auto;
  display: inline-block;
}
.paramBox {
  padding: 2rem;
  overflow: auto;
}
.paramTable {
  text-align: center;
  width: 100%;
}
#paramSetControlBox {
  display: flex;
  justify-content: space-between;
}
#paramSetId {
  flex-grow: 1;
  margin-right: 20px;
  box-sizing: border-box;
}
.paramInfoInput {
  width: 8rem;
  margin: 0 0.2rem;
}
.narrow {
  width: 6rem;
}
.wide {
  width: 14rem;
}
.editBoundsControl {
  display: flex;
  margin-top: 1rem;
  justify-content: flex-end;
}
.marBottom {
  margin-bottom: 0.5rem;
}
</style>
