<template>
  <div class="investments">
    <v-row class="mb-4 d-flex align-center justify-space-between">
      <v-col cols="12" sm="5">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">Investimentos</h2>
        <p class="text-grey">Gerencie sua renda fixa e fundos imobiliários.</p>
      </v-col>
      <v-col cols="12" sm="7" class="text-sm-right mt-2 mt-sm-0 d-flex justify-sm-end align-center gap-2">
        <v-btn variant="tonal" color="info" @click="cdiDialog = true" class="mr-2" rounded="lg">
          Taxa CDI: {{ currentCdiRate }}% a.a.
        </v-btn>
        <v-btn color="primary" @click="dialog = true" prepend-icon="mdi-plus" rounded="lg" elevation="1">Novo</v-btn>
      </v-col>
    </v-row>

    <!-- Resumo -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
         <v-card class="rounded-xl pa-2" elevation="1" color="primary">
          <v-card-item>
            <template v-slot:subtitle>
              <span class="text-white text-opacity-80">Total Investido</span>
            </template>
            <template v-slot:title>
              <div class="text-h4 font-weight-bold mt-1">R$ {{ formatMoney(totalInvested) }}</div>
            </template>
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
         <v-card class="rounded-xl pa-2" elevation="1">
          <v-card-item>
            <template v-slot:subtitle>
              <span class="text-grey-darken-1 font-weight-medium">Rendimento Renda Fixa (Mês/21d)</span>
            </template>
            <template v-slot:title>
              <div class="text-h4 font-weight-bold mt-1 text-info">+ R$ {{ formatMoney(totalCdiYield) }}</div>
            </template>
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
         <v-card class="rounded-xl pa-2" elevation="1">
          <v-card-item>
            <template v-slot:subtitle>
              <span class="text-grey-darken-1 font-weight-medium">Rendimento FIIs (Estimado Mês)</span>
            </template>
            <template v-slot:title>
              <div class="text-h4 font-weight-bold mt-1 text-success">+ R$ {{ formatMoney(totalFiiYield) }}</div>
            </template>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Lista de CDI -->
      <v-col cols="12" md="6">
        <v-card class="rounded-xl elevation-1 h-100">
          <v-card-title class="font-weight-bold pa-5 pb-2 d-flex align-center text-info">
            <v-icon color="info" class="mr-2">mdi-chart-line</v-icon> Renda Fixa (CDI)
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list lines="three">
               <v-list-item v-if="cdiInvestments.length === 0" class="text-center text-grey py-6">Nenhum investimento registrado.</v-list-item>
               <template v-for="(item, index) in cdiInvestments" :key="item.id">
                 <v-list-item class="px-5 py-2">
                   <template v-slot:prepend>
                     <v-avatar color="info-lighten-4">
                       <v-icon color="info">mdi-cash-multiple</v-icon>
                     </v-avatar>
                   </template>
                   <v-list-item-title class="font-weight-bold text-subtitle-1">{{ item.name }}</v-list-item-title>
                   <v-list-item-subtitle>
                     {{ item.cdiPercentage }}% do CDI 
                     <br/> 
                     <span class="text-info font-weight-medium">Rende aprox. R$ {{ formatMoney(getCdiYield(item.amount, item.cdiPercentage)) }} por mês (21 dias úteis)</span>
                   </v-list-item-subtitle>
                   <template v-slot:append>
                     <div class="text-right d-flex align-center">
                       <div class="font-weight-bold text-subtitle-1 mr-3">R$ {{ formatMoney(item.amount) }}</div>
                       <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDelete(item.id)"></v-btn>
                     </div>
                   </template>
                 </v-list-item>
                 <v-divider v-if="index < cdiInvestments.length - 1" inset></v-divider>
               </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Lista de FIIs -->
      <v-col cols="12" md="6">
        <v-card class="rounded-xl elevation-1 h-100">
           <v-card-title class="font-weight-bold pa-5 pb-2 d-flex align-center text-warning-darken-2">
            <v-icon color="warning-darken-2" class="mr-2">mdi-domain</v-icon> Fundos Imobiliários (FIIs)
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list lines="three">
               <v-list-item v-if="fiiInvestments.length === 0" class="text-center text-grey py-6">Nenhum fundo registrado.</v-list-item>
               <template v-for="(item, index) in fiiInvestments" :key="item.id">
                 <v-list-item class="px-5 py-2">
                    <template v-slot:prepend>
                     <v-avatar color="warning-lighten-4">
                       <v-icon color="warning-darken-2">mdi-office-building-marker-outline</v-icon>
                     </v-avatar>
                   </template>
                   <v-list-item-title class="font-weight-bold text-subtitle-1">{{ item.name }}</v-list-item-title>
                   <v-list-item-subtitle>
                     {{ item.quotas }} cotas (R$ {{ formatMoney(item.pricePerQuota) }} cada)
                     <br/>
                     <span class="text-success font-weight-medium">Rende provável R$ {{ formatMoney(item.quotas * item.yieldPerQuota) }} por mês</span>
                   </v-list-item-subtitle>
                   <template v-slot:append>
                     <div class="text-right d-flex align-center">
                       <div class="font-weight-bold text-subtitle-1 mr-3">R$ {{ formatMoney(item.quotas * item.pricePerQuota) }}</div>
                       <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDelete(item.id)"></v-btn>
                     </div>
                   </template>
                 </v-list-item>
                 <v-divider v-if="index < fiiInvestments.length - 1" inset></v-divider>
               </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Simulador de Aportes/Juros -->
    <CompoundInterestSimulator />

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold pa-5 pb-2">Novo Investimento</v-card-title>
        <v-card-text class="pa-5 pt-0">
          <v-form ref="form" v-model="valid">
            <v-select
              v-model="newInvest.type"
              :items="[{title: 'Renda Fixa (CDI)', value: 'cdi'}, {title: 'Fundo Imobiliário (FII)', value: 'fii'}]"
              label="Tipo de Investimento"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="mb-2"
            ></v-select>

            <v-text-field
              v-model="newInvest.name"
              label="Nome (Ex: CDB Inter, MXRF11)"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="mb-2"
              :rules="[v => !!v || 'Campo obrigatório']"
            ></v-text-field>

            <!-- CDI Fields -->
            <template v-if="newInvest.type === 'cdi'">
              <v-text-field
                v-model="newInvest.amount"
                label="Valor Investido (R$)"
                type="number"
                variant="outlined"
                color="primary"
                density="comfortable"
                prefix="R$"
                class="mb-2"
                :rules="[v => !!v || 'Campo obrigatório', v => v > 0 || 'Inválido']"
              ></v-text-field>
              <v-text-field
                v-model="newInvest.cdiPercentage"
                label="Porcentagem do CDI (%)"
                type="number"
                variant="outlined"
                color="primary"
                density="comfortable"
                suffix="%"
                :rules="[v => !!v || 'Campo obrigatório', v => v > 0 || 'Inválido']"
              ></v-text-field>
            </template>

            <!-- FII Fields -->
            <template v-if="newInvest.type === 'fii'">
              <v-row class="mb-0">
                <v-col cols="6" class="pb-0">
                  <v-text-field
                    v-model="newInvest.quotas"
                    label="Quantidade de Cotas"
                    type="number"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    :rules="[v => !!v || 'Campo obrigatório', v => v > 0 || 'Inválido']"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" class="pb-0">
                  <v-text-field
                    v-model="newInvest.pricePerQuota"
                    label="Valor por Cota (R$)"
                    type="number"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    prefix="R$"
                    :rules="[v => !!v || 'Campo obrigatório', v => v > 0 || 'Inválido']"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-text-field
                v-model="newInvest.yieldPerQuota"
                label="Rendimento p/ Cota (R$/mês)"
                type="number"
                variant="outlined"
                color="primary"
                density="comfortable"
                prefix="R$"
                :rules="[v => !!v || 'Campo obrigatório']"
              ></v-text-field>
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" class="px-6 font-weight-bold" @click="saveInvestment" :disabled="!valid">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog CDI Config -->
    <v-dialog v-model="cdiDialog" max-width="400px">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold pa-5 pb-0">Atualizar Taxa CDI</v-card-title>
        <v-card-text class="pa-5">
           <v-text-field
            v-model="tempCdi"
            label="Taxa CDI Anual (%)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="info"
            suffix="% a.a."
            hint="Usado para estimar o rendimento considerando 21 dias úteis por mês"
            persistent-hint
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="cdiDialog = false">Cancelar</v-btn>
          <v-btn color="info" variant="flat" class="rounded-lg px-4" @click="saveCdiRate">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import CompoundInterestSimulator from '../components/CompoundInterestSimulator.vue';

const store = useStore();
const investments = computed(() => store.state.finance.investments || []);
const currentCdiRate = computed(() => store.state.finance.currentCdiRate || 10.40);

const cdiInvestments = computed(() => investments.value.filter(i => i.type === 'cdi'));
const fiiInvestments = computed(() => investments.value.filter(i => i.type === 'fii'));

const totalInvested = computed(() => {
  return investments.value.reduce((sum, item) => {
    if (item.type === 'cdi') return sum + Number(item.amount);
    if (item.type === 'fii') return sum + (Number(item.quotas) * Number(item.pricePerQuota));
    return sum;
  }, 0);
});

const totalFiiYield = computed(() => {
  return fiiInvestments.value.reduce((sum, item) => {
    return sum + (Number(item.quotas) * Number(item.yieldPerQuota));
  }, 0);
});

const totalCdiYield = computed(() => {
  return cdiInvestments.value.reduce((sum, item) => {
    return sum + getCdiYield(item.amount, item.cdiPercentage);
  }, 0);
});

const dialog = ref(false);
const valid = ref(false);
const form = ref(null);

const defaultInvest = {
  type: 'cdi',
  name: '',
  amount: '',
  cdiPercentage: '',
  quotas: '',
  pricePerQuota: '',
  yieldPerQuota: ''
};

const newInvest = ref({ ...defaultInvest });

// CDI Dialog
const cdiDialog = ref(false);
const tempCdi = ref(currentCdiRate.value);

watchEffect(() => {
  if (cdiDialog.value) {
    tempCdi.value = currentCdiRate.value;
  }
});

function saveCdiRate() {
  store.dispatch('finance/updateCdiRate', tempCdi.value);
  cdiDialog.value = false;
}

function closeDialog() {
  dialog.value = false;
  setTimeout(() => {
    newInvest.value = { ...defaultInvest };
    if(form.value) form.value.resetValidation();
  }, 200);
}

function saveInvestment() {
  if (valid.value) {
    store.dispatch('finance/addInvestment', newInvest.value);
    closeDialog();
  }
}

function confirmDelete(id) {
  if (confirm('Remover este investimento?')) {
    store.dispatch('finance/removeInvestment', id);
  }
}

function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCdiYield(amount, cdiPercentage) {
  const cdiAnnualRate = Number(currentCdiRate.value) / 100;
  
  // Fator diário do CDI considerando 252 dias úteis
  const dailyCdiFactor = Math.pow(1 + cdiAnnualRate, 1 / 252);
  
  // Taxa diária calculada com a porcentagem correspondente do investimento (ex: 110% do CDI)
  const dailyInvestmentRate = (dailyCdiFactor - 1) * (Number(cdiPercentage) / 100);
  const dailyInvestmentFactor = 1 + dailyInvestmentRate;
  
  // Fator mensal (estimando 21 dias úteis no mês para juros compostos)
  const monthlyFactor = Math.pow(dailyInvestmentFactor, 21);
  
  return Number(amount) * (monthlyFactor - 1);
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
