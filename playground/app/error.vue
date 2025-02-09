<script setup lang="ts">
import type { PropType } from 'vue'
import type { NuxtError } from '#app'
import { isStaging } from '#imports'

const props = defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})
if (props.error.statusCode !== 404) {
  console.error(props.error.message)
}
const staging = await isStaging()
</script>

<template>
  <UApp>
    <HeaderComponent />
    <UMain>
      <UContainer>
        <UPage>
          <UPageBody>
            <UError :error="error" />
          </UPageBody>
        </UPage>
      </UContainer>
    </UMain>
    <UFooter />
    <StagingBanner
      v-if="staging"
    />
  </UApp>
</template>
