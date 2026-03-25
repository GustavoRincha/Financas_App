<template>
  <v-card class="rounded-xl elevation-1 h-100">
    <v-card-title class="font-weight-bold pa-5 pb-0">
      Receitas vs Despesas (Últimos 6 Meses)
    </v-card-title>
    <v-card-text class="pa-5">
      <apexchart type="bar" height="300" :options="chartOptions" :series="series"></apexchart>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const allTransactions = computed(() => store.state.finance.transactions || []);
const fixedIncome = computed(() => store.state.finance.income || 0);

const chartData = computed(() => {
  const monthsData = [];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    let targetMonth = d.getMonth() + 1;
    let targetYear = d.getFullYear();
    
    const thisMonthTransactions = allTransactions.value.filter(t => {
      const td = new Date(t.date);
      return (td.getMonth() + 1) === targetMonth && td.getFullYear() === targetYear;
    });
    
    const incomes = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) + Number(fixedIncome.value);
      
    const expenses = thisMonthTransactions
      .filter(t => t.type === 'credit' || t.type === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    monthsData.push({
      label: `${monthNames[d.getMonth()]}`,
      income: incomes,
      expense: expenses
    });
  }
  
  return monthsData;
});

const series = computed(() => [
  {
    name: 'Receitas',
    data: chartData.value.map(d => d.income)
  },
  {
    name: 'Despesas',
    data: chartData.value.map(d => d.expense)
  }
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false }
  },
  colors: ['#4CAF50', '#F44336'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: chartData.value.map(d => d.label),
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        if (val >= 1000) {
          return "R$ " + (val / 1000).toFixed(1) + "k";
        }
        return "R$ " + val;
      }
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return "R$ " + val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      }
    }
  }
}));
</script>
