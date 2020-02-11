import Vue from 'vue'
import VueWindowSize from 'vue-window-size';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import App from './App.vue'

// app.js
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Vue plugins
Vue.use(VueWindowSize);
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
