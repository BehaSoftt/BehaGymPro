<template>
  <div class="space-y-3 w-full">
    <label v-if="label" class="block text-ui-label font-ui-normal text-white tracking-ui ml-2 mt-3">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>
    
    <div class="relative flex items-center group">
      <!-- Icon Slot -->
      <div v-if="$slots.icon" class="absolute left-4 text-slate-500 group-focus-within:text-blue-400 transition-colors">
        <slot name="icon"></slot>
      </div>

      <select
        v-if="type === 'select'"
        v-model="internalValue"
        v-bind="$attrs"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full bg-slate-950 border-2 border-indigo-500/60 px-4 py-3 text-ui-main shadow-[0_0_15px_rgba(99,102,241,0.15)] focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] outline-none font-ui-normal text-ui-input tracking-ui transition-all appearance-none cursor-pointer disabled:opacity-50 rounded-xl',
          $slots.icon ? 'pl-12' : '',
          error ? 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : ''
        ]"
      >
        <slot>
          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </slot>
      </select>

      <!-- Textarea Type -->
      <textarea
        v-else-if="type === 'textarea'"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :class="[
          'w-full bg-slate-950 border-2 border-indigo-500/60 px-4 py-3 text-ui-main shadow-[0_0_15px_rgba(99,102,241,0.15)] focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] outline-none font-ui-normal text-ui-input tracking-ui transition-all resize-none placeholder:text-slate-700 disabled:opacity-50 rounded-xl',
          error ? 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : ''
        ]"
      ></textarea>

      <!-- Standard Input Types (text, number, date, time, etc) -->
      <input
        v-else
        v-bind="$attrs"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :step="step"
        :class="[
          'w-full bg-slate-950 border-2 border-indigo-500/60 px-4 py-3 text-ui-main shadow-[0_0_15px_rgba(99,102,241,0.15)] focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] outline-none font-ui-normal text-ui-input tracking-ui transition-all placeholder:text-slate-700 [color-scheme:dark] disabled:opacity-50 rounded-xl',
          $slots.icon ? 'pl-12' : '',
          error ? 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : ''
        ]"
      />

      <!-- Custom Suffix (e.g. TL symbol) -->
      <div v-if="suffix" class="absolute right-4 text-ui-badge font-ui-bold text-slate-600">
        {{ suffix }}
      </div>

      <!-- Arrow for Select -->
      <ChevronDown v-if="type === 'select'" class="w-4 h-4 absolute right-4 text-slate-500 pointer-events-none" />
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-[0.6rem] font-black text-rose-500 tracking-widest mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
      {{ error }}
    </p>

    <!-- Extra Slot (Custom helpers/buttons) -->
    <div v-if="$slots.extra" class="mt-1">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  required: Boolean,
  disabled: [Boolean, Object, String],
  error: String,
  suffix: String,
  rows: { type: Number, default: 3 },
  step: String,
  options: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get() {
    // Normalize null/undefined → '' so placeholder <option value=""> gets selected
    // This prevents dropdown from showing default browser behavior (first option)
    return props.modelValue === null || props.modelValue === undefined ? '' : props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  }
})
</script>

