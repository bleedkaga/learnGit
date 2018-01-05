
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import jquery from 'jquery'
import base64 from 'base-64'

Vue.config.productionTip = false;
Vue.use(ElementUI)

if(process.env.PROJECT == 'F'){
  Vue.prototype.logo = '../assets/logo-fx.png'
} else if(process.env.PROJECT == "P"){
  Vue.prototype.logo = '../assets/logo.jpg'
}

if(process.env.NODE_ENV === 'development'){

  // Vue.prototype.$request = 'http://park.jc.palmtrends.com/api_v2.php';
  Vue.prototype.$request = 'http://disuo.bundhzm.com:8000/api_v2.php';
} else {
  Vue.prototype.$request = '/api_v2.php'
}

Vue.prototype.tips = {
  TIME_ERROR : "请设置合理的查询时间",   //时间查询提示语
}

Vue.prototype.$http = axios;
Vue.prototype.$jquery = jquery;
Vue.prototype.$base64 = base64;


new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
})
