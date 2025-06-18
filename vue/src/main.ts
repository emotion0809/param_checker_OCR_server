import Vue from 'vue';
import App from './App.vue';
import { AuthType, User } from './data/front.data';
import { CreateType, mainService } from './main-service';
import './registerServiceWorker';
import { socketLib } from './socket';
import { nwLib } from './nw.lib';

Vue.config.productionTip = false;

// localStorage..clear(); //方便但避免誤用所以多個點

let dataPreloadP = new Promise(res => {

  // //空則幫創第一個，否則正常載入
  // mainData.users = mainService.GetFromLocalStorage('users') || createRootUser();
  // mainService.loadDataInFromLS('logs');
  socketLib.dataLoadedRes = res;
});

dataPreloadP.then(() => {
  //init vue after loading data
  nwLib.enterFullScreen();
  mainService.vm = new Vue({
    render: (h) => h(App),
  }).$mount('#app') as any;
})


// 創建第一筆
function createRootUser() {
  let u: User = new User('admin', '123456', AuthType.root);
  u.lastLognT = new Date();
  let users = [u];
  mainService.saveDataToLS('users', users);
  return mainService.GetFromLocalStorage('users')
}

