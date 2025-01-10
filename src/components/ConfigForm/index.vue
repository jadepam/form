<template>
  <el-form
    ref="formRef"
    :model="formState"
    :rules="formRules"
    :label-width="config.layout?.labelWidth"
    :label-position="config.layout?.labelPosition"
  >
    <el-row :gutter="config.layout?.gutter || 0">
      <el-col 
        v-for="field in visibleFields" 
        :key="field.name"
        :span="field.span || 12"
        :offset="field.offset"
        :push="field.push"
        :pull="field.pull"
      >
        <el-form-item
          :label="field.label"
          :prop="field.name"
          :required="isFieldRequired(field)"
        >
          <!-- 展示态 -->
          <template v-if="isPreview">
            <component
              v-if="field.preview?.component"
              :is="field.preview.component"
              :value="formState[field.name]"
              v-bind="field.preview.props || {}"
            />
            <span v-else>{{ formatPreviewValue(field) }}</span>
          </template>

          <!-- 编辑态 -->
          <template v-else>
            <component
              :is="getComponentByType(field)"
              v-model="formState[field.name]"
              v-bind="getComponentProps(field)"
              v-on="getComponentEvents(field)"
              :disabled="isFieldDisabled(field)"
              @update:modelValue="(value:any) => handleFieldChange(field, value)"
            >
              <template v-if="hasOptions(field)">
                <component
                  :is="getOptionComponent(field)"
                  v-for="option in getFieldOptions(field)"
                  :key="(option as any)[field.options?.props?.value || 'value']"
                  :label="(option as any)[field.options?.props?.label || 'label']"
                  :value="(option as any)[field.options?.props?.value || 'value']"
                  :disabled="(option as any)[field.options?.props?.disabled || 'disabled']"
                />
              </template>
            </component>
          </template>

          <div v-if="field.tips" class="field-tips">{{ field.tips }}</div>
        </el-form-item>
      </el-col>
    </el-row>

    <div class="form-actions">
      <slot name="actions">
        <el-button @click="formRef?.resetFields()">重置</el-button>
        <el-button type="primary" @click="formRef?.validate()">提交</el-button>
      </slot>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { FormInstance as ElFormInstance } from 'element-plus'
import { componentMap } from './componentMap'
import type { 
  FormConfig, 
  FieldConfig, 
  FormInstance,
  OptionItem,
} from '../../types'

// 组件属性定义
const props = defineProps<{
  config: FormConfig          // 表单配置
  modelValue: Record<string, any>  // 表单数据
  isPreview?: boolean        // 是否为预览模式
}>()

// 组件事件
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'field-change': [fieldName: string, value: any, form: Record<string, any>]
}>()

// 表单实例引用
const formRef = ref<ElFormInstance>()
// 表单状态数据
const formState = ref<Record<string, any>>({})
// 字段选项缓存
const optionsCache = ref<Record<string, OptionItem[]>>({})

// 计算可见字段列表
const visibleFields = computed(() => {
  return props.config.fields.filter(field => !isFieldHidden(field))
})

// 构建表单校验规则
const formRules = computed(() => {
  const rules: Record<string, any[]> = {}
  props.config.fields.forEach(field => {
    if (field.rules || field.required) {
      rules[field.name] = buildFieldRules(field)
    }
  })
  return rules
})

// 初始化表单
onMounted(async () => {
  initFormState()
  initWatchers()
  await initDynamicOptions()
})

// 初始化表单状态
function initFormState() {
  const state: Record<string, any> = {}
  props.config.fields.forEach(field => {
    state[field.name] = props.modelValue[field.name] ?? field.defaultValue
  })
  formState.value = state
}

// 初始化表单联动监听器
function initWatchers() {
  props.config.watchers?.forEach(watcher => {
    watch(
      () => watcher.fields.map(field => formState.value[field]),
      (newValues) => {
        const deps = Object.fromEntries(
          watcher.fields.map((field, index) => [field, newValues[index]])
        )
        watcher.handler(deps, getFormInstance())
      },
      { immediate: watcher.immediate }
    )
  })
}

// 初始化动态选项
async function initDynamicOptions() {
  const dynamicFields = props.config.fields.filter(
    field => field.options?.type === 'dynamic'
  )
  
  for (const field of dynamicFields) {
    if (field.options?.source && typeof field.options.source === 'function') {
      try {
        const options = await field.options.source()
        optionsCache.value[field.name] = options
      } catch (error) {
        console.error(`Failed to fetch options for field ${field.name}:`, error)
      }
    }
  }
}

// 获取组件类型
function getComponentByType(field: FieldConfig):any {
  if (field.component) {
    return field.component
  }
  return componentMap[field.type] || componentMap['input']
}

// 获取组件属性
function getComponentProps(field: FieldConfig): Record<string, any> {
  return field.props || {}
}

// 获取组件事件
function getComponentEvents(field: FieldConfig): Record<string, Function> {
  return field.events || {}
}

// 处理字段值变化
function handleFieldChange(field: FieldConfig, value: any) {
  // 更新表单数据
  formState.value[field.name] = value
  
  // 触发字段值变化事件
  emit('field-change', field.name, value, formState.value)
  
  // 处理字段联动
  handleFieldDependencies(field)
  
  // 更新表单值
  emit('update:modelValue', { ...formState.value })
}

// 处理字段联动
async function handleFieldDependencies(field: FieldConfig) {
  // 处理显式配置的依赖
  field.dependencies?.forEach(dep => {
    const depValues = dep.fields.map(f => formState.value[f])
    const deps = Object.fromEntries(
      dep.fields.map((f, i) => [f, depValues[i]])
    )
    dep.handler(deps, getFormInstance())
  })

  // 处理内置的联动场景
  const dependentFields = props.config.fields.filter(f => 
    f.options?.type === 'dynamic' && 
    f.dependencies?.some(dep => dep.fields.includes(field.name))
  )

  for (const depField of dependentFields) {
    const source = depField.options?.source
    if (typeof source === 'function') {
      try {
        const options = await source()
        optionsCache.value[depField.name] = options
        // 如果当前值不在新选项中，清空该字段
        const validValues = options.map(opt => opt.value)
        if (!validValues.includes(formState.value[depField.name])) {
          formState.value[depField.name] = undefined
        }
      } catch (error) {
        console.error(`Failed to update options for field ${depField.name}:`, error)
      }
    }
  }
}

// 获取字段选项
function getFieldOptions(field: FieldConfig): OptionItem[] {
  if (!field.options) return []
  
  if (field.options.type === 'static') {
    return field.options.source as OptionItem[]
  }
  
  return optionsCache.value[field.name] || []
}

// 格式化预览值
function formatPreviewValue(field: FieldConfig): any {
  const value = formState.value[field.name]
  if (field.preview?.formatter) {
    return field.preview.formatter(value, formState.value)
  }
  return value
}

// 表单实例方法
function getFormInstance(): FormInstance {
  return {
    getFieldValue: (name: string) => formState.value[name],
    setFieldValue: (name: string, value: any) => {
      formState.value[name] = value
      // 触发联动处理
      const field = props.config.fields.find(f => f.name === name)
      if (field) {
        handleFieldDependencies(field)
      }
    },
    setOptions: (name: string, options: OptionItem[]) => {
      optionsCache.value[name] = options
      // 如果当前值不在新选项中，清空该字段
      const currentValue = formState.value[name]
      const validValues = options.map(opt => opt.value)
      if (!validValues.includes(currentValue)) {
        formState.value[name] = undefined
      }
    },
    validate: () => formRef.value?.validate() || Promise.resolve(false),
    resetFields: () => formRef.value?.resetFields(),
    clearValidate: (props?: string | string[]) => formRef.value?.clearValidate(props)
  }
}

// 辅助函数
function isFieldHidden(field: FieldConfig): boolean {
  if (typeof field.hidden === 'function') {
    return field.hidden(formState.value)
  }
  return !!field.hidden
}

function isFieldDisabled(field: FieldConfig): boolean {
  if (typeof field.disabled === 'function') {
    return field.disabled(formState.value)
  }
  return !!field.disabled
}

function isFieldRequired(field: FieldConfig): boolean {
  return field.required || (field.rules?.some(rule => 
    typeof rule === 'object' && rule.required
  ) ?? false)
}

function buildFieldRules(field: FieldConfig) {
  const rules = [...(field.rules || [])]
  if (field.required && !rules.some(rule => 
    typeof rule === 'object' && rule.required
  )) {
    rules.unshift({ required: true, message: `请输入${field.label}` })
  }
  return rules
}

function hasOptions(field: FieldConfig): boolean {
  return !!field.options
}

function getOptionComponent(field: FieldConfig): string {
  const optionMap = {
    'select': 'el-option',
    'radio': 'el-radio',
    'checkbox': 'el-checkbox'
  } as const
  
  return optionMap[field.type as keyof typeof optionMap] || 'div'
}



// 暴露方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  getFieldValue: (name: string) => formState.value[name],
  setFieldValue: (name: string, value: any) => {
    formState.value[name] = value
  }
})
</script>

<style scoped>
.form-group {
  margin-bottom: 32px;
}

.group-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid var(--el-color-primary);
}

.form-actions {
  margin-top: 32px;
  text-align: center;
}
</style>