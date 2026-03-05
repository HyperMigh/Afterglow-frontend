<script setup>
import { computed } from "vue";

defineOptions({
  inheritAttrs: false
});

const emit = defineEmits(["update:modelValue", "keyup", "keydown", "blur", "focus"]);

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  multiline: {
    type: Boolean,
    default: false
  },
  invalid: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: undefined
  }
});

const tagName = computed(() => (props.multiline ? "textarea" : "input"));

function onInput(event) {
  emit("update:modelValue", event.target.value);
}
</script>

<template>
  <component
    :is="tagName"
    :value="modelValue"
    :rows="multiline ? rows : undefined"
    class="ui-input"
    :class="{ 'is-invalid': invalid }"
    v-bind="$attrs"
    @input="onInput"
    @keyup="(event) => emit('keyup', event)"
    @keydown="(event) => emit('keydown', event)"
    @blur="(event) => emit('blur', event)"
    @focus="(event) => emit('focus', event)"
  />
</template>

<style scoped>
.ui-input {
  width: 100%;
  border: 1px solid var(--ag-border);
  border-radius: 10px;
  padding: 11px 13px;
  font-size: 14px;
  color: var(--ag-text);
  background: #ffffff;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.ui-input::placeholder {
  color: var(--ag-text-muted);
}

.ui-input:focus {
  border-color: var(--ag-accent);
  box-shadow: 0 0 0 3px var(--ag-focus-ring);
}

.ui-input.is-invalid {
  border-color: #f97066;
}

textarea.ui-input {
  resize: vertical;
  min-height: 120px;
}
</style>
