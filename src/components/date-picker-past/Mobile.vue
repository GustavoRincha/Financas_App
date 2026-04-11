<template>
  <v-dialog persistent
    v-model="$_model"
    v-bind="$attrs"
    v-on="$listeners"

    ref="dialog"
    content-class="rounded-xl mx-2"
    max-width="290"
  >
    <template #activator="{ on, attrs }">
      <slot name="activator" :on="on" :attrs="attrs" />
      <slot name="readonly"/>
    </template>
    <slot />
  </v-dialog>
</template>

<script>
export default {
  name: 'CoreDatePickerFieldMobile',

  props: {
    value: Boolean,
  },

  computed: {
    $_model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },

  methods: {
    save(...args) {
      this.$refs.dialog.save(...args);
    },
  },
};
</script>
