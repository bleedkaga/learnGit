<template>
  <div class="pay_cost_record">
    <div class="pay_const_search">
      <el-row  :gutter="20">
        <el-col :span="5">
          <span class="panel_arrow_left" @click="back_parking_list" >
            <i class="el-icon-arrow-left"></i>
            缴费记录
          </span>
        </el-col>
        <el-col :span="19">
          <em>
            <el-input placeholder="固定车牌"  v-model="carNumber" >
              <el-button  slot="append" icon="search" @click="requestPayRocord"></el-button>
            </el-input>
          </em>
        </el-col>
      </el-row>

    </div>

    <div class="panel_recharg">
      <el-row :gutter="20">
        <el-col :span="5">
          <div class="panel_recharge_item">
            <div class="panel_group">
              <p>所属停车场</p>
              <div class="block">
                <el-select v-model="recharge_query.parkings">
                  <el-option v-for="item in recharge_query.parkings_options" :key="item.pid" :label="item.name" :value="item.pid">{{item.name}}</el-option>
                </el-select>
              </div>
            </div>

            <div class="panel_group">
              <p>包期状态</p>
              <el-select v-model="recharge_query.state">
                <el-option v-for="item in recharge_query.state_options" :key="item.value" :label="item.label" :value="item.value">{{item.label}}</el-option>
              </el-select>
            </div>

            <div class="panel_group">
              <el-button  type="primary" :loading="pay_record_list_loading" @click="payRecordQuery">查 询</el-button>
            </div>
          </div>
        </el-col>

        <el-col :span="19">
          <div class="panel_recharge_item activity_table_list">
            <div class="operation">
                <el-button type="primary" @click="exportPayRecord" :disabled="selectedParkingRow.length == 0" size="small">导出列表</el-button>

                <span class="f_right">
                  <el-button-group>
                    <el-button size="small" icon="arrow-left"  :disabled="page == 1" @click="turnPage('left')"></el-button>
                    <el-button size="small" icon="arrow-right" :disabled="pageMax"   @click="turnPage('right')"></el-button>
                  </el-button-group>
                </span>
            </div>  <!--opration end-->

            <div class="activity_table">
              <!-- 缴费列表 -->
              <el-table
                ref="multipleTable"
                :data="payRecordList"
                v-loading="pay_record_list_loading"
                element-loading-text="加载中"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="getRowSelected">

                <el-table-column
                  type="selection"
                  align="center"
                  @select="getRowSelected"
                >
                </el-table-column>

                <el-table-column
                  prop="carNumber"
                  label="车牌号码"
                  align="center">
                </el-table-column>

                <el-table-column
                  prop="startDate"
                  label="开始时间"
                  align="center"
                  >
                </el-table-column>

                <el-table-column
                  prop="endDate"
                  label="结束时间"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="type"
                  label="包期类型"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="fee"
                  label="包期金额"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="duration"
                  label="包期时长"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>


                <el-table-column
                  prop="parkingId"
                  label="分配车位"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="chargeAmount"
                  label="充值金额"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="payTime"
                  label="充值时间"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="parkinglotName"
                  label="所属停车场"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="adminName"
                  label="操作员"
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
  var base64 = require('base-64');
  export default {
    name: 'payCostRecord',
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem("user")).admin.admin_id;
      this.getPayRecordList()
      this.getParkingsList()
    },
    data(){
      return {
        pay_record_show: false,
        carNumber: '',
        pay_record_list_loading: false,
        selectedParkingRow: [],
        payRecordList: [],
        page: 1,
        pageMax: false,
        recharge_query:{
          start: '',
          end: '',
          state: '',
          loading: false,
          parkings_options: [],
          parkings:'',
          state_options: [
            { value: '0', label: '有效' },
            { value: '1', label: '已过期' }
          ]
        },
      }
    },
    methods: {

      //表格选中
      getRowSelected(index){
        this.selectedParkingRow = [];
        index.forEach( i => {
           this.selectedParkingRow.push( parseFloat(i.chaid) )
        })
      },
      //返回列表
      back_parking_list(){
        this.$emit('back')
      },

      //按条件查询缴费列表
      payRecordQuery(){
        var requestParams = {
          pid: this.recharge_query.parkings,
          status: this.recharge_query.state
        },
        name = this.carNumber;

        this.page = 1;
        this.getPayRecordList(name, base64.encode(JSON.stringify(requestParams)), 1)
      },

      //获取停车场列表
      getParkingsList(){
        const that = this;

        this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id,{}, function ( res ) {
          that.recharge_query.parkings_options = res.data;
        }, 'json')
      },


      //按车牌号查询
      requestCarNumbers(){
        const requestParamsForCarNumber = this.carNumber;
        this.getFixedTableList(requestParamsForCarNumber, '', ' ')
      },

      requestPayRocord(){
        this.getPayRecordList(this.carNumber)
      },

      //获取缴费列表接口
      getPayRecordList(name, data, page){
        const that = this;
        this.pay_record_list_loading = true
        this.$jquery.post(that.$request, {
          action: 'whitelist_charge_list',
          admin_id: that.admin_id,
          name: name,
          data: data,
          page: page
        }, function( res ){

          if(res.error_code == '0'){
            that.payRecordList = res.data;
            that.pay_record_list_loading = false;
          } else {
            that.$message({type: 'error', message: res.msg})
          }

          that.pageMax = res.data.length > 0 ? false : true;
        }, 'json');
      },

      //按条件查询
      rechargeQueryHandler(){
        const that = this;
        this.recharge_query.loading = true;

        var requestParams = {
          pid: that.recharge_query.parkings,
          status: that.recharge_query.state
        }
        requestParams = that.$base64.encode(JSON.stringify(requestParams));
        this.getFixedTableList(undefined, requestParams, undefined)
      },

      turnPage( direction ){
        const that = this;
        var requestParams = {
          pid: that.recharge_query.parkings,
          status: that.recharge_query.state
        }
        requestParams = that.$base64.encode(JSON.stringify(requestParams));
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getPayRecordList(that.carNumber, requestParams, page)
        this.page = page;
      },


      //导出缴费记录
      exportPayRecord(){
        const that = this;

        this.$jquery.post( that.$request, {
          action: 'whitelist_charge_exp',
          admin_id: that.admin_id,
          chaid: that.$base64.encode(JSON.stringify(that.selectedParkingRow))
        })
        .then( res => {
          window.location.href = that.$request+'?action=whitelist_charge_exp&admin_id='+that.admin_id+'&chaid='+that.$base64.encode(JSON.stringify(that.selectedParkingRow))
        })
      },
    }
  }
</script>
<style type="text/css" lang="scss" scoped>
  .pay_const_search{
    background: white;
    border: 1px solid #bfcbd9;
    padding: 20px;
    padding-left: 0px;
    margin-top: 30px;
    margin-bottom: 10px;
    .panel_arrow_left{
      margin-left: 20px;
      display: inline-block;
      line-height: 36px;
      cursor: pointer;
    }
  }
</style>
