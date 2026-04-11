<template>
  <v-menu offset-y
    v-model="$_model"
    v-bind="$attrs"
    v-on="$listeners"

    :close-on-content-click="false"

    ref="menu"
    content-class="rounded-xl"
    transition="scale-transition"
    min-width="auto"
  >
    <template #activator="{ on, attrs }">
      <slot name="activator" :on="on" :attrs="attrs" />
      <slot name="readonly"/>
    </template>

    <slot />
  </v-menu>
</template>

<script>
export default {
  name: 'CoreDatePickerFieldDesktop',

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
      this.$refs.menu.save(...args);
    },
  },
};
</script>
