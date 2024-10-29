import { createApp } from 'vue';
import { createVueWait } from '../../src/vue-wait';
import { createPinia } from "pinia"

const pinia = createPinia()
const vueWait = createVueWait({
  usePinia: true,
  piniaStoreName: 'vuex-example-module',
  accessorName: '$l'
})

import main from './main.vue';
createApp(main)
  .use(pinia)
  .use(vueWait)
  .mount("#app")




