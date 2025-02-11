<template>
  <UPage>
    <UPageHeader>
      <UIcon
        name="i-svg-spinners-bars-fade"
        class="mt-[18px] opacity-30"
      />
    </UPageHeader>
    <div class="mt-10 space-y-3">
      <USkeleton class="h-4 w-2/3" />
      <USkeleton class="h-4 w-1/2" />
    </div>
    <div class="mt-10 space-y-3">
      <USkeleton class="h-4 w-2/3" />
      <USkeleton class="h-4 w-1/2" />
    </div>
    <div class="mt-10 space-y-3">
      <USkeleton class="h-4 w-2/3" />
      <USkeleton class="h-4 w-1/2" />
    </div>
    <template #left>
      <PostAside />
    </template>
  </UPage>
</template>
