<template lang="html">
  <div class="site">

    <div class="panel_recharg panel_book_order">
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="panel_recharge_item">
            <div class="f_left">充值金额</div>
            <div class="f_right">{{amount}}</div>
          </div>
        </el-col>
        <el-col :span="18">
          <span class="clear_margin"><search @search="search_val"  placeholder="用户账号、绑定的手机号"></search></span>
        </el-col>
      </el-row>
    </div>

    <div class="panel_recharg">
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="panel_recharge_item">
            <div class="panel_group">
              <p>起止日期</p>
              <div class="block">
                <el-date-picker
                  v-model="recharge_query.startTime"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm"
                  placeholder="请选择">
                </el-date-picker>
                <el-date-picker
                  v-model="recharge_query.endTime"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm"
                  placeholder="请选择">
                </el-date-picker>
              </div>
            </div>

            <div class="panel_group">
              <p>是否优惠</p>
              <div class="block">
                <el-select v-model="recharge_query.preferential">
                  <el-option v-for="item in recharge_query.preferential_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"></el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>充值方式</p>
              <div class="block">
                <el-select v-model="recharge_query.payType">
                  <el-option v-for="item in recharge_query.payType_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"></el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <el-button type="primary" :loading="recharge_query.loading" @click="requestRecordData">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="panel_recharge_item activity_table_list">
            <div class="operation">
              <el-button type="primary" :disabled="recharge_query.selectedParkingRow == 0" size="small" @click="exportList">导出列表</el-button>

              <span class="f_right">
                <el-button-group>
                  <el-button size="small" :plain="true" :disabled="true"><i class="el-icon-arrow-left"></i></el-button>
                  <el-button size="small" :plain="true" :disabled="true"><i class="el-icon-arrow-right"></i></el-button>
                </el-button-group>
              </span>
            </div>

            <div class="activity_table">
              <el-table
                :data="tableData"
                v-loading="recordLoading"
                style="width: 100%"
                @selection-change="getSectionRow">

                <el-table-column
                  type="selection"
                  @select="getSectionRow"
                  width="54">
                </el-table-column>

                <el-table-column
                  prop="username"
                  label="充值用户"
                  align="center"
                  width="180">
                </el-table-column>

                <el-table-column
                  prop="payWay"
                  label="充值方式"
                  align="center"
                  width="180">
                  <template slot-scope="scope">
                    <span v-if="scope.row.payWay == '' ">全部</span>
                    <span v-else-if="scope.row.payWay == '0' ">网络支付</span>
                    <span v-else-if="scope.row.payWay == '1' ">现金支付</span>
                    <span v-else-if="scope.row.payWay == '2' ">支付宝支付</span>
                    <span v-else-if="scope.row.payWay == '3' ">微信支付</span>
                    <span v-else-if="scope.row.payWay == '4' ">余额支付</span>
                    <span v-else>未知支付类型</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="payTime"
                  align="center"
                  label="充值时间">
                </el-table-column>
                <el-table-column
                  prop="recharge_money"
                  align="center"
                  label="充值金额（元）">
                </el-table-column>
                <el-table-column
                  prop="total_money"
                  align="center"
                  label="到账金额（元）">
                </el-table-column>
                <el-table-column
                  prop="isDis"
                  align="center"
                  label="是否优惠">
                   <template slot-scope="scope">
                    <span v-if="scope.row.isDis == 0">是</span>
                    <span v-else-if="scope.row.isDis == 1">否</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
var base64 = require('base-64')
import { formatDate } from '@/common/date.js';
import search from '@/components/search'
export default {
  data(){
    return {
      recordLoading: false,
      amount: '', //充值总金额
      recharge_query:{
        startTime: '',
        endTime: '',
        end: '',
        state: '',
        loading: false,
        preferential: '',
        payType: '',
        payType_options: [
          { value: '',  label: '全部' },
          { value: '0', label: '网络支付' },
          { value: '1', label: '现金' },
          { value: '2', label: '支付宝支付' },
          { value: '3', label: '微信支付' },
          { value: '4', label: '余额支付'}
        ],
        preferential_options: [
          { value: '',  label: '所有' },
          { value: '0', label: '是' },
          { value: '1', label: '否' }
        ],
        selectedParkingRow: [],
        loading: false,
        elInputValue: ''
      },
      tableData: []
    }
  },
  methods: {
    search_val(val){
      this.recharge_query.elInputValue = val;
      this.getPayRecordList(val, '', '')
    },
    requestRecordData(){
      const that = this;
      var start = this.recharge_query.startTime ? formatDate( this.recharge_query.startTime, "yyyy-MM-dd hh:mm") : '';
      var end = this.recharge_query.endTime ? formatDate(this.recharge_query.endTime, "yyyy-MM-dd hh:mm") : '';

      if(start > end ){
        this.$message({type: 'warning', message: that.tips.TIME_ERROR})
        return
      }
      var requestParams = {
          "start": start,
          "end": end,
          "isDis": that.recharge_query.preferential,
          "payWay": that.recharge_query.payType
        },
        username = that.recharge_query.elInputValue;

      this.getPayRecordList(username, base64.encode(JSON.stringify( requestParams )), '')
    },
    getPayRecordList(username, data, page){
      const that = this;
      this.recordLoading = true;
      this.$jquery.post(that.$request, {
        action: 'rechargelog_query',
        admin_id: that.admin_id,
        username: username,
        data: data,
        page: page
      }, res => {
        const response = res;
        if( response.error_code == '0') {
          that.tableData = res.data;
          that.amount = res.amount;
        } else {
          that.tableData = []
          that.$message({type: 'error', message: res.msg})
        }

        that.recordLoading = this.recharge_query.loading = false;
      }, 'json')
    },

    //
    getSectionRow(index){
      this.recharge_query.selectedParkingRow = []
      var arr = this.recharge_query.selectedParkingRow
      index.forEach( i => {
         arr.push( parseFloat(i.crid) )
      })

    },

    //导出列表
    exportList(){
      let _this = this;
      let oid = base64.encode(JSON.stringify(_this.recharge_query.selectedParkingRow));

      this.$jquery.post(_this.$request, {
        action: 'rechargelog_exp',
        admin_id: _this.admin_id,
        crid: oid
      }, res => {
        window.location.href = _this.$request + '?action=rechargelog_exp&admin_id='+_this.admin_id+'&crid='+oid;
      })
    }

  },
  components: {
    search
  },
  mounted(){
    this.admin_id = JSON.parse( sessionStorage.getItem('user') ).admin.admin_id;
    this.getPayRecordList()
  },
  filters: {
    formatDate(time){
      var date = new Date( time );
      return formatDate(date, "yyyy-MM-dd hh:mm");
    }
  }
}
</script>

