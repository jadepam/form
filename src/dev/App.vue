<template>
  <div class="form-example">
    <div class="form-header">
      <h2>复杂表单示例</h2>
      <el-button @click="togglePreview">
        {{ isPreview ? '编辑模式' : '预览模式' }}
      </el-button>
    </div>

    <config-form
      ref="formRef"
      v-model="formData"
      :config="formConfig"
      :is-preview="isPreview"
      @field-change="handleFieldChange"
    >
      <template #actions>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </config-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfigForm from '@/components/ConfigForm/index.vue'
import type { FormConfig } from '@/types'
import MyCustomInput from './components/MyCustomInput.vue'

// 表单数据
const formData = ref({
  name: '',
  gender: '',
  birthday: '',
  age: '',
  education: '',
  major: '',
  skills: [],
  experience: 0,
  salary: [0, 0],
  employmentType: '',
  workTime: '',
  department: '',
  position: '',
  description: '',
  attachments: [],
  agreement: false,
  custom1: '',
  custom2: ''
})

// 预览状态
const isPreview = ref(false)
const formRef = ref()

// 表单配置
const formConfig: FormConfig = {
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      span: 8,  // 占据8列
      required: true,
      rules: [
        { min: 2, max: 20, message: '长度在 2 到 20 个字符' }
      ],
      props: {
        placeholder: '请输入姓名',
        maxlength: 20,
        showWordLimit: true
      }
    },
    {
      name: 'gender',
      label: '性别',
      type: 'radio',
      span: 8,  // 占据8列
      required: true,
      options: {
        type: 'static',
        source: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ]
      }
    },
    {
      name: 'birthday',
      label: '出生日期',
      type: 'date',
      required: true,
      props: {
        valueFormat: 'YYYY-MM-DD',
        disabledDate: (time: Date) => time.getTime() > Date.now()
      },
      dependencies: [{
        fields: ['birthday'],
        handler: (deps, form) => {
          if (deps.birthday) {
            const age = new Date().getFullYear() - new Date(deps.birthday).getFullYear()
            form.setFieldValue('age', age)
          }
        }
      }]
    },
    {
      name: 'age',
      label: '年龄',
      type: 'input',
      props: {
        disabled: true
      }
    },

    // 教育背景
    {
      name: 'education',
      label: '学历',
      type: 'select',
      required: true,
      options: {
        type: 'static',
        source: [
          { label: '高中', value: 'highschool' },
          { label: '大专', value: 'college' },
          { label: '本科', value: 'bachelor' },
          { label: '硕士', value: 'master' },
          { label: '博士', value: 'phd' }
        ]
      }
    },
    {
      name: 'major',
      label: '专业',
      type: 'select',
      required: true,
      disabled: form => !form.education,
      options: {
        type: 'dynamic',
        source: async () => {
          // 模拟异步获取专业列表
          return [
            { label: '计算机科学', value: 'cs' },
            { label: '软件工程', value: 'se' },
            { label: '信息技术', value: 'it' }
          ]
        },
        cache: true
      }
    },

    // 技能和经验
    {
      name: 'skills',
      label: '技能',
      type: 'checkbox',
      options: {
        type: 'static',
        source: [
          { label: 'Vue', value: 'vue' },
          { label: 'React', value: 'react' },
          { label: 'Angular', value: 'angular' },
          { label: 'Node.js', value: 'nodejs' }
        ]
      }
    },
    {
      name: 'experience',
      label: '工作经验',
      type: 'slider',
      props: {
        min: 0,
        max: 10,
        step: 0.5,
        showStops: true,
        marks: {
          0: '应届',
          3: '3年',
          5: '5年',
          10: '10年+'
        }
      }
    },
    {
      name: 'salary',
      label: '期望薪资',
      type: 'slider',
      props: {
        range: true,
        min: 0,
        max: 50,
        step: 5,
        marks: {
          0: '0k',
          10: '10k',
          20: '20k',
          30: '30k',
          40: '40k',
          50: '50k+'
        }
      }
    },

    // 工作信息
    {
      name: 'employmentType',
      label: '工作类型',
      type: 'select',
      required: true,
      options: {
        type: 'static',
        source: [
          { label: '全职', value: 'fulltime' },
          { label: '兼职', value: 'parttime' },
          { label: '实习', value: 'intern' }
        ]
      }
    },
    {
      name: 'workTime',
      label: '工作时间',
      type: 'time',
      hidden: form => form.employmentType !== 'parttime',
      props: {
        isRange: true,
        rangeSeparator: '至',
        placeholder: '选择工作时间范围'
      }
    },
    {
      name: 'department',
      label: '部门',
      type: 'select',
      required: true,
      options: {
        type: 'static',
        source: [
          { label: '技术部', value: 'tech' },
          { label: '产品部', value: 'product' },
          { label: '设计部', value: 'design' }
        ]
      }
    },
    {
      name: 'position',
      label: '职位',
      type: 'select',
      required: true,
      dependencies: [{
        fields: ['department'],
        handler: (deps, form) => {
          const positionMap = {
            tech: [
              { label: '前端工程师', value: 'frontend' },
              { label: '后端工程师', value: 'backend' }
            ],
            product: [
              { label: '产品经理', value: 'pm' },
              { label: '产品运营', value: 'po' }
            ],
            design: [
              { label: 'UI设计师', value: 'ui' },
              { label: 'UX设计师', value: 'ux' }
            ]
          }
          form.setOptions('position', positionMap[deps.department as keyof typeof positionMap] || [])
        }
      }]
    },

    // 其他信息
    {
      name: 'description',
      label: '个人描述',
      type: 'textarea',
      span: 24,  // 占据整行
      props: {
        rows: 4,
        maxlength: 500,
        showWordLimit: true
      }
    },
    {
      name: 'attachments',
      label: '附件',
      type: 'upload',
      props: {
        action: '/api/upload',
        multiple: true,
        limit: 5,
        accept: '.pdf,.doc,.docx',
        'list-type': 'picture-card',
        'on-exceed': () => {
          alert('最多上传5个文件')
        }
      }
    },
    {
      name: 'agreement',
      label: '同意协议',
      type: 'switch',
      required: true,
      props: {
        activeText: '同意',
        inactiveText: '不同意'
      }
    },
    {
      name: 'custom1',
      label: '自定义搜索1',
      type: 'my-custom-input',
      span: 12,
      props: {
        placeholder: '请输入搜索关键词'
      },
      events: {
        search: (value: string) => {
          console.log('搜索:', value)
        }
      }
    },
    {
      name: 'custom2',
      label: '自定义搜索2',
      type: 'custom',
      span: 12,
      component: MyCustomInput,
      props: {
        placeholder: '请输入搜索内容'
      },
      events: {
        search: (value: string) => {
          console.log('搜索:', value)
        }
      }
    }
  ],
  
  layout: {
    labelWidth: '100px',
    labelPosition: 'right',
    gutter: 20
  },

  // 表单级联动
  watchers: [
    {
      fields: ['education', 'experience'],
      handler: (values, form) => {
        // 根据学历和经验自动推荐职位
        console.log('教育和经验变化:', values)
      }
    },
    {
      fields: ['skills'],
      handler: (values, form) => {
        // 根据技能自动推荐部门
        if (values.skills?.includes('vue') || values.skills?.includes('react')) {
          form.setFieldValue('department', 'tech')
        }
      }
    }
  ],

  // 验证配置
  validate: {
    trigger: 'blur',
    first: true,
    scroll: true
  }
}

// 切换预览状态
const togglePreview = () => {
  isPreview.value = !isPreview.value
}

// 处理字段变化
const handleFieldChange = (field: string, value: any, form: any) => {
  console.log('字段变化:', field, value, form)
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    console.log('表单数据:', formData.value)
    // 处理表单提交逻辑
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.form-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--el-text-color-primary);
}
</style>