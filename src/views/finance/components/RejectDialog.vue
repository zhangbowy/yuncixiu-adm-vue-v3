<template>
  <div class="finance-dialog">
    <el-dialog v-dialogDrag :title="$t('驳回申请')" :visible.sync="value" width="30%" :before-close="beforeClose">
      <el-form ref="form" :model="form" :rules="rules" size="small">
        <el-form-item :label="$t('驳回理由')" prop="remark">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit('form')">{{ $t('确定') }}</el-button>
          <el-button @click="beforeClose">{{ $t('取消') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FinanceDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => {

      }
    }
  },
  data() {
    return {
      form: {
        remark: ''
      },
      rules: {
        remark: [
          { required: true, message: `${this.$t('请填写驳回理由')}`, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {

  },
  watch: {
    value: {
      deep: true,
      handler(newValue, old) {
        if (newValue === false) {
          this.form.remark = ''
        }
      }
    }
  },
  created() {

  },
  mounted() {

  },
  methods: {
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.form.cash_id = this.item.cash_id
          this.$emit('submit', this.form)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    beforeClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="sass">

</style>
