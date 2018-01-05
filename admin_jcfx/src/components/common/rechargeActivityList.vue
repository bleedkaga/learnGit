<template>
  <div class="recharge_activity">
    <div class="location">
      <el-row :gutter="10">
        <el-col :span="6">
          <div class="setting" @click="back"><span  style="line-height:36px;"><i class="el-icon-arrow-left"></i>充值记录</span></div>
        </el-col>
        <!-- <el-col  :span="18">
          <el-input placeholder="搜索" v-model="input">
            <el-button slot="append" icon="search" @click="keywordSearch"></el-button>
          </el-input>
        </el-col> -->
      </el-row>
    </div>
    <div class="table_list">
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="left">
            <div class="form_group">
              <p>起止日期</p>
              <el-date-picker type="datetime" v-model='start' placeholder='请输入起止日期'></el-date-picker>
              <el-date-picker type="datetime" v-model='end' placeholder='请输入起止日期'></el-date-picker>
            </div>
            <div class="form_group">
              <el-button type="primary" @click="query">查  询</el-button>
            </div>
          </div>
        </el-col>
        <el-col  :span="18">
          <div class="right">
            <div class="top">
              <el-button type="primary" size="small" :disabled="selectedParkingRow.length == 0" @click="exportChargeActivityRecord">导出列表</el-button>
              <span class="f_right">
                <el-button-group>
                  <el-button size="small" @click="turnPage('left')"  :disabled="page == 1"><i class="el-icon-arrow-left"></i></el-button>
                  <el-button size="small" @click="turnPage('right')" :disabled="pageMax"><i class="el-icon-arrow-right"></i></el-button>
                </el-button-group>
              </span>
            </div>
            <el-table :data="rechargeActivityRecordData" v-loading="tableLoading" @selection-change="handleSelectionChange">
              <el-table-column type="selection" @select="handleSelectionChange"></el-table-column>
              <el-table-column label="充值账号" prop="username"></el-table-column>
              <el-table-column label="充值金额" prop="recharge_money"></el-table-column>
              <el-table-column label="赠送金额" prop="gift_money"></el-table-column>
              <el-table-column label="实际到账金额" prop="total_money"></el-table-column>
              <el-table-column label="充值时间" prop="payTime"></el-table-column>
              <el-table-column label="充值方式" prop="payWay">
                <template slot-scope="scope">
                  <span v-if="scope.row.payWay == 0">网络支付</span>
                  <span v-else-if="scope.row.payWay == 1">现金支付</span>
                  <span v-else-if="scope.row.payWay == 2">支付宝支付</span>
                  <span v-else-if="scope.row.payWay == 3">微信支付</span>
                  <span v-else-if="scope.row.payWay == 4">余额支付</span>
                  <span v-else>未知</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script type="text/javascript">
  var base64 = require('base-64');
  import { formatDate } from '@/common/date.js';
  export default {
    name: 'rechargeActivity',
    props: ['aid'],
    data(){
      return {
        input: '',
        start: '',
        end: '',
        rechargeActivityRecordData: [],
        page: 1,
        pageMax: false,
        tableLoading: false,
        selectedParkingRow: [],
        keyword: ''
      }
    },
    filters: {
      formatDate(time){
         var date = new Date( time );
         return formatDate(date, "yyyy-MM-dd hh:mm");
       }
    },

    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getData()
    },
    methods: {
      keywordSearch(  ){ //搜索关键词
        this.query()
      },
      query( ){
        var that = this;
        var start = that.start ? formatDate(that.start, "yyyy-MM-dd hh:mm") : '';
        var end = that.end ? formatDate(that.end, "yyyy-MM-dd hh:mm") : '';
        var params = {
          "start": start,
          "end": end,
        }
        var keyword = this.input;

        this.getData(keyword, base64.encode(JSON.stringify(params)));
      },
      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow;
        index.forEach( i => {
           arr.push( parseFloat(i.crid) )
        })
      },

      //导出充值记录链接
      exportChargeActivityRecord(){
        const that = this;

        var crid = base64.encode(JSON.stringify(that.selectedParkingRow));
        this.$jquery.post(that.$request, {
          action: 'charge_activitylog_exp',
          admin_id: that.admin_id,
          crid: crid
        }, res => {
          window.location.href = that.$request + '?action=charge_activitylog_exp&admin_id='+that.admin_id+'&crid='+crid;
        }).ajaxError(function(){
          alert('出错了')
        })
      },

      getData(keyword, data, page){
        const that = this;
        this.tableLoading = true;
        this.$jquery.post(that.$request, {
          action: 'charge_activity_log',
          admin_id: that.admin_id,
          aid: that.aid,
          keyword: keyword,
          data: data,
          page: page
        }, res => {
          if( res.error_code == '0'){
            that.rechargeActivityRecordData = res.data;
            that.keyword = ''
          } else {
            that.$message({ type: 'error', message: res.msg})
          }
          this.tableLoading = false;
          this.pageMax = res.data.length > 0 ? false : true;
        }, 'json')
      },

      back(){
        this.$emit('back')
      },

      turnPage( direction ){
        var that = this;
        var start = that.start ? formatDate(that.start, "yyyy-MM-dd hh:mm") : '';
        var end = that.end ? formatDate(that.end, "yyyy-MM-dd hh:mm") : '';

        var params = {
          "start": start,
          "end": end,
        }
        var keyword = this.input;
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getData(keyword, base64.encode(JSON.stringify(params)), page)
        this.page = page;
      },
    }
  }
</script>
<style type="text/css" lang="scss" scoped>
  .location{
    background: white;
    padding: 20px;
    margin-top: 40px;
    border: 1px solid #bfcbd9;
    .setting{ cursor: pointer; }
  }
  .table_list{
    margin-top: 30px;
    .left, .right{ padding : 20px; background: white; border: 1px solid #bfcbd9; border-radius: 2px;}
    .left .el-date-editor{ width: 100%; margin-bottom: 10px;}
    .left .el-button{ width: 100%; margin-bottom: 10px; margin-top: 100px;}
    .right{ background: white;}
    .right .top{ margin-bottom: 20px;}
    .f_right{ float: right;}
  }
</style>
