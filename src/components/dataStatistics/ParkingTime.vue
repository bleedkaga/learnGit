<template>
	<div class="parking-time">
		<panel-title title="停车时长分析"></panel-title>
		<br>
		<div class="panel-data">
			<el-row :gutter="30">
				<el-col :span="6">
					<div class="request">
						<div class="form_group ">
						    <p>停车场</p>
						    <el-select placeholder="请选择停车场" v-model="parking" @change="fetchParkingAll">
								<el-option v-for="item in parkingList" :key="item.pid" :label="item.name" :value="item.pid"></el-option>
							</el-select>
						</div>
						<div class="form_group ">
						    <p>固定车位</p>
						    <el-select placeholder="请选择车位" :filterable="true" v-model="parkingNo" >
						    	<el-option v-for="item in parkingSpaceList" :key="item.cid" :label="item.parkingNo" :value="item.cid"></el-option>
						    </el-select>
						</div>
						<div class="form_group ">
							<p>起止日期</p>
							<el-date-picker
							  v-model="start"
							  type="date"
							  :picker-options="pickerBeginDateBefore"
							  format="yyyy-MM-dd"
							  placeholder="选择日期">
							</el-date-picker>
							<el-date-picker
							  v-model="end"
							  type="date"
							  :picker-options="pickerBeginDateAfter"
							  format="yyyy-MM-dd"
							  placeholder="选择日期">
							</el-date-picker>
						</div>
						<div class="form_group">
							<el-button type="primary" class="request_btn" @click="queryHandle">查询</el-button>
						</div>
					</div>
				</el-col>
				<el-col :span="18">
					<div class="request_table" style="min-height: 300px;">
					  	<div class="parking-duration">
					  		<span class="f_right">
							    <el-button-group>
							      <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left', pageCallback)"></el-button>
							      <el-button size="small" icon="arrow-right" :disabled="page === total_page" @click="turnPage('right', pageCallback)"></el-button>
							    </el-button-group>
						  	</span>
					  	</div>
					  	<div class="parking-duration">
					  		<div class="parking-duration-item" v-for="item in durationList">
					  			<p class="title">{{item.date}}</p>
					  			<el-table
								    :data="item.data"
								    style="width: 100%">
								   <el-table-column
								      type="index"
								      label="次数"
								      width="90">
								    </el-table-column>
								    <el-table-column
								      prop="starttime"
								      label="停车时间">
								    </el-table-column>
								    <el-table-column
								      prop="leavetime"
								      label="离开时间">
								    </el-table-column>
								    <el-table-column
								      prop="duration"
								      label="停车时长">
								      
								    </el-table-column>
							  	</el-table>
							  	<p>合计：{{item.total}}</p>
					  		</div>
					  	</div>
					</div>
				</el-col>
			</el-row>
		</div>
	</div>
</template>
<script>
	import panelTitle from '@/components/panel_title';
	import mixin from '../../common/mixin.js'
	export default {
		name: 'parking-time',
		data(){
			return {
				cid: '',
				start: '',
				end: '',
				parking:'',
				parkingList: [],
				parkingSpaceList: [],
				parkingNo:'',
				table: [],
				durationList: [],
				page: 1,
				total_page: 1,
				pickerBeginDateAfter:{
	                disabledDate(time) {
	                    return (time.getTime() + 364000) > Date.now();
	                }
	            },
	            pickerBeginDateBefore:{
	                disabledDate(time) {
	                    return time.getTime() > Date.now();
	                }
	            }
			}
		},
		mixins: [mixin],
		components: {
			panelTitle
		},
		mounted(){
			this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
			this.getAdminParkingList(this.setParkingList)		
		},
		methods: {
			setParkingList( data ){
				this.parkingList = data.data;
				this.parking = data.data[0].pid
				this.parkinglot = this.parking;
			},
			//获取停车位
			fetchParkingAll(){
				this.$http.get(this.$request+'?action=parking_all&admin_id='+this.admin_id+'&pid='+this.parking).then( res =>{
					console.log(res)
					const resp = res.data;
					if(resp.error_code == '0'){
						this.parkingSpaceList = resp.data;
						console.log( resp.data[0].cid)
						this.parkingNo = resp.data[0].cid;
						this.fetchParkingDurationHandle();
					}
				})
			},
			//获取停车时长
			fetchParkingDurationHandle(){
				var start = this.start ? new Date(this.start).Format('yyyy-MM-dd') : '';

				var end = this.end ? new Date(this.end).Format('yyyy-MM-dd') : '';

				if(this.parkingNo == ''){
					this.$message({type: 'warning', message: '请选择车位'})
					return
				}
				this.fetchPost(this.$request, {
					action: 'parking_duration',
					admin_id: this.admin_id,
					cid: this.parkingNo,
					start: start,
					end: end
				}, res => {
					const resp = res.data;
					if(resp.error_code == '0'){
						this.durationList = resp.data;
						this.total_page = resp.total_page
					} else {
						this.$message({type: 'error', message: resp.msg})
					}
				})
			},
			//条件查询
			queryHandle(){
				this.fetchParkingDurationHandle()
			},
			pageCallback(){
				this.fetchParkingDurationHandle()
			}
		}
	}
</script>
<style scoped>
	.parking-time{
		padding-left: 20px;
		padding-right: 20px;
	}
	.parking-time .request{
		background: white;
		border: 1px solid #ddd;
		padding: 10px 20px;
	}
	.parking-time .request .form_group p{
		margin:0;
		margin-bottom: 5px;
	}
	.parking-time .request .el-input,
	.parking-time .request .el-select{
		width: 100%;
		margin-bottom: 10px;
	}
	.parking-time .request .el-button{
		width: 100%;
		margin-top: 50px;
	}
	.parking-time .request_table{
		background: white;
		border: 1px solid #ddd;
		padding: 20px;
	}
	.parking-time 	.f_right{
		float: right;
		margin-bottom: 20px;
	}
	.parking-time .parking-duration-item{
		margin-bottom: 30px;
	}
	.parking-duration{
		overflow: hidden;
	}
	.parking-time .parking-duration-item .title{
		margin:0;
		padding-bottom: 5px;
		font-size: 14px;
	}
</style>