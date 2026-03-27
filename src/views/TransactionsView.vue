<template>
  <div class="transactions">
    <v-row class="mb-4 d-flex align-center justify-space-between">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold mb-1 d-flex align-center">
          Extrato 
          <v-chip v-if="filters.startDate || filters.endDate" color="primary" class="ml-4" variant="tonal">Filtro Personalizado de Datas</v-chip>
          <span v-else class="text-h5 text-grey ml-3 font-weight-regular">{{ selectedMonthName }} / {{ selectedYear }}</span>
        </h2>
        <p class="text-grey">Busque e analise detalhadamente o seu histórico.</p>
      </v-col>
    </v-row>

    <!-- Barra de Filtros -->
    <v-card class="rounded-xl mb-6 pa-4 elevation-1 bg-surface">
      <v-row dense>
        <v-col cols="12" sm="6" md="3">
          <v-select
             v-model="filters.type"
             :items="typeOptions"
             label="Tipo"
             variant="outlined"
             density="compact"
             color="primary"
             hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
             v-model="filters.category"
             :items="categoryOptions"
             label="Categoria"
             variant="outlined"
             density="compact"
             color="primary"
             hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
             v-model="filters.startDate"
             type="date"
             label="A partir de"
             variant="outlined"
             density="compact"
             color="primary"
             hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
             v-model="filters.endDate"
             type="date"
             label="Até"
             variant="outlined"
             density="compact"
             color="primary"
             hide-details
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="rounded-xl elevation-1">
      <v-card-text class="pa-0">
        <v-list lines="two" bg-color="transparent" class="py-0">
          <v-list-item v-if="filteredTransactions.length === 0" class="py-8 text-center text-grey">
            Nenhuma movimentação encontrada para o filtro selecionado.
          </v-list-item>

          <template v-for="(item, index) in filteredTransactions" :key="item.id">
            <v-hover v-slot="{ isHovering, props }">
              <v-list-item 
                class="px-5 py-3" 
                :class="{ 'bg-background': isHovering }" 
                v-bind="props"
              >
                <template v-slot:prepend>
                   <v-avatar :color="getIconColor(item.type) + '-lighten-4'">
                    <v-icon :color="getIconColor(item.type)">{{ getIcon(item.type) }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold text-subtitle-1">{{ item.description }}</v-list-item-title>
                <v-list-item-subtitle class="text-grey">{{ formatDate(item.date) }} • {{ getTypeName(item.type) }} <span v-if="item.category">• {{ item.category }}</span></v-list-item-subtitle>
                
                <template v-slot:append>
                  <div class="d-flex align-center">
                    <div class="font-weight-bold mr-4" :class="item.type === 'income' ? 'text-success' : 'text-error'">
                      {{ item.type === 'income' ? '+' : '-' }} R$ {{ formatMoney(item.amount) }}
                    </div>
                    <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="confirmDelete(item.id)"></v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-hover>
            <v-divider v-if="index < filteredTransactions.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card-text>
    </v-card>

    <TransactionFormDialog />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import TransactionFormDialog from '../components/TransactionFormDialog.vue';

const store = useStore();
const allTransactions = computed(() => store.state.finance.transactions || []);

const selectedMonth = computed(() => store.state.finance.selectedMonth);
const selectedYear = computed(() => store.state.finance.selectedYear);

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const selectedMonthName = computed(() => months[selectedMonth.value - 1]);

const filters = ref({
  type: 'Todos',
  category: 'Todas',
  startDate: '',
  endDate: ''
});

const typeOptions = ['Todos', 'Entradas', 'Saídas', 'Cartão de Crédito', 'Débito / Pix'];
const incomeCategories = ['Salário', 'Rendimentos', 'Vendas', 'Outros Ganhos'];
const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Serviços', 'Outros'];

const categoryOptions = computed(() => {
  if (filters.value.type === 'Entradas') return ['Todas', ...incomeCategories];
  if (filters.value.type === 'Saídas' || filters.value.type === 'Cartão de Crédito' || filters.value.type === 'Débito / Pix') return ['Todas', ...expenseCategories];
  return ['Todas', ...incomeCategories, ...expenseCategories];
});

watchEffect(() => {
  // Reset category if not available in new type dropdown
  if (!categoryOptions.value.includes(filters.value.category)) {
    filters.value.category = 'Todas';
  }
});

const filteredTransactions = computed(() => {
  return allTransactions.value.filter(t => {
    // Type Filter
    if (filters.value.type === 'Entradas' && t.type !== 'income') return false;
    if (filters.value.type === 'Saídas' && t.type === 'income') return false;
    if (filters.value.type === 'Cartão de Crédito' && t.type !== 'credit') return false;
    if (filters.value.type === 'Débito / Pix' && t.type !== 'debit') return false;

    // Category Filter
    if (filters.value.category !== 'Todas' && t.category !== filters.value.category) return false;

    // Dates Filter
    const tDate = new Date(t.date);
    if (filters.value.startDate || filters.value.endDate) {
      if (filters.value.startDate) {
        const start = new Date(filters.value.startDate + 'T00:00:00');
        if (tDate < start) return false;
      }
      if (filters.value.endDate) {
        const end = new Date(filters.value.endDate + 'T23:59:59');
        if (tDate > end) return false;
      }
    } else {
      // Default to Global Month/Year if no dates chosen
      const rMonth = selectedMonth.value;
      const rYear = selectedYear.value;
      if (tDate.getMonth() + 1 !== rMonth || tDate.getFullYear() !== rYear) {
        return false;
      }
    }

    return true;
  });
});

function confirmDelete(id) {
  if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
    store.dispatch('finance/removeTransaction', id);
  }
}

// Utils
function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  return dayjs(dateStr).format('DD/MM/YYYY HH:mm');
}

function getTypeName(type) {
  if (type === 'income') return 'Ganho / Renda';
  if (type === 'credit') return 'Cartão de Crédito';
  if (type === 'debit') return 'Débito / Pix';
  return 'Outro';
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
