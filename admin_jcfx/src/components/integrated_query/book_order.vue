<template lang="html">
  <div class="site">

    <search placeholder="预约ID/车牌号码/停车场" @search="searchKeyword"></search>
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
              <el-button type="primary" :loading="recharge_query.loading" @click="conditionQuerys(1)">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="panel_recharge_item activity_table_list">
            <div class="operation">
              <el-button type="primary" @click="exportReservationList" size="small" :disabled="selectedRow.length == 0">导出订单</el-button>

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
                  prop="reid"
                  label="预约订单ID">
                </el-table-column>
                <el-table-column
                  prop="startTime"
                  label="预约时间">
                </el-table-column>
                <el-table-column
                  prop="expireTime"
                  label="最迟入场时间">
                </el-table-column>
               <!--  <el-table-column
                  prop="chongzhiTime"
                  label="最早入场时间">
                </el-table-column> -->
                <el-table-column
                  prop="duration"
                  label="预约时长">
                </el-table-column>
                <el-table-column
                  prop="carNumber"
                  label="预约车牌">
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="订单状态">
                  <template slot-scope="scope">
                    <span v-if="scope.row.status == 0">已预约</span>
                    <span v-else-if="scope.row.status == 1">预约失败</span>
                    <span v-else-if="scope.row.status == 2">预约成功</span>
                    <span v-else-if="scope.row.status == 3">取消</span>
                    <span v-else-if="scope.row.status == 4">使用中</span>
                    <span v-else-if="scope.row.status == 5">预约超时</span>
                    <span v-else-if="scope.row.status == 6">结束</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="payedFee"
                  label="金额（元）">
                </el-table-column>
                <el-table-column
                  prop="parkinglotName"
                  label="停车场">
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
import search from '@/components/search';
import { formatDate } from '@/common/date.js';
export default {
  data(){
    return {
      page: 1,
      pageMax: false,
      recharge_query:{
        startTime: '',
        endTime: '',
        keyword: '',
        loading: false,
        //订单状态
        orderStatus: '',
        orderStatus_options: [
          { value: '0', label: '已预约' },
          { value: '1', label: '预约失败' },
          { value: '2', label: '预约成功' },
          { value: '3', label: '取消' },
          { value: '4', label: '使用中' },
          { value: '5', label: '预约超时' },
          { value: '6', label: '结束' }
        ],

        //停车场
        parkingLot: '',
        parkingLot_options: [],

        state_options: [
          {
            value: '1',
            label: '状态1'
          },
          {
            value: '2',
            label: '状态2'
          }
        ]
      },
      selectedRow: [],
      tableData: []
    }
  },
  mounted(){
    this.admin_id = JSON.parse(sessionStorage.getItem("user")).admin.admin_id;
    this.getParkingLot()
    this.getReservationList()
  },
  methods: {

    searchKeyword( keyword ){
      this.recharge_query.keyword = keyword;
      this.page = 1;
      this.getReservationList(keyword, null, 1)
    },

    //翻页
    turnPage( direction ){
      var page = this.page;
      if( direction == 'left'){
        page--
      } else {
        page++
      }
      this.conditionQuerys(page)
      this.$emit('page', page)
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

    //按照条件查询
    conditionQuerys( page ){

      let _this = this;
      let condition = _this.recharge_query;
      let start = condition.startTime ? formatDate(condition.startTime, "yyyy-MM-dd hh:mm") : '';
      let end  = condition.endTime ? formatDate(condition.endTime,  "yyyy-MM-dd hh:mm") : '';
      if(start > end ){
        this.$message({type: 'warning', message: _this.tips.TIME_ERROR})
        return
      }
      var params = {
        "start":start,
        "end": end,
        "status":condition.orderStatus,
        "pid": condition.parkingLot
      }

      params = base64.encode(JSON.stringify(params))
      this.getReservationList(_this.recharge_query.keyword, params, page)
    },


    //查询预约订单
    getReservationList(keyword, data, page){
      var _this = this;

      _this.$jquery.post(_this.$request, {
        action: 'reservation_list',
        admin_id: _this.admin_id,
        name: keyword,
        data: data,
        page: page
      }, res => {

        if(res.error_code == '0'){
          _this.tableData = res.data
        } else {
          _this.tableData = []
          _this.$message({ type: 'error', message: res.msg})
        }

        _this.pageMax = res.data ? false : true;
      }, 'json')
    },

     //导出订单
    exportReservationList(){
      let _this = this;
      let oid = base64.encode(JSON.stringify(_this.selectedRow));
      this.$jquery.post(_this.$request, {
        action: 'reservation_exp',
        admin_id: _this.admin_id,
        reid: oid
      }, res => {
        window.location.href = _this.$request + '?action=reservation_exp&admin_id='+_this.admin_id+'&reid='+oid;
      })
    },

    //获取表格id
    handleSelectionChange(index){
      this.selectedRow = [];
      index.forEach( i => {
         this.selectedRow.push( parseFloat(i.reid) )
      })
    },
  },
  components: {
    search
  },
  filters: {
    formatDate(time){
       var date = new Date( time );
       return formatDate(date, "yyyy-MM-dd hh:mm");
     }
  },
}
</script>

