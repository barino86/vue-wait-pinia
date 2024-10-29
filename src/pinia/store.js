import { is, any, start, end, progress, percent, endProgress } from '../utils';

export default {
  state: () => ({
    waitingFor: [],
    progresses: {}
  }),
  getters: {
    is: (state) => waiter => is(state.waitingFor, waiter),
    any: (state) => any(state.waitingFor),
    percent: (state) => waiter => percent(state.progresses, waiter)
  },
  actions: {
    start(waiter){
      this.waitingFor = start(this.waitingFor, waiter)
    },
    end( waiter){
      this.waitingFor = end(this.waitingFor, waiter)
      this.progresses = endProgress(this.progresses, waiter)
    },
    progress({ waiter, current, total }) {
      this.progresses = progress(this.progresses, waiter, current, total);
    }
  }
};
