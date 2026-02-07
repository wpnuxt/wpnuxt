<template>
  <div>
    <h1>Protected Page</h1>
    <div id="auth-check">
      <span v-if="isAuthenticated" id="access-granted">Access Granted</span>
      <span v-else id="access-denied">Access Denied</span>
    </div>
    <div v-if="user" id="user-details">
      <p id="detail-name">
        {{ user.name }}
      </p>
      <p id="detail-username">
        {{ user.username }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, user } = useWPAuth()
</script>
