import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

var VueTouch = require('vue-touch')
VueTouch.registerCustomEvent('doubletap', {
      type: 'tap',
      taps: 2
    })
Vue.use(VueTouch, {name: 'v-touch'})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
