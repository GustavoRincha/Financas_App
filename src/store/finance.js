export default {
  namespaced: true,
  state: {
    income: 0,
    savingsGoal: 0,
    transactions: [],
    investments: [],
    currentCdiRate: 10.40,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
  },
  getters: {
    filteredTransactions(state) {
      return state.transactions.filter(t => {
        const date = new Date(t.date);
        return (date.getMonth() + 1) === state.selectedMonth && date.getFullYear() === state.selectedYear;
      });
    },
    totalCredit(state, getters) {
      return getters.filteredTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
    },
    totalDebit(state, getters) {
      return getters.filteredTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
    },
    totalExpenses(state, getters) {
      return getters.totalCredit + getters.totalDebit;
    },
    balance(state, getters) {
      const incomeCalc = getters.filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      return state.income + incomeCalc - getters.totalExpenses;
    }
  },
  mutations: {
    SET_FINANCE_DATA(state, data) {
      if (data.income !== undefined) state.income = data.income;
      if (data.savingsGoal !== undefined) state.savingsGoal = data.savingsGoal;
      if (data.transactions) state.transactions = data.transactions;
      if (data.investments) state.investments = data.investments;
      if (data.currentCdiRate !== undefined) state.currentCdiRate = data.currentCdiRate;
      if (data.selectedMonth !== undefined) state.selectedMonth = data.selectedMonth;
      if (data.selectedYear !== undefined) state.selectedYear = data.selectedYear;
    },
    SET_INCOME(state, income) {
      state.income = Number(income);
    },
    SET_CDI_RATE(state, rate) {
      state.currentCdiRate = Number(rate);
    },
    SET_SELECTED_MONTH(state, month) {
      state.selectedMonth = Number(month);
    },
    SET_SELECTED_YEAR(state, year) {
      state.selectedYear = Number(year);
    },
    SET_SAVINGS_GOAL(state, goal) {
      state.savingsGoal = Number(goal);
    },
    ADD_TRANSACTION(state, transaction) {
      state.transactions.unshift(transaction);
    },
    REMOVE_TRANSACTION(state, id) {
      state.transactions = state.transactions.filter(t => t.id !== id);
    },
    ADD_INVESTMENT(state, investment) {
      state.investments.unshift(investment);
    },
    REMOVE_INVESTMENT(state, id) {
      state.investments = state.investments.filter(i => i.id !== id);
    }
  },
  actions: {
    loadData({ commit }) {
      const data = localStorage.getItem('financas_app_data');
      if (data) {
        commit('SET_FINANCE_DATA', JSON.parse(data));
      }
    },
    saveData({ state }) {
      localStorage.setItem('financas_app_data', JSON.stringify(state));
    },
    updateIncome({ commit, dispatch }, income) {
      commit('SET_INCOME', income);
      dispatch('saveData');
    },
    updateCdiRate({ commit, dispatch }, rate) {
      commit('SET_CDI_RATE', rate);
      dispatch('saveData');
    },
    updateSelectedMonth({ commit, dispatch }, month) {
      commit('SET_SELECTED_MONTH', month);
      dispatch('saveData');
    },
    updateSelectedYear({ commit, dispatch }, year) {
      commit('SET_SELECTED_YEAR', year);
      dispatch('saveData');
    },
    updateSavingsGoal({ commit, dispatch }, goal) {
      commit('SET_SAVINGS_GOAL', goal);
      dispatch('saveData');
    },
    addTransaction({ commit, dispatch }, transaction) {
      const newTransaction = {
        ...transaction,
        amount: Number(transaction.amount),
        id: Date.now().toString() + '-' + Math.floor(Math.random() * 10000),
        date: transaction.customDate || new Date().toISOString(),
      };
      commit('ADD_TRANSACTION', newTransaction);
      dispatch('saveData');
    },
    removeTransaction({ commit, dispatch }, id) {
      commit('REMOVE_TRANSACTION', id);
      dispatch('saveData');
    },
    addInvestment({ commit, dispatch }, investment) {
      const newInvest = {
        ...investment,
        id: Date.now().toString(),
        date: new Date().toISOString()
      };
      commit('ADD_INVESTMENT', newInvest);
      dispatch('saveData');
    },
    removeInvestment({ commit, dispatch }, id) {
      commit('REMOVE_INVESTMENT', id);
      dispatch('saveData');
    }
  }
};
