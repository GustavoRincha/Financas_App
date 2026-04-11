<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app color="primary" theme="dark">
      <v-list class="py-0">
        <v-list-item class="px-3 py-5" title="Fin App" subtitle="Controle Pessoal">
          <template v-slot:prepend>
            <v-avatar color="white" class="mr-3">
              <v-icon color="primary" icon="mdi-chart-pie" size="x-large"></v-icon>
            </v-avatar>
          </template>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item to="/" prepend-icon="mdi-view-dashboard" title="Dashboard" base-color="white" class="mt-2 text-button"></v-list-item>
        <v-list-item to="/transactions" prepend-icon="mdi-list-box-outline" title="Extrato" base-color="white" class="text-button"></v-list-item>
        <v-list-item to="/investments" prepend-icon="mdi-chart-line" title="Investimentos" base-color="white" class="text-button"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app elevation="0" :color="isDark ? 'surface' : 'background'">
      <v-app-bar-nav-icon color="primary" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title class="font-weight-bold text-primary">Controle Financeiro</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme" color="primary">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-4 pa-md-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from 'vuetify';

const drawer = ref(null);
const store = useStore();
const theme = useTheme();

const isDark = computed(() => store.state.finance.theme === 'dark');

watchEffect(() => {
  theme.global.name.value = store.state.finance.theme || 'light';
});

function toggleTheme() {
  store.dispatch('finance/toggleTheme');
}

onMounted(() => {
  store.dispatch('finance/loadData');
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
.v-application {
  font-family: 'Inter', sans-serif !important;
}
</style>
