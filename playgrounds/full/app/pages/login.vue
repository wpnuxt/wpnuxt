<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField, ButtonProps } from '@nuxt/ui'

interface HeadlessLoginProvider {
  name: string
  provider: string
  authorizationUrl: string
  isEnabled: boolean
}

const {
  login,
  loginWithProvider,
  isLoading,
  error,
  isAuthenticated,
  getProviders,
  fetchHeadlessLoginProviders
} = useWPAuth()
const router = useRouter()

// Get configured redirect path
const config = useRuntimeConfig().public.wpNuxtAuth
const redirectPath = config.redirectOnLogin || '/'

// Get available auth providers
const authProviders = getProviders()
const showPasswordAuth = authProviders.password
const showOAuthAuth = authProviders.oauth
const showHeadlessLogin = authProviders.headlessLogin

// Headless Login providers (fetched from WordPress)
const headlessLoginProviders = ref<HeadlessLoginProvider[]>([])
const loadingProviders = ref(false)

// Fetch Headless Login providers on mount
onMounted(async () => {
  if (showHeadlessLogin) {
    loadingProviders.value = true
    headlessLoginProviders.value = await fetchHeadlessLoginProviders()
    loadingProviders.value = false
  }
})

// Map provider to icon
function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    GOOGLE: 'i-simple-icons-google',
    GITHUB: 'i-simple-icons-github',
    FACEBOOK: 'i-simple-icons-facebook',
    LINKEDIN: 'i-simple-icons-linkedin',
    INSTAGRAM: 'i-simple-icons-instagram'
  }
  return icons[provider] || 'i-lucide-log-in'
}

// Build providers array for UAuthForm
const providers = computed<ButtonProps[]>(() => {
  const result: ButtonProps[] = []

  // Add Headless Login providers (Google, GitHub, etc.)
  if (showHeadlessLogin) {
    for (const provider of headlessLoginProviders.value) {
      result.push({
        label: `Sign in with ${provider.name}`,
        icon: getProviderIcon(provider.provider),
        onClick: () => loginWithProvider(provider.provider)
      })
    }
  }

  // Add miniOrange OAuth provider
  if (showOAuthAuth) {
    result.push({
      label: 'Sign in with WordPress',
      icon: 'i-lucide-log-in',
      to: '/api/auth/oauth/authorize',
      external: true
    })
  }

  return result
})

// Form fields for password auth
const fields: AuthFormField[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Enter your username',
    autocomplete: 'username',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    autocomplete: 'current-password',
    required: true
  }
]

// Validation
function validate(state: { username?: string, password?: string }) {
  const errors: { name: string, message: string }[] = []
  if (!state.username) errors.push({ name: 'username', message: 'Username is required' })
  if (!state.password) errors.push({ name: 'password', message: 'Password is required' })
  return errors
}

// Form submit handler
async function onSubmit(event: FormSubmitEvent<{ username: string, password: string }>) {
  const result = await login({
    username: event.data.username,
    password: event.data.password
  })

  if (result.success) {
    router.push(redirectPath)
  }
}

// Redirect if already authenticated
watch(isAuthenticated, (value) => {
  if (value) {
    router.push(redirectPath)
  }
}, { immediate: true })
</script>

<template>
  <UContainer class="max-w-md py-16">
    <UPageCard>
      <!-- Loading state for providers -->
      <div
        v-if="showHeadlessLogin && loadingProviders"
        class="flex justify-center py-8"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin text-gray-400 size-6"
        />
      </div>

      <!-- Auth form -->
      <UAuthForm
        v-else-if="showPasswordAuth || providers.length"
        title="Login"
        description="Sign in with your WordPress account"
        :fields="showPasswordAuth ? fields : []"
        :providers="providers"
        :separator="showPasswordAuth && providers.length ? 'or' : undefined"
        :validate="validate"
        :loading="isLoading"
        :submit="showPasswordAuth ? { label: 'Sign in' } : undefined"
        @submit="onSubmit"
      >
        <!-- Error alert -->
        <template
          v-if="error"
          #validation
        >
          <UAlert
            color="error"
            variant="subtle"
            :title="error"
            icon="i-lucide-alert-circle"
          />
        </template>
      </UAuthForm>

      <!-- No auth methods message -->
      <UAlert
        v-else
        color="warning"
        variant="subtle"
        title="No authentication methods configured"
        icon="i-lucide-alert-triangle"
      />
    </UPageCard>
  </UContainer>
</template>
