<template>
  <v-card class="rounded-xl elevation-1 mt-6 bg-surface">
    <v-card-title class="font-weight-bold pa-5 pb-0 d-flex align-center text-primary">
      <v-icon color="primary" class="mr-2">mdi-chart-areaspline</v-icon> Calculadora de Juros Compostos
    </v-card-title>
    <v-card-text class="pa-5">
      <v-row>
        <!-- Form Inputs -->
        <v-col cols="12" md="5">
          <v-row dense>
            <v-col cols="12" sm="6" md="12">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-2 text-high-emphasis">Valor Inicial (R$)</span>
                <v-tooltip location="top" text="Quanto dinheiro você já tem para começar a investir hoje.">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="small" color="grey" class="ml-1 cursor-pointer">mdi-information</v-icon>
                  </template>
                </v-tooltip>
              </div>
              <v-text-field
                v-model.number="initialAmount"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                prefix="R$"
                class="mb-3"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" md="12">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-2 text-high-emphasis">Aporte Mensal (R$)</span>
                <v-tooltip location="top" text="Valor que você planeja guardar todos os meses consistentemente.">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="small" color="grey" class="ml-1 cursor-pointer">mdi-information</v-icon>
                  </template>
                </v-tooltip>
              </div>
              <v-text-field
                v-model.number="monthlyContribution"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                prefix="R$"
                class="mb-3"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-divider class="mb-3"></v-divider>
            </v-col>

            <v-col cols="7">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-2 text-high-emphasis">Taxa de Juros</span>
                <v-tooltip location="top" text="A rentabilidade esperada da sua aplicação. Exemplo: CDI atual rende próximo a 10% a.a.">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="small" color="grey" class="ml-1 cursor-pointer">mdi-information</v-icon>
                  </template>
                </v-tooltip>
              </div>
              <v-text-field
                v-model.number="interestRate"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                suffix="%"
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="5">
              <div class="mb-1"><span class="text-subtitle-2 text-high-emphasis">Período</span></div>
              <v-select
                v-model="rateType"
                :items="[{title: 'Ao Mês', value: 'monthly'}, {title: 'Ao Ano', value: 'annual'}]"
                variant="outlined"
                density="compact"
                hide-details
              ></v-select>
            </v-col>

            <v-col cols="7">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-2 text-high-emphasis">Duração do Investimento</span>
                <v-tooltip location="top" text="Por quanto tempo o seu dinheiro vai ficar rendendo.">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="small" color="grey" class="ml-1 cursor-pointer">mdi-information</v-icon>
                  </template>
                </v-tooltip>
              </div>
              <v-text-field
                v-model.number="periodAmount"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="5">
              <div class="mb-1"><span class="text-subtitle-2 text-transparent">-</span></div>
              <v-select
                v-model="periodType"
                :items="[{title: 'Meses', value: 'months'}, {title: 'Anos', value: 'years'}]"
                variant="outlined"
                density="compact"
                hide-details
              ></v-select>
            </v-col>
          </v-row>
          
          <div class="bg-background pa-4 rounded-lg mt-2 border">
            <div class="text-caption text-grey mb-1">Resultado Final Projetado:</div>
            <div class="text-h5 font-weight-bold text-primary">R$ {{ formatMoney(projectedTotal) }}</div>
            <div class="d-flex align-center justify-space-between mt-2">
              <div class="text-caption text-high-emphasis">
                Total Investido:<br><strong>R$ {{ formatMoney(totalInvestedRaw) }}</strong>
              </div>
              <div class="text-caption text-success text-right">
                Juros Acumulados:<br><strong>+ R$ {{ formatMoney(projectedTotal - totalInvestedRaw) }}</strong>
              </div>
            </div>
          </div>
        </v-col>
        
        <!-- Chart -->
        <v-col cols="12" md="7">
          <apexchart type="area" height="350" :options="chartOptions" :series="series"></apexchart>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from 'vuetify';

const store = useStore();
const theme = useTheme();

const initialAmount = ref(1000);
const monthlyContribution = ref(500);

const interestRate = ref(10.40);
const rateType = ref('annual');

const periodAmount = ref(5);
const periodType = ref('years');

const projectionData = computed(() => {
  const initial = typeof initialAmount.value === 'number' ? initialAmount.value : 0;
  const monthly = typeof monthlyContribution.value === 'number' ? monthlyContribution.value : 0;
  const rateVal = typeof interestRate.value === 'number' ? interestRate.value : 0;
  const pAmount = typeof periodAmount.value === 'number' ? periodAmount.value : 0;
  
  const totalMonths = periodType.value === 'years' ? pAmount * 12 : pAmount;
  
  // Convert custom rate to monthly rate multiplier
  let monthlyRate = 0;
  if (rateType.value === 'annual') {
    monthlyRate = Math.pow(1 + rateVal / 100, 1 / 12) - 1;
  } else {
    monthlyRate = rateVal / 100;
  }

  let currentBalance = initial;
  let currentInvested = initial;
  
  const categories = ['Hoje'];
  const balanceData = [initial];
  const investedData = [initial];
  
  for (let i = 1; i <= totalMonths; i++) {
    currentBalance = (currentBalance + monthly) * (1 + monthlyRate);
    currentInvested = currentInvested + monthly;
    
    // Sparsely sample points for graph depending on duration length
    const shouldPush = (totalMonths <= 24) || 
                       (totalMonths > 24 && totalMonths <= 120 && i % 12 === 0) || 
                       (totalMonths > 120 && i % 24 === 0) || 
                       i === totalMonths;
    
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

const isDarkTheme = computed(() => theme.global.name.value === 'dark');

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false },
    background: 'transparent'
  },
  theme: {
    mode: isDarkTheme.value ? 'dark' : 'light'
  },
  colors: ['#2196F3', isDarkTheme.value ? '#757575' : '#9E9E9E'],
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
        const n = Number(val);
        if (isNaN(n)) return val;
        if (n >= 1000000) return "R$ " + (n / 1000000).toFixed(2).replace('.', ',') + "M";
        if (n >= 1000) return "R$ " + (n / 1000).toFixed(2).replace('.', ',') + "k";
        return "R$ " + n.toFixed(2).replace('.', ',');
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
