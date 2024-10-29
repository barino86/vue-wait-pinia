import { createApp } from 'vue';
import { createVueWait } from '../../src/vue-wait';
import { OrbitSpinner } from 'epic-spinners';
import main from './main.vue';

const vueWait = createVueWait({
  registerComponents: false
})

createApp(main)
  .use(vueWait)
  .component('orbit-spinner', OrbitSpinner)
  .mount("#app")

