<script setup lang="ts">
const orderField = defineModel<string>('orderField', { required: true })
const order = defineModel<'ASC' | 'DESC'>('order', { required: true })

const orderFieldOptions = [
  { label: 'Date', value: 'DATE' },
  { label: 'Title', value: 'TITLE' },
  { label: 'Modified', value: 'MODIFIED' },
  { label: 'Author', value: 'AUTHOR' },
  { label: 'Comment count', value: 'COMMENT_COUNT' }
]

const orderFieldItems = computed(() =>
  orderFieldOptions.map(opt => ({
    label: opt.label,
    icon: orderField.value === opt.value ? 'i-lucide-check' : undefined,
    onSelect: () => {
      orderField.value = opt.value
    }
  }))
)

const currentOrderFieldLabel = computed(() =>
  orderFieldOptions.find(o => o.value === orderField.value)?.label ?? 'Date'
)
</script>

<template>
  <div class="flex justify-end gap-2 mb-6">
    <UDropdownMenu :items="orderFieldItems">
      <UButton
        icon="i-lucide-arrow-up-down"
        trailing-icon="i-lucide-chevron-down"
        variant="ghost"
        size="sm"
      >
        Order by: {{ currentOrderFieldLabel }}
      </UButton>
    </UDropdownMenu>
    <UButton
      :icon="order === 'ASC' ? 'i-lucide-arrow-down-narrow-wide' : 'i-lucide-arrow-up-narrow-wide'"
      variant="ghost"
      size="sm"
      @click="order = order === 'ASC' ? 'DESC' : 'ASC'"
    >
      {{ order === 'ASC' ? 'Ascending' : 'Descending' }}
    </UButton>
  </div>
</template>
