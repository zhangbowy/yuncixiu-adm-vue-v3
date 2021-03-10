<template>
  <div class="">
    <el-form ref="settingForm" :model="settingForm" :rules="rules" label-position="left" label-width="140px">
      <div class="form-content-item">
        <!-- <div class="block-title"><card-tag :tag-name="$t('微信设置')" /></div> -->
        <div class="block-content">
          <el-form-item :label="$t('商户号')" prop="mch_id">
            <el-input v-model="settingForm.mch_id" size="small" />
          </el-form-item>
          <el-form-item :label="$t('商户密钥')" prop="wxpay_key">
            <el-input v-model="settingForm.wxpay_key" size="small" />
          </el-form-item>
          <el-form-item label="AppID" prop="appid">
            <el-input v-model="settingForm.appid" size="small" />
          </el-form-item>
          <el-form-item label="AppSecret" prop="appsecret">
            <el-input v-model="settingForm.appsecret" size="small" />
          </el-form-item>
          <el-form-item :label="$t('公众号域名')" prop="domain">
            <el-input v-model="settingForm.domain" size="small">
              <template slot="prepend">http://</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('证书文件')" prop="wxpay_cert_p12">
            <el-upload
              class="upload-demo"
              name="cert"
              :action="baseUrl+'/file/uploadCert'"
              :headers="{'adm_sign': adm_sign}"
              :on-change="handleChange"
              :file-list="fileList"
              :on-remove="removeFile"
              :on-success="uploadSuccess"
              :with-credentials="true"
              :limit="1"
              :on-exceed="uploadExceed"
            >
              <el-button size="small" type="primary">{{ $t('上传证书文件') }}</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item :label="$t('微信验证文件')" prop="verify_file">
            <el-upload
              class="upload-demo"
              name="verify_file"
              :action="baseUrl+'/file/uploadVerify'"
              :headers="{'adm_sign': adm_sign}"
              :on-change="wxVerifyHandleChange"
              :file-list="wxVerifyList"
              :on-remove="wxVerifyRemoveFile"
              :on-success="wxVerifyUploadSuccess"
              :with-credentials="true"
              :limit="1"
              :on-exceed="uploadExceed"
            >
              <el-button size="small" type="primary">{{ $t('上传微信验证文件') }}</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="submitForm('settingForm')">{{ $t('保存') }}</el-button>
            <el-button size="small" @click="resetForm('settingForm')">{{ $t('重置') }}</el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { settingApi } from '@/api/system'
import { getToken } from '@/utils/auth'
export default {
  name: '',
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      adm_sign: getToken(),
      fileList: [],
      wxVerifyList: [],
      settingForm: {
        mch_id: '',
        wxpay_key: '',
        appid: '',
        appsecret: '',
        url: '',
        wxpay_cert_p12: '',
        verify_file: ''
      },
      rules: {
        mch_id: [
          { required: true, message: `${this.$t('请输入微信商户号')}`, trigger: 'blur' }
        ],
        wxpay_key: [
          { required: true, message: `${this.$t('请输入微信支付密钥')}`, trigger: 'blur' },
          { min: 32, max: 32, message: `${this.$t('长度为32个字符')}`, trigger: 'blur' }
        ],
        appid: [
          { required: true, message: `${this.$t('请输入')}AppID`, trigger: 'blur' }
        ],
        appsecret: [
          { required: true, message: `${this.$t('请输入')}AppSecret`, trigger: 'blur' }
        ],
        domain: [
          { required: true, message: `${this.$t('请输入公众号域名')}`, trigger: 'blur' }
        ],
        wxpay_cert_p12: [
          { required: true, message: `${this.$t('请上传证书文件')}`, trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getSetting()
  },
  methods: {
    getSetting() {
      settingApi.getWxConfig().then(res => {
        this.settingForm = res.data
        res.data.wxpay_cert_p12 && this.fileList.push({
          name: res.data.wxpay_cert_p12,
          url: res.data.wxpay_cert_p12
        })
        res.data.verify_file && this.wxVerifyList.push({
          name: res.data.verify_file,
          url: res.data.verify_file
        })
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // alert('submit!')
          settingApi.saveWxConfig(this.settingForm).then(res => {
            this.$message({
              type: 'success',
              message: this.$t(...res.msg) || `${this.$t('保存成功')}!`
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 选择文件
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    wxVerifyHandleChange(file, fileList) {
      this.wxVerifyList = fileList.slice(-3)
    },
    uploadExceed() {
      this.$message({
        type: 'warning',
        message: `${this.$t('超出文件数量限制')},${this.$t('请先删除原文件后重新选择')}!`
      })
    },
    wxVerifyRemoveFile(file, fileList) {
      this.settingForm.verify_file = ''
      this.wxVerifyList = []
    },
    removeFile(file, fileList) {
      this.settingForm.wxpay_cert_p12 = ''
      this.fileList = []
    },
    wxVerifyUploadSuccess(res) {
      if (res.code === 0) {
        this.wxVerifyList.push({
          name: res.data.url,
          url: res.data.url
        })
        this.settingForm.verify_file = res.data.url
      } else {
        this.wxVerifyList = []
        this.$message({
          type: 'error',
          message: this.$t(...res.msg)
        })
      }
    },
    uploadSuccess(res) {
      this.fileList.push({
        name: res.data.url,
        url: res.data.url
      })
      this.settingForm.wxpay_cert_p12 = res.data.url
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

