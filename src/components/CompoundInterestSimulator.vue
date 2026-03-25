<template>
  <v-card class="rounded-xl elevation-1 mt-6">
    <v-card-title class="font-weight-bold pa-5 pb-0 d-flex align-center text-primary">
      <v-icon color="primary" class="mr-2">mdi-chart-areaspline</v-icon> Simulador de Juros Compostos (100% CDI)
    </v-card-title>
    <v-card-text class="pa-5">
      <v-row>
        <!-- Form Inputs -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model.number="initialAmount"
            label="Valor Inicial (R$)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="primary"
            prefix="R$"
            class="mb-2"
          ></v-text-field>
          
          <v-text-field
            v-model.number="monthlyContribution"
            label="Aporte Mensal (R$)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="primary"
            prefix="R$"
            class="mb-2"
          ></v-text-field>
          
          <v-text-field
            v-model.number="periodMonths"
            label="Período (Meses)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="primary"
            class="mb-2"
          ></v-text-field>
          
          <div class="bg-primary-lighten-5 pa-4 rounded-lg mt-2">
            <div class="text-caption text-grey-darken-1 mb-1">Rendimento no período:</div>
            <div class="text-h5 font-weight-bold text-primary">R$ {{ formatMoney(projectedTotal) }}</div>
            <div class="text-caption text-success mt-1">
              + R$ {{ formatMoney(projectedTotal - totalInvestedRaw) }} em juros
            </div>
            <div class="text-caption text-grey mt-2">
              Baseado na taxa ajustável de {{ currentCdiRate }}% a.a.
            </div>
          </div>
        </v-col>
        
        <!-- Chart -->
        <v-col cols="12" md="8">
          <apexchart type="area" height="350" :options="chartOptions" :series="series"></apexchart>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const currentCdiRate = computed(() => store.state.finance.currentCdiRate || 10.40);

const initialAmount = ref(1000);
const monthlyContribution = ref(500);
const periodMonths = ref(60);

const projectionData = computed(() => {
  const months = periodMonths.value || 0;
  const initial = initialAmount.value || 0;
  const monthly = monthlyContribution.value || 0;
  
  const cdiAnnualRate = Number(currentCdiRate.value) / 100;
  const dailyCdiFactor = Math.pow(1 + cdiAnnualRate, 1 / 252);
  const monthlyFactor = Math.pow(dailyCdiFactor, 21);
  const monthlyRate = monthlyFactor - 1;

  let currentBalance = initial;
  let currentInvested = initial;
  
  const categories = ['Hoje'];
  const balanceData = [initial];
  const investedData = [initial];
  
  for (let i = 1; i <= months; i++) {
    currentBalance = (currentBalance + monthly) * (1 + monthlyRate);
    currentInvested = currentInvested + monthly;
    
    const shouldPush = (months <= 24) || (months > 24 && months <= 120 && i % 12 === 0) || (months > 120 && i % 24 === 0) || i === months;
    
    if (shouldPush) {
      if (i % 12 === 0) {
        categories.push(`Ano ${i/12}`);
      } else {
        categories.push(`Mês ${i}`);
      }
      balanceData.push(currentBalance);
      investedData.push(currentInvested);
    }
  }
  
  return { categories, balanceData, investedData, finalBalance: currentBalance, finalInvested: currentInvested };
});

const projectedTotal = computed(() => projectionData.value.finalBalance);
const totalInvestedRaw = computed(() => projectionData.value.finalInvested);

const series = computed(() => [
  {
    name: 'Total Acumulado (+ Juros)',
    data: projectionData.value.balanceData
  },
  {
    name: 'Valor Investido',
    data: projectionData.value.investedData
  }
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false }
  },
  colors: ['#2196F3', '#9E9E9E'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  xaxis: {
    categories: projectionData.value.categories,
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        if (val >= 1000000) return "R$ " + (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return "R$ " + (val / 1000).toFixed(0) + "k";
        return "R$ " + val.toFixed(0);
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return "R$ " + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }
  }
}));

function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
.bg-primary-lighten-5 {
  background-color: #E3F2FD !important;
}
</style>
