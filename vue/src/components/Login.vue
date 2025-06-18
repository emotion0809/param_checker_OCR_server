<template>
  <div class="loginPage" id="loginPage">
    <div class="center">
      <div class="LoginBox">
        <div class="loginTitle">Login</div>
        <div class="enterDataBox">
          <div class="center enterDataRow">
            <div class="center iconBox noRightRadius">
              <img src="../assets/user.svg" class="icon" />
            </div>

            <input
              v-model="loginData.accountName"
              class="loginInput noLeftRadius"
              placeholder="UserName"
            />
          </div>

          <div class="center enterDataRow">
            <div class="center iconBox noRightRadius">
              <img src="../assets/lock-locked.svg" class="icon" />
            </div>
            <input
              v-model="loginData.password"
              type="password"
              class="loginInput noLeftRadius"
              placeholder="Password"
            />
          </div>
        </div>
        <!-- //不blur,enter可能會觸發連兩次登入 -->
        <div class="rightAlign" style="margin-top: 0.8rem;">
          <button
            class="primaryBut"
            style="padding: 0.375rem 1.5rem;"
            @click=" logIn(); $event.target.blur(); "
          >Login</button>
        </div>
      </div>
      <div class="logoBox centerV">
        <div style="font-size:1.5rem;">VMZ N100</div>
        <br />
        <div
          style="font-size:0.6rem;font-weight: lighter;"
        >Automation makes the future of manufacturing</div>
        <br />
        <br />
        <div class="cpNameBox">HHC Auto Co.,Ltd.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// import { mainFrontService as mfs, mainFrontService } from "../main-front.service";
import { backData } from "../data/back.data";
import { socket } from "../socket";
import { mainService } from '../main-service';
import { User, AuthType, frontData } from '@/data/front.data';

export default Vue.extend({
  name: "Login",
  props: {
    users: Array
  },
  data: function (): { loginData: User } {
    return {
      // companies: null,
      loginData: {
        accountName: '',
        password: '',
        auth: AuthType.root
      } as User,
    }
  },
  methods: {
    logIn() {
      let users: User[] = this.users as any;
      let theUser = users.find(user => user.accountName === this.loginData.accountName);
      if (!theUser) {
        mainService.alert('無此帳號');
        return
      }
      if (theUser.password !== this.loginData.password) {
        mainService.alert('密碼錯誤');
        return
      }
      theUser.lastLognT = new Date();
      mainService.saveDataToLS('users', users);
      //登入
      frontData.user = theUser;
    },
    onKeyDown(event: KeyboardEvent) {
      if (event.keyCode === 13) this.logIn()
    },
  },
  mounted: function () {
    document.body.addEventListener('keydown', this.onKeyDown);

  },
  destroyed() {
    document.body.removeEventListener('keydown', this.onKeyDown);
  },
  // computed: {
  //   companiesWithSelf: function () {
  //     let x = [{ id: null, companyName: 'AG' }].concat(this.companies ? this.companies : [])
  //     return x
  //   }
  // },
});


/** make modals able to be closed by Enter & Esc */
// function activateSomeKeysForCloseModalTemporarily(
//   closeCallBack: Function,
//   toActioveKey: "ALL" | "ENTER" | "ESC" = "ALL",
//   isStopOnceTriggered = true
// ): Function {
//   document.addEventListener("keydown", onEnterPressed);
//   let removeDetectionResForOutSide;

//   new Promise(res => {
//     removeDetectionResForOutSide = res;
//   }).then(() => {
//     document.removeEventListener("keydown", onEnterPressed);
//   });

//   return removeDetectionResForOutSide;

//   function onEnterPressed(event) {
//     let detectBoolean;
//     if (toActioveKey === "ALL")
//       detectBoolean = event.keyCode === 13 || event.keyCode === 27;
//     else if (toActioveKey === "ENTER") detectBoolean = event.keyCode === 13;
//     else if (toActioveKey === "ESC") detectBoolean = event.keyCode === 27;

//     if (detectBoolean) {
//       if (closeCallBack) closeCallBack();
//       if (isStopOnceTriggered)
//         document.removeEventListener("keydown", onEnterPressed);
//     }
//   }
// }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/* login page */
.loginPage {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ebedef;
  // background: linear-gradient(
  //   144deg,
  //   rgba(174, 226, 238, 0.9587185215883228) 0%,
  //   rgba(164, 199, 236, 1) 38%,
  //   rgba(159, 180, 235, 1) 59%,
  //   rgba(36, 106, 189, 1) 100%
  // );
}

.loginTitle {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: rgb(60, 75, 100);
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.LoginBox {
  background-color: white;
  padding: 2.75rem;
  width: 18em;
  // border-radius: 1em;
  display: flex;
  flex-direction: column;
  border: 0;
  box-shadow: 0 1px 1px 0 rgba(60, 75, 100, 0.14),
    0 2px 1px -1px rgba(60, 75, 100, 0.12), 0 1px 3px 0 rgba(60, 75, 100, 0.2);
}

.iconBox {
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px #d8dbe0 solid;
  height: 1.5rem;
  background-color: #ebedef;
  margin-right: -1px;
}
.icon {
  width: 1rem;
  height: 1rem;
}
.enterDataBox {
  display: flex;
  flex-direction: column;
}

.enterDataRow {
  margin-bottom: 1rem;
}
.loginInput {
  padding: 0.375rem 0.75rem;
  height: 1.5rem;
}

.logoBox {
  height: 100%;
  width: 18rem;
  background-color: var(--primary);
  color: white;
}
.cpNameBox {
  // border-radius: .3rem;
  color: #4f5d70;
  font-weight: 600;
  padding: 0.5rem 1rem;
  // border:1px    solid  #ebedef;
  background-color: white;
}
</style>
