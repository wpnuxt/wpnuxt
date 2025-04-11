<template>
  <div>
    <header>
      <WPNuxtLogo />
      <Navigation />
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: 'DM Sans', sans-serif;
}
header, main {
  max-width: 1024px;
  margin: 0 auto;
  padding: 10px;
}
a {
  color: #666;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid rgb(186 175 78 / 1);
}
a:hover {
  border-bottom: 1px solid #333;
}
</style>
