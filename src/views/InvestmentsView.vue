<template>
  <div class="investments">
    <v-row class="mb-4 d-flex align-center justify-space-between">
      <v-col cols="12" sm="5">
        <h2 class="text-h4 font-weight-bold ">Investimentos</h2>
        <p class="text-grey">Gerencie seu portfólio completo.</p>
      </v-col>
      <v-col cols="12" sm="7" class="text-sm-right mt-2 mt-sm-0 d-flex justify-sm-end align-center gap-2 flex-wrap">
        <v-btn variant="tonal" color="warning-darken-2" @click="apiDialog = true" rounded="lg" size="small" class="mr-1">
          <v-icon>mdi-key-variant</v-icon> API BRAPI
        </v-btn>
        <v-btn variant="tonal" color="success" @click="fetchPrices" rounded="lg" size="small" class="mr-1" :loading="isFetching">
          <v-icon left>mdi-refresh</v-icon> Cotações
        </v-btn>
        <v-btn variant="tonal" color="info" @click="cdiDialog = true" rounded="lg" size="small" class="mr-1">
          CDI: {{ currentCdiRate }}% a.a.
        </v-btn>
        <v-btn color="primary" @click="dialog = true" prepend-icon="mdi-plus" rounded="lg" elevation="1">Investir</v-btn>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-tabs v-model="tab" color="primary" align-tabs="center" class="mb-6 rounded-lg bg-surface elevation-1">
      <v-tab value="overview"><v-icon class="mr-2">mdi-view-dashboard</v-icon> Resumo</v-tab>
      <v-tab value="fixed"><v-icon class="mr-2">mdi-chart-line</v-icon> Renda Fixa</v-tab>
      <v-tab value="stocks"><v-icon class="mr-2">mdi-finance</v-icon> Ações & FIIs</v-tab>
      <v-tab value="crypto"><v-icon class="mr-2">mdi-bitcoin</v-icon> Criptomoedas</v-tab>
      <v-tab value="simulator"><v-icon class="mr-2">mdi-chart-areaspline</v-icon> Simulador</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="bg-transparent">
      <!-- 1. RESUMO GERAL -->
      <v-window-item value="overview">
        <v-row class="mb-4">
          <v-col cols="12" md="4">
             <v-card class="rounded-xl pa-2" elevation="1" color="primary">
              <v-card-item>
                <template v-slot:subtitle>
                  <span class="text-white text-opacity-80">Patrimônio Investido</span>
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
                  <span class="text-grey-darken-1 font-weight-medium">Renda Fixa (+Mês)</span>
                </template>
                <template v-slot:title>
                  <div class="text-h4 font-weight-bold mt-1 text-info">+ R$ {{ formatMoney(totalFixedYield) }}</div>
                </template>
              </v-card-item>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
             <v-card class="rounded-xl pa-2" elevation="1">
              <v-card-item>
                <template v-slot:subtitle>
                  <span class="text-grey-darken-1 font-weight-medium">FIIs (Provento Estimado/Mês)</span>
                </template>
                <template v-slot:title>
                  <div class="text-h4 font-weight-bold mt-1 text-success">+ R$ {{ formatMoney(totalFiiYield) }}</div>
                </template>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
        
        <v-row v-if="cryptoInvestments.length > 0 || stockInvestments.length > 0">
           <v-col cols="12">
             <v-card class="rounded-xl pa-4 text-center">
               <h3 class="text-h6 font-weight-bold  mb-2">Desempenho da Renda Variável</h3>
               <p class="text-grey">
                  Saldo atual (Cripto + Ações): <strong class="text-primary">R$ {{ formatMoney(totalVariableCurrent) }}</strong> 
                  <br> Investido (Custo): <strong>R$ {{ formatMoney(totalVariableInvested) }}</strong>
               </p>
               <v-chip :color="totalVariableCurrent >= totalVariableInvested ? 'success' : 'error'" class="mt-2" variant="flat">
                 Variância: {{ formatMoney(totalVariableCurrent - totalVariableInvested) }} ({{ ((totalVariableCurrent / totalVariableInvested - 1) * 100).toFixed(2) }}%)
               </v-chip>
             </v-card>
           </v-col>
        </v-row>
      </v-window-item>

      <!-- 2. RENDA FIXA (CDI + Tesouro) -->
      <v-window-item value="fixed">
        <v-row>
          <!-- CDI -->
          <v-col cols="12" md="6">
            <v-card class="rounded-xl elevation-1 h-100">
              <v-card-title class="font-weight-bold pa-5 pb-2 d-flex align-center text-info">
                <v-icon color="info" class="mr-2">mdi-bank</v-icon> Rendimento atrelado ao CDI
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
                         <span class="text-info font-weight-medium">Rende aprox. R$ {{ formatMoney(getCdiYield(item.amount, item.cdiPercentage)) }} /mês</span>
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
          <!-- Tesouro / Fixado -->
          <v-col cols="12" md="6">
            <v-card class="rounded-xl elevation-1 h-100">
              <v-card-title class="font-weight-bold pa-5 pb-2 d-flex align-center text-teal">
                <v-icon color="teal" class="mr-2">mdi-shield-check</v-icon> Tesouro Direto / Prefixado
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list lines="three">
                   <v-list-item v-if="fixedInvestments.length === 0" class="text-center text-grey py-6">Nenhuma obrigação registrada.</v-list-item>
                   <template v-for="(item, index) in fixedInvestments" :key="item.id">
                     <v-list-item class="px-5 py-2">
                       <template v-slot:prepend>
                         <v-avatar color="teal-lighten-4">
                           <v-icon color="teal">mdi-file-document-outline</v-icon>
                         </v-avatar>
                       </template>
                       <v-list-item-title class="font-weight-bold text-subtitle-1">{{ item.name }}</v-list-item-title>
                       <v-list-item-subtitle>
                         Taxa Fixa: {{ item.annualRate }}% a.a.
                         <br/> 
                         <span class="text-teal font-weight-medium">Rende aprox. R$ {{ formatMoney(getFixedYield(item.amount, item.annualRate)) }} /mês</span>
                       </v-list-item-subtitle>
                       <template v-slot:append>
                         <div class="text-right d-flex align-center">
                           <div class="font-weight-bold text-subtitle-1 mr-3">R$ {{ formatMoney(item.amount) }}</div>
                           <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDelete(item.id)"></v-btn>
                         </div>
                       </template>
                     </v-list-item>
                     <v-divider v-if="index < fixedInvestments.length - 1" inset></v-divider>
                   </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- 3. AÇÕES & FIIs -->
      <v-window-item value="stocks">
        <v-row>
           <!-- Ações -->
           <v-col cols="12" md="6">
            <v-card class="rounded-xl elevation-1 h-100">
              <v-card-title class="font-weight-bold pa-5 pb-2 d-flex align-center text-blue-darken-2">
                <v-icon color="blue-darken-2" class="mr-2">mdi-trending-up</v-icon> Ações (B3)
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list lines="three">
                   <v-list-item v-if="stockInvestments.length === 0" class="text-center text-grey py-6">Nenhuma ação listada.</v-list-item>
                   <template v-for="(item, index) in stockInvestments" :key="item.id">
                     <v-list-item class="px-5 py-2">
                       <template v-slot:prepend>
                         <v-avatar color="blue-lighten-4">
                           <v-icon color="blue-darken-2">mdi-finance</v-icon>
                         </v-avatar>
                       </template>
                       <v-list-item-title class="font-weight-bold text-subtitle-1">{{ item.ticker.toUpperCase() }}</v-list-item-title>
                       <v-list-item-subtitle>
                         {{ item.quotas }} ações • Custo Médio: R$ {{ formatMoney(item.buyPrice) }}
                         <br/>
                         <span :class="(item.currentPrice && item.currentPrice >= item.buyPrice) ? 'text-success' : 'text-error'" class="font-weight-medium">
                           Cotação Atual: R$ {{ formatMoney(item.currentPrice || item.buyPrice) }}
                         </span>
                       </v-list-item-subtitle>
                       <template v-slot:append>
                         <div class="text-right d-flex align-center">
                           <div class="mr-3 text-right">
                             <div class="font-weight-bold text-subtitle-1">R$ {{ formatMoney(item.quotas * (item.currentPrice || item.buyPrice)) }}</div>
                             <div class="text-caption text-grey">Invest.: R$ {{ formatMoney(item.quotas * item.buyPrice) }}</div>
                           </div>
                           <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDelete(item.id)"></v-btn>
                         </div>
                       </template>
                     </v-list-item>
                     <v-divider v-if="index < stockInvestments.length - 1" inset></v-divider>
                   </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          
          <!-- FIIs -->
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
                         <span class="text-success font-weight-medium">Provento Mensal: R$ {{ formatMoney(item.quotas * item.yieldPerQuota) }}</span>
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
      </v-window-item>

      <!-- 4. CRIPTOMOEDAS -->
      <v-window-item value="crypto">
        <v-row>
          <v-col cols="12">
            <v-card class="rounded-xl elevation-1 h-100">
              <v-card-title class="font-weight-bold pa-5 pb-2 d-flex align-center text-orange-darken-2">
                <v-icon color="orange-darken-2" class="mr-2">mdi-bitcoin</v-icon> Criptomoedas
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list lines="three">
                   <v-list-item v-if="cryptoInvestments.length === 0" class="text-center text-grey py-6">Nenhuma criptomoeda registrada.</v-list-item>
                   <template v-for="(item, index) in cryptoInvestments" :key="item.id">
                     <v-list-item class="px-5 py-2">
                       <template v-slot:prepend>
                         <v-avatar color="orange-lighten-4">
                           <v-icon color="orange-darken-2">mdi-currency-btc</v-icon>
                         </v-avatar>
                       </template>
                       <v-list-item-title class="font-weight-bold text-subtitle-1">{{ item.ticker.toUpperCase() }}</v-list-item-title>
                       <v-list-item-subtitle>
                         Saldo: {{ item.amountOfCoins }} {{ item.ticker.toUpperCase() }} • Custo Médio: R$ {{ formatMoney(item.buyPrice) }}
                         <br/>
                         <span :class="(item.currentPrice && item.currentPrice >= item.buyPrice) ? 'text-success' : 'text-error'" class="font-weight-medium">
                           Cotação Atual: R$ {{ formatMoney(item.currentPrice || item.buyPrice) }}
                         </span>
                       </v-list-item-subtitle>
                       <template v-slot:append>
                         <div class="text-right d-flex align-center">
                           <div class="mr-3 text-right">
                             <div class="font-weight-bold text-subtitle-1">R$ {{ formatMoney(item.amountOfCoins * (item.currentPrice || item.buyPrice)) }}</div>
                             <div class="text-caption text-grey">Invest.: R$ {{ formatMoney(item.amountOfCoins * item.buyPrice) }}</div>
                           </div>
                           <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDelete(item.id)"></v-btn>
                         </div>
                       </template>
                     </v-list-item>
                     <v-divider v-if="index < cryptoInvestments.length - 1" inset></v-divider>
                   </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- 5. SIMULADOR -->
      <v-window-item value="simulator">
        <CompoundInterestSimulator />
      </v-window-item>
    </v-window>

    <!-- Dialog Registro Investimento -->
    <v-dialog v-model="dialog" max-width="500px" scrollable>
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold pa-5 pb-2">Novo Investimento</v-card-title>
        <v-card-text class="pa-5 pt-0" style="max-height: 70vh;">
          <v-form ref="form" v-model="valid">
            <v-select
              v-model="newInvest.type"
              :items="investTypes"
              label="Modalidade"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="mb-2"
            ></v-select>

            <!-- CDI Fields -->
            <template v-if="newInvest.type === 'cdi'">
              <v-text-field v-model="newInvest.name" label="Nome (Ex: CDB Inter)" variant="outlined" density="comfortable" class="mb-2" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
              <v-text-field v-model="newInvest.amount" label="Valor Investido (R$)" type="number" variant="outlined" density="comfortable" prefix="R$" class="mb-2" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
              <v-text-field v-model="newInvest.cdiPercentage" label="Porcentagem do CDI (%)" type="number" variant="outlined" density="comfortable" suffix="%" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
            </template>
            
            <!-- Fixed Fields -->
            <template v-if="newInvest.type === 'fixed'">
              <v-text-field v-model="newInvest.name" label="Nome (Ex: Tesouro Prefixado)" variant="outlined" density="comfortable" class="mb-2" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
              <v-text-field v-model="newInvest.amount" label="Valor Investido (R$)" type="number" variant="outlined" density="comfortable" prefix="R$" class="mb-2" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
              <v-text-field v-model="newInvest.annualRate" label="Taxa Fixa Anual (%)" type="number" variant="outlined" density="comfortable" suffix="% a.a." :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
            </template>

            <!-- FII Fields -->
            <template v-if="newInvest.type === 'fii'">
              <v-text-field v-model="newInvest.name" label="Nome (Ex: MXRF11)" variant="outlined" density="comfortable" class="mb-2" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
              <v-row class="mb-0">
                <v-col cols="6" class="pb-0"><v-text-field v-model="newInvest.quotas" label="Cotas" type="number" variant="outlined" density="comfortable" :rules="[v => !!v || 'Obrigatório']"></v-text-field></v-col>
                <v-col cols="6" class="pb-0"><v-text-field v-model="newInvest.pricePerQuota" label="Valor (R$)" type="number" variant="outlined" density="comfortable" prefix="R$" :rules="[v => !!v || 'Obrigatório']"></v-text-field></v-col>
              </v-row>
              <v-text-field v-model="newInvest.yieldPerQuota" label="Provento p/ Cota (R$/mês)" type="number" variant="outlined" density="comfortable" prefix="R$" class="mb-2" :rules="[v => !!v || 'Obrigatório']"></v-text-field>
            </template>
            
            <!-- Stock Fields -->
            <template v-if="newInvest.type === 'stock'">
              <v-text-field v-model="newInvest.ticker" label="Ticker (Ex: PETR4)" variant="outlined" density="comfortable" class="mb-2" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
              <v-row class="mb-0">
                <v-col cols="6" class="pb-0"><v-text-field v-model="newInvest.quotas" label="Quantidade" type="number" variant="outlined" density="comfortable" :rules="[v => !!v || 'Obrigatório']"></v-text-field></v-col>
                <v-col cols="6" class="pb-0"><v-text-field v-model="newInvest.buyPrice" label="Preço Médio" type="number" variant="outlined" density="comfortable" prefix="R$" :rules="[v => !!v || 'Obrigatório']"></v-text-field></v-col>
              </v-row>
              <p class="text-caption text-grey mt-2">Cotação suportada via BRAPI. Atualizado usando o botão de Cotações.</p>
            </template>

            <!-- Crypto Fields -->
            <template v-if="newInvest.type === 'crypto'">
              <v-text-field v-model="newInvest.ticker" label="Símbolo (Ex: BTC, ETH)" variant="outlined" density="comfortable" class="mb-2" :rules="[v => !!v || 'Campo obrigatório']"></v-text-field>
              <v-row class="mb-0">
                <v-col cols="6" class="pb-0"><v-text-field v-model="newInvest.amountOfCoins" label="Qtd Moedas" type="number" variant="outlined" density="comfortable" :rules="[v => !!v || 'Obrigatório']"></v-text-field></v-col>
                <v-col cols="6" class="pb-0"><v-text-field v-model="newInvest.buyPrice" label="Preço Médio Unitário" type="number" variant="outlined" density="comfortable" prefix="R$" :rules="[v => !!v || 'Obrigatório']"></v-text-field></v-col>
              </v-row>
              <p class="text-caption text-grey mt-2">Preços atualizados gratuitamente via AwesomeAPI BRL.</p>
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
           <v-text-field v-model="tempCdi" label="Taxa CDI Anual (%)" type="number" variant="outlined" density="comfortable" color="info" suffix="% a.a." hint="Usado para estimar o rendimento considerando 21 dias úteis" persistent-hint></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="cdiDialog = false">Cancelar</v-btn>
          <v-btn color="info" variant="flat" class="rounded-lg px-4" @click="saveCdiRate">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Dialog BRAPI -->
    <v-dialog v-model="apiDialog" max-width="400px">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold pa-5 pb-0">Chave API: BRAPI</v-card-title>
        <v-card-text class="pa-5">
           <p class="mb-4 text-body-2">Para cotações em tempo real da B3, crie uma conta gratuita em <strong>brapi.dev</strong> e cole seu token abaixo.</p>
           <v-text-field v-model="tempBrapi" label="Token BRAPI" type="text" variant="outlined" density="comfortable" color="warning"></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="apiDialog = false">Cancelar</v-btn>
          <v-btn color="warning-darken-2" variant="flat" class="rounded-lg px-4" @click="saveBrapiKey">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SnackBar Alerts -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>

    <!-- Modal de Confirmação de Remoção -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="rounded-xl pa-2 bg-surface">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
           <v-icon color="error" class="mr-2">mdi-alert</v-icon> Remover Investimento
        </v-card-title>
        <v-card-text class="text-body-1">
          Tem certeza que deseja remover este item do portfólio? O montante deixará de ser somado aos totais.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" class="px-4" @click="executeDelete">Remover</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import CompoundInterestSimulator from '../components/CompoundInterestSimulator.vue';

const store = useStore();
const investments = computed(() => store.state.finance.investments || []);
const currentCdiRate = computed(() => store.state.finance.currentCdiRate || 10.40);
const brapiToken = computed(() => store.state.finance.apiKeys?.brapi || '');

const tab = ref('overview');
const isFetching = ref(false);
const snackbar = ref({ show: false, text: '', color: 'success' });

const investTypes = [
  {title: 'Renda Fixa (CDI)', value: 'cdi'},
  {title: 'Tesouro/Prefixado', value: 'fixed'},
  {title: 'Fundo Imobiliário (FII)', value: 'fii'},
  {title: 'Ações (B3)', value: 'stock'},
  {title: 'Criptomoeda', value: 'crypto'}
];

// Computed Categories
const cdiInvestments = computed(() => investments.value.filter(i => i.type === 'cdi'));
const fixedInvestments = computed(() => investments.value.filter(i => i.type === 'fixed'));
const fiiInvestments = computed(() => investments.value.filter(i => i.type === 'fii'));
const stockInvestments = computed(() => investments.value.filter(i => i.type === 'stock'));
const cryptoInvestments = computed(() => investments.value.filter(i => i.type === 'crypto'));

// Calculations
const totalInvested = computed(() => {
  let sum = 0;
  investments.value.forEach(item => {
    if (item.type === 'cdi' || item.type === 'fixed') sum += Number(item.amount);
    if (item.type === 'fii') sum += (Number(item.quotas) * Number(item.pricePerQuota));
    if (item.type === 'stock') sum += (Number(item.quotas) * Number(item.buyPrice));
    if (item.type === 'crypto') sum += (Number(item.amountOfCoins) * Number(item.buyPrice));
  });
  return sum;
});

const totalFixedYield = computed(() => {
  return cdiInvestments.value.reduce((s, i) => s + getCdiYield(i.amount, i.cdiPercentage), 0) +
         fixedInvestments.value.reduce((s, i) => s + getFixedYield(i.amount, i.annualRate), 0);
});

const totalFiiYield = computed(() => {
  return fiiInvestments.value.reduce((s, i) => s + (Number(i.quotas) * Number(i.yieldPerQuota)), 0);
});

const totalVariableInvested = computed(() => {
  let s = 0;
  stockInvestments.value.forEach(i => s += (Number(i.quotas) * Number(i.buyPrice)));
  cryptoInvestments.value.forEach(i => s += (Number(i.amountOfCoins) * Number(i.buyPrice)));
  return s;
});

const totalVariableCurrent = computed(() => {
  let s = 0;
  stockInvestments.value.forEach(i => s += (Number(i.quotas) * Number(i.currentPrice || i.buyPrice)));
  cryptoInvestments.value.forEach(i => s += (Number(i.amountOfCoins) * Number(i.currentPrice || i.buyPrice)));
  return s;
});


// Forms and Dialogs
const dialog = ref(false);
const valid = ref(false);
const form = ref(null);

const defaultInvest = {
  type: 'cdi', name: '', ticker: '', amount: '', cdiPercentage: '', annualRate: '',
  quotas: '', pricePerQuota: '', yieldPerQuota: '',
  buyPrice: '', amountOfCoins: ''
};

const newInvest = ref({ ...defaultInvest });

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

const deleteDialog = ref(false);
const itemToDelete = ref(null);

function confirmDelete(id) {
  itemToDelete.value = id;
  deleteDialog.value = true;
}

function executeDelete() {
  if (itemToDelete.value) {
    store.dispatch('finance/removeInvestment', itemToDelete.value);
    deleteDialog.value = false;
    itemToDelete.value = null;
    showSnackbar('Investimento removido.', 'info');
  }
}

// CDI Management
const cdiDialog = ref(false);
const tempCdi = ref(currentCdiRate.value);

watchEffect(() => {
  if (cdiDialog.value) tempCdi.value = currentCdiRate.value;
});

function saveCdiRate() {
  store.dispatch('finance/updateCdiRate', tempCdi.value);
  cdiDialog.value = false;
}

// BRAPI Key Management
const apiDialog = ref(false);
const tempBrapi = ref(brapiToken.value);

watchEffect(() => {
  if (apiDialog.value) tempBrapi.value = brapiToken.value;
});

function saveBrapiKey() {
  store.dispatch('finance/updateApiKeys', { brapi: tempBrapi.value });
  apiDialog.value = false;
  snackbar.value = { show: true, text: 'Token BRAPI salvo com sucesso.', color: 'success' };
}

// Fetch Real-time Quotes
async function fetchPrices() {
  isFetching.value = true;
  let successCount = 0;
  
  // Crypto Fetch (AwesomeAPI - Free, no token)
  const cryptos = cryptoInvestments.value.map(c => c.ticker.toUpperCase() + '-BRL').join(',');
  if (cryptos) {
    try {
      const res = await axios.get(`https://economia.awesomeapi.com.br/last/${cryptos}`);
      cryptoInvestments.value.forEach(item => {
        const key = item.ticker.toUpperCase() + 'BRL';
        if (res.data[key] && res.data[key].bid) {
          store.dispatch('finance/updateInvestmentPrice', { id: item.id, price: Number(res.data[key].bid) });
          successCount++;
        }
      });
    } catch(e) { console.error('Crypto fetch error', e); }
  }

  // Stocks Fetch (BRAPI - Needs token mostly)
  const stocks = stockInvestments.value.map(s => s.ticker.toUpperCase()).join('%2C');
  if (stocks) {
    if (!brapiToken.value) {
      snackbar.value = { show: true, text: 'Adicione sua chave BRAPI para atualizar Ações B3.', color: 'warning' };
    } else {
      try {
        const res = await axios.get(`https://brapi.dev/api/quote/${stocks}?token=${brapiToken.value}`);
        if (res.data && res.data.results) {
          res.data.results.forEach(result => {
            const item = stockInvestments.value.find(s => s.ticker.toUpperCase() === result.symbol);
            if (item && result.regularMarketPrice) {
              store.dispatch('finance/updateInvestmentPrice', { id: item.id, price: Number(result.regularMarketPrice) });
              successCount++;
            }
          });
        }
      } catch(e) { console.error('Stock fetch error', e); }
    }
  }

  isFetching.value = false;
  if(successCount > 0) {
    snackbar.value = { show: true, text: `Cotações atualizadas (${successCount} ativos).`, color: 'success' };
  } else if (!stocks) {
    snackbar.value = { show: true, text: 'Nenhum ativo para atualizar com a API externa.', color: 'info' };
  }
}

// Math Utilities
function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCdiYield(amount, cdiPercentage) {
  const cdiAnnualRate = Number(currentCdiRate.value) / 100;
  const dailyCdiFactor = Math.pow(1 + cdiAnnualRate, 1 / 252);
  const dailyInvestmentRate = (dailyCdiFactor - 1) * (Number(cdiPercentage) / 100);
  const monthlyFactor = Math.pow(1 + dailyInvestmentRate, 21);
  return Number(amount) * (monthlyFactor - 1);
}

function getFixedYield(amount, annualRate) {
  const rate = Number(annualRate) / 100;
  const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;
  return Number(amount) * monthlyRate;
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
