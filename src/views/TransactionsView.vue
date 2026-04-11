<template>
  <div class="transactions">
    <v-row class="mb-4 d-flex align-center justify-space-between">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold mb-1 d-flex flex-wrap align-center">
          <span>Extrato</span>
          <BankImportDialog class="ml-sm-4 mt-2 mt-sm-0" />
          <v-chip v-if="filters.startDate || filters.endDate" color="primary" class="ml-sm-4 mt-2 mt-sm-0" variant="tonal">Filtro de Datas</v-chip>
          <span v-else class="text-h5 text-grey ml-sm-3 font-weight-regular mt-2 mt-sm-0 block">{{ selectedMonthName }} / {{ selectedYear }}</span>
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
            <v-col cols="6" sm="3">
              <DatePicker v-model="filters.startDate" label="Data Inicial" />
            </v-col>
            <v-col cols="6" sm="3">
              <DatePicker v-model="filters.endDate" label="Data Final" />
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

    <!-- Modal de Confirmação de Exclusão -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="rounded-xl pa-2 bg-surface">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
           <v-icon color="error" class="mr-2">mdi-alert</v-icon> Excluir Movimentação
        </v-card-title>
        <v-card-text class="text-body-1">
          Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" class="px-4" @click="executeDelete">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import TransactionFormDialog from '../components/TransactionFormDialog.vue';
import BankImportDialog from '../components/BankImportDialog.vue';
import DatePicker from '../components/DatePicker.vue';

const store = useStore();
const allTransactions = computed(() => store.state.finance.transactions || []);

const selectedMonth = computed(() => store.state.finance.selectedMonth);
const selectedYear = computed(() => store.state.finance.selectedYear);

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const selectedMonthName = computed(() => months[selectedMonth.value - 1]);

const initialStartDate = dayjs()
  .year(store.state.finance.selectedYear)
  .month(store.state.finance.selectedMonth - 1)
  .startOf('month')
  .format('YYYY-MM-DD');

const initialEndDate = dayjs()
  .year(store.state.finance.selectedYear)
  .month(store.state.finance.selectedMonth - 1)
  .endOf('month')
  .format('YYYY-MM-DD');

const filters = ref({
  type: 'Todos',
  category: 'Todas',
  startDate: initialStartDate,
  endDate: initialEndDate
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

const deleteDialog = ref(false);
const itemToDelete = ref(null);

function confirmDelete(id) {
  itemToDelete.value = id;
  deleteDialog.value = true;
}

function executeDelete() {
  if (itemToDelete.value) {
    store.dispatch('finance/removeTransaction', itemToDelete.value);
    deleteDialog.value = false;
    itemToDelete.value = null;
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
