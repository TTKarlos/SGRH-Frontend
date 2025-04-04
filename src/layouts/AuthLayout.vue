<template>
  <div class="auth-layout">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>

<style>
.auth-layout {
  min-height: 100vh;
  background-color: #f5f7fb;
}
</style>

