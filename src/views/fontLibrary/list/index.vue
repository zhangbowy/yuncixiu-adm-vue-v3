<template>
  <div class="fonts-list main-content">
    <div class="screen-box">
      <div class="operation">
        <el-select v-model="fontType" size="small" clearable :placeholder="$t('请选择字体类型')" class="selector">
          <el-option
            v-for="item in fontTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button v-has="701" size="small" icon="el-icon-upload" type="primary" @click="showDialog('add')">{{ $t('上传') }}</el-button>
      </div>
    </div>
    <div class="content">
      <el-table
        v-loading="loading"
        :data="fontsList"
        style="width: 100%"
        fit
        highlight-current-row
        tooltip-effect="dark"
      >
        <el-table-column
          :label="$t('序号')"
          align="center"
          width="100"
          type="index"
        />
        <el-table-column
          prop="font_name"
          :label="$t('字体名称')"
          align="center"
        />
        <el-table-column
          :label="$t('样板展示')"
          align="center"
        >
          <template slot-scope="scope">
            <img :key="scope.row.preview_image" :src="scope.row.preview_image" alt="" height="40">
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('操作')"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click.native="showDialog('edit',scope.row)"
            >{{ $t('编辑') }}</el-button>
            <el-button
              size="mini"
              @click.native="showDetail(scope.row)"
            >{{ $t('查看') }}</el-button>
            <el-button
              v-has="702"
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.font_id)"
            >{{ $t('删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <!-- <div class="pagination-box">
        <el-pagination
          :total="total"
          :current-page="currentPage"
          :page-sizes="[5, 10, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div> -->
    </div>
    <!-- 新增字体 -->
    <el-dialog v-dialogDrag center :title="dialogType=='add'?`${$t('新增字体')}`: `${$t('修改字体')}`" :visible.sync="fontDialog">
      <el-form ref="fontForm" :model="fontForm" :rules="rules" label-width="80px" label-position="left" size="small">
        <el-form-item :label="$t('字体名称')" prop="font_name">
          <el-input v-model="fontForm.font_name " :disabled="dialogType=='detail'" />
        </el-form-item>
        <el-form-item :label="$t('最小高度')" prop="min_height">
          <el-input-number v-model="fontForm.min_height" :min="8" :max="80" :label="$t('字体最小高度')" />
        </el-form-item>
        <el-form-item :label="$t('最大高度')" prop="max_height">
          <el-input-number v-model="fontForm.max_height" :min="fontForm.min_height" :max="80" :label="$t('字体最大高度')" />
        </el-form-item>
        <!-- <el-form-item :label="$t('预览图')" prop="preview_img">
          <el-upload
            class="logo-uploader"
            :action="`${baseUrl}/design/uploadImg`"
            name="image"
            :headers="{'adm_sign': token}"
            :file-list="fileList"
            :with-credentials="true"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :disabled="dialogType=='detail'"
          >
            <img v-if="imageUrl" :src="imageUrl" class="logo">
            <i v-else class="el-icon-plus logo-uploader-icon" />
          </el-upload>
        </el-form-item> -->
        <el-form-item :label="$t('样板展示')" prop="preview_image">
          <img-upload
            :img-data="fontForm.preview_image"
            :pic-max="1"
            :disabled="dialogType=='detail'"
            @chooseImg="imageChoose"
          />
        </el-form-item>
        <el-form-item :label="$t('字体类型')" prop="font_type">
          <el-select v-model="fontForm.font_type" size="small" clearable :placeholder="$t('请选择字体类型')" class="selector">
            <el-option
              v-for="item in fontTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType=='add'" :label="$t('字体文件')" prop="file">
          <el-upload
            ref="upload"
            class="upload-demo"
            action
            name="font"
            :http-request="submitUpload"
            :before-upload="beforeUpload"
            :on-remove="handleRemove"
            :on-change="fileChange"
            :file-list="fileList"
            :limit="1"
            :on-exceed="uploadExceed"
            :multiple="false"
            :auto-upload="false"
            :with-credentials="true"
          >
            <el-button slot="trigger" size="small" type="primary">{{ $t('选取文件') }}</el-button>
            <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">{{ $t('上传到服务器') }}</el-button> -->
            <div slot="tip" class="el-upload__tip">{{ fontForm.font_type === 1 ? $t(`只能上传压缩文件，且不超过2M`) : $t('只能上传ttf文件') }}</div>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button v-if="dialogType!=='detail'" v-has="701" type="primary" @click="onSubmit('fontForm')">{{ $t('保存') }}</el-button>
          <el-button @click="fontDialog = false">{{ $t('取消') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog v-dialogDrag center :title="fontDetail.font_name" :visible.sync="fontDetailDialog" class="font-dialog">
      <div style="text-align: center" class="font-box">
        <div v-for="(item,key) in fontDetail.font_content" :key="key" class="font-item">
          <span>{{ key }}：</span>
          <el-image :key="item" class="image" :src="item" lazy />
          <!-- <img :src="item" alt="" width="40"> -->
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import fontApi from '@/api/common/font'
import { getToken } from '../../../utils/auth'
import ImgUpload from '@/components/ImgUpload'
export default {
  components: {
    ImgUpload
  },
  data() {
    var validateFiles = (rule, value, callback) => {
      if (this.fileList.length === 0) {
        callback(new Error(`${this.$t('请选择字体文件')}`))
      } else {
        callback()
      }
    }
    return {
      loading: true,
      token: getToken(),
      keywords: '',
      baseUrl: process.env.VUE_APP_BASE_API,
      fontsList: [],
      fontDialog: false,
      fontDetailDialog: false,
      fontForm: {
        font_name: '',
        preview_image: '',
        font_type: 2,
        min_height: 0,
        max_height: 0
      },
      pageSize: 5,
      currentPage: 1,
      total: 0,
      fileList: [],
      fontDetail: {},
      fontType: '',
      fontTypeOptions: [ // 字体类型
        {
          label: `${this.$t('普通字体')}`,
          value: 2
        },
        {
          label: `${this.$t('刺绣字体')}`,
          value: 1
        }
      ],
      rules: {
        font_name: [
          { required: true, message: `${this.$t('请填写字体名称')}`, trigger: 'blur' }
        ],
        preview_image: [
          { required: true, message: `${this.$t('请上传样板图')}`, trigger: 'blur' }
        ],
        min_height: [
          { required: true, message: `${this.$t('请输入最小高度')}`, trigger: 'blur' }
        ],
        max_height: [
          { required: true, message: `${this.$t('请输入最大高度')}`, trigger: 'blur' }
        ],
        font_type: [
          { required: true, message: `${this.$t('请选择字体类型')}`, trigger: 'blur' }
        ],
        file: [
          { validator: validateFiles, trigger: 'change' }
        ]
      },
      dialogType: 'add'
    }
  },
  watch: {
    fontType: {
      handler(newValue, oldValue) {
        this.fetchData()
      }
    },
    fontDialog(val) {
      if (val === false) {
        this.$refs['fontForm'].resetFields()
        this.fileList = []
        this.fontForm = {
          font_name: '',
          preview_image: '',
          min_height: 0,
          max_height: 0
        }
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 获取字体列表
      fontApi.fontList({
        font_type: this.fontType
      }).then(res => {
        this.loading = false
        this.fontsList = res.data
      }).catch(() => {
        this.loading = false
        this.$message({
          type: 'info',
          message: `${this.$t('网络异常')}!`
        })
      })
    },
    showDialog(type, form) {
      this.dialogType = type
      if (form && form.font_id) {
        Object.assign(this.fontForm, form)
      }
      this.fontDialog = true
    },
    showDetail(row) {
      this.fontDetail = row
      this.fontDetailDialog = true
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.fontForm.font_id) {
            fontApi.editFont(this.fontForm).then(res => {
              this.$message({
                type: 'success',
                message: this.$t(...res.msg) || `${this.$t('编辑成功')}!`
              })
              this.$refs.fontForm.resetFields()
              this.fetchData()
              this.fontDialog = false
            })
          } else {
            const upload = this.$refs.upload
            console.log(upload)
            upload.submit()
          }
        } else {
          return false
        }
      })
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleDelete(id) {
      this.$confirm(`${this.$t('是否从字体库删除该字体')}?`, `${this.$t('提示')}`, {
        confirmButtonText: `${this.$t('确定')}`,
        cancelButtonText: `${this.$t('取消')}`,
        type: 'warning',
        confirmButtonClass: 'danger'
      }).then(() => {
        fontApi.deleteFont({ font_id: id }).then(res => {
          this.$message({
            type: 'success',
            message: `${this.$t('删除成功')}!`
          })
          this.fetchData()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: `${this.$t('已取消删除')}`
        })
      })
    },
    uploadExceed() {
      this.$message({
        type: 'warning',
        message: `${this.$t('超出文件数量限制')}, ${this.$t('请先删除原文件后重新选择')}!`
      })
    },
    submitUpload(e) {
      const formData = new FormData()
      formData.append('font', e.file)
      formData.append('font_name', this.fontForm.font_name)
      formData.append('font_type', this.fontForm.font_type)
      formData.append('max_height', this.fontForm.max_height)
      formData.append('min_height', this.fontForm.min_height)
      formData.append('preview_image', this.fontForm.preview_image)
      const loading = this.$loading({
        lock: true,
        text: `${this.$t('文件上传中')}`,
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.5)'
      })
      fontApi.uploadFont(formData).then(res => {
        if (res.code !== 0) {
          this.$message({
            message: this.$t(res.data.msg),
            type: 'error'
          })
        } else {
          this.$message({
            message: `${this.$t('上传成功')}`,
            type: 'success'
          })
          loading.close()
          this.fetchData()
          this.fontDialog = false
        }
      }).catch(() => {
        loading.close()
        this.$message({
          type: 'info',
          message: `${this.$t('上传失败')}`
        })
      })
    },
    fileChange(file, fileList) {
      this.fileList.push(file)
    },
    beforeUpload(file, fileList) {
      if (this.fontForm.font_type === 2) {
        return true
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error(`${this.$t('上传文件大小不能超过')} 2MB!`)
      }
      return isLt2M
    },
    handleRemove(file, fileList) {
      this.fileList.pop()
    },
    imageChoose(path) {
      this.fontForm.preview_image = path
      this.$refs.fontForm.validateField('preview_image')
    }
  }
}
</script>

<style lang="scss" scoped>
.fonts-list{
  .screen-box{
    .screen-item{
      text-align: left;
    }
    .selector {
      float: left;
      margin-right: 10px;
    }
    .operation{
      position: relative;
      top: 0;
      right: 0;
    }
  }
  .font-box{
    display: flex;
    flex-flow: wrap;
    align-items: center;
    .font-item{
      width: 20%;
      margin-bottom: 20px;
      .image{
        width: 40px;
      }
    }
  }
}

</style>
<style lang="scss">
.font-dialog{
  .el-dialog{
    position: absolute;
    top: 50%;
    left: 50%;
    margin: 0 !important;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    display: flex;
    flex-direction: column;
    height: 60vh;
    overflow: hidden;
    .el-dialog__body {
      overflow: auto;
    }
  }
  // 上传logo
  .logo-uploader{
    .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .el-upload:hover {
      border-color: #409EFF;
    }
    .logo-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 200px;
      height: 150px;
      line-height: 150px;
      text-align: center;
    }
    .logo {
      width: 200px;
      height: 150px;
      display: block;
    }
  }
}
</style>
