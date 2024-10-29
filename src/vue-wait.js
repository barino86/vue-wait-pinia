import {
  is,
  any,
  start,
  end,
  progress,
  percent,
  endProgress,
  nodeIsDebug
} from './utils';

// Import to export
import { mapWaitingActions, mapWaitingGetters, waitFor } from './helpers';
import { defineStore, mapState } from 'pinia'
import { createApp } from "vue";

import piniaStore from './pinia/store';
import vWaitComponent from './components/v-wait.vue';
import vWaitDirective from './directives/wait.js';

export default class VueWait {
  constructor(options = {}) {
    const defaults = {
      accessorName: '$wait',
      // Pinia Options
      usePinia: false,
      piniaStoreName: 'waitStore',
      // Components
      registerComponent: true,
      componentName: 'v-wait',
      // Directives
      registerDirective: true,
      directiveName: 'wait'
    };
    this.options = {
      ...defaults,
      ...options
    };
    this.initialized = false;
  }

  init(App, store) {
    if (nodeIsDebug() && !install.installed && VueWait.getVueVersion(App) < 3) {
      console.warn(
        `[vue-wait] not installed. Make sure to call \`Vue.use(VueWait)\` before init root instance.`
      );
    }

    if (this.initialized) {
      return;
    }

    if (this.options.registerComponent) {
      App.component(this.options.componentName, vWaitComponent);
    }

    if (this.options.registerDirective) {
      App.directive(this.options.directiveName, vWaitDirective);
    }

    if (this.options.usePinia) {
      const { piniaStoreName } = this.options;
      if (!store) {
        throw new Error('[vue-wait] Pinia not initialized.');
      }

      let storeDef

      if (!store._s.has(piniaStoreName)) {
        storeDef = defineStore(piniaStoreName, piniaStore)
      } else {
        storeDef = store._s.get(piniaStoreName)
      }
      this.store = storeDef()

      const config = {
        computed: {
          ...mapState(storeDef, [
            'is', 'any', 'percent'
          ]),
        }
      };

      this.stateHandler = createApp(config)
        .mount(
          document.createElement('div')
        );

    } else {
      const config = {
        data() {
          return {
            waitingFor: [],
            progresses: {}
          };
        },
        computed: {
          is() {
            return waiter => is(this.waitingFor, waiter);
          },
          any() {
            return any(this.waitingFor);
          },
          percent() {
            return waiter => percent(this.progresses, waiter);
          }
        },
        methods: {
          start(waiter) {
            this.waitingFor = start(this.waitingFor, waiter);
          },
          end(waiter) {
            this.waitingFor = end(this.waitingFor, waiter);
            this.progresses = endProgress(this.progresses, waiter);
          },
          progress({ waiter, current, total }) {
            this.progresses = progress(this.progresses, waiter, current, total);
          }
        }
      };

      this.stateHandler = createApp(config).mount(
        document.createElement('div')
      );
    }

    this.initialized = true;
  }

  get any() {
    return this.stateHandler.any;
  }

  static getVueVersion(app) {
    return parseFloat((app.version || '').split('.')[0] || 0);
  }

  is(waiter) {
    return this.stateHandler.is(waiter);
  }

  // alias for `is`
  waiting(waiter) {
    return this.is(waiter);
  }

  percent(waiter) {
    return this.stateHandler.percent(waiter);
  }

  start(waiter) {
    if (this.options.usePinia) {
      this.store.start(waiter)
      return;
    }
    this.stateHandler.start(waiter);
  }

  end(waiter) {
    if (this.options.usePinia) {
      this.store.end(waiter)
      return;
    }
    this.stateHandler.end(waiter);
  }

  progress(waiter, current, total = 100) {
    if (!this.is(waiter)) {
      this.start(waiter);
    }

    if (current > total) {
      this.end(waiter);
      return;
    }

    if (this.options.usePinia) {
      this.store.progress({ waiter, current, total })
      return;
    }
    this.stateHandler.progress({ waiter, current, total });
  }
}

export function install(App) {
  if (install.installed && App) {
    if (nodeIsDebug()) {
      console.warn(
        '[vue-wait] already installed. Vue.use(VueWait) should be called only once.'
      );
    }
    return;
  }

  App.mixin({
    /**
     * VueWait init hook, injected into each instances init hooks list.
     */
    beforeCreate() {
      const { wait, store, parent } = this.$options;

      let instance = null;
      if (wait) {
        instance = typeof wait === 'function' ? new wait() : wait;
        // Inject store
        instance.init(App, store);
      } else if (parent && parent.__$waitInstance) {
        instance = parent.__$waitInstance;
        instance.init(App, parent.$store);
      }

      if (instance) {
        // Store helper for internal use
        this.__$waitInstance = instance;
        this[instance.options.accessorName] = instance;
      }
    }
  });

  install.installed = true;
}

function createVueWait(options) {
  const Wait = {
    instance: null,
    async install(app) {
      if (this.installed && app) {
        if (nodeIsDebug()) {
          console.warn('[vue-wait] already installed');
        }
        return this.instance;
      }

      const instance = new VueWait(options);
      instance.init(app, app.config.globalProperties.$pinia);
      app.config.globalProperties[instance.options.accessorName] = instance;

      app.mixin({
        beforeCreate() {
          this.__$waitInstance = instance;
        }
      });

      this.instance = instance;
      this.installed = true;
      return instance;
    }
  };

  return Wait;
}

// Export which are imported to export
export { mapWaitingActions, mapWaitingGetters, waitFor, createVueWait };

VueWait.install = install;
