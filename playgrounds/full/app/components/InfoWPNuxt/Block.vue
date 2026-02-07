<script setup lang="ts">
const props = defineProps<{
  block: Record<string, unknown>
}>()

const items = computed(() => [
  {
    label: 'Block Data',
    content: JSON.stringify(props.block, null, 2)
  }
])
</script>

<template>
  <div>
    <h3>WPNuxt Block</h3>
    <UAccordion :items="items">
      <template #body="{ item }">
        <pre>{{ item.content }}</pre>
      </template>
    </UAccordion>
  </div>
</template>
