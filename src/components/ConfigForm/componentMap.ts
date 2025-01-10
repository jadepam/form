import type { Component } from 'vue'
import {
  ElInput,
  ElSelect,
  ElDatePicker,
  ElSwitch,
  ElRadioGroup,
  ElCheckboxGroup,
  ElInputNumber,
  ElTimePicker,
  ElSlider,
  ElUpload
} from 'element-plus'
import { ComponentType } from '@/types'

export const componentMap: Record<ComponentType, Component> = {
  'input': ElInput,
  'textarea': ElInput,
  'select': ElSelect,
  'radio': ElRadioGroup,
  'checkbox': ElCheckboxGroup,
  'date': ElDatePicker,
  'time': ElTimePicker,
  'datetime': ElDatePicker,
  'number': ElInputNumber,
  'switch': ElSwitch,
  'slider': ElSlider,
  'upload': ElUpload,
  'custom': ElInput // 默认使用 ElInput
} 