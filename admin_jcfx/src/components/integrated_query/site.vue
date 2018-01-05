<template lang="html">
  <div class="site">
    <search @search="search_val" placeholder="车牌号码/停车场"></search>

    <div class="panel_book_order">

      <el-row :gutter="30">

        <el-col :span="6">
          <div class="panel_recharge_item">

            <div class="panel_group">
              <p>车辆类型</p>
              <div class="block">
                <el-select v-model="recharge_query.carType">
                  <el-option v-for="item in recharge_query.carType_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"></el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>停车类型</p>
              <div class="block">
                <el-select v-model="recharge_query.parking">
                  <el-option v-for="item in recharge_query.parking_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"></el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>停车场</p>
              <div class="block">
                <el-select v-model="recharge_query.parkingspace">
                  <el-option v-for="item in recharge_query.parkinglist"
                              :key="item.pid"
                              :label="item.name"
                              :value="item.pid"></el-option>

                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <el-button type="primary" :loading="recharge_query.loading" @click="rechargeQueryHandler">查询</el-button>
            </div>
          </div>
        </el-col>

        <el-col :span="18">
          <div class="panel_recharge_item activity_table_list">
            <div class="operation">
              <el-button @click="" type="primary" size="small" :disabled="selectedRow.length == 0" @click="exportParkingList">导出信息</el-button>

              <span class="f_right">
                <el-button-group>
                  <el-button size="small" @click="turnPagePrev" :disabled="this.recharge_query.page == 1"><i class="el-icon-arrow-left"></i></el-button>
                  <el-button size="small" @click="turnPageNext" :disabled="this.recharge_query.next"><i class="el-icon-arrow-right"></i></el-button>
                </el-button-group>
              </span>
            </div>  <!--opration end-->

            <div class="activity_table">
              <el-table
                ref="multipleTable"
                :data="rechargeTableData"
                v-loading="rechargeQueryLoading"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">

                <el-table-column
                  type="selection"
                  align="center"
                  @select="handleSelectionChange"
                  width="55">
                </el-table-column>

                <el-table-column
                  prop="carNumber"
                  label="车牌号码"
                  align="center"
                  width="120">
                  <!-- <template slot-scope="scope">{{ scope.row.date }}</template> -->
                </el-table-column>

                <el-table-column
                  prop="carType"
                  label="车辆类型"
                  align="center"
                  width="120">
                  <template slot-scope="scope">
                    <span v-if="scope.row.carType == 0">大型车</span>
                    <span v-else-if="scope.row.carType == 1">中型车</span>
                    <span v-else-if="scope.row.carType == 2">小型车</span>
                    <span v-else>位置车辆类型</span>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="inTime"
                  label="通行时间"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="carUrl"
                  label="车牌图片"
                  width="140"
                  align="center"
                  filter-placement="bottom-end">
                  <template slot-scope="scope">
                  {{scope.row.carUrl}}
                    <img v-if="scope.row.carUrl" style="width:100%" :src="scope.row.carUrl" />
                    <span v-else>无车牌图片</span>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="pType"
                  label="停车类型"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span v-if="scope.row.pType == 0">临时车</span>
                    <span v-else-if="scope.row.pType == 1">月租车</span>
                    <span v-else>未知</span>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="parkinglotName"
                  label="停车场"
                  align="center"
                  show-overflow-tooltip>
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
import search from '@/components/search'
export default {
  data(){
    return {
      admin_id: '',
      recharge_query: {
        elInputValue: '',
        carType: '',
        carType_options: [ { value: '', label: '所有'}, { value: '0', label: '大型车'}, { value: '1', label: '中型车'}, { value: '2', label: '小型车'}],
        parking: '',
        parking_options: [ { value: '', label: '所有'}, { value: '0', label: '临时车'}, { value: '1', label: '月租车'}],
        parkingspace: '',
        parkinglist: [],
        page: 1,
        next: false,
      },
      rechargeTableData:[],
      rechargeQueryLoading: false,
      selectedRow: [],
    }
  },
  methods: {
    search_val(val){
      this.recharge_query.elInputValue = val;
      this.getParkingList(val, '', '');
    },

    //上一页
    turnPagePrev(){
      var page = this.recharge_query.page,
          requestParams = {
            pid: this.recharge_query.parkingspace,
            carType: this.recharge_query.carType,
            pType: this.recharge_query.parking
          };
      page--;

      this.getParkingList(this.recharge_query.elInputValue, base64.encode(JSON.stringify(requestParams)), page)
      this.recharge_query.page = page
    },

    //下一页
    turnPageNext(){
      var page = this.recharge_query.page,
          requestParams = {
            pid: this.recharge_query.parkingspace,
            carType: this.recharge_query.carType,
            pType: this.recharge_query.parking
          };
      page++;

      this.getParkingList(this.recharge_query.elInputValue, base64.encode(JSON.stringify(requestParams)), page)
      this.recharge_query.page = page
    },


    //表格选中
    handleSelectionChange(index){
      this.selectedRow = [];
      index.forEach( i => {
         this.selectedRow.push( parseFloat(i.pcarid) )
      })
    },

    //场内列表查询
    getParkingList(name, data, page){

      const that = this;
      this.rechargeQueryLoading = true
      this.$jquery.post(that.$request, {
        action: 'parkinglot_car_list',
        admin_id: that.admin_id,
        name: name,
        data: data,
        page: page
      },  res => {
        if( res.data.length == 0){
          that.recharge_query.next = true;
        } else {
          that.recharge_query.next = false;
        }
        that.rechargeTableData = res.data;
        that.rechargeQueryLoading = this.recharge_query.loading = false;
      }, 'json')
    },

    //按条件查询
    rechargeQueryHandler(){
      this.recharge_query.loading =  true;
      this.rechargeQueryLoading = true

      var requestParams = {
        pid: this.recharge_query.parkingspace,
        carType: this.recharge_query.carType,
        pType: this.recharge_query.parking
      },

      name = this.recharge_query.elInputValue;
      console.log(requestParams)
      requestParams = base64.encode(JSON.stringify(requestParams))

      this.getParkingList(name, requestParams)
    },

    //导出场内车辆链接
    exportParkingList(){
      const that = this;

      this.$jquery.post(that.$request, {
        action: 'parkinglot_car_exp',
        admin_id: that.admin_id,
        pcarid:  base64.encode(JSON.stringify(that.selectedRow))
      }, res => {
        window.location.href = that.$request+'?action=parkinglot_car_exp&admin_id='+ that.admin_id +'&pcarid='+ base64.encode(JSON.stringify(that.selectedRow));
      })
    },

    //获取停车场列表
    getParkingSpaceList(){
      const that = this;

      this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id,{}, res => {
        that.recharge_query.parkinglist = res.data;
      }, 'json')
    }
  },
  mounted(){
    this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
    this.getParkingList()
    this.getParkingSpaceList()
  },
  components: {
    search
  }
}
</script>
