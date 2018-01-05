<template lang="html">
  <div class="recharge-activity-setting">
    <panel-title title="充值活动设置"></panel-title>

    <recharge-activity-list v-if="rechargeActivityListVisible" @back="back" :aid="aid"></recharge-activity-list>
    <span v-else>
      <div class="panel_search" >
        <el-input placeholder="活动名称" v-model="activityName">
          <el-button slot="append" icon="search" @click="searchKeyword"></el-button>
        </el-input>
      </div>

      <div class="panel_recharg">
        <el-row :gutter="20">
          <el-col :span="5">
            <div class="panel_recharge_item">
              <div class="f_left">充值金额</div>
              <div class="f_right" v-text="chargeAmount"></div>
            </div>
          </el-col>
          <el-col :span="5">
            <div class="panel_recharge_item">
              <div class="f_left"> 用户账户剩余（元）</div>
              <div class="f_right" v-text="balance"></div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="panel_recharg">

        <el-row :gutter="20">

          <el-col :span="5">
            <div class="panel_recharge_item">
              <div class="panel_group">
                <p>起止日期</p>
                <div class="block">
                  <el-date-picker
                    v-model="recharge_query.start"
                    type="datetime"
                    format="yyyy-MM-dd HH:mm"
                    placeholder="选择日期时间">
                  </el-date-picker>
                </div>
                <div class="block">
                  <el-date-picker
                    v-model="recharge_query.end"
                    type="datetime"
                    format="yyyy-MM-dd HH:mm"
                    placeholder="选择日期时间">
                  </el-date-picker>
                </div>
              </div>

              <div class="panel_group">
                <p>活动状态</p>
                <el-select v-model="recharge_query.state">
                  <el-option v-for="item in recharge_query.state_options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">{{item.label}}</el-option>

                </el-select>
              </div>

              <div class="panel_group">
                <el-button type="primary"  :loading="recharge_query.loading" @click="requestPayActivityHandler">查询</el-button>
              </div>
            </div>
          </el-col>

          <el-col :span="19">
            <div class="panel_recharge_item activity_table_list">
              <div class="operation">
                <el-button @click="create_activity_dialog = true" size="small"><i class="el-icon-plus"></i></el-button>
                <el-button-group>
                  <el-button size="small" :disabled="selectedParkingRow.length ==0" @click="charge_activity_status(1)"><i class="el-icon-caret-right"></i> 开始</el-button>
                  <el-button size="small" :disabled="selectedParkingRow.length ==0" @click="charge_activity_status(2)"><i class="custom-icon-stop"></i> 结束</el-button>
                </el-button-group>
                <el-button type="primary" @click="exportActivity" :disabled="selectedParkingRow.length == 0" size="small">导出活动列表</el-button>

                <span class="f_right">
                  <el-button-group>
                    <el-button size="small" @click="turnPage('left')" :disabled="page == 1"><i class="el-icon-arrow-left"></i></el-button>
                    <el-button size="small" @click="turnPage('right')" :disabled="pageMax"><i class="el-icon-arrow-right"></i></el-button>
                  </el-button-group>
                </span>
              </div>  <!--opration end-->

              <div class="activity_table">
                <el-table
                  ref="multipleTable"
                  :data="payActivityList"
                  tooltip-effect="dark"
                  v-loading="recharge_query.loading"
                  style="width: 100%"
                  @selection-change="handleSelectionChange">

                  <el-table-column
                    type="selection"
                    @select="handleSelectionChange"
                    width="55">
                  </el-table-column>

                  <el-table-column
                    prop="name"
                    label="活动名称"
                    align="center">
                    <!-- <template slot-scope="scope">{{ scope.row.date }}</template> -->
                  </el-table-column>

                  <el-table-column
                    prop="start"
                    label="开始时间"
                    align="center"
                    width="200">
                  </el-table-column>

                  <el-table-column
                    prop="end"
                    label="结束时间"
                    align="center"
                    width="200"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="recharge_money"
                    label="充值金额（元）"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="total_money"
                    label="到账金额（元）"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="gift_money"
                    label="赠送金额（元）"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="status"
                    label="活动状态"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                      <span v-if="scope.row.status == 0"> 未开始</span>
                      <span v-else-if="scope.row.status == 1"> 进行中</span>
                      <span v-else-if="scope.row.status == 2"> 已结束</span>
                      <span v-else> 未知活动状态</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    prop="record"
                    label="充值记录"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                      <a class="viewActivity" @click="viewActivity(scope.row)" href="javascript:;"> 查看</a>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </span>

    <el-dialog
      title="创建充值活动"
      :visible.sync="create_activity_dialog">
      <div class="create_activity">
        <div class="left">
          <div class="form-group">
            <p>活动名称</p>
            <el-input v-model="create_activity_data.name" placeholder="请输入活动名称"></el-input>
          </div>

          <div class="form-group">
            <p>开始时间</p>
            <el-date-picker
               v-model="create_activity_data.startTime"
               type="datetime"
               format="yyyy-MM-dd HH:mm"
               placeholder="选择日期时间">
             </el-date-picker>
          </div>

          <div class="form-group">
            <p>结束时间</p>
            <el-date-picker
               v-model="create_activity_data.endTime"
               type="datetime"
               format="yyyy-MM-dd HH:mm"
               placeholder="选择日期时间">
             </el-date-picker>
          </div>
        </div>
        <div class="right">
          <div class="form-group">
            <p>用户支付金额（元）</p>
            <el-input min="0" type="number" v-model="create_activity_data.chargeAmount" placeholder="请输入用户支付金额"></el-input>
          </div>

          <div class="form-group">
            <p>实际到账金额（元）</p>
            <el-input min="0" type="number" v-model="create_activity_data.realAmount" placeholder="请输入实际到账金额"></el-input>
          </div>

          <div class="form-group">
            <p>赠送上线金额（元）</p>
            <el-input min="0" type="number" v-model="create_activity_data.limit" placeholder="请输入赠送上线金额"></el-input>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="create_activity_dialog = false">取 消</el-button>
        <el-button type="primary" :loading="create_activity_data.loading" @click="createActivity">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
var base64 = require('base-64'), page = 1;
import rechargeActivityList from '@/components/common/rechargeActivityList';
import panelTitle from '@/components/panel_title';
import { formatDate } from '@/common/date.js';
export default {
  data(){
    return {
      value1: "",
      admin_id: '',
      activityName: '',
      chargeAmount: '',
      balance: '',
      recharge_query:{
        start: '',
        chargeAmount: 0,
        balance: 0,
        end: '',
        state: '',
        loading: false,
        state_options: [
          { value: '0', label: '未开始' },
          { value: '1', label: '进行中' },
          { value: '2', label: '已结束' }
        ]
      },
      payActivityList: [],
      create_activity_dialog: false,
      create_activity_data: {
        loading: false,
        name: '',
        startTime: '',
        endTime: '',
        chargeAmount: '',
        realAmount: '',
        limit: ''
      },
      time:1469281964000,
      page: 1,
      rechargeActivityListVisible: false,
      aid: '',
      keyword: '',
      pageMax: false,
      selectedParkingRow: []
    }
  },
  mounted(){
    this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
    this.getPayActivityList()
  },
  components: {
    rechargeActivityList,
    panelTitle
  },
  methods: {
    searchKeyword(  ){
      this.getPayActivityList( this.activityName )
    },
    exportActivity(){   //导出活动列表
      let _this = this;
      var aid = base64.encode(JSON.stringify(_this.selectedParkingRow))
      this.$jquery.post(_this.$request, {
        action: 'charge_activity_exp',
        admin_id: _this.admin_id,
        aid: aid
      }, res => {
        window.location.href = _this.$request + "?action=charge_activity_exp&admin_id="+_this.admin_id+"&aid="+aid
      })
    },
    back(){
      this.rechargeActivityListVisible = false;
    },
    //状态选中
    handleSelectionChange( index ){
      this.selectedParkingRow = []
      var arr = this.selectedParkingRow;
      index.forEach( i => {
         arr.push( parseFloat(i.aid) )
      })
    },

    //更改活动状态
    charge_activity_status(type){
      let _this = this;

      var aid = base64.encode(JSON.stringify(_this.selectedParkingRow))
      this.$jquery.post(_this.$request, {
        action: 'charge_activity_status',
        admin_id: _this.admin_id,
        ty: type,
        aid : aid
      }, res => {
        if(res.error_code == '0'){
          this.$message({type: 'success', message: '修改成功'})
          this.getPayActivityList(_this.activityName, '', this.page)
        } else {
          this.$message({type: 'error', message: res.msg})

        }
      }, 'json')
    },

    viewActivity( obj ){
      this.rechargeActivityListVisible = true;
      this.aid  = obj.aid;
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
      this.getPayActivityList(_this.activityName, data, page)
      this.page = page;
    },

    //条件查询
    requestPayActivityHandler(){
      let _this = this;

      var start = this.recharge_query.start ? formatDate(this.recharge_query.start, "yyyy-MM-dd hh:mm"): '';
      var end = this.recharge_query.end ? formatDate(this.recharge_query.end, "yyyy-MM-dd hh:mm") : '';
      if(start > end){
        this.$message({type: 'warning', message: _this.tips.TIME_ERROR})
        return
      } else {
        var data = {
          start: start,
          end:end,
          status: this.recharge_query.state
        }

        data = base64.encode(JSON.stringify(data))

        this.recharge_query.loading = true;
        this.getPayActivityList(_this.activityName, data, 1)
      }

    },

    createActivity(){

      let _this = this;
      const start = this.create_activity_data.startTime ? formatDate(this.create_activity_data.startTime, "yyyy-MM-dd hh:mm") : '';
      const end = this.create_activity_data.endTime ? formatDate(this.create_activity_data.endTime, "yyyy-MM-dd hh:mm") : '';
      if(start > end){
        this.$message({type: 'warning', message: "请设置合理的活动时间"})
        throw '请设置合理的活动时间'
      }
      var data = {
        activityName: encodeURI(this.create_activity_data.name),
        startTime: start,
        endTime: end,
        chargeAmount: this.create_activity_data.chargeAmount,
        realAmount: this.create_activity_data.realAmount,
        limit: this.create_activity_data.limit
      }
      this.create_activity_data.loading = true;
      this.$jquery.post(_this.$request, {
        action: "charge_activity_add",
        admin_id: this.admin_id,
        data : base64.encode( JSON.stringify( data ) )
      }, res => {
        if( res.error_code == '0' ) {
          this.$message({
            type: 'success',
            message: '添加成功'
          })
        this.getPayActivityList()
        for(var i in this.create_activity_data){
          this.create_activity_data[i] = ''
        }

        this.create_activity_dialog = false;
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }

        _this.create_activity_data.loading = false;

      }, 'json')

    },

    getPayActivityList(name, data, page){
      var data = data, page = page, that = this;
      this.recharge_query.loading = true;
      this.$jquery.post(that.$request, {
        action: 'charge_activity_list',
        admin_id: that.admin_id,
        name: name,
        data: data,
        page: page
      }, res => {
        const response = res;
        if( response.error_code == '0' ) {
          this.payActivityList = response.data.activity;
          this.chargeAmount = response.data.chargeAmount;
          this.balance = response.data.balance;

        } else {
          this.payActivityList = []
          this.$message({
            type: 'error',
            message: res.msg
          })

        }
        this.recharge_query.loading = false;
        this.pageMax = response.data.activity > 0 ? false : true;

      }, 'json')
    }
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
.recharge-activity-setting{
  padding: 0 20px;
  .viewActivity{
    text-decoration: none;
    color: #ea8209;
  }
  .create_activity{
    overflow: hidden;
    .left,.right{
      width: 40%;
      float: left;
    }
    .left{
      padding-right: 5%;
    }
    .right{
      padding-left: 5%;
    }
    .el-input{
      width: 100%
    }
  }
  .form-group{
    margin-bottom: 20px;
  }
  .form-group p, .panel_group p{
    margin-bottom: 5px;
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
    margin-top: 40px;
    padding: 20px;
    border: 1px solid #ddd;
    background: white;
    margin-bottom: 10px;
  }

  .panel_recharge_item{
    margin: 10px 0;
    background: white;
    border:1px solid #bfcbd9;
    padding: 20px 0;
    overflow: hidden;
    border-radius: 4px;
    .f_left{
      float: left;
      width: 40%;
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
