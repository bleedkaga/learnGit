<template lang="html">
  <div class="recharge-activity-setting">
    <panel-title title="发票管理"></panel-title>

    <div class="panel_invoice">
      <el-row :gutter="30" type="flex">

        <el-col :span="5">
          <div class="grid-content">
            未开票笔数
            <em v-text="not_number"></em>
          </div>
        </el-col>

        <el-col :span="5">
          <div class="grid-content">
            未开票金额
            <em v-text="not_money"></em>
          </div>
        </el-col>

        <el-col :span="5">
          <div class="grid-content">
            已开票笔数
            <em v-text="com_number"></em>
          </div>
        </el-col>

        <el-col :span="5">
          <div class="grid-content">
            已开票金额
            <em v-text="com_money"></em>
          </div>
        </el-col>

        <el-col :span="5">
          <div class="grid-content bg-purple" @click="invoiceRuleEdit">
            开票规则设置
          </div>
        </el-col>

      </el-row>
    </div>
    <div class="panel_search">
      <el-input placeholder="联系电话、收件人姓名" v-model="input5">
        <el-button slot="append" icon="search" @click="searchInvoice"></el-button>
      </el-input>
    </div>

    <div class="panel_recharg">

      <el-row :gutter="20">

        <el-col :span="5">
          <div class="panel_recharge_item">
            <div class="panel_group">
              <p>开票状态</p>
              <div class="block">
                <el-select v-model="recharge_query.state">
                  <el-option v-for="item in recharge_query.state_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">{{item.label}}</el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>支付方式</p>
              <el-select v-model="recharge_query.payway">
                <el-option v-for="item in recharge_query.payway_options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">{{item.label}}</el-option>

              </el-select>
            </div>

            <div class="panel_group">
              <el-button type="primary" :loading="recharge_query.loading" @click="rechargeQueryHandler">查询</el-button>
            </div>
          </div>
        </el-col>

        <el-col :span="19">
          <div class="panel_recharge_item activity_table_list">
            <div class="operation">
              <el-button type="primary" @click="exportActivity" size="small" :disabled="rows.length < 1">导出记录</el-button>

              <span class="f_right">
                <el-button-group>
                  <el-button size="small" @click="turnPagePrev" :disabled="page == 1"><i class="el-icon-arrow-left"></i></el-button>
                  <el-button size="small" @click="turnPageNext" :disabled="pageMaxLength"><i class="el-icon-arrow-right"></i></el-button>
                </el-button-group>
              </span>
            </div>  <!--opration end-->

            <div class="activity_table">
              <el-table
                v-loading="tableLoading"
                ref="multipleTable"
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">

                <el-table-column
                  type="selection"
                  @select="handleSelectionChange"
                  align="center"
                >
                </el-table-column>

                <el-table-column
                  prop="amount"
                  label="发票金额"
                  align="center"
                  >
                  <!-- <template slot-slot-scope="scope">{{ scope.row.date }}</template> -->
                </el-table-column>

                <el-table-column
                  prop="payWay"
                  label="支付方式"
                  align="center"
                  >
                  <template slot-scope="scope">
                    <span v-if="scope.row.payWay == 0">到付</span>
                    <span v-else-if="scope.row.payWay == 1">预付</span>
                    <span v-else>未知</span>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="invoiceHead"
                  label="发票抬头"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="receiver"
                  label="收件人"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="linkPhone"
                  label="联系电话"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="postcode"
                  label="邮政编码"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="address"
                  label="收件地址"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="deliveryCompany"
                  label="快递"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="deliveryNo"
                  label="快递单号"
                  align="courier_number"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="invoiceNo"
                  label="发票号"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="status"
                  label="发票"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span v-if="scope.row.status == 0">未开票</span>
                    <span v-else-if="scope.row.status == 1">已开票</span>
                    <span v-else>未知</span>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="edit"
                  label="修改"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="editInvoce(scope.row)"><i class="el-icon-edit"></i> 修 改</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>


    <el-dialog
      title="创建充值活动"
      :visible.sync="create_activity_dialog">
      <div class="create_activity">
        <div class="left">
          <div class="form-group">
            <p>活动名称</p>
            <el-input placeholder="请输入活动名称"></el-input>
          </div>

          <div class="form-group">
            <p>开始时间</p>
            <el-input placeholder="请选择开始时间"></el-input>
          </div>

          <div class="form-group">
            <p>结束时间</p>
            <el-input placeholder="请选择结束时间"></el-input>
          </div>
        </div>
        <div class="right">
          <div class="form-group">
            <p>用户支付金额（元）</p>
            <el-input placeholder="请输入用户支付金额"></el-input>
          </div>

          <div class="form-group">
            <p>实际到账金额（元）</p>
            <el-input placeholder="请输入实际到账金额"></el-input>
          </div>

          <div class="form-group">
            <p>赠送上线金额（元）</p>
            <el-input placeholder="请输入赠送上线金额"></el-input>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="create_activity_dialog = false">取 消</el-button>
        <el-button type="primary" :loading="create_activity_data.loading" @click="create_activity">确 定</el-button>
      </span>
    </el-dialog>


    <el-dialog title="开票设置" :visible.sync="create_invoice_dialog" size="tiny">

      <div class="create_invoice">
        <div class="form_group">
          <p>免运费开拍金额（元）</p>
          <el-input placeholder="请输入免运费开票金额"></el-input>
        </div>
        <div class="form_group">
          <p>最低金额（元）</p>
          <el-input placeholder="请输入最低开票金额"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="create_invoice_dialog = false">取 消</el-button>
        <el-button type="primary" :loading="create_activity_data.loading" @click="">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="发票信息修改" :visible.sync="change_invoice_dialog" size="tiny">

      <div class="create_invoice">
        <div class="form_group">
          <p>快递名称<i>*</i></p>
          <el-input placeholder="请输入免运费开票金额"></el-input>
        </div>
        <div class="form_group">
          <p>快递单号<i>*</i></p>
          <el-input placeholder="请输入最低开票金额"></el-input>
        </div>
        <div class="form_group">
          <p>发票号<i>*</i></p>
          <el-input placeholder="请输入发票号"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="change_invoice_dialog = false">取 消</el-button>
        <el-button type="primary" :loading="create_activity_data.loading" @click="">确 定</el-button>
      </span>
    </el-dialog>


    <!-- 开票规则设置 -->
    <el-dialog :visible.sync="invoiceRuleEditVisible" title="设置开票规则" size="tiny">
      <div class="rule_edit">
        <div class="form_group">
          <p>免运费开票金额</p>
          <el-input placeholder="请输入免运费开票金额" v-model="freeRule"></el-input>
        </div>
        <div class="form_group">
          <p>最低开票金额</p>
          <el-input placeholder="请输入最低开票金额" v-model="lowestRule"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelInvoice">取 消</el-button>
        <el-button type="primary" :loading="ruleEditLoading" @click="ruleEditSave">设 置</el-button>
      </span>
    </el-dialog>

    <!-- 开票规则设置 -->
    <el-dialog :visible.sync="editInvoceVisible" title="发票修改" size="tiny">
      <div class="rule_edit">
        <div class="form_group">
          <p>快递名称<i>*</i></p>
          <el-input placeholder="请输入快递名称" v-model="logistics.name"></el-input>
        </div>
        <div class="form_group">
          <p>快递单号<i>*</i></p>
          <el-input type="number" placeholder="请输入快递单号" v-model="logistics.number"></el-input>
        </div>
        <div class="form_group">
          <p>发票号<i>*</i></p>
          <el-input type="number" placeholder="请输入发票号" v-model="logistics.invoice_number"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editInvoceVisible = false; ">取 消</el-button>
        <el-button type="primary" :loading="ruleEditLoading" @click="saveInvoiceExpress">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
var base64 = require('base-64'), page = 1;
var jquery = require('jquery')
import panelTitle from '@/components/panel_title';
export default {
  data(){
    return {
      admin_id: "",
      input5: "",
      not_number: '',
      not_money: '',
      com_money: '',
      com_number: '',
      pageMaxLength: '',
      recharge_query:{
        start: '',
        end: '',
        state: '',
        loading: false,
        state_options: [
          { value: '0', label: '未开票' },
          { value: '1', label: '已开票' }
        ],
        payway: '',
        payway_options:[
          { value: '0', label: '到付' },
          { value: '1', label: '预付' }
        ],
      },
      tableLoading: false,
      tableData: [],
      create_activity_dialog: false,
      create_activity_data: {
        loading: false
      },
      create_invoice_dialog: false,
      change_invoice_dialog: false,
      page: 1,
      rows: [],
      invoiceRuleEditVisible: false, //开票规则设置可见。
      freeRule: '', //免运费最低开票金额
      lowestRule: '', //最低开票金额,
      ruleEditLoading: false, //开票保存

      editInvoceVisible: false, //发票修改
      logistics: {
        name: '',
        number: '',
        invoice_number: ''
      }
    }
  },
  components: {
    panelTitle
  },
  mounted(){
    this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
    this.getInvoiceTableList()
  },
  methods: {
    handleSelectionChange( index ){
      this.rows.length = 0;
      index.forEach( i => {
         this.rows.push(i.fid)
      })
    },
    cancelInvoice(){
      this.invoiceRuleEditVisible = false;
      this.freeRule = '';
      this.lowestRule = ''
    },
    editInvoce( obj ){
      this.editInvoceVisible = true;

      this.logistics.fid = obj.fid;
      this.logistics.name = obj.deliveryCompany
      this.logistics.number = obj.deliveryNo;
      this.logistics.invoice_number = obj.invoiceNo;

    },
    saveInvoiceExpress(){
      let _this = this;
      var data = {
        invoiceNo: _this.logistics.invoice_number,
        deliveryCompany: encodeURI(_this.logistics.name),
        deliveryNo: _this.logistics.number
      }
      for(var i in data){
        if(data[i] == ''){
          this.$message({type: 'warning', message: '请填写完整'})
          return
        }
      }
      data = base64.encode(JSON.stringify(data))
      this.$jquery.post(_this.$request, {
        action: 'invoice_edit',
        admin_id: _this.admin_id,
        fid: _this.logistics.fid,
        data: data
      }, res => {
        if(res.error_code == '0'){
          this.$message({type: 'success', message: '保存成功'})
          this.getInvoiceTableList()
          this.editInvoceVisible = false;
        } else {
          this.$message({type: 'error', message: res.msg})
        }
      }, 'json')
    },
    //设置开票规则可见
    invoiceRuleEdit(){
      this.invoiceRuleEditVisible = true;
    },

    //保存
    ruleEditSave(){
      const that = this;
      var data = {
        "freeRule": that.freeRule,
        "lowestRule": that.lowestRule
      }
      data = base64.encode(JSON.stringify(data))

      this.ruleEditLoading = true;
      this.$jquery.post(that.$request, {
        action: 'invoice_rule_edit',
        admin_id: that.admin_id,
        data: data
      }, res => {
        if( res.error_code == '0'){
          that.$message({type: 'success', message: '设置成功'})
          that.invoiceRuleEditVisible = false;
          that.freeRule = '';
          that.lowestRule = ''
        } else {
          that.$message({ type: 'error', message: res.msg})
        }
        that.ruleEditLoading = false;
      }, 'json')
    },

    rechargeQueryHandler(){
      this.recharge_query.loading = true;
      var that = this;
      var data = {
        status: this.recharge_query.state,
        payway: this.recharge_query.payway
      }

      this.getInvoiceTableList(1, '', base64.encode(JSON.stringify(data)))

    },
    searchInvoice(){
      this.recharge_query.loading = true;
      var that = this;

      this.getInvoiceTableList(1, that.input5)
    },

    //导出列表
    exportActivity(){
      let _this = this;
      const exportArrIds = base64.encode(JSON.stringify(_this.rows));

      this.$jquery.post(_this.$request, {
        action: 'invoice_exp',
        admin_id: _this.admin_id,
        fid: exportArrIds
      }, res => {
        window.location.href = _this.$request+ "?action=invoice_exp&admin_id="+_this.admin_id+"&fid="+exportArrIds
      })


    },

    //上翻页
    turnPagePrev(){
      page = this.page;
      page--
      this.getInvoiceTableList(page, undefined, undefined)
      this.page = page
    },

    //下翻页
    turnPageNext(){
      page = this.page;
      page++
      this.getInvoiceTableList(page, undefined, undefined)
      this.page = page
    },

    //获取发票列表
    getInvoiceTableList(page, name, data){
      const that = this;
      this.tableLoading = true;
      this.$jquery.post(that.$request, {
        action: 'invoice_list',
        admin_id: this.admin_id,
        page: page,
        name: name,
        data: data
      }, res => {
        if( res.error_code == '0' ) {
          that.tableData = res.data.invoice;
          that.not_number = res.data.not_number;
          that.not_money = res.data.not_money;
          that.com_money = res.data.com_money;
          that.com_number = res.data.com_number;

        } else {
          that.$message({ type: 'error', message: res.msg})
        }

        this.pageMaxLength = res.data.invoice.length > 0 ? false : true;
        this.tableLoading = this.recharge_query.loading =  false;
      }, 'json')
    },
    create_activity(){
      this.create_activity_data.loading = true;

      setTimeout( ()=>{
        this.create_activity_data.loading = false;
        this.create_activity_dialog = false;
      }, 1000)
    }
  }
}
</script>

<style lang="scss">
@media (min-width: 1280px){
  .el-table .cell, .el-table th>div{
    padding:0px;
  }
}
.create_invoice,.rule_edit{
  .form_group{
    margin-bottom: 20px;
    p{
      margin: 0px;
      margin-bottom: 10px;
    }
    i{
      color: red;
      font-style: normal;
    }
  }
}
.recharge-activity-setting{
  padding: 0 20px;
  .grid-content{
    background: white;
    border: 1px solid #bfcbd9;
    padding: 30px 20px;
    margin-top: 20px;
    border-radius: 4px;
    em{
      float: right;
      font-style: normal;
    }
  }
  .bg-purple{
    background: #9a4db7;
    border: 1px solid #9a4db7;
    color: white;
    text-align: center;
    cursor: pointer;
  }
  .create_activity{
    overflow: hidden;
    .left,.right{
      width: 50%;
      float: left;
    }
    .left{
      padding-right: 5%;
    }
    .right{
      padding-left: 5%;
    }
  }

  .activity_table_list{
    .operation{
      padding: 0 20px;
      .el-button-group{
        margin: 0 20px;
      }
      .f_right{
        float: right;
        text-align: right;
        padding-right: 0px;
        margin: 0;
        .el-button-group{
          margin:0;
        }
      }
      .custom-icon-stop{
        display: inline-block;
      }
      .custom-icon-stop:after{
        content: '';
        width: 12px;
        height: 12px;
        margin-right: 2px;
        margin-bottom: -2px;
        display: inline-block;
        border-radius: 2px;
        background: #444;
      }
    }
    .activity_table{
      margin: 20px;
    }
  }
  .panel_search{
    margin-top: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    background: white;
    margin-bottom: 10px;
  }
  .panel_recharge_item{
    margin: 20px 0;
    background: white;
    border:1px solid #bfcbd9;
    padding: 20px 0;
    overflow: hidden;
    border-radius: 4px;
    .f_left{
      float: left;
      width: 60%;
      padding-left: 20px;
    }
    .f_right{
      float: right;
      width: 40%;
      padding-right: 20px;
      text-align: right;
    }
  }
  .panel_group{
    padding: 0 20px;
    .block{
      margin-bottom: 20px;
    }
    .el-input{
      width: 100%;
    }
    .el-select{
      width: 100%;
    }
    .el-button{
      display: block;
      width: 100%;
      margin-top: 200px;

    }
  }
}
</style>
