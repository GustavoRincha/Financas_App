<template>
  <v-card class="rounded-xl elevation-1 h-100">
    <v-card-title class="font-weight-bold pa-5 pb-0">
      Despesas por Categoria
    </v-card-title>
    <v-card-text class="pa-5">
      <div v-if="hasData">
        <apexchart type="donut" height="300" :options="chartOptions" :series="series"></apexchart>
      </div>
      <div v-else class="text-center text-grey py-10">
        <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-chart-pie</v-icon>
        <p>Nenhuma despesa registrada neste período.</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const filteredExpenses = computed(() => {
  return store.getters['finance/filteredTransactions'].filter(
    t => t.type === 'debit' || t.type === 'credit'
  );
});

const chartData = computed(() => {
  const categorySums = {};
  filteredExpenses.value.forEach(t => {
    const cat = t.category || 'Outros';
    categorySums[cat] = (categorySums[cat] || 0) + Number(t.amount);
  });
  
  const sorted = Object.entries(categorySums).sort((a, b) => b[1] - a[1]);
  
  return {
    labels: sorted.map(i => i[0]),
    series: sorted.map(i => i[1])
  };
});

const hasData = computed(() => chartData.value.series.length > 0);
const series = computed(() => chartData.value.series);

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Inter, sans-serif'
  },
  labels: chartData.value.labels,
  colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'],
  plotOptions: {
    pie: {
      donut: {
        size: '65%'
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    position: 'bottom'
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
