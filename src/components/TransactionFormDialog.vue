<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" elevation="4" icon="mdi-plus" size="x-large" v-bind="props" class="floating-btn"></v-btn>
    </template>
    
    <v-card class="rounded-xl">
      <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">Nova Movimentação</v-card-title>
      <v-card-text class="pa-5 pt-2">
        <v-form ref="form" v-model="valid">
          <v-select
            v-model="transaction.type"
            :items="types"
            label="Tipo de Transação"
            variant="outlined"
            density="comfortable"
            color="primary"
            item-title="title"
            item-value="value"
            class="mb-2"
            required
            @update:modelValue="transaction.category = ''"
          >
            <template v-slot:selection="{ item }">
              <v-icon :color="item.raw.color" class="mr-2">{{ item.raw.icon }}</v-icon>
              {{ item.title }}
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :title="item.title">
                <template v-slot:prepend>
                  <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-select
            v-model="transaction.category"
            :items="currentCategories"
            label="Categoria"
            variant="outlined"
            density="comfortable"
            color="primary"
            class="mb-2"
            :rules="[v => !!v || 'Categoria é obrigatória']"
            required
          ></v-select>

          <v-text-field
            v-model="transaction.amount"
            label="Valor Total (R$)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="primary"
            prefix="R$"
            class="mb-2"
            :rules="[v => !!v || 'Valor é obrigatório', v => v > 0 || 'Valor deve ser maior que zero']"
            required
          ></v-text-field>

          <v-text-field
            v-if="transaction.type === 'credit'"
            v-model.number="transaction.installments"
            label="Número de Parcelas"
            type="number"
            variant="outlined"
            density="comfortable"
            color="primary"
            class="mb-2"
            min="1"
            hint="Dividirá o valor total nos próximos meses"
            persistent-hint
          ></v-text-field>

          <v-text-field
            v-model="transaction.description"
            label="Descrição (Ex: Condomínio, Salário)"
            variant="outlined"
            density="comfortable"
            color="primary"
            :rules="[v => !!v || 'Descrição é obrigatória']"
            required
            @keyup.enter="save"
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" elevation="0" class="px-6 rounded-lg font-weight-bold" @click="save" :disabled="!valid">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const dialog = ref(false);
const form = ref(null);
const valid = ref(false);
const store = useStore();

const types = [
  { title: 'Ganho / Renda', value: 'income', icon: 'mdi-arrow-up-circle', color: 'success' },
  { title: 'Gasto - Cartão de Crédito', value: 'credit', icon: 'mdi-credit-card-outline', color: 'error' },
  { title: 'Gasto - Débito / Pix', value: 'debit', icon: 'mdi-bank-transfer', color: 'warning' }
];

const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Serviços', 'Outros'];
const incomeCategories = ['Salário', 'Rendimentos', 'Vendas', 'Presente', 'Outros'];

const currentCategories = computed(() => {
  return transaction.value.type === 'income' ? incomeCategories : expenseCategories;
});

const transaction = ref({
  type: 'debit',
  category: '',
  amount: '',
  installments: 1,
  description: ''
});

function close() {
  dialog.value = false;
  setTimeout(() => {
    transaction.value = {
      type: 'debit',
      category: '',
      amount: '',
      installments: 1,
      description: ''
    };
    if (form.value) {
      form.value.resetValidation();
    }
  }, 200);
}

function save() {
  if (valid.value) {
    if (transaction.value.type === 'credit' && transaction.value.installments > 1) {
      const installments = parseInt(transaction.value.installments);
      const totalAmount = Number(transaction.value.amount);
      const installmentAmount = (totalAmount / installments).toFixed(2);
      
      const baseDate = new Date();
      
      for (let i = 1; i <= installments; i++) {
        const targetDate = new Date(baseDate);
        targetDate.setMonth(baseDate.getMonth() + (i - 1));
        
        const newTx = {
          type: 'credit',
          category: transaction.value.category,
          amount: Number(installmentAmount),
          description: `${transaction.value.description} (${i}/${installments})`,
          customDate: targetDate.toISOString()
        };
        
        store.dispatch('finance/addTransaction', newTx);
      }
    } else {
      store.dispatch('finance/addTransaction', transaction.value);
    }
    close();
  }
}
</script>

<style scoped>
.floating-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 4;
}
</style>
