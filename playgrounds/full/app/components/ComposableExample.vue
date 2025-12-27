<script setup lang="ts">
defineProps<{
  code: string
  trigger: () => void
}>()
</script>

<template>
  <div class="grid grid-cols-12 gap-2 mb-2">
    <pre class="col-span-11 m-0 py-2 flex justify-start">
      <pre>{{ code }}</pre>
    </pre>
    <div>
      <UButton
        icon="i-lucide-play"
        aria-label="Run the code"
        @click="trigger"
      />
    </div>
  </div>
</template>
