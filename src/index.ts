import { App } from 'vue'
import ConfigForm from './components/ConfigForm/index.vue'
import type { FormItemRule, ConfigFormProps, ConfigFormEmits, ConfigFormExpose } from './types'

export { ConfigForm }
export type { FormItemRule, ConfigFormProps, ConfigFormEmits, ConfigFormExpose }

export default {
  install(app: App) {
    app.component('ConfigForm', ConfigForm)
  }
} 