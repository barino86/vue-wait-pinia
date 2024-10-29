import { defineStore } from "pinia";

export const useCountStore = defineStore('count', {
  state: () => ({
    counter: 1
  }),
  getters: {
    count: (state) => state.counter
  },
  actions: {
    incrementAsync({ commit }) {
      return new Promise(resolve => {
        setTimeout(() => {
          this.counter += 1
          resolve();
        }, 3000);
      });
    }
  }
})
