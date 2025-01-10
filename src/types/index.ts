import type { Component } from 'vue'
import type { FormItemRule } from 'element-plus'

// 导出 FormItemRule 类型
export type {FormItemRule}

// 选项项目接口 - 用于下拉框、单选、多选等选项类型组件
export interface OptionItem {
  label: string                // 选项显示文本
  value: any                   // 选项值
  disabled?: boolean           // 是否禁用
  [key: string]: any          // 其他可能的自定义属性
}

// 自定义表单验证函数类型
export type CustomValidateFunction = (rule: any, value: any, callback: (error?: Error) => void) => void

// 字段配置接口 - 描述表单中单个字段的完整配置
export interface FieldConfig {
  name: string                    // 字段名称，用于表单数据绑定
  label: string                   // 字段标签文本
  type: ComponentType             // 字段组件类型
  defaultValue?: any              // 默认值
  tips?: string                   // 提示信息
  required?: boolean              // 是否必填
  disabled?: boolean | ((form: Record<string, any>) => boolean)    // 是否禁用（可以是布尔值或函数）
  hidden?: boolean | ((form: Record<string, any>) => boolean)      // 是否隐藏（可以是布尔值或函数）
  props?: Record<string, any>     // 传递给组件的属性
  events?: Record<string, Function> // 组件事件处理器

  // 验证规则数组
  rules?: (FormItemRule | CustomValidateFunction)[]
  
  // 预览模式配置
  preview?: {
    component?: Component         // 自定义预览组件
    formatter?: (value: any, form: Record<string, any>) => any  // 预览值格式化函数
    props?: Record<string, any>   // 预览组件的属性
  }
  
  // 字段依赖配置
  dependencies?: {
    fields: string[]             // 依赖的字段名数组
    handler: (deps: Record<string, any>, form: FormInstance) => void  // 依赖处理函数
  }[]
  
  // 选项配置（用于选择类组件）
  options?: {
    type: 'static' | 'dynamic'   // 选项类型：静态或动态
    source: OptionItem[] | (() => Promise<OptionItem[]>)  // 选项数据源
    props?: {                    // 选项属性映射
      label?: string            // 标签字段名
      value?: string           // 值字段名
      disabled?: string        // 禁用字段名
    }
    cache?: boolean            // 是否缓存动态选项
  }

  // 栅格布局相关配置
  span?: number        // 栅格占据的列数，默认12表示独占一行
  offset?: number      // 栅格左侧的间隔格数
  push?: number        // 栅格向右移动格数
  pull?: number        // 栅格向左移动格数

  component?: Component  // 自定义组件
}

// 支持的组件类型枚举
export type ComponentType = 
  | 'input'                 // 输入框
  | 'textarea'             // 文本域
  | 'select'               // 下拉选择
  | 'radio'                // 单选框
  | 'checkbox'             // 复选框
  | 'date'                 // 日期选择器
  | 'time'                 // 时间选择器
  | 'datetime'             // 日期时间选择器
  | 'number'               // 数字输入框
  | 'switch'               // 开关
  | 'slider'               // 滑块
  | 'upload'               // 上传
  | (string & {}) // 支持任意字符串作为自定义组件类型

// 表单实例接口 - 定义表单组件对外暴露的方法
export interface FormInstance {
  getFieldValue: (name: string) => any              // 获取字段值
  setFieldValue: (name: string, value: any) => void // 设置字段值
  setOptions: (name: string, options: OptionItem[]) => void  // 设置字段选项
  validate: () => Promise<boolean>                  // 表单验证
  resetFields: () => void                          // 重置表单
  clearValidate: (props?: string | string[]) => void  // 清除验证
}

// 表单配置接口 - 整个表单的配置信息
export interface FormConfig {
  fields: FieldConfig[]           // 字段配置数组
  layout?: {
    labelWidth?: string          // 标签宽度
    labelPosition?: 'left' | 'right' | 'top'  // 标签位置
    gutter?: number             // 栅格间隔
  }
  
  // 表单级别的监听器配置
  watchers?: {
    fields: string[]            // 监听的字段
    immediate?: boolean         // 是否立即触发
    handler: (values: Record<string, any>, form: FormInstance) => void  // 监听处理函数
  }[]
  
  // 验证配置
  validate?: {
    trigger?: 'blur' | 'change' | 'submit'  // 验证触发方式
    first?: boolean            // 是否在发现第一个验证错误时停止
    scroll?: boolean           // 是否滚动到错误字段
  }
}

// 组件属性接口 - 定义组件接收的 props
export interface ConfigFormProps {
  config: FormConfig              // 表单配置
  modelValue: Record<string, any> // 表单数据
  isPreview?: boolean            // 是否为预览模式
}

// 组件事件接口 - 定义组件触发的事件
export interface ConfigFormEmits {
  (e: 'update:modelValue', value: Record<string, any>): void           // 更新表单数据
  (e: 'field-change', fieldName: string, value: any, form: Record<string, any>): void  // 字段值变化
}

// 组件暴露方法接口 - 定义组件对外暴露的方法
export interface ConfigFormExpose {
  validate: () => Promise<boolean>                  // 表单验证
  resetFields: () => void                          // 重置表单
  clearValidate: (props?: string | string[]) => void  // 清除验证
  getFieldValue: (name: string) => any              // 获取字段值
  setFieldValue: (name: string, value: any) => void // 设置字段值
  setOptions: (name: string, options: OptionItem[]) => void  // 设置字段选项
}