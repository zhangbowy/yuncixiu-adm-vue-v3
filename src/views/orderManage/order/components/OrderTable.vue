<template>
  <div class="order-table-list">
    <div class="order-item">
      <el-row class="order-header">
        <el-col :span="6" class="header-item">
          <el-row>
            <el-col :span="16">{{ $t('商品') }}</el-col>
            <el-col :span="8" class="alignR">{{ $t('单价') }}/{{ $t('数量') }}</el-col>
          </el-row>
        </el-col>
        <el-col :span="3" class="header-item">
          {{ $t('订单状态') }}
        </el-col>
        <el-col :span="3" class="header-item">
          {{ $t('收货人') }}
        </el-col>
        <el-col :span="3" class="header-item">
          {{ $t('买家信息') }}
        </el-col>
        <el-col :span="3" class="header-item">
          {{ $t('买家留言') }}
        </el-col>
        <el-col :span="3" class="header-item">
          {{ $t('实付金额') }}
        </el-col>
        <el-col :span="3" class="header-item">
          {{ $t('订单操作') }}
        </el-col>
      </el-row>

      <div class="order-item-content">
        <el-checkbox-group v-model="checkList" @change="onCheckboxGroupChange">
          <div v-for="(item, index) in data" :key="`${item.id}-${index}`" class="item-box">
            <div class="item-header">
              <el-checkbox :label="item.id" />
              <span>{{ $t('订单号') }}：{{ item.order_no }}</span>
              <!-- <span>{{ item.payType==1?'线下支付': '在线支付' }}</span> -->
              <span>{{ $t(item._order_type) }}</span>
              <span>{{ item.created_at }}</span>
              <span v-if="item._logistics_type" style="color: orange;">{{ $t(item._logistics_type) }}</span>
              <span v-if="item.status === 11" style="color: red;">{{ $t('机器码') }}: {{ item.machine_code }}{{ item.machine_name && ` (${item.machine_name})` }}</span>
              <div class="header-btn" :style="{marginLeft: '10px'}">
                <el-button
                  v-if="item.order_type==2 || item.order_type==3 || item.order_type==4"
                  v-has="19"
                  size="mini"
                  type="text"
                  @click="showDesign(item)"
                >{{ $t('定制信息') }}</el-button>
              </div>
              <div class="header-btn">
                <router-link :to="`/orderManage/orderDetail?order_no=${item.order_no}`">
                  <el-button
                    v-has="19"
                    size="mini"
                    type="text"
                  >{{ $t('查看详情') }}</el-button>
                </router-link>
              </div>
            </div>
            <el-row class="item-content" type="flex" align="middle">
              <el-col :span="6" class="td-item">
                <el-row v-for="(good,i) in item.order_item" :key="`${i}-${good.sku_id}`" class="goods-item">
                  <el-col :span="16" style="text-align:left" class="goods-info">
                    <el-image :key="good.image" :src="good.image" lazy fit="contain" />
                    <div class="right-info">
                      <span class="goods-name">{{ good.name }}</span>
                      <span class="goods-sku">{{ good.sku_name }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8" class="alignR"> <div> <span style="color: #ee0a24">{{ $t('￥') }}{{ good.current_price }}</span>/{{ good.buy_num }}{{ $t('件') }}</div></el-col>
                </el-row>
              </el-col>
              <el-col :span="3" class="td-item">
                <div>
                  <el-tag :type="item.status | statusFilter">
                    {{ $t(item._status) }}
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="3" class="td-item"><div>{{ item.receiver_name }}/{{ item.receiver_phone }}</div></el-col>
              <el-col :span="3" class="td-item">
                <div>
                  <img :src="item.user.headimgurl?item.user.headimgurl: ''" alt="" width="30" height="30">
                  <p style="font-size:12px; margn: 5px 0">{{ item.user.nickname }}</p>
                </div>
              </el-col>
              <el-col :span="3" class="td-item"><div>{{ item.buyer_message?item.buyer_message: $t("买家未留言") }}</div></el-col>
              <el-col :span="3" class="td-item">
                <div>
                  <span style="color: #ee0a24">{{ $t('￥') }}{{ item.pay_amount.toFixed(2) }} </span>
                  <p v-if="item.express_amount>0" class="" style="color: orange">({{ $t('含运费') }}{{ $t('￥') }}{{ item.express_amount.toFixed(2) }})</p>
                  <!-- <p v-if="item.designer_price>0" class="" style="color: orange">（定制价格￥{{ item.designer_price.toFixed(2) }}）</p> -->
                </div>
              </el-col>
              <el-col :span="3" class="td-item">
                <div v-if="item.status==1" class="operate-btn">
                  <p>{{ $t('等待买家付款') }}</p>
                  <el-button
                    v-has="503"
                    size="mini"
                    type="primary"
                    style="margin: 10px 0 0"
                    @click.native="confirmPayment(item.id)"
                  >{{ $t('确认付款') }}</el-button>
                </div>
                <div v-if="item.status==7" class="operate-btn">
                  <p>{{ $t('已支付') }} {{ $t('待派单') }}</p>
                  <el-button
                    v-has="506"
                    size="mini"
                    type="primary"
                    @click="dispatch(7, item)"
                    class="dispatch-order-button"
                  >{{ $t('派单') }}</el-button>
                  <el-button
                  v-has="506"
                  size="mini"
                  type="primary"
                  @click="refund(item)"
                >{{ $t('驳回&退款') }}</el-button>
                </div>
                <div v-if="item.status==2" class="operate-btn">
                  <p>{{ $t('等待商家发货') }}</p>
                  <el-button
                    v-has="501"
                    size="mini"
                    type="primary"
                    @click="showDialog(2, item)"
                  >{{ $t('发货') }}</el-button>
                </div>

                <div v-if="item.status==3" class="operate-btn">
                  <p>{{ $t('商家已经发货') }}</p>
                  <el-button
                    size="mini"
                    type="primary"
                    @click="showDialog(3, item)"
                  >{{ $t('修改发货') }}</el-button>
                  <el-button
                    v-has="504"
                    size="mini"
                    type="primary"
                    style="margin: 10px 0 0"
                    @click="conReceived(item.id)"
                  >{{ $t('确认收货') }}</el-button>
                </div>
                <div v-if="item.status==10 && item._logistics_type ==='门店自提'" class="operate-btn">
                  <el-button
                    v-has="504"
                    size="mini"
                    type="primary"
                    style="margin: 10px 0 0"
                    @click="conReceived(item.id, item._logistics_type)"
                  >{{ $t('确认完成') }}</el-button>
                </div>
                <div v-if="item.status==11" v-has="509" class="operate-btn">
                  <el-button
                    v-has="504"
                    size="mini"
                    type="primary"
                    style="margin: 10px 0 0"
                    @click="cancelDistribution(item.id)"
                  >{{ $t('取消下发') }}</el-button>
                </div>
                <div v-if="item.status==4" class="operate-btn">
                  <p>{{ $t('交易完成') }}</p>
                </div>
                <!-- <div v-if="item.logistics_type==2 && item.status==10" class="operate-btn">
                  <el-button
                    size="mini"
                    type="primary"
                  >{{ $t('已完成') }}</el-button>
                </div> -->
                <div v-if="item.status==5" class="operate-btn">
                  <p>{{ $t('询价中') }}</p>
                  <el-button
                    v-has="507"
                    size="mini"
                    type="primary"
                    @click="showReplay(item.id)"
                  >{{ $t('回复询价') }}</el-button>
                </div>
                <div v-if="item.status==6" class="operate-btn">
                  <p>{{ $t('已回复询价') }}</p>
                </div>
                <div v-if="item.status=='-2'" class="operate-btn">
                  <p>{{ $t('交易关闭') }}</p>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-checkbox-group>
        <!-- 没有订单 -->
        <div v-if="data.length===0" class="no-data">{{ $t('暂无订单') }}...</div>
      </div>
    </div>
    <!-- 发货/修改发货弹窗 -->
    <el-dialog v-dialogDrag :visible.sync="orderDiaLog" :title="dialogTitle">
      <div class="dialog-content">
        <div class="order-item-goods">
          <el-form ref="sendForm" :model="sendForm" :rules="rules" label-width="80px" label-position="left" size="small">
            <el-form-item prop="checkedGoods" label-width="0">
              <el-table
                ref="multipleTable"
                :data="sendItem.order_item"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="sentGoodsCheck"
              >
                <el-table-column
                  type="selection"
                  width="55"
                />
                <el-table-column
                  :label="$t('商品')"
                  width="120"
                >
                  <template slot-scope="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column
                  prop="buy_num"
                  :label="$t('数量')"
                  width="120"
                />
                <el-table-column
                  prop="express_name"
                  :label="$t('物流公司')"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="express_number"
                  :label="$t('单号')"
                  show-overflow-tooltip
                />
              </el-table>
            </el-form-item>
            <div class="order-address-info">
              <div>{{ `${$t('联系方式')}${$t('：')}` }}<span>{{ sendItem.receiver_name }} </span> <span>{{ sendItem.receiver_phone }}</span></div>
              <div>{{ `${$t('收货地址')}${$t('：')}` }}<span>{{ sendItem.receiver_address }} </span></div>
            </div>
            <el-form-item :label="$t('物流公司')" prop="express_id" style="display: inline-block;width: 50%">
              <el-select v-model="sendForm.express_id" :placeholder="$t('请选择')" @change="selectGet">
                <el-option
                  v-for="item in expressOpthions"
                  :key="item.express_id"
                  :label="item.express_name"
                  :value="item.express_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('快递单号')" prop="express_number" style="display: inline-block;width: 45%">
              <el-input v-model="sendForm.express_number" :placeholder="$t('请输入内容')" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('sendForm')">{{ $t('确认') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>

    <!-- 派单 -->
    <el-dialog v-dialogDrag :visible.sync="dispatchDialog" :title="$t('派单')" width="30%">
      <el-form ref="dispatchForm" :model="dispatchForm" :rules="dispatchRules" label-width="100px" label-position="right" size="small">
        <el-form-item :label="$t('设计师团队')" style="width: 100%" prop="designer_team_id">
          <el-select v-model="dispatchForm.designer_team_id" :placeholder="$t('请选择设计师团队')">
            <el-option
              v-for="item in designerList"
              :key="item.designer_team_id"
              :label="item.designer_team_name"
              :value="item.designer_team_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('价格')" prop="price">
          <el-input v-model.number="dispatchForm.price" :placeholder="$t('请输入价格')" />
        </el-form-item>
        <el-form-item>
          <el-button @click="dispatchDialog = false">{{ $t('取消') }}</el-button>
          <el-button type="primary" @click="doDispatch('dispatchForm')">{{ $t('确认') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 回复询价 -->
    <el-dialog v-dialogDrag :visible.sync="replayDialog" :title="$t('回复询价')" width="30%">
      <el-form ref="replayForm" :model="replayForm" :rules="replayRules" label-width="80px" label-position="right" size="small">
        <el-form-item :label="$t('价格')" prop="price">
          <el-input v-model="replayForm.price" type="number" />
        </el-form-item>
        <el-form-item>
          <el-button @click="replayDialog = false">{{ $t('取消') }}</el-button>
          <el-button type="primary" @click="confirmReplay('replayForm')">{{ $t('确认') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <design-dialog v-model="designInfo" :info-item="designInfoItem" @close="designInfo = false" />
    <el-dialog
      v-dialogDrag
      :title="$t('请选择机器')"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <div>
        <el-radio-group v-if="machineList.length" v-model="machine_id" size="small">
          <el-radio v-for="machine in machineList" :key="machine.machine_code" :label="machine.machine_code" border>{{ machine.machine_name }}</el-radio>
        </el-radio-group>
        <span v-else>{{ $t('该定制分类没有关联任何机器') }}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="onDialogClick">{{ $t('确定') }}</el-button>
      </span>
    </el-dialog>
    <div v-if="activeName === '10'" v-has="508" class="btn_group">
      <el-button type="primary" class="issued-btn" @click="onIssuedBtnClick">{{ $t('下发机器') }}</el-button>
      <el-button type="success" class="issued-btn" icon="el-icon-finished" @click="checkAll">{{ $t('全选') }}</el-button>
      <el-button type="warning" class="issued-btn" icon="el-icon-close" @click="unCheckAll">{{ $t('取消全选') }}</el-button>
    </div>
  </div>
</template>

<script>
import { getExpressList } from '@/api/common'
import { getTeamList } from '@/api/designer'
import { orderApi } from '@/api/order'
import DesignDialog from './DesignDialog'
export default {
  components: {
    DesignDialog
  },
  inject: ['reload'],
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'danger',
        2: '',
        3: '',
        4: 'success',
        5: 'danger',
        6: 'danger',
        '-2': 'info'
      }
      return statusMap[status]
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    activeName: {
      type: String,
      default: '1'
    },
    customCategoryList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      orderDiaLog: false,
      dispatchDialog: false,
      replayDialog: false, // 回复询价
      designInfo: false,
      designInfoItem: {},
      dialogTitle: '', // 弹框标题
      expressOpthions: [], // 物流公司列表
      checkList: [], // 选中的订单id
      sendItem: {}, // 要发货的订单信息
      designerList: [], // 设计师团队
      checkedGoods: [],
      machineList: [], // 机器列表
      current_custom_category_id: 0,
      express_name: '',
      dialogVisible: false,
      machine_id: 0, // 机器id
      sendForm: {
        checkedGoods: [],
        express_id: '',
        express_number: ''
      },
      dispatchForm: {
        order_id: '',
        designer_team_id: '',
        price: ''
      }, // 派单
      dispatchRules: {
        designer_team_id: [
          { required: true, message: `${this.$t('请选择团队')}`, trigger: 'change' }
        ],
        price: [
          { required: true, message: `${this.$t('请输入价格')}`, trigger: 'blur' }
        ]
      },
      rules: {
        checkedGoods: [
          { required: true, message: `${this.$t('请选择商品')}`, trigger: 'change' }
        ],
        express_id: [
          { required: true, message: `${this.$t('请选择快递公司')}`, trigger: 'change' }
        ],
        express_number: [
          { required: true, message: `${this.$t('请输入快递单号')}`, trigger: 'blur' }
        ]
      },
      replayForm: {
        order_id: '',
        price: ''
      },
      replayRules: {
        price: [
          { required: true, message: `${this.$t('请输入价格')}`, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    'sendForm.express_id': {
      deep: true,
      handler(newValue, oldValue) {
        this.sendItem.order_item.map(item => {
          if (this.checkedGoods.indexOf(item.order_item_id) !== -1) {
            item.express_id = newValue
            item.express_name = this.express_name
          }
        })
      }
    },
    'sendForm.express_number': {
      deep: true,
      handler(newValue, oldValue) {
        this.sendItem.order_item.map(item => {
          if (this.checkedGoods.indexOf(item.order_item_id) !== -1) {
            item.express_number = newValue
          }
        })
      }
    },
    'sendForm.checkedGoods': {
      deep: true,
      handler(newValue, oldValue) {
        newValue.map(item => {
          if (this.checkedGoods.indexOf(item.order_item_id) !== -1) {
            item.express_id = this.sendForm.express_id
            item.express_name = this.express_name
            item.express_number = this.sendForm.express_number
          }
        })
      }
    },
    orderDiaLog: {
      handler(newValue) {
        if (newValue === false) {
          this.sendForm = {
            checkedGoods: [],
            express_id: '',
            express_number: ''
          }
          this.$refs.sendForm.resetFields()
        }
      }
    },
    current_custom_category_id: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.customCategoryList.forEach(item => {
            if (newValue === item.custom_category_id) {
              this.machineList = item.machine || []
              this.machineList.length && (this.machine_id = this.machineList[0].machine_code)
              return
            }
          })
        }
      }
    },
    data: {
      handler() {
        this.checkList = []
      }
    }
  },
  created() {
    this.getExpress()
    // 获取设计师团队
    this.getTeamList()
  },
  methods: {
    onDialogClick() {
      if (this.machine_id) {
        orderApi.sendMachine({
          order_id: this.checkList,
          custom_template_id: this.current_custom_category_id,
          machine_id: this.machine_id
        }).then($data => {
          this.$message({
            message: this.$t($data.msg) || `${this.$t('操作成功')}!`,
            type: 'success'
          })
          this.dialogVisible = false
        })
      } else {
        this.dialogVisible = false
      }
    },
    checkAll() {
      this.checkList = this.data.map(item => item.id)
    },
    unCheckAll() {
      this.checkList = []
    },
    onIssuedBtnClick() {
      if (!this.checkList.length) {
        this.$message({
          // title: `${this.$t('警告')}`,
          message: `${this.$t('没有选择订单')}`,
          type: 'warning'
        })
      } else {
        const checkedOrderList = this.data.filter(item => {
          return this.checkList.includes(item.id)
        })
        if (checkedOrderList.length) {
          const custom_category_id = checkedOrderList[0].custom_category_id
          let is_same = true
          checkedOrderList.forEach(item => {
            if (item.custom_category_id !== custom_category_id) {
              this.$message({
                // title: `${this.$t('警告')}`,
                message: `${this.$t('必须选择相同的定制分类')}`,
                type: 'error'
              })
              is_same = false
              return
            }
            if (item._logistics_type === `${this.$t('门店自提')}`) {
              this.$message({
                // title: `${this.$t('警告')}`,
                message: `${this.$t('门店自提订单无法下发机器')}`,
                type: 'error'
              })
              is_same = false
              return
            }
          })
          if (!custom_category_id) {
            this.$message({
              // title: `${this.$t('警告')}`,
              message: `${this.$t('定制分类错误')}`,
              type: 'error'
            })
            return
          }
          if (is_same) {
            this.current_custom_category_id = custom_category_id
            this.dialogVisible = true
          }
        }
      }
    },
    cancelDistribution(orderId) {
      orderApi.cancelSendMachine({ order_id: orderId }).then(res => {
        if (res.code === 0) {
          this.$emit('reload')
          this.$message({
            type: 'success',
            message: this.$t(...res.msg)
          })
        }
      })
    },
    showDesign(orderDetail) {
      this.designInfo = true
      this.designInfoItem = orderDetail.order_item[0]
    },
    // 获取物流公司列表
    getExpress() {
      getExpressList().then(res => {
        this.expressOpthions = res.data
      })
    },
    getTeamList() {
      // 获取管理者列表
      getTeamList({
        pageSize: 100,
        currentPage: 1
      }).then(res => {
        this.designerList = res.data.data
      })
    },
    // 获取订单列表，子组件触发父组件方法
    getOrderList() {
      setTimeout(() => {
        this.$emit('getList')
      }, 500)
    },
    // 显示弹框
    showDialog(status, item) {
      this.sendItem = item
      this.dialogTitle = status === 2 ? `${this.$t('订单发货')}` : `${this.$t('修改发货')}`
      this.orderDiaLog = true
    },
    // 显示派单弹框
    dispatch(status, item) {
      this.dispatchDialog = true
      this.dispatchForm.order_id = item.id
    },
    // 回复询价
    showReplay(id) {
      this.replayDialog = true
      this.replayForm.order_id = id
    },
    // 确认回复询价
    confirmReplay(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          orderApi.replyOrder(this.replayForm).then(res => {
            this.$message({
              type: 'success',
              message: this.$t(...res.msg)
            })
          })
          this.replayDialog = false
          this.getOrderList()
        } else {
          return false
        }
      })
    },
    // 弹框商品选择
    sentGoodsCheck(val) {
      this.sendForm.checkedGoods = val
      const arr = []
      val.map(item => {
        arr.push(item.order_item_id)
      })
      this.checkedGoods = arr
    },
    // 提交派单
    doDispatch(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          orderApi.dispatchOrder({
            order_id: this.dispatchForm.order_id,
            designer_team_id: this.dispatchForm.designer_team_id,
            designer_price: this.dispatchForm.price
          }).then(res => {
            this.$message({
              type: 'success',
              message: this.$t(...res.msg)
            })
          })
          this.dispatchDialog = false
          this.getOrderList()
        } else {
          return false
        }
      })
    },
    // 提交发货
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          orderApi.orderDeliver({
            order_id: this.sendItem.id,
            order_item_id: this.checkedGoods,
            express_id: this.sendForm.express_id,
            express_number: this.sendForm.express_number
          }).then(res => {
            this.$message({
              type: 'success',
              message: this.$t(...res.msg)
            })
          })
          this.orderDiaLog = false
          this.getOrderList()
        } else {
          return false
        }
      })
    },
    conReceived(id, type) {
      this.$confirm(this.$t(`确认${type === '门店自提' ? '提货' : '收货'}后将无法恢复,是否继续?`), `${this.$t('提示')}`, {
        confirmButtonText: `${this.$t('确定')}`,
        cancelButtonText: `${this.$t('取消')}`,
        type: 'warning'
      }).then(() => {
        orderApi.confirmReceived({
          order_id: id
        }).then(res => {
          this.$message({
            type: 'success',
            message: this.$t(...res.msg)
          })
        })
        this.getOrderList()
      }).catch(() => {

      })
    },
    // 选择快递公司，获取选中的快递公司名称
    selectGet(vId) {
      let obj = {}
      obj = this.expressOpthions.find((item) => { // 这里的selectList就是上面遍历的数据源
        return item.express_id === vId// 筛选出匹配数据
      })
      this.express_name = obj.express_name
    },
    // 点击确认支付
    confirmPayment(id) {
      this.$confirm(`${this.$t('确认支付后无法恢复')},${this.$t('是否继续')}?`, `${this.$t('提示')}`, {
        confirmButtonText: `${this.$t('确定')}`,
        cancelButtonText: `${this.$t('取消')}`,
        type: 'warning'
      }).then(() => {
        orderApi.confirmPayment({
          order_id: id
        }).then(res => {
          this.$message({
            type: 'success',
            message: this.$t(...res.msg)
          })
        })
        this.getOrderList()
      }).catch(() => {

      })
    },
    onCheckboxGroupChange(value) {
      this.$emit('checkboxChange', value)
    },
    // 管理后台退款
    refund($item) {
      this.$confirm(this.$t(`是否确认取消该订单，并退款给客户,是否继续?`), `${this.$t('提示')}`, {
        confirmButtonText: `${this.$t('确定')}`,
        cancelButtonText: `${this.$t('取消')}`,
        type: 'warning'
      }).then(() => {
        orderApi.refund({
          order_no: $item.order_no
        }).then(res => {
          this.$message({
            type: 'success',
            message: this.$t(...res.msg)
          })
        })
        this.getOrderList()
      }).catch(() => {

      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-header{
  align-items: center;
  font-size: 14px;
  padding: 0 10px;
  box-shadow: 0px 10px 20px #ebeef5;
  margin-bottom: 20px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 5px;
  .header-item{
    text-align: center;
    border-right: 1px solid #eee;
    padding: 10px 5px;
    &:last-child{
      border-right: none;
    }
  }
}
.order-item-content{
  .item-box{
    margin-bottom: 20px;
    border-radius: 5px;
    border: 1px solid #fafafa;
    box-shadow: 0px 10px 20px #ebeef5;
    vertical-align: middle;
    .item-header{
      padding: 10px;
      background: #f5f5f5;
      border-radius: 5px 5px 0 0;
      span{
        margin-left: 10px;
      }
      .header-btn{
        float: right;
        margin-top: -7px;
      }
    }
    .item-content{
      padding: 0 10px;
      &:hover{
        background: #fafafa;
      }
      .td-item{
        padding: 10px 5px;
        text-align: center;
        .goods-item{
          border-bottom: 1px solid #fafafa;
          padding: 10px;
          &:last-child{
            border: none;
          }
          .goods-info{
            display: flex;
            align-items: center;
            .el-image{
              width: 80px;
              height: 80px;
            }
            .right-info{
              flex: 1;
              padding-left: 10px;
              span{
                display: block;
              }
              span.goods-name{
                padding-bottom: 10px;
              }
              span.goods-sku{
                color: #999;
                font-size: 12px;
              }
            }
          }
        }
        &:last-child{
          border: none
        }
      }
    }
  }
}
.no-data{
  text-align: center;
}
.order-address-info{
  padding: 20px 0;
  div{
    padding: 10px 0;
  }
}
.el-checkbox-group{
  font-size: 14px;
  .el-checkbox{
    span{
      font-size: 0;
    }
  }
}
</style>

<style lang="scss">
.order-table-list{
  padding: 0 10px;
  .el-checkbox__label{
    display: none;
  }
}
.dispatch-order-button {
  margin-bottom: 5px;
}
</style>
