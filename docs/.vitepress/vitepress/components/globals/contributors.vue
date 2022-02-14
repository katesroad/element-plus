<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
// @ts-expect-error missing types
import _contributors from '/virtual-contributors'

const props = defineProps<{ id: string }>()
const { theme } = useData()

const contributors = computed(() => _contributors[props.id])
</script>

<template>
  <div class="mb-4">
    <div class="flex flex-wrap gap-4 pt-2">
      <div v-for="c of contributors" :key="c.hash">
        <a
          :href="`https://github.com/${theme.repo}/commits/${
            theme.branch
          }/packages/components/${id}?author=${encodeURIComponent(c.email)}`"
          target="_blank"
          class="flex gap-2 items-center"
        >
          <img
            :src="`https://gravatar.com/avatar/${c.hash}?d=retro`"
            class="w-8 h-8 rounded-full"
          />
          <el-badge :value="c.count">
            <span class="px-2">{{ c.name }}</span>
          </el-badge>
        </a>
      </div>
    </div>
  </div>
</template>
