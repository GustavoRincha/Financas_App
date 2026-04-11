<template>
  <component
    v-model="isActive"
    ref="component"
    :is="$_component"
    :return-value.sync="$_model"
  >
    <template #activator="{ on, attrs }">
      <core-text-field 
        readonly
        :value="$_presentationModel"
        v-bind="{ ...attrs, ...$attrs }"
        dense
        class="pa-0 teste"
        :rounded="false"
        :style="{ 'background-color': form ? 'white' : 'transparent' }"
        append-icon="mdi-calendar-outline"
        outlined
        hide-details="auto"
        v-on="readonly ? {} : on"
        @click:append="!readonly && $_onClickAppendIcon()"
      />
    </template>

    <v-date-picker 
      v-model="$_model"
      scrollable
      :no-title="!$_isMobile"
      locale="pt-br"
    >
      <v-spacer />

      <v-btn rounded depressed class="pr-3" @click="isActive = false">
        <v-icon left>mdi-close</v-icon>
        Cancelar
      </v-btn>

      <v-btn rounded depressed color="primary" class="pr-3" @click="$_onClickConfirm">
        <v-icon left>mdi-check</v-icon>
        Ok
      </v-btn>
    </v-date-picker>
  </component>
</template>

<script>
import CoreTextField from '../text-field/Index.vue';
import CoreDatePickerFieldMobile from './Mobile.vue';
import CoreDatePickerFieldDesktop from './Desktop.vue';

export default {
  name: 'CoreDatePickerField',

  components: {
    CoreTextField,
  },

  props: {
    value: String,
    form: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isActive: false,
    };
  },

  computed: {
    $_isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },

    $_component() {
      return this.$_isMobile ? CoreDatePickerFieldMobile : CoreDatePickerFieldDesktop;
    },

    $_model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    $_presentationModel() {
      if (!this.value) return "";
      
      const date = new Date(this.value);
      // Corrige o fuso horário para a data não voltar um dia (bug clássico de JS)
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      return date.toLocaleDateString('pt-BR');
    },
  },

  methods: {
    $_onClickConfirm() {
      this.$refs.component.save(this.$_model);
      this.isActive = false;
    },

    $_onClickAppendIcon() {
      this.isActive = true;
    },
  },
};
</script>

<style scoped>

::v-deep .v-input__append-inner {
  margin-top: 8px !important; 
}

</style>