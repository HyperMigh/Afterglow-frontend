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
  border: 1px solid var(--ag-border-soft);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--ag-input-text);
  background: var(--ag-input-bg);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ui-input:focus {
  border-color: var(--ag-border-focus);
  box-shadow: 0 0 0 2px var(--ag-focus-ring);
}

.ui-input.is-invalid {
  border-color: var(--ag-danger-border);
}

textarea.ui-input {
  resize: vertical;
  min-height: 120px;
}
</style>
