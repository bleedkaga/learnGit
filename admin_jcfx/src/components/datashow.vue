<template>
  <div class="datashow">
    <panel-title title="数据统计"></panel-title>

    <h1 class="datatime-picker">
      起止日期： &nbsp;
      <el-date-picker
        v-model="startTime"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        placeholder="选择日期时间">
      </el-date-picker>
       ----
      <el-date-picker
        v-model="endTime"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        placeholder="选择日期时间">
      </el-date-picker>
      &nbsp;&nbsp;&nbsp;
      <el-button @click="queryProjectData">确定</el-button>
    </h1>

    <div class="data-statistical" >
      <p>项目数据统计</p>
      <div class="data_container" v-loading="statisticalLoading">
        <div class="data_item" id="d1" :style="{'background-color': statisticalLoading ? '#ddd': '#fff'}"></div>
        <div class="data_item" id="d2" :style="{'background-color': statisticalLoading ? '#ddd': '#fff'}"></div>
        <div class="data_item" id="d3" :style="{'background-color': statisticalLoading ? '#ddd': '#fff'}"></div>
        <div class="data_item" id="d4" :style="{'background-color': statisticalLoading ? '#ddd': '#fff'}"></div>
      </div>
    </div>

    <div class="data-statistical">
      <div class="panel_inline">
        停车场： &nbsp;&nbsp;&nbsp;
        <el-select v-model="parkinglot_id" @change="parkingSelectChange">
          <el-option v-for="item in parkings" :key="item.pid" :label="item.name" :value="item.pid"></el-option>
        </el-select>
      </div>
      <div class="panel_data">
        <div class="panel_small_item bg_green">
          <p>今日停车订单总数</p>
          <p>{{parkingData.order_number}}</p>
        </div>
        <div class="panel_small_item bg_blue">
          <p>今日停车订单总金额</p>
          <p v-text="parkingData.order_money"></p>
        </div>
        <div class="panel_small_item bg_yellow">
          <p>今日空闲车位</p>
          <p v-text="parkingData.idle"></p>
        </div>
        <div class="panel_small_item bg_red">
          <p>今日车位使用率</p>
          <p v-text="parkingData.use_rate"></p>
        </div>
      </div>
    </div>

    <div class="map" v-loading="parkingDataQueryLoading">
      <div class="map_info">
        <ul>
          <li @click="$router.push({path: 'parking-lock', query: {parkinglot_id: parkingData.parkinglot_id}})" class="pointer"><span>车位锁数量</span> <i v-text="parkingData.lock_all"></i></li>
          <li><span>低电量状态</span> <i v-text="parkingData.lock_lowpower"></i></li>
          <li><span>故障状态</span> <i v-text="parkingData.lock_fault"></i></li>
        </ul>
        <ul class="gateway">
          <li @click="$router.push({path: 'gateway', query: {parkinglot_id: parkingData.parkinglot_id}})" class="pointer"><span>网关数量</span> <i v-text="parkingData.gateway_all"></i></li>
          <li><span>离线状态</span> <i v-text="parkingData.gateway_offline"></i></li>
        </ul>
        <ul>
          <li @click="$router.push({path: 'earth', query: {parkinglot_id: parkingData.parkinglot_id}})" class="pointer"><span>地磁数量</span> <i v-text="parkingData.geom_all"></i></li>
          <li><span>低电量状态</span> <i v-text="parkingData.geom_lowpower"></i></li>
          <li><span>离线状态</span> <i v-text="parkingData.geom_offline"></i></li>
        </ul>
      </div>
      <div id="container" class="map_container">

      </div>
    </div>

  </div>
</template>
<script type="text/javascript">
  import AMap from 'AMap';
  import panelTitle from '@/components/panel_title';
  import echarts from 'echarts';
  import { formatDate } from '@/common/date.js';
  export default {
    name:  'datashow',
    filters: {
      formatDate(time){
        var date = new Date( time );
        return formatDate(date, "yyyy-MM-dd hh:mm");
      }
    },
    data(){
      return {
        charts: "",
        projectCharts : {
          registerUserCount : {
            init: '',
            opinion: ['微信', 'APP']
          },
          parkingOrderCount: {
            init: ""
          },
          parkingOrderAmount: {
            init: ""
          },
          rechargeAllAmount: {
            init:""
          }
        },
        parkingDataQueryLoading: false,
        parkingData: {},
        parking:"",
        parkings: [],
        parkinglot_id: "",
        startTime: "",
        endTime: "",
        statisticalLoading: true,
        tooltip : {
          trigger: 'item',
          formatter: '{b}:{c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          // data:this.projectCharts.registerUserCount.opinion
        }

      }
    },

    mounted(){
      const that = this;
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      //获取停车场
      this.$jquery.post(this.$request+'?action=parkinglot_admin_all', {admin_id: that.admin_id}, res => {
        this.parkings = JSON.parse(res).data
      })

      //项目数据统计
      this.getProductData()

      //获取停车场数据统计
      this.getParkingDataCount();
    },
    methods: {

      //获取项目数据统计
      getProductData(){
        const that = this;
        var start = that.startTime ? formatDate( that.startTime, "yyyy-MM-dd hh:mm") : '';
        var end = that.endTime ? formatDate( that.endTime, "yyyy-MM-dd hh:mm") : '';

        this.$jquery.post(this.$request, {
          action: 'data_project',
          admin_id: that.admin_id,
          start: start,
          end: end
        }, res => {
          if(res.error_code == '0'){
            var response = res;

            this.projectCharts.registerUserCount = response.data.user;
            this.projectCharts.parkingOrderCount = response.data.order_number;
            this.projectCharts.parkingOrderAmount = response.data.order_money;
            this.projectCharts.rechargeAllAmount = response.data.recharge_record;

            this.renderRegisterUsers('d1')
            this.renderParkingOrderCount('d2')
            this.renderParkingOrderAmount('d3')
            this.renderParkingAllAmount('d4')
          } else{
            that.$message({type: 'error', message: res.msg})
          }
          that.statisticalLoading = false;
        }, 'json')
      },

      //更改停车场查询
      parkingSelectChange(){
        this.parkingDataQueryLoading = true
        this.getParkingDataCount()
      },

      //获取停车场数据统计
      getParkingDataCount(parkinglot_id){
        const that = this;
        this.$jquery.post(this.$request, {
          action: 'data_parking',
          admin_id: that.admin_id,
          parkinglot_id: that.parkinglot_id
        }, res => {
          const data = res.data;
          if(res.error_code == '0'){
            this.parkingData = data;
            initMap([data.coordinateX, data.coordinateY], data.parkinglotName)
          } else {
            that.$message({type: 'error', message: res.msg})
          }

          this.parkingDataQueryLoading = false


        }, 'json')
      },

      //根据时间查询项目数据
      queryProjectData(){
        if( this.startTime == ''){
          this.$message({
            type: 'warning',
            message: '请选择起始时间'
          })
          return
        }

        if( this.endTime == ''){
          this.$message({
            type: 'warning',
            message: '请选择结束时间'
          })
          return
        }
        this.statisticalLoading = true
        this.getProductData()
      },

      //用户注册数
      renderRegisterUsers(id){
        const user = document.getElementById(id)
        this.projectCharts.registerUserCount.init = echarts.init(user);
        this.projectCharts.registerUserCount.init.setOption({
          tooltip: this.tooltip,
          legend: this.legend,
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          title: {
            text: '注册用户数',
            padding: 20,
            textStyle:{
              color:"#666"
            },
            subtext: (Number(this.projectCharts.registerUserCount.wei) + Number(this.projectCharts.registerUserCount.app)).toFixed(2),
            subtextStyle: {
              color:"#666",
              fontSize: 26
            }
          },
          series : [
            {
              type:'pie',
              radius : '50%',
              center: ['50%', '60%'],
              data:[
                  {value:this.projectCharts.registerUserCount.wei, name:'微信', color: 'red'},
                  {value:this.projectCharts.registerUserCount.app, name:'app'}
              ],
              avoidLabelOverlap: false,
              labelLine:{
                normal:{
                  lineStyle:{
                    width:2
                  }
                }
              }
            }
          ]
        })
      },

      //停车订单总数
      renderParkingOrderCount(id){
        const orderCountContainer = document.getElementById(id)
        this.projectCharts.parkingOrderCount.init = echarts.init(orderCountContainer);
        this.projectCharts.parkingOrderCount.init.setOption({
          tooltip: this.tooltip,
          legend: this.legend,
          title: {
            text: '停车订单总数',
            padding: 20,
            textStyle:{
              color:"#666"
            },
            subtext: (Number(this.projectCharts.parkingOrderCount.cash)+Number(this.projectCharts.parkingOrderCount.net)+Number(this.projectCharts.parkingOrderCount.other)).toFixed(2),
            subtextStyle: {
              color:"#666",
              fontSize: 26
            }
          },
          series : [
            {
              type:'pie',
              radius : '50%',
              center: ['50%', '60%'],
              data:[
                   {value:this.projectCharts.parkingOrderCount.cash, name:'现金'},
                  {value:this.projectCharts.parkingOrderCount.net, name:'网络支付'},
                  // {value:this.projectCharts.parkingOrderCount.other, name:'其他'}
              ],
              avoidLabelOverlap: false,
              labelLine:{
                normal:{
                  lineStyle:{
                    width:2
                  }
                }
              }
            }
          ]
        })
      },

      //停车订单总金额
      renderParkingOrderAmount(id){
        const parkingOrderContainer = document.getElementById(id)
        this.projectCharts.parkingOrderAmount.init = echarts.init(parkingOrderContainer);
        this.projectCharts.parkingOrderAmount.init.setOption({
          tooltip: this.tooltip,
          title: {
            text: '停车订单总金额',
            padding: 20,
            textStyle:{
              color:"#666"
            },
            subtext: (Number(this.projectCharts.parkingOrderAmount.cash)+Number(this.projectCharts.parkingOrderAmount.net)+Number(this.projectCharts.parkingOrderAmount.other)).toFixed(2),
            subtextStyle: {
              color:"#666",
              fontSize: 26
            }
          },
          legend: this.legend,
          series : [
            {
              type:'pie',
              radius : '50%',
              center: ['50%', '60%'],
              data:[
                   {value:this.projectCharts.parkingOrderAmount.cash, name:'现金'},
                  {value:this.projectCharts.parkingOrderAmount.net, name:'网络支付'},

              ],
              avoidLabelOverlap: false,
              labelLine:{
                normal:{
                  lineStyle:{
                    width:2
                  }
                }
              }
            }
          ]
        })
      },

      //充值总金额
      renderParkingAllAmount(id){
        const parkingAllContainer = document.getElementById(id)
        this.projectCharts.rechargeAllAmount.init = echarts.init(parkingAllContainer);
        this.projectCharts.rechargeAllAmount.init.setOption({
          tooltip: this.tooltip,
          legend: this.legend,
          title: {
            text: '充值总金额',
            padding: 20,
            textStyle:{
              color:"#666"
            },
            subtext: (Number(this.projectCharts.rechargeAllAmount.cash)+Number(this.projectCharts.rechargeAllAmount.net)).toFixed(2),
            subtextStyle: {
              color:"#666",
              fontSize: 22
            }
          },
          series : [
            {
              type:'pie',
              radius : '50%',
              center: ['50%', '60%'],
              data:[
                   {value:this.projectCharts.rechargeAllAmount.cash, name:'现金支付'},
                  {value:this.projectCharts.rechargeAllAmount.net, name:'网络支付'}
              ],
              avoidLabelOverlap: false,
              labelLine:{
                normal:{
                  lineStyle:{
                    width:2
                  }
                }
              }
            }
          ]
        })
      }
    },
    components: {
      panelTitle
    }
  }

  function initMap(coordinates, labelname){
    var map = new AMap.Map('container', {
        resizeEnable: true,
        center: coordinates,
        zoom: 20
    });

    var marker = new AMap.Marker({
        position: map.getCenter()
    });

    marker.setMap(map);

    // 设置label标签
    marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
        offset: new AMap.Pixel(-80, -80),//修改label相对于maker的位置
        content: labelname
    });
  }
</script>
<style lang="scss">
  $blue: #3395dd;
  $green: #64d120;
  $yellow: #ffb900;
  $red : #e94337;
  *{
    margin:0;
    padding:0;
  }
  .amap-marker-label{
    height: 50px;
    width: 180px;
    text-align: center;
    line-height: 40px;
    border:none;
    border: 1px solid #ddd;
    box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
    font-size: 16px;
    position: relative;
    &:after{
      content: "";
      position: absolute;
      width: 12px;
      height: 12px;
      left: 50%;
      bottom: -6px;
      box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
      margin-left: -6px;
      background: white;
      transform: rotateZ(45deg);
    }
  }
  .datashow{
    overflow: hidden;
    text-align: left;
    padding-right:20px;
    padding-left:20px;

    .datatime-picker{
      background: white;
      padding: 30px 10px;
      font-size: 16px;
      margin: 30px 0;
      border: 1px solid #ddd;
      input[type="button"]{
        background: #62cb31;
        font-size: 14px;
        color: white;
        border: none;
        padding: 4px 9px;
        border-radius: 4px;
      }
    }
    .data-statistical{
      margin-bottom: 40px;
      p{
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        font-family: 'Microsoft Yahei';
      }
      .data_container{
        overflow: hidden;
        display: flex;
        display: -webkit-box;
      }
      .data_item{
        width: 23.5%;
        width: 23%\0;
        margin-right: 1.7%;
        border: 1px solid #ddd;
        background: #ddd;
        border-radius: 4px;
        height: 227px;
        float: left\0;
        display: inline-block\0;
      }
      .panel_inline{
        background: white;
        padding: 20px 10px;
      }
    }
    .panel_data{
      margin-top: 40px;
      display: flex;
      overflow: hidden;
    }
    .panel_small_item{
      width: 24%;
      width: 23.5%\0;
      margin-right: 2%;
      padding: 40px 0;
      text-align: center;
      color: white;
      border-radius: 6px;
      float: left\0;
      display: inline-block\0;
      &:last-child{
        margin:0
      }
      p{
        height: 40px;
        line-height: 40px;
        font-size: 18px;
        font-family: 'Microsoft Yahei';
        &:last-child{
          margin-top: 30px;
          font-size: 60px;
          margin-bottom: 30px;
        }
      }
    }
    .bg_green{
      background: $green;
    }
    .bg_red{
      background: $red;
    }
    .bg_yellow{
      background: $yellow;
    }
    .bg_blue{
      background: $blue
    }
    .map{
      margin-bottom: 50px;
      overflow: hidden;
    }
    .map_info{
      width: 23.5%;
      border: 1px solid #ddd;
      float: left;
      margin-right: 2%;
      box-sizing: border-box;
      background: white;
      ul{
        margin-bottom: 20px;
        padding: 20px 0;
        list-style-type: none;
        width: 90%;
        margin: 0 auto;
        li{
          height: 50px;
          line-height: 50px;
          font-size: 14px;
          overflow: hidden;
          position: relative;
          &:first-child{
          background: #f8f9fb;
          border: 1px solid #e9eaec;
          }
          span{
            float: left;
            padding-left: 2em;
          }
          i{
            float: right;
            padding-right: 1em;
            font-style: normal;
          }
        }
        &:first-child li:first-child span:before{
          content: "";
          width: 8px;
          height: 8px;
          position: absolute;
          left: 10px;
          top: 50%;
          margin-top: -4px;
          border-radius: 4px;
          background: #f17e00;
        }
        &.gateway li:first-child span:before{
          content: "";
          width: 8px;
          height: 8px;
          position: absolute;
          left: 10px;
          top: 50%;
          margin-top: -4px;
          border-radius: 4px;
          background: #a148c8;
        }
        &:last-child li:first-child span:before{
          content: "";
          width: 8px;
          height: 8px;
          position: absolute;
          left: 10px;
          top: 50%;
          margin-top: -4px;
          border-radius: 4px;
          background: #2499da;
        }
      }
    }
    .map_container{
      width: 74.5%;
      float: right;
      height: 622px;
    }
  }

</style>
