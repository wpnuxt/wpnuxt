<script setup lang="ts">
const { isAuthenticated, logout, user: authUser } = useWPAuth()
const { user, fetchUser, isLoading, getDisplayName, getAvatarUrl, isAdmin, hasRole } = useWPUser()
const router = useRouter()

// Redirect to login if not authenticated
watch(isAuthenticated, (value) => {
  if (!value) {
    router.push('/login')
  }
}, { immediate: true })

// Fetch user data when authenticated
onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    await fetchUser()
  }
})

async function handleLogout() {
  await logout()
}

// Use authUser from OAuth if user from GraphQL is not available
const displayUser = computed(() => user.value || authUser.value)
const displayName = computed(() => {
  if (user.value) return getDisplayName()
  const u = authUser.value
  if (!u) return 'User'
  return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'User'
})
const avatarUrl = computed(() => {
  if (user.value) return getAvatarUrl()
  return authUser.value?.avatar?.url || null
})
</script>

<template>
  <UContainer class="max-w-2xl py-16">
    <UCard v-if="isAuthenticated">
      <template #header>
        <UUser
          :name="displayName"
          :description="displayUser?.username ? `@${displayUser.username}` : displayUser?.email"
          :avatar="{ src: avatarUrl || undefined, icon: 'i-lucide-user' }"
          size="xl"
        />
      </template>

      <div
        v-if="isLoading"
        class="flex justify-center py-8"
      >
        <UIcon
          name="i-svg-spinners-ring-resize"
          class="size-8"
        />
      </div>

      <div
        v-else-if="displayUser"
        class="space-y-6"
      >
        <!-- User Info Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-if="displayUser.email">
            <p class="text-sm font-medium text-muted mb-1">
              Email
            </p>
            <p>{{ displayUser.email }}</p>
          </div>

          <div v-if="displayUser.firstName || displayUser.lastName">
            <p class="text-sm font-medium text-muted mb-1">
              Full Name
            </p>
            <p>{{ displayUser.firstName }} {{ displayUser.lastName }}</p>
          </div>

          <div v-if="displayUser.username">
            <p class="text-sm font-medium text-muted mb-1">
              Username
            </p>
            <p>{{ displayUser.username }}</p>
          </div>

          <div v-if="displayUser.nickname && displayUser.nickname !== displayUser.username">
            <p class="text-sm font-medium text-muted mb-1">
              Nickname
            </p>
            <p>{{ displayUser.nickname }}</p>
          </div>
        </div>

        <!-- Bio -->
        <div v-if="displayUser.description">
          <p class="text-sm font-medium text-muted mb-1">
            Bio
          </p>
          <p class="text-gray-600 dark:text-gray-400">
            {{ displayUser.description }}
          </p>
        </div>

        <!-- Roles -->
        <div v-if="displayUser.roles?.nodes?.length">
          <p class="text-sm font-medium text-muted mb-2">
            Roles
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="role in displayUser.roles.nodes"
              :key="role.name"
              :color="role.name === 'administrator' ? 'error' : role.name === 'editor' ? 'warning' : 'neutral'"
              variant="subtle"
              size="lg"
            >
              {{ role.name }}
            </UBadge>
          </div>
        </div>

        <!-- Admin Alert -->
        <UAlert
          v-if="isAdmin()"
          color="info"
          variant="subtle"
          title="Administrator access"
          description="You have full access to the WordPress admin panel."
          icon="i-lucide-shield-check"
        />

        <!-- Editor Alert -->
        <UAlert
          v-else-if="hasRole('editor')"
          color="warning"
          variant="subtle"
          title="Editor access"
          description="You can create and edit posts and pages."
          icon="i-lucide-pencil"
        />
      </div>

      <!-- No user data -->
      <div
        v-else
        class="py-4 text-center text-muted"
      >
        <p>You are signed in but user details could not be loaded.</p>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            color="error"
            variant="soft"
            icon="i-lucide-log-out"
            @click="handleLogout"
          >
            Sign out
          </UButton>
        </div>
      </template>
    </UCard>

    <div
      v-else
      class="text-center py-16"
    >
      <p class="text-muted mb-4">
        Please sign in to view your profile.
      </p>
      <UButton to="/login">
        Sign in
      </UButton>
    </div>
  </UContainer>
</template>
