import { createStore } from 'vuex';
import finance from './finance';

export default createStore({
  state: {
    // Define your state here
  },
  getters: {
    // Define getters here
  },
  mutations: {
    // Define synchronous state mutations here
  },
  actions: {
    // Define asynchronous actions here
  },
  modules: {
    finance
  }
});
