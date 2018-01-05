<template lang="html">
  <div class="site">

   <search placeholder="车牌号码/操作员/停车场" @search="searchKeyword"></search>
    <div class="panel_book_order">
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
              <p>收费方式</p>
              <div class="block">
                <el-select v-model="recharge_query.payWay">
                  <el-option v-for="item in recharge_query.payWay_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">{{item.label}}</el-option>

                </el-select>
              </div>
            </div>

            <!-- <div class="panel_group">
              <p>计费规则</p>
              <div class="block">
                <el-select v-model="recharge_query.state">
                  <el-option v-for="item in recharge_query.state_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">{{item.label}}</el-option>

                </el-select>
              </div>
            </div> -->

            <div class="panel_group">
              <p>缴费状态</p>
              <div class="block">
                <el-select v-model="recharge_query.payStatus">
                  <el-option v-for="item in recharge_query.payStatus_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">{{item.label}}</el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>订单状态</p>
              <div class="block">
                <el-select v-model="recharge_query.orderStatus">
                  <el-option v-for="item in recharge_query.orderStatus_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">{{item.label}}</el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>停车场</p>
              <div class="block">
                <el-select v-model="recharge_query.parkingLot">
                  <el-option v-for="item in recharge_query.parkingLot_options"
                              :key="item.pid"
                              :label="item.name"
                              :value="item.pid">{{item.name}}</el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>订单来源</p>
              <div class="block">
                <el-select v-model="recharge_query.orderSource">
                  <el-option v-for="item in recharge_query.orderSource_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">{{item.label}}</el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <el-button type="primary" :loading="recharge_query.loading" @click="conditionQuery">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="panel_recharge_item activity_table_list">
            <div class="operation">
              <el-button type="primary" @click="exportOrderlist" :disabled="selectedRow.length == 0" size="small">导出列表</el-button>

              <span class="f_right">
                <el-button-group>
                  <el-button size="small" @click="turnPage('left')" :disabled="page == 1"><i class="el-icon-arrow-left"></i></el-button>
                  <el-button size="small" @click="turnPage('right')" :disabled="pageMax"><i class="el-icon-arrow-right"></i></el-button>
                </el-button-group>
              </span>
            </div>

            <div class="activity_table">
              <el-table
                :data="tableData"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column
                  type="selection"
                  width="35">
                </el-table-column>
                <el-table-column
                  prop="carNumber"
                  label="车牌号码">
                </el-table-column>
                <el-table-column
                  prop="inTime"
                  show-overflow-tooltip
                  label="入场时间">
                </el-table-column>
                <el-table-column
                  prop="outTime"
                  show-overflow-tooltip
                  label="出场时间">
                </el-table-column>
                <el-table-column
                  prop="parking_time"
                  label="停车总时长">
                </el-table-column>
                <el-table-column
                  prop="rule"
                  label="计费规则">
                </el-table-column>
                <el-table-column
                  prop="payWay"
                  label="收费方式">
                  <template slot-scope="scope">
                    <span v-if="scope.row.payWay == 0 || scope.row.payWay == null">网络支付</span>
                    <span v-else-if="scope.row.payWay == 1">现金支付</span>
                    <span v-else-if="scope.row.payWay == 2">支付宝支付</span>
                    <span v-else-if="scope.row.payWay == 3">微信支付</span>
                    <span v-else-if="scope.row.payWay == 4">余额支付</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="payStatus"
                  label="缴费状态">
                  <template slot-scope="scope">
                    <span v-if="scope.row.payStatus == 0">未支付</span>
                    <span v-else-if="scope.row.payStatus == 1">已支付</span>
                    <span v-else-if="scope.row.payStatus == 2">未支付</span>
                    <span v-else-if="scope.row.payStatus == 3">支付</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="orderStatus"
                  label="订单状态">
                   <template slot-scope="scope">
                    <span v-if="scope.row.orderStatus == 0">进行中</span>
                    <span v-else-if="scope.row.orderStatus == 1">欠费</span>
                    <span v-else-if="scope.row.orderStatus == 2">已结束</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="orderSource"
                  label="来源">
                   <template slot-scope="scope">
                    <span v-if="scope.row.orderSource == 0">道闸</span>
                    <span v-else-if="scope.row.orderSource == 1">PDA</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="totalFee"
                  label="金额（元）">
                </el-table-column>
                <el-table-column
                  prop="parkinglotName"
                  label="停车场">
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="操作员">
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
var base64 = require('base-64');
import search from '@/components/search'
import { formatDate } from '@/common/date.js';
export default {
  data(){
    return {
      recharge_query:{
        startTime: '',
        endTime: '',
        keyword: '',
        loading: false,

        //收费方式
        payWay: '',
        payWay_options: [
          { value: '0', label: '网络支付' },
          { value: '1', label: '现金支付' },
          { value: '2', label: '支付宝支付' },
          { value: '3', label: '微信支付' },
          { value: '4', label: '余额支付' },
        ],

        //缴费状态
        payStatus: '',
        payStatus_options: [
          { value: '0', label: '未支付' },
          { value: '1', label: '已支付' },
          { value: '2', label: '未退款' },
          { value: '3', label: '已退款' }
        ],

        //订单状态
        orderStatus: '',
        orderStatus_options: [
          { value: '0', label: '进行中' },
          { value: '1', label: '欠费' },
          { value: '2', label: '已结束' },
          { value: '3', label: '已退款' }
        ],

        //订单来源
        orderSource: '',
        orderSource_options: [
          { value: '0', label: '道闸' },
          { value: '1', label: 'PDA' },
        ],

        //停车场
        parkingLot: '',
        parkingLot_options: []
      },
      tableData: [],
      selectedRow: [],
      page: 1,
      pageMax: false,
    }
  },
  components: {
    search
  },
  mounted(){

    this.admin_id = JSON.parse(sessionStorage.getItem("user")).admin.admin_id;
    this.getOrderlist();
    this.getParkingLot()
  },
  methods: {
    searchKeyword( keyword ){
      this.recharge_query.keyword = keyword;
      this.getOrderlist(keyword)
    },

    getOrderlist(keyword, data, page){
      const that = this;
      this.$jquery.post(that.$request, {
        action: 'order_list',
        admin_id: that.admin_id,
        search: keyword,
        data: data,
        page: page
      }, res => {

        if(res.error_code == '0'){
          that.tableData = res.data
        } else {
          that.tableData = []
          that.$message({ type: 'error', message: res.msg})
        }


        that.pageMax = res.data > 0 ? false : true;
      }, 'json')
    },

    //按条件查询
    conditionQuery(){
      let _this = this;
      let condition = _this.recharge_query;
      var start = condition.startTime ?  formatDate(condition.startTime, "yyyy-MM-dd hh:mm") : '';
      var end   = condition.endTime   ?  formatDate(condition.endTime,  "yyyy-MM-dd hh:mm") : '';
      if(start > end ){
        this.$message({type: 'warning', message: _this.tips.TIME_ERROR})
        return
      }
      var params = {
        "start":start,
        "end":end,
        "payWay": condition.payWay,
        "payStatus": condition.payStatus,
        "orderStatus": condition.orderStatus,
        "pid": condition.parkingLot,
        "orderSource": condition.orderSource
      }

      params = base64.encode(JSON.stringify(params))
      this.getOrderlist(_this.recharge_query.keyword, params, 1)
    },

    //翻页
    turnPage( direction ){
      let _this = this;
      let condition = _this.recharge_query;
      var page = this.page;
      var start = condition.startTime ?  formatDate(condition.startTime, "yyyy-MM-dd hh:mm") : '';
      var end   = condition.endTime   ?  formatDate(condition.endTime,  "yyyy-MM-dd hh:mm") : '';
      var params = {
        "start":start,
        "end":end,
        "payWay": condition.payWay,
        "payStatus": condition.payStatus,
        "orderStatus": condition.orderStatus,
        "pid": condition.parkingLot,
        "orderSource": condition.orderSource
      }
      params = base64.encode(JSON.stringify(params))

      if( direction == 'left'){
        page--
      } else {
        page++
      }
      this.getOrderlist(_this.recharge_query.keyword, params, page)
      this.page = page;
    },

    //获取停车场
    getParkingLot(){
      let _this = this;

      this.$jquery.get(_this.$request+'?action=parkinglot_admin_all&admin_id='+_this.admin_id, {}, res => {
        if( res.error_code == '0'){
          _this.recharge_query.parkingLot_options = res.data;
        }
      }, 'json')
    },

    //导出订单
    exportOrderlist(){
      let _this = this;
      let oid = base64.encode(JSON.stringify(_this.selectedRow));
      this.$jquery.post(_this.$request, {
        action: 'order_exp',
        admin_id: _this.admin_id,
        oid: oid
      }, res => {
        window.location.href = _this.$request + '?action=order_exp&admin_id='+_this.admin_id+'&oid='+oid;
      })
    },

    //获取表格id
    handleSelectionChange(index){
      this.selectedRow = [];
      index.forEach( i => {
         this.selectedRow.push( parseFloat(i.oid) )
      })
    },

  },
  filters: {
    formatDate(time){
       var date = new Date( time );
       return formatDate(date, "yyyy-MM-dd hh:mm");
     }
  },
}
</script>

<style lang="scss">
.panel_recharg{
  .panel_recharge_item{
    background: white;
    border:1px solid #bfcbd9;
    padding: 30px 0;
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
  .clear_margin{
    .panel_search{
      margin:0;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
    }
  }
  .panel_group{
    padding: 0 20px;
    .el-input{
      margin-bottom: 10px;
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
  .f_right{
    float: right;
  }
  .activity_table_list{
    .operation{
      padding: 0 20px;
      .el-button-group{
        margin: 0;
        margin-right: 20px;
      }
      .f_right{
        float: right;
        text-align: right;
        padding-right: 0px;
        margin: 0;
      }
      .custom-icon-stop{
        display: inline-block;
      }
    }
    .activity_table{
      margin: 20px;
    }
    .cell{
      padding-left: 8px;
      padding-right: 8px;
    }
  }
}
</style>
