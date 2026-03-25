<template>
  <div class="transactions">
    <v-row class="mb-4 d-flex align-center justify-space-between">
      <v-col cols="12" sm="8">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">Extrato Completo</h2>
        <p class="text-grey">Histórico detalhado de todas as suas entradas e saídas.</p>
      </v-col>
    </v-row>

    <v-card class="rounded-xl elevation-1">
      <v-card-text class="pa-0">
        <v-list lines="two" bg-color="transparent" class="py-0">
          <v-list-item v-if="transactions.length === 0" class="py-8 text-center text-grey">
            Nenhuma movimentação registrada. Use o botão + para adicionar.
          </v-list-item>

          <template v-for="(item, index) in transactions" :key="item.id">
            <v-hover v-slot="{ isHovering, props }">
              <v-list-item 
                class="px-5 py-3" 
                :class="{ 'bg-grey-lighten-4': isHovering }" 
                v-bind="props"
              >
                <template v-slot:prepend>
                   <v-avatar :color="getIconColor(item.type) + '-lighten-4'">
                    <v-icon :color="getIconColor(item.type)">{{ getIcon(item.type) }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold text-subtitle-1">{{ item.description }}</v-list-item-title>
                <v-list-item-subtitle class="text-grey">{{ formatDate(item.date) }} • {{ getTypeName(item.type) }}</v-list-item-subtitle>
                
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
            <v-divider v-if="index < transactions.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card-text>
    </v-card>

    <TransactionFormDialog />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import moment from 'moment';
import TransactionFormDialog from '../components/TransactionFormDialog.vue';

const store = useStore();
const transactions = computed(() => store.state.finance.transactions);

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
  return moment(dateStr).format('DD/MM/YYYY HH:mm');
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
