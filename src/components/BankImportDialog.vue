<template>
  <v-dialog v-model="dialog" max-width="900" scrollable>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="elevated"
        color="secondary"
        prepend-icon="mdi-file-upload-outline"
        class="rounded-lg font-weight-bold"
      >
        Importar Extrato
      </v-btn>
    </template>

    <v-card class="rounded-xl bg-surface" height="85vh" style="display: flex; flex-direction: column;">
      <v-card-title class="font-weight-bold pa-5 pb-3 d-flex align-center justify-space-between text-secondary">
        <div class="d-flex align-center">
          <v-icon color="secondary" class="mr-2">mdi-robot-outline</v-icon> Assistente de Importação
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog"></v-btn>
      </v-card-title>
      
      <v-divider></v-divider>

      <v-card-text class="pa-5 flex-grow-1" style="overflow-y: auto;">
        <!-- Step 1: Configuração e Upload -->
        <v-slide-y-transition leave-absolute>
          <div v-if="step === 1">
            <v-alert
              color="primary"
              variant="tonal"
              icon="mdi-information-outline"
              class="mb-6 rounded-lg text-body-2"
            >
               Faça upload do extrato gerado pelo seu banco no formato <strong>.CSV</strong>. Selecione o banco de origem para que a nossa inteligência preencha a data, o tipo (entrada/saída) e a categoria por você!
            </v-alert>

            <v-row class="mb-5">
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedBank"
                  :items="bankBanks"
                  label="Banco / Formato do Extrato"
                  variant="outlined"
                  color="primary"
                  hide-details
                  item-title="name"
                  item-value="id"
                >
                   <template v-slot:prepend-inner>
                     <v-icon color="primary">mdi-bank</v-icon>
                   </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="csvFile"
                  accept=".csv"
                  label="Arquivo CSV"
                  variant="outlined"
                  color="secondary"
                  show-size
                  hide-details
                  prepend-icon=""
                  prepend-inner-icon="mdi-file-csv"
                ></v-file-input>
              </v-col>
            </v-row>

            <div v-if="parseError" class="text-error text-caption mt-2 mb-4 d-flex align-center bg-error-lighten-5 pa-3 rounded">
               <v-icon size="small" class="mr-1">mdi-alert-circle</v-icon> {{ parseError }}
            </div>

            <div class="text-center mt-8">
              <v-btn 
                color="secondary" 
                size="x-large" 
                class="rounded-xl font-weight-bold px-8" 
                :loading="isProcessing"
                :disabled="!csvFile || !selectedBank"
                hover
                @click="processFile"
              >
                Inspecionar Extrato
              </v-btn>
            </div>
            
            <div class="text-center text-grey mt-10">
              <v-icon size="50" color="grey-lighten-2" opacity="0.5">mdi-file-upload-outline</v-icon>
            </div>
          </div>
        </v-slide-y-transition>

        <!-- Step 2: Prévia (Preview) dos Dados -->
        <v-slide-y-transition leave-absolute>
          <div v-if="step === 2">
             <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6 font-weight-bold text-high-emphasis">Prévia ({{ parsedRecords.length }} transações encontradas)</h3>
                <v-chip color="success" variant="flat">Pronto para Revisão</v-chip>
             </div>
             <p class="text-body-2 text-grey mb-4">Por favor, revise a lista abaixo gerada pelo nosso leitor automático. O banco não repassa a categoria das compras, deixamos como 'Outros' para as despesas.</p>
             
             <v-table class="border rounded-lg bg-surface">
               <thead>
                 <tr>
                   <th class="text-left font-weight-bold">Data (Formatada)</th>
                   <th class="text-left font-weight-bold">Descrição do Extrato</th>
                   <th class="text-left font-weight-bold">Tipo</th>
                   <th class="text-right font-weight-bold">Valor Base</th>
                 </tr>
               </thead>
               <tbody>
                 <tr v-for="(tx, i) in parsedRecords" :key="i">
                   <td>{{ formatDate(tx.customDate) }}</td>
                   <td>{{ tx.description }}</td>
                   <td>
                     <v-chip size="small" :color="tx.type === 'income' ? 'success' : 'error'">
                        {{ tx.type === 'income' ? 'Entrada (+)' : 'Saída (-)' }}
                     </v-chip>
                   </td>
                   <td class="text-right font-weight-bold" :class="tx.type === 'income' ? 'text-success' : 'text-error'">
                     R$ {{ Number(tx.amount).toFixed(2).replace('.', ',') }}
                   </td>
                 </tr>
               </tbody>
             </v-table>
          </div>
        </v-slide-y-transition>
      </v-card-text>

      <v-divider v-if="step === 2"></v-divider>

      <v-card-actions v-if="step === 2" class="pa-5 bg-grey-lighten-4">
        <v-btn color="grey-darken-1" variant="text" @click="step = 1">Voltar</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" variant="elevated" class="rounded-lg px-6 font-weight-bold" @click="confirmImport">Confirmar e Importar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar" color="success" timeout="3000" location="bottom right">
    <v-icon class="mr-2">mdi-check-circle</v-icon>
    {{ snackbarText }}
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import Papa from 'papaparse';
import dayjs from 'dayjs';

const store = useStore();
const dialog = ref(false);
const step = ref(1);
const snackbar = ref(false);
const snackbarText = ref('');

const csvFile = ref(null);
const selectedBank = ref('nubank');
const isProcessing = ref(false);
const parseError = ref('');
const parsedRecords = ref([]);

const bankBanks = [
  { name: 'Nubank Padrão (Colunas: Data, Valor, Identificador)', id: 'nubank' },
  { name: 'Itaú / Bradesco (Colunas: data, lançamento, valor)', id: 'itau' },
  { name: 'Inter / Genérico Simples (Colunas: Date, Description, Value)', id: 'generic' }
];

function closeDialog() {
  dialog.value = false;
  setTimeout(() => {
    step.value = 1;
    csvFile.value = null;
    parseError.value = '';
    parsedRecords.value = [];
  }, 300);
}

function processFile() {
  if (!csvFile.value) return;
  isProcessing.value = true;
  parseError.value = '';

  const file = csvFile.value;

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    complete: function(results) {
      try {
         const rows = results.data;
         const mapList = [];
         let headerMap = null;

         rows.forEach(row => { // row is an array of strings
            // Automatically find the header row (bypassing bank metadata)
            if (!headerMap) {
               const cleanRow = row.map(cell => String(cell).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());
               if (cleanRow.some(s => s.includes('data') || s.includes('date')) && 
                   cleanRow.some(s => s.includes('valor') || s.includes('lancamento') || s.includes('historico') || s.includes('credito') || s.includes('amount') || s.includes('identifi'))) {
                   headerMap = cleanRow;
               }
               return; // skip until header is found
            }

            // Process data row
            const rowObj = {};
            headerMap.forEach((key, index) => {
               if (key) rowObj[key] = row[index];
            });

            const keys = Object.keys(rowObj);
            const getVal = (keywords) => {
               const matchedKey = keys.find(k => keywords.some(kw => k.includes(kw)));
               return matchedKey ? rowObj[matchedKey] : undefined;
            };

            const dateRaw = getVal(['data', 'date']);
            const desc = getVal(['descricao', 'historico', 'lancamento', 'name', 'origem', 'identific']);
               
            let valueRaw = getVal(['valor', 'value', 'amount']);
            if (!valueRaw) {
               const cred = getVal(['credito']);
               const deb = getVal(['debito']);
               if (cred && String(cred).trim() !== '') {
                 valueRaw = cred;
               } else if (deb && String(deb).trim() !== '') {
                 valueRaw = "-" + String(deb).trim();
               }
            }

            // Exclude summary rows like "Total" or empty dates
            if (dateRaw && valueRaw && String(dateRaw).trim().length > 1 && !String(dateRaw).toLowerCase().includes('total')) {
               let internalTx = createTxRecord(dateRaw, valueRaw, desc || 'Importado via Extrato');
               if (internalTx && internalTx.amount > 0) {
                  mapList.push(internalTx);
               }
            }
         });

         if (mapList.length === 0) {
            parseError.value = "Nenhuma transação válida encontrada. O formato escolhido do banco está correto para o arquivo selecionado?";
         } else {
            parsedRecords.value = mapList;
            step.value = 2; // proceed to preview
         }
      } catch (err) {
         parseError.value = "Falha estrutural ao ler o arquivo CSV. Verifique se o arquivo não está corrompido.";
      }
      isProcessing.value = false;
    },
    error: function(err) {
      parseError.value = "Erro fatal do leitor PapaParse: " + err.message;
      isProcessing.value = false;
    }
  });
}

function createTxRecord(dateString, valueString, descriptionStr) {
  // Parsing Value String to Float safely (Handles both 1.000,50 and 1000.50)
  let sanVal = String(valueString).replace(/[R$\s]/g, '');
  if (sanVal.includes(',') && sanVal.includes('.')) {
    sanVal = sanVal.replace(/\./g, '').replace(',', '.'); // brazilian format 1.000,50 -> 1000.50
  } else if (sanVal.includes(',')) {
    sanVal = sanVal.replace(',', '.');
  }
  const floatVal = parseFloat(sanVal);

  if (isNaN(floatVal)) return null;

  // Determine Type based on Sign
  const type = floatVal < 0 ? 'debit' : 'income'; // Assuming negative means money out
  const absAmount = Math.abs(floatVal);
  const category = type === 'income' ? 'Outros Ganhos' : 'Outros';

  // Date Parsing (Try DD/MM/YYYY then fallback to standard parsing)
  let isoDate = new Date().toISOString();
  if (dateString) {
     const parts = dateString.split('/');
     if (parts.length === 3) {
        // Assume DD MM YYYY
        if (parts[2].length === 4) { // year is 4 digits
          const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`);
          if (!isNaN(d.getTime())) isoDate = d.toISOString();
        }
     } else {
        const d = dayjs(dateString);
        if (d.isValid()) isoDate = d.toISOString();
     }
  }

  return {
     type,
     category,
     amount: absAmount,
     description: descriptionStr || 'Despesa Importada',
     customDate: isoDate
  };
}

function confirmImport() {
   if (parsedRecords.value.length > 0) {
     store.dispatch('finance/importTransactionsBulk', parsedRecords.value);
     snackbarText.value = `${parsedRecords.value.length} transações importadas com sucesso!`;
     snackbar.value = true;
     closeDialog();
   }
}

function formatDate(iso) {
  return dayjs(iso).format('DD/MM/YYYY');
}

</script>
