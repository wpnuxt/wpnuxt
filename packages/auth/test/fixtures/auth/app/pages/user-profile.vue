<template>
  <div>
    <h1>User Profile</h1>
    <div id="fetch-status">
      <span v-if="isLoading" id="fetch-loading">Fetching user...</span>
      <span v-else-if="user" id="fetch-success">User loaded</span>
      <span v-else id="fetch-error">No user data</span>
    </div>
    <div v-if="user" id="profile-data">
      <p id="profile-id">
        {{ user.id }}
      </p>
      <p id="profile-databaseId">
        {{ user.databaseId }}
      </p>
      <p id="profile-name">
        {{ user.name }}
      </p>
      <p id="profile-email">
        {{ user.email }}
      </p>
      <p id="profile-username">
        {{ user.username }}
      </p>
    </div>
    <div v-if="error" id="profile-error">
      {{ error }}
    </div>
    <button id="fetch-btn" @click="fetchUser">
      Fetch User
    </button>
    <button id="clear-btn" @click="clearUser">
      Clear User
    </button>
    <div id="role-check">
      <span id="is-admin">{{ isAdmin() ? 'Admin' : 'Not Admin' }}</span>
      <span id="display-name">{{ getDisplayName() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isLoading, error, fetchUser, clearUser, isAdmin, getDisplayName } = useWPUser()
</script>
