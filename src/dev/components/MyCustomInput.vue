<template>
  <div class="my-custom-input">
    <el-input
      v-model="inputValue"
      :placeholder="placeholder"
      class="custom-input"
    >
      
      <template #append>
        <el-button @click="handleSearch">
          搜索
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [value: string]
}>()

const inputValue = ref(props.modelValue || '')

// 监听输入值变化
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// 处理搜索
const handleSearch = () => {
  emit('search', inputValue.value)
}
</script>

<style scoped>
.my-custom-input {
  display: flex;
  align-items: center;
}

.custom-input {
  flex: 1;
}
</style> 