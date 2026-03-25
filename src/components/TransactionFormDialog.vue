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

          <v-text-field
            v-model="transaction.amount"
            label="Valor (R$)"
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
import { ref } from 'vue';
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

const transaction = ref({
  type: 'debit',
  amount: '',
  description: ''
});

function close() {
  dialog.value = false;
  setTimeout(() => {
    transaction.value = {
      type: 'debit',
      amount: '',
      description: ''
    };
    if (form.value) {
      form.value.resetValidation();
    }
  }, 200);
}

function save() {
  if (valid.value) {
    store.dispatch('finance/addTransaction', transaction.value);
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
