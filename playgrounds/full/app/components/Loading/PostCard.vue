<template>
  <UPageCard>
    <template #title>
      <USkeleton class="h-4 w-2/3" />
    </template>
    <template #description>
      <div class="grid gap-2 mt-4 w-full">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-[250px]" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-[250px]" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-[250px]" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-[250px]" />
      </div>
    </template>
    <template #footer>
      <USkeleton class="h-8 w-24" />
    </template>
  </UPageCard>
</template>
