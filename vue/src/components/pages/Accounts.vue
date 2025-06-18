<template>
  <div class="block fullH antiMC splitV">
    <div class="blockTitle sidesAlign">
      帳戶管理
      <div style="text-align:right" class="addNewAccountBoxWrapper">
        <div class="addNewAccountBox">
          <input
            class="accountInfoInput"
            type="text"
            placeholder="帳戶名"
            v-model="createAccountData.accountName"
          />
          <input
            class="accountInfoInput"
            type="password"
            placeholder="密碼"
            v-model="createAccountData.password"
          />
          <input
            class="accountInfoInput"
            type="password"
            placeholder="請再輸入密碼"
            v-model="createAccountData.passwordDoubleCheck"
          />
          <button class="butSpace secondaryBut" @click="clickAdd">新增帳戶</button>
        </div>
      </div>
    </div>
    <div class="accountBox fullH">
      <table class="accountTable">
        <tr>
          <th style="width:20%">帳戶</th>
          <th style="width:20%">帳號管理權限</th>
          <th style="width:20%">上次登入時間</th>
          <th style="width:40%">操作</th>
        </tr>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{user.accountName}}</td>

          <td>{{authEnum[user.auth]==='root'?'有':''}}</td>
          <td>{{user.lastLognT?user.lastLognT.toLocaleString():''}}</td>
          <td>
            <div v-if="isEditPs&&usingIndex===index">
              <input
                class="accountInfoInput narrow"
                type="password"
                placeholder="密碼"
                v-model="editPsObj.password"
              />
              <input
                class="accountInfoInput narrow"
                type="password"
                placeholder="請再輸入密碼"
                v-model="editPsObj.passwordDoubleCheck"
              />
              <button class="butSpace secondaryBut" @click="confirmEditingPs()">確定</button>
              <button class="butSpace secondaryBut" @click="isEditPs=false">取消</button>
            </div>
            <div v-else @click.capture="usingIndex=index">
              <button class="butSpace secondaryBut" @click="clickEditPs()">修改密碼</button>
              <button
                v-if="authEnum[user.auth]!=='root'"
                class="butSpace secondaryBut"
                @click="deleteAccount()"
              >刪除帳戶</button>
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
import { AuthType, User } from '@/data/front.data';

export default Vue.extend({
  name: 'Accounts',
  props: {
    users: Array,
  },
  data() {
    return {
      createAccountData: {
        accountName: '' as string,
        password: '' as string,
        passwordDoubleCheck: '' as string,
      },
      editPsObj: {
        password: '' as string,
        passwordDoubleCheck: '' as string,
      },
      authEnum: AuthType,
      isEditPs: false,
      usingIndex: 0
    }
  },
  methods: {
    clickAdd() {
      let users: User[] = this.users as any;

      if (!this.createAccountData.accountName || !this.createAccountData.password || !this.createAccountData.passwordDoubleCheck) {
        mainService.alert('欄位不得為空');
        return
      }
      if (users.some(u => u.accountName === this.createAccountData.accountName)) {
        mainService.alert('帳戶名重複');
        return
      }

      if (this.createAccountData.password !== this.createAccountData.passwordDoubleCheck) {
        mainService.alert('密碼相異');
        return
      }
      let u = new User(this.createAccountData.accountName, this.createAccountData.password);
      users.push(u);
      mainService.saveDataToLS('users', users);
      Object.keys(this.createAccountData).forEach(key => (this.createAccountData as any)[key] = '');
      mainService.inform('創建成功');
    },
    clickEditPs() {
      Object.keys(this.editPsObj).forEach(key => (this.editPsObj as any)[key] = '');
      this.isEditPs = true;
    },
    confirmEditingPs() {
      if (this.editPsObj.password !== this.editPsObj.passwordDoubleCheck) {
        mainService.alert('密碼相異');
        return
      }
      this.currUser.password = this.editPsObj.password;
      mainService.saveDataToLS('users', this.users);

      mainService.inform('修改成功');
      this.isEditPs = false;
    },
    deleteAccount() {
      mainService.confirm(`確定刪除 ${this.currUser.accountName} ?`).then(isToDel => {
        if (isToDel) {
          let users: User[] = this.users as any;
          users.splice(users.findIndex(u => u.id === this.currUser.id), 1);
          mainService.saveDataToLS('users', this.users);
          mainService.inform('刪除成功');
        }
      });

    }
  },
  computed: {
    currUser(): User {
      return (this.users as any)[this.usingIndex];
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.addNewAccountBox {
  margin-left: auto;
  display: inline-block;
}
.accountBox {
  padding: 2rem;
  overflow: auto;
}
.accountTable {
  text-align: center;
  width: 100%;
}
.accountInfoInput {
  width: 8rem;
  margin: 0 0.2rem;
}
.narrow {
  width: 6rem;
}
</style>
