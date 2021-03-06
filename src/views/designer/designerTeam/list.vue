<template>
  <div class="shops-list main-content">
    <div class="screen-box">
      <div class="screen-item">
        <el-input
          v-model="keywords"
          size="small"
          :placeholder="$t('请输入关键词')"
          clearable
          style="width:220px"
          @keyup.enter.native="fetchData"
        />
        <el-button size="small" icon="el-icon-search" type="primary" @click.native="fetchData">{{ $t('搜索') }}</el-button>
      </div>
      <div class="operation">
        <el-button v-has="601" size="small" icon="el-icon-plus" type="primary" @click="showDialog('add')">{{ $t('新增') }}</el-button>
      </div>
    </div>
    <div class="content">
      <el-table
        v-loading="load"
        :data="designerList"
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
          prop="designer_team_name"
          :label="$t('团队名称')"
          align="center"
        />
        <el-table-column
          prop="created_at"
          :label="$t('创建时间')"
          align="center"
        />
        <el-table-column
          prop="updated_at"
          :label="$t('更新时间')"
          align="center"
        />
        <el-table-column
          fixed="right"
          :label="$t('操作')"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click.native="showDialog('detail', scope.row)"
            >{{ $t('查看') }}</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.designer_team_id)"
            >{{ $t('删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination
          :total="total"
          :current-page="currentPage"
          :page-sizes="[5, 10, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 团队新增，详情，编辑弹框 -->
    <el-dialog v-dialogDrag center :title="dialogType=='add'? $t('新增设计师团队'): dialogType=='edit'? `${$t('编辑设计师团队')}`: `${$t('设计师团队详情')}`" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" label-position="left" size="small">
        <el-form-item :label="$t('团队名称')" prop="designer_team_name">
          <el-input v-model="form.designer_team_name " :disabled="dialogType=='detail'" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('管理者名称')" prop="designer_name">
          <el-input v-model="form.designer_name " :disabled="dialogType=='detail'" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('管理者手机号')" prop="designer_phone">
          <el-input v-model="form.designer_phone " :disabled="dialogType=='detail'" style="width:100%" />
        </el-form-item>
        <!-- <el-form-item label="管理者logo" prop="logo">
          <el-upload
            class="logo-uploader"
            :action="`${baseUrl}/file/uploadImg`"
            :data="{type: 'shop_logo'}"
            name="image"
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
        <el-form-item>
          <el-button v-if="dialogType!=='detail'" type="primary" @click="onSubmit('form')">{{ $t('保存') }}</el-button>
          <!-- <el-button v-else type="primary" @click="dialogType='edit'">{{ $t('编辑') }}</el-button> -->
          <el-button @click="dialogFormVisible = false">{{ $t('关闭') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { addDesigner, editDesigner, getTeamList, deleteDesigner } from '@/api/designer'
import { validPhone } from '@/utils/validate'
export default {
  data() {
    const validatePhone = (rule, value, callback) => {
      if (!validPhone(value)) {
        callback(new Error(`${this.$t('手机号格式不正确')}`))
      } else {
        callback()
      }
    }
    return {
      load: true,
      keywords: '',
      baseUrl: process.env.VUE_APP_BASE_API,
      designerList: [],
      multipleSelection: [],
      dialogFormVisible: false,
      form: {
        designer_team_name: '',
        designer_name: '',
        designer_phone: '',
        password: ''
      },
      pageSize: 10,
      currentPage: 1,
      total: 0,
      rules: {
        designer_team_name: [
          { required: true, message: `${this.$t('请填写团队名称')}`, trigger: 'blur' },
          { min: 1, max: 15, message: `${this.$t('长度在 {0} 到 {1} 个字符', [1, 15])}`, trigger: 'blur' }
        ],
        designer_name: [
          { required: true, message: `${this.$t('请填写设计师姓名')}`, trigger: 'blur' }
        ],
        designer_phone: [
          { required: true, trigger: 'blur', validator: validatePhone }
        ]
      },
      dialogType: 'add'
    }
  },
  watch: {
    dialogFormVisible(val) {
      if (val === false) {
        this.$refs['form'].resetFields()
        this.form = {
          designer_team_name: '',
          designer_name: '',
          designer_phone: '',
          password: ''
        }
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 获取管理者列表
      getTeamList({
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }).then(res => {
        this.load = false
        this.designerList = res.data.data
        this.total = res.data.count
      })
    },
    showDialog(type, form) {
      this.dialogType = type
      this.dialogFormVisible = true
      if (form && form.designer.length > 0) {
        this.form = form.designer.find(i => {
          return i.is_leader === 1
        })
        this.form.designer_team_name = form.designer_team_name
        this.form.designer_team_id = form.designer_team_id
      }
    },
    onSubmit(formName) {
      const _this = this
      _this.$refs[formName].validate((valid) => {
        if (valid) {
          if (_this.form.designer_id) {
            if (this.form.password === '') {
              delete this.form.password
            }
            editDesigner(_this.form).then(res => {
              if (res.code === 0) {
                this.$message({
                  type: 'success',
                  message: this.$t(...res.msg) || `${this.$t('修改成功')}!`
                })
                // 重置表单
                _this.$refs[formName].resetFields()
                this.dialogFormVisible = false
                this.fetchData()
              } else {
                this.$message.success(this.$t(...res.msg) || `${this.$t('修改失败')}!`)
              }
            })
          } else {
            addDesigner(_this.form).then(res => {
              if (res.code === 0) {
                this.$message({
                  type: 'success',
                  message: this.$t(...res.msg) || `${this.$t('添加成功')}!`
                })
                // 重置表单
                _this.$refs[formName].resetFields()
                this.dialogFormVisible = false
                this.fetchData()
              } else {
                this.$message.success(this.$t(...res.msg) || `${this.$t('添加失败')}!`)
              }
            })
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
      this.$confirm(`${this.$t('是否删除该团队')}?`, `${this.$t('提示')}`, {
        confirmButtonText: `${this.$t('确定')}`,
        cancelButtonText: `${this.$t('取消')}`,
        type: 'warning',
        confirmButtonClass: 'danger'
      }).then(() => {
        deleteDesigner({ designer_team_id: id }).then(res => {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.shops-list{
  .screen-box{
    .screen-item{
      text-align: left;
    }
  }
}
</style>

<style lang="scss">
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
      width: 150px;
      height: 150px;
      line-height: 150px;
      text-align: center;
    }
    .logo {
      width: 150px;
      height: 150px;
      display: block;
    }
  }
</style>
