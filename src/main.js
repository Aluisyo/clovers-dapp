// import lazySizes from 'lazysizes'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Web3 from 'web3'
import ENS from 'ethereum-ens'
import Portis from '@portis/web3';
import VueHead from 'vue-head'
import VueTouch from 'vue-touch'
// import VueChatScroll from 'vue-chat-scroll'

import BN from 'bignumber.js'

import Clv from '@/components/Clv'
// import CloverGridItem from '@/components/CloverGridItem'
// import './registerServiceWorker'
import ZeroClientProvider from 'web3-provider-engine/zero.js'

import autofocus from 'vue-autofocus-directive'
const networks = {
  4: 'rinkeby',
  5777: 'ganache',
  1: 'mainnet'
}

if (global.ethereum) {
  global.web3 = new Web3(global.ethereum)
} else if (global.web3) {
  global.web3 = new Web3(global.web3.currentProvider)
} else {
  const portis = new Portis(process.env.VUE_APP_PORTIS_DAPP, networks[store.state.correctNetwork]);
  global.web3 = new Web3(portis.provider);
}

global.ens = new ENS(global.web3.currentProvider)

router.beforeEach((to, from, next) => {
  to.meta.fromName = from.name
  next()
})

router.afterEach(() => {
  if (ga) ga('send', 'pageview')
})

Object.defineProperty(Vue.prototype, '$BN', { value: BN })

// Vue config
Vue.config.productionTip = false
Vue.config.devtools = true
Vue.config.APIBaseUrl = process.env.VUE_APP_API_URL

Vue.use(VueHead, {separator: '|', complement: 'Clovers'})
Vue.use(VueTouch, {name: 'v-touch'})
// Vue.use(VueChatScroll)

Vue.component('clv', Clv)

Vue.directive('autofocus', autofocus)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
