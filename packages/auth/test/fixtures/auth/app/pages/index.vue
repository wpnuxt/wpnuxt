<template>
  <div>
    <h1>Auth Test Home</h1>
    <div id="auth-status">
      <span v-if="isLoading" id="loading">Loading...</span>
      <span v-else-if="isAuthenticated" id="authenticated">Authenticated</span>
      <span v-else id="unauthenticated">Not Authenticated</span>
    </div>
    <div v-if="user" id="user-info">
      <span id="user-name">{{ user.name }}</span>
      <span id="user-email">{{ user.email }}</span>
    </div>
    <div v-if="error" id="auth-error">
      {{ error }}
    </div>
    <NuxtLink
      v-if="!isAuthenticated"
      id="login-link"
      to="/login"
    >Login</NuxtLink>
    <button
      v-else
      id="logout-btn"
      @click="handleLogout"
    >
      Logout
    </button>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, isLoading, user, error, logout } = useWPAuth()

async function handleLogout() {
  await logout()
}
</script>
