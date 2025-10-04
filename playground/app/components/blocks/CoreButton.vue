<script setup lang="ts">
interface CoreButtonBlock {
  attributes: {
    url?: string
    text?: string
  }
}

defineProps<{
  block: CoreButtonBlock
}>()
</script>

<template>
  <div>
    <UButton
      :to="block.attributes.url"
      color="yellow"
    >
      <span v-sanitize="block.attributes.text" />
    </UButton>
  </div>
</template>
