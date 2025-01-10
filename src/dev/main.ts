import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import 'element-plus/dist/index.css'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      name: '姓名',
      age: '年龄',
      type: '类型',
      hobbies: '爱好'
    },
    'en-US': {
      name: 'Name',
      age: 'Age',
      type: 'Type',
      hobbies: 'Hobbies'
    }
  }
})

const app = createApp(App)
app.use(ElementPlus)
app.use(i18n)
app.mount('#app') 