import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import TransactionsView from '../views/TransactionsView.vue';
import InvestmentsView from '../views/InvestmentsView.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: TransactionsView
  },
  {
    path: '/investments',
    name: 'Investments',
    component: InvestmentsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
