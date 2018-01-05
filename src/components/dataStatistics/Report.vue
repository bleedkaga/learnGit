<template>
	<div class="report">
		<panel-title title="停车报表"></panel-title>

		<div class="panel">
			<el-row>
				<el-col :span="5">
					<el-select placeholder="请选择停车场" v-model="parking">
						<el-option v-for="item in parkingList" :key="item.pid" :label="item.name" :value="item.pid"></el-option>
					</el-select>
				</el-col>
				<el-col :span="7">
					<div>
						<label>停车日期：</label>
						<el-date-picker
					      v-model="date"
					      type="date"
					      placeholder="选择日期">
					    </el-date-picker>
					</div>
				</el-col>
				<el-col :span="4">
					<el-button type="success" @click="queryReportHandle">确 定</el-button>
				</el-col>
			</el-row>
		</div>

		<!-- 空闲车位报表面板 -->
		<div class="panel-report">
			<h4>空闲车位</h4>
			<div class="panel-report-inline">
				<el-row>
					<el-col :span="20">
						<div  id="freeParking" style="height: 295px;" v-loading="loading1"></div>
					</el-col>
					<el-col :span="4">
						<div class="panel-report-description">
							<p class="small-title">{{parkinglot}}</p>
							<h1 class="title">空闲车位</h1>
							<p class="date">{{formatedDate}}</p>
						</div>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="20">
						<p class="charts-info"><span>X:当日时间（h)&nbsp;&nbsp;&nbsp;&nbsp;Y：空闲车位（个）</span></p>
					</el-col>
				</el-row>
			</div>
		</div>

		<!-- 占用车位数表面板 -->
		<div class="panel-report">
			<h4>占用车位数</h4>
			<div class="panel-report-inline">
				<el-row>
					<el-col :span="20">
						<div id="occupiedParking" style="height: 295px;" v-loading="loading2"></div>
					</el-col>
					<el-col :span="4">
						<div class="panel-report-description">
							<p class="small-title">{{parkinglot}}</p>
							<h1 class="title">占用车位数</h1>
							<p class="date">{{formatedDate}}</p>
						</div>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="20">
						<p class="charts-info"><span>X:当日时间（h)&nbsp;&nbsp;&nbsp;&nbsp;Y：占用车位（个）</span></p>
					</el-col>
				</el-row>
			</div>
		</div>

		<!-- 车位使用率面板 -->
		<div class="panel-report">
			<h4>车位使用率</h4>
			<div class="panel-report-inline">
				<el-row>
					<el-col :span="20">
						<div id="parkingUseage" style="height: 295px;" v-loading="loading3"></div>
					</el-col>
					<el-col :span="4">
						<div class="panel-report-description">
							<p class="small-title">{{parkinglot}}</p>
							<h1 class="title">车位使用率</h1>
							<p class="date">{{formatedDate}}</p>
						</div>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="20">
						<p class="charts-info"><span>X:当日时间（h)&nbsp;&nbsp;&nbsp;&nbsp;Y：车位使用率（%）</span></p>
					</el-col>
				</el-row>
			</div>
		</div>
	</div>
</template>

<script>
	import qs from 'qs'
	import panelTitle from '@/components/panel_title';
	import echarts from 'echarts';
	import mixin from '../../common/mixin.js'

	export default {
		name: 'dataReport',
		data(){
			return {
				date: '',
				parking: '',
				reports: {
					freeParking:{
						init: '',
						data: undefined
					},
					occupiedParking:{
						init: '',
						data: undefined
					},
					parkingUseage: {
						init: '',
						data: undefined
					}
				},
				parkinglot: '',
				parkingList: [],
				formatedDate: new Date().Format("yyyy-MM-dd"),
				loading1: true,
				loading2: true,
				loading3: true,
			}
		},
		mixins: [mixin],
		components: {
			panelTitle
		},
		mounted(){
			this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
			
			this.fetchReportData()
			this.getAdminParkingList( this.setParkingList )
		},
		methods: {
			parkingLot(){
				this.parkingList.forEach( (i, v, a) => {
					if(this.parking === i.pid){
						this.parkinglot = i.name
					}
				})
			},
			queryReportHandle(){
				this.fetchReportData()
			},
			setParkingList( data ){
				this.parkingList = data.data;
				this.parking = data.data[0].pid
				this.parkinglot =  data.data[0].name
			},
			fetchReportData(){
				var date = this.date || new Date();
					date = date && new Date(date).Format('yyyy-MM-dd');
				this.$http.post(this.$request, qs.stringify({
					action:'parking_report',
					admin_id: this.admin_id,
					parkinglot_id:  this.parking,
					date: date
				}),{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					}
				}).then( res => {
					const resp = res.data;
					if(resp.error_code == '0'){
						this.parkingLot()
						this.all_parking = resp.data.all_parking;
						console.log(resp.data.all_parking)
						this.reports.freeParking.data = resp.data.idle
						this.reports.occupiedParking.data = resp.data.occupied
						this.reports.parkingUseage.data = resp.data.usage
						this.formatedDate = date;
						this.freeParkingSpaceHandle('freeParking')
						this.occupiedParkingSpaceHandle('occupiedParking')
						this.parkingUseageHandle('parkingUseage')
					}
				})
			},
			freeParkingSpaceHandle(id){
				var xAxis = [],
					yAxis = [],
					xAxisSource = this.reports.freeParking.data;
				const that = this;
				this.loading1 = false;
				xAxisSource.forEach( i => {
					xAxis.push(i.time)
					yAxis.push(i.number)
				})

				var option = {
				    color: ['#3398DB'],
				    tooltip : {
				        trigger: 'axis',
				        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
				            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
				        }
				    },
				    grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
				    xAxis : [
				        {
				            type : 'category',
				            data : xAxis,
				            axisTick: {
				                alignWithLabel: false
				            },
				            name: 'X'
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
				            splitNumber: 10,
				            max: that.all_parking,
				            name: 'Y'
				        }
				    ],
				    series : [
				        {
				            name:'空闲车位',
				            type:'bar',
				            barWidth: '100%',
				            data:yAxis,
				            barGap: '0',
				            itemStyle:{
				            	normal: {
				            		borderColor: '#fff',
				            		barBorderRadius: 2
				            	}
				            }
				        }
				    ]
				};// 配置结束

				//空闲车位配置
				const freeParkingSpaceConf = document.getElementById(id)
        		this.reports.freeParking.init = echarts.init(freeParkingSpaceConf);
        		this.reports.freeParking.init.setOption(option)
			},
			occupiedParkingSpaceHandle(id){
				var xAxis = [],
					yAxis = [],
					xAxisSource = this.reports.occupiedParking.data;
				const that = this;
				this.loading2 = false;

				xAxisSource.forEach( i => {
					xAxis.push(i.time)
					yAxis.push(i.number)
				})

				var option = {
				    color: ['#3398DB'],
				    tooltip : {
				        trigger: 'axis',
				        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
				            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
				        }
				    },
				    grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
				    xAxis : [
				        {
				            type : 'category',
				            data : xAxis,
				            axisTick: {
				                alignWithLabel: true
				            },
				            name: 'X'
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
				            splitNumber: 10,
				            max: that.all_parking,
				            name: 'Y'
				        }
				    ],
				    series : [
				        {
				            name:'占用车位数',
				            type:'bar',
				            barWidth: '100%',
				            data:yAxis,
				            barGap: '0',
				            itemStyle:{
				            	normal: {
				            		borderColor: '#fff',
				            		barBorderRadius: 2
				            	}
				            }
				        }
				    ]
				};// 配置结束

				const occupiedParkingSpaceConf = document.getElementById(id)
        		this.reports.occupiedParking.init = echarts.init(occupiedParkingSpaceConf);
        		this.reports.occupiedParking.init.setOption(option)
			},
			parkingUseageHandle(id){
				var xAxis = [],
					yAxis = [],
					xAxisSource = this.reports.parkingUseage.data;

				const that = this;
				this.loading3 = false;
				xAxisSource.forEach( i => {
					xAxis.push(i.time)
					yAxis.push(i.number)
				})
				var option = {
				    color: ['#3398DB'],
				    tooltip : {
				        trigger: 'axis',
				        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
				            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
				        }
				    },
				    grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
				    xAxis : [
				        {
				            type : 'category',
				            data : xAxis,
				            axisTick: {
				                alignWithLabel: true
				            },
				            name: 'X'
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
				            splitNumber: 10,
				            max: 100,
				            name: 'Y'
				        }
				    ],
				    series : [
				        {
				            name:'车位使用率',
				            type:'bar',
				            barWidth: '100%',
				            data:yAxis,
				            barGap: '0',
				            itemStyle:{
				            	normal: {
				            		borderColor: '#fff',
				            		barBorderRadius: 2
				            	}
				            }
				        }
				    ]
				};// 配置结束

				const parkingUseageConf = document.getElementById(id)
        		this.reports.parkingUseage.init = echarts.init(parkingUseageConf);
        		this.reports.parkingUseage.init.setOption(option)
			}
		}
	}
</script>

<style scoped>
	.report{
		padding-left: 20px;
		padding-right: 20px;
	}
	.panel{
		background: white;
		border: 1px solid #ddd;
		border-radius: 2px;
		padding: 20px;
		margin-top: 20px;
	}
	.panel-report{
		margin-top: 20px;
	}
	.panel-report h4{
		font-size: 14px;
		margin: 0px;
		margin-bottom: 5px;
		font-weight: normal;
	}
	.panel-report .panel-report-inline{
		background: white;
		padding: 2px;
		border: 1px solid #ddd;
		border-right: none;
		border-radius: 2px;	
	}
	.panel-report .panel-report-description{
		height: 295px;
		background: white;
		padding: 2px;
		text-align: center;
	}
	.panel-report-description .small-title{
		padding-top: 95px
	}
	.panel-report .charts-info{
		text-align:center;
		background: white;
		padding: 20px 0;
	}
	.panel-report .charts-info span{
		border-bottom: 1px solid #ddd;
		padding-bottom: 5px;
	}
</style>