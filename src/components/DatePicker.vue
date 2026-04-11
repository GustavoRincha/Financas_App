<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-bind="props"
        :label="label"
        :model-value="formattedDate"
        prepend-inner-icon="mdi-calendar"
        readonly
        variant="outlined"
        color="primary"
        hide-details="auto"
        :density="density || 'comfortable'"
      ></v-text-field>
    </template>
    
    <v-card>
      <v-date-picker 
        v-model="internalDate" 
        color="primary"
        @update:modelValue="save"
        hide-header
      ></v-date-picker>
      <v-card-actions class="pt-0 justify-end">
        <v-btn color="grey" variant="text" size="small" @click="menu = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';

const props = defineProps(['modelValue', 'label', 'density']);
const emit = defineEmits(['update:modelValue']);

const menu = ref(false);

const internalDate = ref();

// Correctly parse initial date
if (props.modelValue) {
  const temp = new Date(props.modelValue);
  temp.setMinutes(temp.getMinutes() + temp.getTimezoneOffset());
  internalDate.value = temp;
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const temp = new Date(newVal);
    // Fix offset shifting bug so 01 forms remains 01 locally
    temp.setMinutes(temp.getMinutes() + temp.getTimezoneOffset());
    internalDate.value = temp;
  } else {
    internalDate.value = null;
  }
});

const formattedDate = computed(() => {
  if (!props.modelValue) return '';
  return dayjs(props.modelValue).format('DD/MM/YYYY');
});

function save(newDate) {
  menu.value = false;
  if (!newDate) return;
  // Emit standard ISO Date YYYY-MM-DD
  emit('update:modelValue', dayjs(newDate).format('YYYY-MM-DD'));
}
</script>
