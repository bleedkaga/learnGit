<template>
  <div class="parking-record">
    <el-row :gutter="30">
      <el-col :span="6">
        <div class="left">
          <div class="form_group">
            <p>起止日期</p>
            <el-date-picker v-model="request.start" format="yyyy-MM-dd HH:mm"  type="datetime"  placeholder="选择起始日期"></el-date-picker>
            <el-date-picker v-model="request.end"  format="yyyy-MM-dd HH:mm" type="datetime" placeholder="选择结束日期"></el-date-picker>
          </div>

          <div class="form_group">
            <p>收费方式</p>
            <el-select v-model="request.payWay">
              <el-option v-for="item in request.payWay_options" :label="item.label" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </div>

         <!--  <div class="form_group">
            <p>计费规则</p>
            <el-select></el-select>
          </div>
 -->
          <div class="form_group">
            <p>缴费状态</p>
            <el-select v-model="request.payStatus">
              <el-option v-for="item in request.payStatus_options" :label="item.label" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </div>

          <div class="form_group">
            <p>订单状态</p>
            <el-select v-model="request.orderStatus">
              <el-option v-for="item in request.orderStatus_options" :label="item.label" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </div>

          <div class="form_group">
            <p>停车场</p>
            <el-select v-model="request.parking">
              <el-option v-for="item in request.parking_options" :label="item.name" :value="item.pid" :key="item.pid"></el-option>
            </el-select>
          </div>

          <div class="form_group">
            <p>订单来源</p>
            <el-select v-model="request.orderSource">
              <el-option v-for="item in request.orderSource_options" :label="item.label" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </div>

          <div class="form_group">
            <el-button type="primary" @click="query" :loading="queryLoading">查 询</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="right">
          <el-button type="primary" size="small" :disabled="selectedParkingRow.length == 0" @click="exportOrder">导出订单</el-button>
          <span class="f_right">
            <el-button-group>
              <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
              <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
            </el-button-group>
          </span>
          <el-table :data="userOrderList" v-loading="tableLoading" @selection-change="getSectionRow">
            <el-table-column         type="selection"></el-table-column>
            <el-table-column prop="carNumber" label="车牌号码"></el-table-column>
            <el-table-column prop="inTime" label="入场时间"></el-table-column>
            <el-table-column prop="outTime" label="出场时间"></el-table-column>
            <el-table-column prop="parking_time" label="停车总时长" width="110"></el-table-column>
            <el-table-column prop="rule" label="计费规则"></el-table-column>
            <el-table-column prop="payWay" label="收费方式">
              <template slot-scope="scope">
                <span v-if="scope.row.payWay == 0"> 网络支付</span>
                <span v-else-if="scope.row.payWay == 1">现金支付</span>
                <span v-else-if="scope.row.payWay == 2">支付宝支付</span>
                <span v-else-if="scope.row.payWay == 3">微信支付</span>
                <span v-else-if="scope.row.payWay == 4">余额</span>
                <span v-else>----</span>
              </template>
            </el-table-column>
            <el-table-column prop="payStatus" label="缴费状态">
              <template slot-scope="scope">
                <span v-if="scope.row.payStatus == 0"> 未支付</span>
                <span v-else-if="scope.row.payStatus == 1">已支付</span>
                <span v-else-if="scope.row.payStatus == 2">未退款</span>
                <span v-else-if="scope.row.payStatus == 3">已退款</span>
                <span v-else>----</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderStatus" label="订单状态">
              <template slot-scope="scope">
                <span v-if="scope.row.orderStatus == 0"> 进行中</span>
                <span v-else-if="scope.row.orderStatus == 1">欠费</span>
                <span v-else-if="scope.row.orderStatus == 2">已结束</span>
                <span v-else>----</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderSource" label="来源">
              <template slot-scope="scope">
                <span v-if="scope.row.orderSource == 0"> 道闸</span>
                <span v-else-if="scope.row.orderSource == 1">PDA</span>
                <span v-else>----</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalFee" label="金额（元）" width="110"></el-table-column>
            <el-table-column prop="parkinglotName" label="停车场"></el-table-column>
            <el-table-column prop="name" label="操作员"></el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import { formatDate } from '@/common/date.js';
  var base64 = require('base-64')
  export default {
    name: 'parking-record',
    props: ['userid'],
    data(){
      return {
        start: '',
        end: '',
        page: 1,
        pageMax: false,
        userOrderList: [],
        tableLoading: false,
        selectedParkingRow: [],
        queryLoading: false,
        request: {
          start: '',
          end: '',
          payWay: '',
          payWay_options: [
            { value: '0', label:'网络支付'},
            { value: '1', label:'现金支付'},
            { value: '2', label:'支付宝支付'},
            { value: '3', label:'微信支付'},
            { value: '4', label:'余额支付'},
          ],
          payStatus: '',
          payStatus_options: [
            { value: '0', label:'未支付'},
            { value: '1', label:'已支付'},
            { value: '2', label:'未退款'},
            { value: '3', label:'已退款'}
          ],
          orderStatus: '',
          orderStatus_options: [
            { value: '0', label:'进行中'},
            { value: '1', label:'欠费'},
            { value: '2', label:'已结束'},
          ],
          orderSource: '',
          orderSource_options: [
            { value: '0', label:'道闸'},
            { value: '1', label:'PDA'},
          ],
          parking: '',
          parking_options: []
        }
      }
    },
    methods: {
      //获取选中行
      getSectionRow(index){
        this.selectedParkingRow.length = 0;
        index.forEach( i => {
           this.selectedParkingRow.push(i.oid)
        })
      },

      //获取用户订单列表
      getUserOrderList( data, page ){
        const that = this;

        this.queryLoading = true;
        this.tableLoading = true;

        this.$jquery.post(that.$request, {
          action: 'user_order_list',
          admin_id: that.admin_id,
          userid: that.$props.userid,
          data: data,
          page: page,
        }, res => {
          if( res.error_code == '0'){
            this.userOrderList = res.data;
          } else {
            this.$message({ type: 'error', message: res.msg })
          }

          this.tableLoading = this.queryLoading = false;
          this.pageMax = res.data.length > 0 ? false : true;
        }, 'json')
      },

      //收费翻页
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }

        this.getUserOrderList(this.getCondition(), page)
        this.page = page;
      },

      getCondition(){
        const that = this;
        const p = this.request;
        const start = that.request.start ? formatDate(that.request.start, "yyyy-MM-dd hh:mm") : '';
        const end = that.request.end ? formatDate(that.request.end, "yyyy-MM-dd hh:mm") : '';
        if(start > end ){
          this.$message({type: 'warning', message: that.tips.TIME_ERROR})
          throw that.tips.TIME_ERROR
        }
        var params = {
          "start": start,
          "end": end,
          "payWay": p.payWay,
          "payStatus": p.payStatus,
          "orderStatus": p.orderStatus,
          "pid": p.parking,
          "orderSource": p.orderSource
        }
        return base64.encode(JSON.stringify(params))
      },

      //按条件查询
      query(){

        this.getUserOrderList(this.getCondition(), 1)
      },

      //导出订单
      exportOrder(){
        const that = this;
        var oids = base64.encode(JSON.stringify(that.selectedParkingRow))
        this.$jquery.post(that.$request, {
          action: 'order_exp',
          admin_id: that.admin_id,
          oid: oids
        }, res => {
          window.location.href = this.$request+'?action=order_exp'+'&admin_id='+that.admin_id+'&oid='+oids
        })
      },

      //获取停车场列表
      getParkingList(){
        const that = this;
        this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id, {}, res => {
          this.request.parking_options = res.data;
        }, 'json')
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getUserOrderList();
      this.getParkingList()
    },
    filters: {
      formatDate(time){
         var date = new Date( time );
         return formatDate(date, "yyyy-MM-dd hh:mm");
       }
    },
  }
</script>
<style type="text/css" lang="scss">
.parking-record{
  margin-top: 30px;
  .left, .right{
    border: 1px solid #bfcbd9;
    background: white;
    border-radius: 4px;
    padding: 20px;
  }
  .left {
    .form_group{
      margin-bottom: 20px;
    }
    p{
      margin:0;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .el-date-editor.el-input, .el-select{
      width: 100%;
      margin-bottom: 10px;
    }
    .el-button{
      width: 100%;
      margin-top: 100px;
    }
  }
}

</style>
