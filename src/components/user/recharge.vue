<template>
  <div class="recharge">
    <div class="integreted_query_group">
      <el-row :gutter="30">
        <el-col :span="6">
          <div  class="btn_item" style="text-align: left; padding-left: 20px;">
            充值总金额（元）
            <span class="f_right" v-text="'￥'+recharge_amount"></span>
          </div>
        </el-col>
        <el-col :span="6">
          <div  class="btn_item" style="text-align: left; padding-left: 20px;">
            账号金额（元）
            <span class="f_right">￥{{balance}}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="integreted_query_group">
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="left">
            <div class="form_group">
              <p>起止日期</p>
              <el-date-picker
                v-model="startTime"
                type="datetime"
                placeholder="选择开始时间">
              </el-date-picker>
              <el-date-picker
                v-model="endTime"
                type="datetime"
                placeholder="选择结束时间">
              </el-date-picker>
            </div>

            <div class="form_group">
              <p>是否优惠</p>
              <el-select v-model="youhui">
                <el-option v-for="item in youhui_options" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </div>

            <div class="form_group">
              <el-button type="primary" @click="query" :loading = "queryLoading">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="_right">
            <el-button type="primary" size="small" :disabled="selectedParkingRow.length == 0" @click="exportRechargeLog">导出报表</el-button>
            <span class="f_right">
              <el-button-group>
                <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
              </el-button-group>
            </span>
            <el-table
            :data="rechargeTable"
            v-loading="tableLoading"
            @selection-change="selection"
            style="width: 100%">
            <el-table-column
                type="selection"
                @selection="selection"
              >

            </el-table-column>
            <el-table-column
              prop="username"
              label="绑定手机号"
              width="180">
            </el-table-column>
            <el-table-column
              prop="payTime"
              label="充值时间"
              width="180">
            </el-table-column>
            <el-table-column
              prop="recharge_money"
              label="充值金额">
            </el-table-column>
            <el-table-column
              prop="total_money"
              label="到账金额">
            </el-table-column>
            <el-table-column
              prop="isDis"
              label="是否优惠">
              <template slot-scope="scope">
                <span v-if="scope.row.isDis == 0">否</span>
                <span v-else>是</span>
              </template>
            </el-table-column>
          </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import { formatDate } from '@/common/date.js';
  var base64 = require('base-64')
  export default {
    name: 'rechargeUser',
    props: ['userid'],
    data(){
      return {
        selectedParkingRow: [],
        youhui: '',
        startTime: '',
        endTime: '',
        tableLoading: false,
        queryLoading: false,
        recharge_amount: 0,
        youhui_options: [
          { value: '0', label: '否'},
          { value: '1', label: '是'}
        ],
        rechargeTable: [],
        page: 1,
        pageMax: false,
        balance: 0,
        uid: '',

        balance: ''
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.uid = this.$props.userid;
      this.getUserRechargeList()
    },
    methods: {
      //按条件查询
      getCondition(){
        const that = this;
        const start = that.startTime ? formatDate(that.startTime, "yyyy-MM-dd hh:mm") : '';
        const end = that.startTime ? formatDate(that.endTime, "yyyy-MM-dd hh:mm") : '';

        if(start > end ){
          this.$message({type: 'warning', message: that.tips.TIME_ERROR})
          throw that.tips.TIME_ERROR
        }
        var params =  {
            "start": that.startTime,
            "end": that.endTime,
            "isDis": that.youhui
        }
        return base64.encode(JSON.stringify(params))
      },
      //获取选中行
      selection(index){
        this.selectedParkingRow = []
        index.forEach( i => {
           this.selectedParkingRow.push(i.crid)
        })
      },
      query(){
        this.getUserRechargeList(this.getCondition(), 1)
      },
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.$emit('page', page)
        this.page = page;
      },

      //导出充值记录链接
      exportRechargeLog(){
        const that = this;

        var crid = base64.encode(JSON.stringify(that.selectedParkingRow));
        this.$jquery.post(that.$request, {
          action: 'rechargelog_exp',
          admin_id: that.admin_id,
          crid: crid
        }, res => {
          window.location.href = that.$request + '?action=rechargelog_exp&admin_id='+that.admin_id+'&crid='+crid
        })
      },
      getUserRechargeList(data, page){
        const that = this;
        this.tableLoading = true
        this.$jquery.post( that.$request, {
          action: 'user_rechargelog',
          admin_id: that.admin_id,
          userid: that.$props.userid,
          data: data,
          page: page,
        }, res => {

          if( res.error_code == '0'){
            this.rechargeTable = res.data.info;
            this.recharge_amount = res.data.recharge_amount || 0;
            this.balance = res.data.balance;

          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          this.pageMax = res.data.length > 0 ? false : true;
          this.tableLoading = this.queryLoading =  false;
        }, 'json')
      }
    },
    filters: {
      formatDate(time){
         var date = new Date( time );
         return formatDate(date, "yyyy-MM-dd hh:mm");
       }
    },
  }
</script>
<style type="text/css" lang="scss" >
.integreted_query_group{
  .f_right{
    padding-right: 10px;
  }
  .left{
    background: white;
    padding: 20px ;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 14px;
    cursor: pointer;
    .form_group{
      margin-bottom: 20px;
      p{
        font-size: 14px;
        margin:0;
        margin-bottom: 5px;
      }
    }
    .el-button{
      margin-top: 100px;
    }
    .el-select, .el-button{
      width: 100%;
    }
    .el-date-editor.el-input{
      width: 100%;
      margin-bottom: 10px;
    }
  }
  ._right{
    background: white;
    padding: 20px ;
  }
  .f_right{
    background: white;
    float: none;
    margin-right: 20px;
  }
}
</style>
