---
title: 'A Vue 3 UI Framework'
lang: en-US
page: true
---

<vp-script setup>
if (typeof window !== 'undefined') {
  const preferredLang = localStorage.getItem('preferred_lang') || 'en-US'
  window.location.pathname = `/${preferredLang}/`
}
</vp-script>
