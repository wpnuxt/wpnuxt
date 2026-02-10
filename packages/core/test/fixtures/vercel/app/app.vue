<template>
  <div id="vercel-test">
    <h1>Vercel SSR Test</h1>
    <div v-sanitize-html="'<p>This is <strong>sanitized</strong> HTML content.</p>'" />
  </div>
</template>
