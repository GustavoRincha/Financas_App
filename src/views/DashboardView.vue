<template>
  <div class="dashboard">
    <v-row class="mb-2 d-flex align-center justify-space-between">
      <v-col cols="12" sm="8">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3 mb-1">Olá, Gustavo!</h2>
        <p class="text-grey mb-4">Aqui está o resumo das suas finanças de {{ selectedMonthName }} de {{ selectedYear }}.</p>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right mt-2 mt-sm-0">
        <v-btn variant="tonal" color="primary" rounded="lg" prepend-icon="mdi-calendar" @click="filterDialog = true">
          {{ selectedMonthName }} / {{ selectedYear }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <!-- Saldo Atual -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="rounded-xl pa-2" elevation="2" color="primary">
          <v-card-item>
            <template v-slot:subtitle>
              <span class="text-white text-opacity-80">Saldo Disponível</span>
            </template>
            <template v-slot:title>
              <div class="text-h4 font-weight-bold mt-1">R$ {{ formatMoney(balance) }}</div>
            </template>
          </v-card-item>
          <v-card-text class="pt-0">
            <v-icon icon="mdi-wallet" class="mr-1" color="white" opacity="0.8"></v-icon> 
            <span class="text-caption text-white text-opacity-80">Renda restando</span>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Receitas -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="rounded-xl pa-2" elevation="1">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="success-lighten-4" class="mr-3">
                <v-icon color="success" icon="mdi-arrow-up-circle"></v-icon>
              </v-avatar>
            </template>
            <template v-slot:subtitle>
              <span class="text-grey-darken-1 font-weight-medium">Receitas Totais</span>
            </template>
            <template v-slot:title>
              <div class="text-h5 font-weight-bold mt-1 text-grey-darken-3">R$ {{ formatMoney(totalIncomeRender) }}</div>
            </template>
          </v-card-item>
        </v-card>
      </v-col>

      <!-- Despesas de Crédito -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="rounded-xl pa-2" elevation="1">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="error-lighten-4" class="mr-3">
                <v-icon color="error" icon="mdi-credit-card-outline"></v-icon>
              </v-avatar>
            </template>
            <template v-slot:subtitle>
              <span class="text-grey-darken-1 font-weight-medium">Fatura (Crédito)</span>
            </template>
            <template v-slot:title>
              <div class="text-h5 font-weight-bold mt-1 text-grey-darken-3">R$ {{ formatMoney(totalCredit) }}</div>
            </template>
          </v-card-item>
        </v-card>
      </v-col>

      <!-- Despesas de Débito/Pix -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="rounded-xl pa-2" elevation="1">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="warning-lighten-4" class="mr-3">
                <v-icon color="warning-darken-2" icon="mdi-bank-transfer"></v-icon>
              </v-avatar>
            </template>
            <template v-slot:subtitle>
              <span class="text-grey-darken-1 font-weight-medium">Débito e Pix</span>
            </template>
            <template v-slot:title>
              <div class="text-h5 font-weight-bold mt-1 text-grey-darken-3">R$ {{ formatMoney(totalDebit) }}</div>
            </template>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos Analíticos -->
    <v-row class="mt-4">
      <v-col cols="12" md="5">
        <ExpenseCategoryChart />
      </v-col>
      <v-col cols="12" md="7">
        <IncomeExpenseBarChart />
      </v-col>
    </v-row>

    <!-- Meta de Economia -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="rounded-xl" elevation="1">
          <v-card-title class="font-weight-bold pa-5 pb-2 d-flex align-center">
            <v-icon color="secondary" class="mr-2">mdi-target</v-icon>
            Meta de Guarda (Mensal)
          </v-card-title>
          <v-card-text class="pa-5 pt-0">
            <div class="d-flex align-center justify-space-between mb-2 mt-4">
              <span class="text-grey-darken-1">Progresso para guardar R$ {{ formatMoney(savingsGoal) }}</span>
              <span class="font-weight-bold text-secondary">{{ savingsPercentage }}%</span>
            </div>
            <v-progress-linear 
              :model-value="savingsPercentage" 
              color="secondary" 
              height="12" 
              rounded="pill"
            ></v-progress-linear>
            <div class="mt-4 d-flex">
              <v-btn variant="tonal" color="secondary" size="small" class="rounded-lg" @click="editGoalDialog = true">Definir Meta</v-btn>
              <v-btn variant="tonal" color="primary" size="small" class="rounded-lg ml-2" @click="editIncomeDialog = true">Definir Renda Base</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Últimas Transações Mini -->
      <v-col cols="12" md="6">
         <v-card class="rounded-xl" elevation="1" height="100%">
          <v-card-title class="font-weight-bold pa-5 pb-2 d-flex justify-space-between align-center">
            <span>Movimentações do Mês</span>
            <v-btn variant="text" color="primary" size="small" to="/transactions">Ver Todas</v-btn>
          </v-card-title>
          <v-list lines="two" class="pa-2">
            <v-list-item v-if="recentTransactions.length === 0">
              <div class="text-center py-4 text-grey">Nenhuma transação no período.</div>
            </v-list-item>
            <template v-for="(item, index) in recentTransactions" :key="item.id">
              <v-list-item class="rounded-lg mb-1">
                <template v-slot:prepend>
                  <v-avatar :color="getIconColor(item.type) + '-lighten-4'">
                    <v-icon :color="getIconColor(item.type)">{{ getIcon(item.type) }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ item.description }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(item.date) }} <span v-if="item.category">• {{ item.category }}</span></v-list-item-subtitle>
                <template v-slot:append>
                  <div class="font-weight-bold" :class="item.type === 'income' ? 'text-success' : 'text-error'">
                    {{ item.type === 'income' ? '+' : '-' }} R$ {{ formatMoney(item.amount) }}
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="index < recentTransactions.length - 1" inset></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Filtro Data -->
    <v-dialog v-model="filterDialog" max-width="400px">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold pa-5 pb-0">Filtrar por Período</v-card-title>
        <v-card-text class="pa-5">
           <v-select
             v-model="tempMonth"
             :items="months"
             label="Mês"
             variant="outlined"
             color="primary"
             density="comfortable"
             class="mb-2"
           ></v-select>
           <v-text-field
             v-model="tempYear"
             label="Ano"
             type="number"
             variant="outlined"
             color="primary"
             density="comfortable"
           ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="filterDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" class="rounded-lg px-4" @click="applyFilter">Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Meta -->
    <v-dialog v-model="editGoalDialog" max-width="400px">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold pa-5 pb-0">Definir Meta de Economia</v-card-title>
        <v-card-text class="pa-5">
           <v-text-field
            v-model="tempGoal"
            label="Valor a guardar (R$)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="secondary"
            prefix="R$"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="editGoalDialog = false">Cancelar</v-btn>
          <v-btn color="secondary" variant="flat" class="rounded-lg px-4" @click="saveGoal">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Renda Base -->
    <v-dialog v-model="editIncomeDialog" max-width="400px">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold pa-5 pb-0">Definir Renda Base Mensal</v-card-title>
        <v-card-text class="pa-5">
           <v-text-field
            v-model="tempIncome"
            label="Renda Fixa (R$)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="primary"
            prefix="R$"
          ></v-text-field>
          <p class="text-caption text-grey mt-1">Essa renda será adicionada aos ganhos manuais inseridos (se houver).</p>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="editIncomeDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" class="rounded-lg px-4" @click="saveIncome">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <TransactionFormDialog />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watchEffect } from 'vue';
import { useStore } from 'vuex';
import TransactionFormDialog from '../components/TransactionFormDialog.vue';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart.vue';
import IncomeExpenseBarChart from '../components/IncomeExpenseBarChart.vue';
import moment from 'moment';

const store = useStore();

const balance = computed(() => store.getters['finance/balance']);
const totalCredit = computed(() => store.getters['finance/totalCredit']);
const totalDebit = computed(() => store.getters['finance/totalDebit']);
const savingsGoal = computed(() => store.state.finance.savingsGoal);
const income = computed(() => store.state.finance.income);
const allTransactions = computed(() => store.getters['finance/filteredTransactions']);

const selectedMonth = computed(() => store.state.finance.selectedMonth);
const selectedYear = computed(() => store.state.finance.selectedYear);

const months = [
  { value: 1, title: 'Janeiro' },
  { value: 2, title: 'Fevereiro' },
  { value: 3, title: 'Março' },
  { value: 4, title: 'Abril' },
  { value: 5, title: 'Maio' },
  { value: 6, title: 'Junho' },
  { value: 7, title: 'Julho' },
  { value: 8, title: 'Agosto' },
  { value: 9, title: 'Setembro' },
  { value: 10, title: 'Outubro' },
  { value: 11, title: 'Novembro' },
  { value: 12, title: 'Dezembro' }
];

const selectedMonthName = computed(() => {
  const m = months.find(m => m.value === selectedMonth.value);
  return m ? m.title : '';
});

const filterDialog = ref(false);
const tempMonth = ref(selectedMonth.value);
const tempYear = ref(selectedYear.value);

watchEffect(() => {
  if (filterDialog.value) {
    tempMonth.value = selectedMonth.value;
    tempYear.value = selectedYear.value;
  }
});

function applyFilter() {
  store.dispatch('finance/updateSelectedMonth', tempMonth.value);
  store.dispatch('finance/updateSelectedYear', tempYear.value);
  filterDialog.value = false;
}

const totalIncomeRender = computed(() => {
  const manualIncome = allTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  return income.value + manualIncome;
});

const recentTransactions = computed(() => {
  return allTransactions.value.slice(0, 4);
});

// Meta logic
const savingsPercentage = computed(() => {
  if (savingsGoal.value === 0) return 0;
  // Percentage calculation based on balance compared to goal
  const perc = (balance.value / savingsGoal.value) * 100;
  return perc > 100 ? 100 : Math.round(perc);
});


const editGoalDialog = ref(false);
const tempGoal = ref('');

const editIncomeDialog = ref(false);
const tempIncome = ref('');

onMounted(() => {
  tempGoal.value = savingsGoal.value;
  tempIncome.value = income.value;
});

function saveGoal() {
  store.dispatch('finance/updateSavingsGoal', tempGoal.value);
  editGoalDialog.value = false;
}

function saveIncome() {
  store.dispatch('finance/updateIncome', tempIncome.value);
  editIncomeDialog.value = false;
}

// Utils
function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  return moment(dateStr).format('DD/MM/YYYY HH:mm');
}

function getIcon(type) {
  if (type === 'income') return 'mdi-arrow-up-circle';
  if (type === 'credit') return 'mdi-credit-card-outline';
  if (type === 'debit') return 'mdi-bank-transfer';
  return 'mdi-help-circle';
}

function getIconColor(type) {
  if (type === 'income') return 'success';
  if (type === 'credit') return 'error';
  if (type === 'debit') return 'warning-darken-2';
  return 'grey';
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
</style>
