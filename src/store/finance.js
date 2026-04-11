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
    categoryBudgets: {},
    apiKeys: {
      brapi: ''
    },
    lastYieldInjectionDate: '',
    creditCardClosingDay: null,
    theme: 'light'
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
    },
    totalEstimatedYield(state) {
      let yieldSum = 0;
      if (!state.investments) return 0;
      state.investments.forEach(item => {
        if (item.type === 'fii') {
          yieldSum += (Number(item.quotas) * Number(item.yieldPerQuota));
        } else if (item.type === 'cdi') {
          const cdiAnnualRate = Number(state.currentCdiRate) / 100;
          const dailyCdiFactor = Math.pow(1 + cdiAnnualRate, 1 / 252);
          const dailyInvestmentRate = (dailyCdiFactor - 1) * (Number(item.cdiPercentage) / 100);
          const monthlyFactor = Math.pow(1 + dailyInvestmentRate, 21);
          yieldSum += Number(item.amount) * (monthlyFactor - 1);
        } else if (item.type === 'fixed') {
          const rate = Number(item.annualRate) / 100;
          const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;
          yieldSum += Number(item.amount) * monthlyRate;
        }
      });
      return yieldSum;
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
      if (data.categoryBudgets !== undefined) state.categoryBudgets = data.categoryBudgets;
      if (data.apiKeys !== undefined) state.apiKeys = data.apiKeys;
      if (data.lastYieldInjectionDate !== undefined) state.lastYieldInjectionDate = data.lastYieldInjectionDate;
      if (data.creditCardClosingDay !== undefined) state.creditCardClosingDay = data.creditCardClosingDay;
      if (data.theme !== undefined) state.theme = data.theme;
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
    SET_CATEGORY_BUDGETS(state, budgets) {
      state.categoryBudgets = { ...state.categoryBudgets, ...budgets };
    },
    ADD_TRANSACTION(state, transaction) {
      state.transactions.unshift(transaction);
    },
    ADD_TRANSACTIONS_BULK(state, transactionsArray) {
      // Unshift multiple items logically by creating a new array 
      state.transactions = [...transactionsArray.reverse(), ...state.transactions];
    },
    REMOVE_TRANSACTION(state, id) {
      state.transactions = state.transactions.filter(t => t.id !== id);
    },
    ADD_INVESTMENT(state, investment) {
      state.investments.unshift(investment);
    },
    REMOVE_INVESTMENT(state, id) {
      state.investments = state.investments.filter(i => i.id !== id);
    },
    UPDATE_INVESTMENT_PRICE(state, { id, price }) {
      const index = state.investments.findIndex(i => i.id === id);
      if (index !== -1) {
        state.investments[index].currentPrice = price;
      }
    },
    UPDATE_API_KEYS(state, keys) {
      state.apiKeys = { ...state.apiKeys, ...keys };
    },
    SET_YIELD_INJECTION_DATE(state, dateStr) {
      state.lastYieldInjectionDate = dateStr;
    },
    SET_CC_CLOSING_DAY(state, day) {
      state.creditCardClosingDay = day ? Number(day) : null;
    },
    SET_THEME(state, theme) {
      state.theme = theme;
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
    updateCategoryBudgets({ commit, dispatch }, budgets) {
      commit('SET_CATEGORY_BUDGETS', budgets);
      dispatch('saveData');
    },
    addTransaction({ commit, dispatch }, transaction) {
      const newTransaction = {
        ...transaction,
        amount: Number(transaction.amount),
        id: crypto.randomUUID(),
        date: transaction.customDate || new Date().toISOString(),
      };
      commit('ADD_TRANSACTION', newTransaction);
      dispatch('saveData');
    },
    importTransactionsBulk({ commit, dispatch }, transactionsArray) {
      if (!Array.isArray(transactionsArray) || transactionsArray.length === 0) return;
      
      const newTxs = transactionsArray.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        id: crypto.randomUUID(),
        date: tx.customDate || new Date().toISOString(),
      }));
      commit('ADD_TRANSACTIONS_BULK', newTxs);
      dispatch('saveData');
    },
    removeTransaction({ commit, dispatch }, id) {
      commit('REMOVE_TRANSACTION', id);
      dispatch('saveData');
    },
    addInvestment({ commit, dispatch }, investment) {
      const newInvest = {
        ...investment,
        id: crypto.randomUUID(),
        date: new Date().toISOString()
      };
      commit('ADD_INVESTMENT', newInvest);
      dispatch('saveData');
    },
    removeInvestment({ commit, dispatch }, id) {
      commit('REMOVE_INVESTMENT', id);
      dispatch('saveData');
    },
    updateInvestmentPrice({ commit, dispatch }, payload) {
      commit('UPDATE_INVESTMENT_PRICE', payload);
      dispatch('saveData');
    },
    updateApiKeys({ commit, dispatch }, keys) {
      commit('UPDATE_API_KEYS', keys);
      dispatch('saveData');
    },
    updateYieldInjectionDate({ commit, dispatch }, dateStr) {
      commit('SET_YIELD_INJECTION_DATE', dateStr);
      dispatch('saveData');
    },
    updateCcClosingDay({ commit, dispatch }, day) {
      commit('SET_CC_CLOSING_DAY', day);
      dispatch('saveData');
    },
    toggleTheme({ commit, dispatch, state }) {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      commit('SET_THEME', newTheme);
      dispatch('saveData');
    }
  }
};
