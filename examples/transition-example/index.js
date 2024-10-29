import { createApp } from 'vue';
import { createVueWait } from '../../src/vue-wait';
import main from './main.vue';

const vueWait = createVueWait({
  registerComponents: false
})

createApp(main)
  .use(vueWait)
  .mount("#app")
