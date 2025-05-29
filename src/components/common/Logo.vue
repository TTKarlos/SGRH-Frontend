<template>
  <div class="logo-container">
    <svg class="logo" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="40" height="40" rx="5" fill="#4361ee" />
      <text x="60" y="35" font-family="Arial" font-size="20" font-weight="bold" fill="#333">
        RRHH
      </text>
      <text x="60" y="50" font-family="Arial" font-size="12" fill="#666">
        Sistema
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Logo'
}
</script>

<style>
.logo-container {
  display: inline-block;
}

.logo {
  height: 40px;
  width: auto;
}
</style>

