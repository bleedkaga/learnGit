<template lang="html">
  <div class="recharge-activity-setting">
    <panel-title title="固定车辆设置"></panel-title>

    <!-- 缴费列表 -->
    <paycost-record v-if="paycostRecordVisible" @back="paycostRecordVisible = false"></paycost-record>

    <!-- 固定车辆列表 -->
    <template v-else>
      <search placeholder="固定车牌" @search="search"></search>
      <div  class="panel_recharg">
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
                <el-button type="primary" :loading="recharge_query.loading" @click="rechargeQueryHandler">查询</el-button>
              </div>
            </div>
          </el-col>

          <el-col :span="19">
            <div class="panel_recharge_item activity_table_list">
              <div class="operation">

                  <el-button-group>
                    <el-button size="small" @click="createtParkings"><i class="el-icon-plus"></i></el-button>
                    <el-button size="small" :disabled="fixedCarListToken.length == 0" @click="deleteFixedParking"><i class="el-icon-delete"></i></el-button>
                  </el-button-group>

                  <el-button size="small" @click="pay_record_handler">缴费记录</el-button>

                  <el-button type="primary" @click="export_activity" :disabled="fixedCarListToken.length == 0" size="small">导出列表</el-button>
                <span class="f_right">
                  <el-button-group>
                    <el-button size="small" @click="turnPage('left')" :disabled="page == 1"><i class="el-icon-arrow-left"></i></el-button>
                    <el-button size="small" @click="turnPage('right')" :disabled="pageMax"><i class="el-icon-arrow-right"></i></el-button>
                  </el-button-group>
                </span>


              </div>  <!--opration end-->

              <div class="activity_table">
                <!-- 固定车辆列表 -->
                <el-table
                  ref="multipleTable"
                  :data="fixedTableData"
                  tooltip-effect="dark"
                  style="width: 100%"
                  v-loading="parkingFixedListLoading"
                  v-if="!pay_record_show"
                  @selection-change="getFixedToken">

                  <el-table-column
                    type="selection"
                    align="center"
                    @select="getFixedToken"
                  >
                  </el-table-column>

                  <el-table-column
                    prop="carNumber"
                    label="车牌号码"
                    align="center"
                    >
                    <!-- <template slot-scope="scope">{{ scope.row.date }}</template> -->
                  </el-table-column>

                  <el-table-column
                    prop="startDate"
                    label="开始时间"
                    show-overflow-tooltip
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
                    prop="ownerName"
                    label="车主姓名"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="phoneNumber"
                    label="车主电话"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="status"
                    label="包期状态"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                      <span v-if="scope.row.status == 0">有效</span>
                      <span v-else-if="scope.row.status == 1">已过期</span>
                      <span v-else>未知</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    prop="parkinglotName"
                    label="所属停车场"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="invoice"
                    label="续费"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                      <el-button type="primary" size="small" @click="renewalFee(scope.row.tid, scope.row.carNumber, scope.row.parkinglotId)">续 费</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </template>


    <el-dialog
      title="创建充值活动"
      :visible.sync="create_activity_dialog"
      >
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

    <!-- 创建固定停车位 -->
    <create-parkings v-if="createParkingsVisible" @hideModel="hide"></create-parkings>

    <!-- 固定车辆续费 -->
    <renewal-fees v-if="renewalFeeVisible" :visible="renewalFeeVisible" :carNumber="carNumber" :parking="parkingRenewal" :fixedCarId="fixedCarId" @hideRenewalFee="hideRenewalFee"></renewal-fees>
  </div>
</template>

<script>
var base64 = require('base-64')
import panelTitle from '@/components/panel_title';
import createParkings from '@/components/fixedCar/create.vue';
import search from '@/components/search';
import renewalFees from '@/components/fixedCar/renewal-fee.vue';
import paycostRecord from '@/components/fixedCar/payCostRecord';
import { formatDate } from '@/common/date.js';

export default {
  data(){
    return {
      carNumber: '',
      isTurnNext: true,
      parkingRenewal: '',
      admin_id: '',
      pay_record_show: false,
      createParkingsVisible: false,
      renewalFeeVisible: false,
      fixedCarListToken: [],
      parking: '',
      parking_options: [],
      keyword: '',
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
      loading: true,
      fixedTableData: [],
      payRecordList: [],
      create_activity_dialog: false,
      create_activity_data: {
        loading: false
      },
      create_invoice_dialog: false,
      change_invoice_dialog: false,
      pay_record_list_loading: false,
      parkingFixedListLoading:false,
      page: 1,
      pageMax: false,
      selectedParkingRow: [],
      fixedCarId: '',

      //缴费记录
      paycostRecordVisible: false
    }
  },
  methods: {
    //删除固定停车位
    deleteFixedParking(){
      const that = this;

      this.$confirm('此操作将删除选择的车辆, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$jquery.post(that.$request, {
            action: 'whitelist_del',
            admin_id: that.admin_id,
            tid: base64.encode(JSON.stringify( that.fixedCarListToken))
          }, res => {
            if ( res.error_code == '0') {
              that.$message({
                type: 'success',
                message: '删除成功'
              })
              that.getFixedTableList()
            } else {
              that.$message({
                type: 'error',
                message: res.msg
              })
            }
          }, 'json')
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });

    },

    //列表翻页
    turnPage( direction ){
      let _this = this;
      var page = this.page;
      var start = this.recharge_query.start ? formatDate(this.recharge_query.start, "yyyy-MM-dd hh:mm"): '';
      var end = this.recharge_query.end ? formatDate(this.recharge_query.end, "yyyy-MM-dd hh:mm") : '';
      var data = {
        start: start,
        end:end,
        status: this.recharge_query.state
      }
      data = base64.encode(JSON.stringify(data))
      if( direction == 'left'){
        page--
      } else {
        page++
      }
      this.getFixedTableList(_this.keyword, data, page)
      this.page = page;
    },

    search( keyword ){
      this.keyword = keyword;
      this.getFixedTableList(keyword)
    },
    //固定车辆续费
    renewalFee( id, carNumber, parking ){
      this.fixedCarId = id;
      this.renewalFeeVisible = true
      this.carNumber = carNumber
      this.parkingRenewal = parking;  //固定车辆停车场id
    },

    hideRenewalFee(){
      this.renewalFeeVisible = false;
      this.getFixedTableList()
    },

    //添加停车位
    createtParkings(){
      this.createParkingsVisible = true;
    },
    hide(){
      this.createParkingsVisible = false;
      this.getFixedTableList()
    },
    recharge_query_handler(){
      this.recharge_query.loading = true;

      setTimeout(() => {
        this.recharge_query.loading = false
      }, 3000)
    },
    create_activity(){

      this.create_activity_data.loading = true;
      setTimeout( ()=>{
        this.create_activity_data.loading = false;
        this.create_activity_dialog = false;
      }, 1000)
    },
    pay_record_handler(){
      this.paycostRecordVisible = true;
    },
    getParkingList(){
      const that = this;
      this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id, {}, res => {
        this.parking_options = res.data;
      }, 'json')
    },

    export_activity(){
      const that = this;
      var tid = base64.encode(JSON.stringify(that.fixedCarListToken));

      this.$jquery.post( that.$request, {
        action: 'charge_activity_exp',
        admin_id: that.admin_id,
        aid: tid
      }, res => {

        window.location.href = that.$request+'?action=whitelist_exp&admin_id='+that.admin_id+'&tid='+tid
      })
    },

    //获取固定车辆列表接口
    getFixedTableList(name, data, page){
      const that = this;
      that.parkingFixedListLoading = true;
      this.$jquery.post(that.$request, {
        action: 'whitelist_list',
        admin_id: that.admin_id,
        name: name,
        data: data,
        page: page
      }).then( res => {
        var response ;
        try {
          response = JSON.parse(res);
        } catch (e){
          response = res;
        }


        if( response.error_code == '0') {

          this.fixedTableData = response.data;
          this.keyword = ''
        } else {
          this.$notify({
            type: 'error',
            title: '错误',
            message: response.msg
          })
        }

        this.pageMax = response.data.length > 0 ? false : true;
        that.recharge_query.loading = that.parkingFixedListLoading = false
      }).catch( res => {
        this.$notify({
          type: 'error',
          title: '错误',
          message: res
        });

        that.recharge_query.loading = that.parkingFixedListLoading = false;

      })
    },

    //获取停车场列表
    getParkingsList(){
      const that = this;

      this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id, function ( res ) {
        that.recharge_query.parkings_options = res.data;
      }, 'json')
    },

    requestPayRocord(){
      this.getPayRecordList(this.carNumber)
    },

    //按条件查询
    rechargeQueryHandler(){
      const that = this;
      this.recharge_query.loading = true;

      var requestParams = {
        pid: that.recharge_query.parkings,
        status: that.recharge_query.state
      }

      requestParams = base64.encode(JSON.stringify(requestParams));
      this.getFixedTableList(that.keyword, requestParams, undefined)
    },

    //按车牌号查询
    requestCarNumbers(){
      const requestParamsForCarNumber = this.carNumber;
      this.getFixedTableList(requestParamsForCarNumber, '', ' ')
    },


    //获取固定车辆列表
    getFixedToken(index){
      this.fixedCarListToken = [];
      index.forEach( i => {
         this.fixedCarListToken.push( parseFloat(i.tid) )
      })
    },

    //
    getRowSelected(index){
      this.selectedParkingRow = [];
      index.forEach( i => {
         this.selectedParkingRow.push( parseFloat(i.chaid) )
      })
    },
  },
  mounted(){
    this.admin_id = JSON.parse(sessionStorage.getItem("user")).admin.admin_id;
    this.getFixedTableList();
    this.getParkingsList();

  },
  components: {
    panelTitle,
    createParkings,
    renewalFees,
    search,
    paycostRecord
  },
  filters: {
    formatDate(time){
      var date = new Date( time );
      return formatDate( date, "yyyy-MM-dd hh:mm");
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
.create_invoice{
  .form_group{
    margin-bottom: 20px;
    p{ margin: 0; margin-bottom: 5px;}
    .el-select, .el-input{ width: 100%;}
    i{
      color: red;
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
  }
  .create_activity{
    overflow: hidden;
    .left,.right{
      width: 45%;
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
        margin: 0;
        margin-right: 20px;
      }
      .f_right{
        float: right;
        text-align: right;
        padding-right: 0px;
        margin: 0;
        .el-button-group{
          margin:0
        }
      }
      .custom-icon-stop{
        display: inline-block;
      }
    }
    .activity_table{
      margin: 20px;
    }
  }
  .pay_record{
    margin-top: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    background: white;
    margin-bottom: 10px;
    overflow: hidden;
    display: flex;
    span{
      cursor: pointer;
    }
    .pay_record_search{
      width: 100%;
    }
    em{
      width: 79.5%;
      display: inline-block;
      font-style: normal;
    }
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

}
</style>
