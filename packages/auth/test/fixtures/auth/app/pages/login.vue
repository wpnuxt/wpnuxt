<template>
  <div>
    <h1>Login Page</h1>
    <form id="login-form" @submit.prevent="handleLogin">
      <div>
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          name="username"
          required
        >
      </div>
      <div>
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          required
        >
      </div>
      <button
        id="submit-btn"
        type="submit"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <div v-if="loginError" id="login-error">
      {{ loginError }}
    </div>
    <div v-if="loginSuccess" id="login-success">
      Login successful!
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, isLoading } = useWPAuth()

const username = ref('')
const password = ref('')
const loginError = ref('')
const loginSuccess = ref(false)

async function handleLogin() {
  loginError.value = ''
  loginSuccess.value = false

  const result = await login({
    username: username.value,
    password: password.value
  })

  if (result.success) {
    loginSuccess.value = true
    await navigateTo('/')
  } else {
    loginError.value = result.error || 'Login failed'
  }
}
</script>
