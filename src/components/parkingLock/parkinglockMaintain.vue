<template>
	<div>
		<div class="children-navigation">
			<span @click="back"> <i class="el-icon-arrow-left"></i>  故障与维修列表</span>
		</div>
		<div class="panel-data">
			<el-row :gutter="30">
				<el-col :span="6">
					<div class="request">
						
						<div class="form_group ">
							<p>报修时间区域搜索</p>
							<el-date-picker
							  v-model="time1"
							  type="datetime"
							  format="yyyy-MM-dd HH:mm"
							  placeholder="选择日期时间">
							</el-date-picker>
							<el-date-picker
							  v-model="time2"
							  type="datetime"
							  format="yyyy-MM-dd HH:mm"
							  placeholder="选择日期时间">
							</el-date-picker>
						</div>
						<div class="form_group ">
							<p>修复时间区域搜索</p>
							<el-date-picker
							  v-model="time3"
							  type="datetime"
							  format="yyyy-MM-dd HH:mm"
							  placeholder="选择日期时间">
							</el-date-picker>
							<el-date-picker
							  v-model="time4"
							  type="datetime"
							  format="yyyy-MM-dd HH:mm"
							  placeholder="选择日期时间">
							</el-date-picker>
						</div>
						<div class="form_group">
							<el-button type="success" class="request_btn" :loading="loading" @click="requestHistory">查  询</el-button>
						</div>
					</div>
				</el-col>
				<el-col :span="18">
					<div class="request_table">
						<el-button-group>
							<el-button size="small" icon="plus"  @click="addMaintainHandle"></el-button>
							<el-button size="small" icon="delete" :disabled="selectedCol.length == 0"  @click="deleteForm"></el-button>
					    </el-button-group>
					  	<span class="f_right">
						    <el-button-group>
						      <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left', fetchMaintainList)"></el-button>
						      <el-button size="small" icon="arrow-right" :disabled="total_page == page" @click="turnPage('right', fetchMaintainList)"></el-button>
						    </el-button-group>
					  	</span>
					  	<el-table
						    :data="tableData"
						    v-loading="tableLoading"
						    style="width: 100%"
						    @selection-change="handleSelectionChange">
						    <el-table-column type="selection"></el-table-column>
						    <el-table-column
						      prop="serialNumber"
						      label="车锁串号"
						      width="180">
						    </el-table-column>
						    <el-table-column
						      prop="reporttime"
						      label="报修时间"
						      width="180">
						    </el-table-column>
						    <el-table-column
						      prop="repairtime"
						      label="修复时间">
						    </el-table-column>
						    <el-table-column
						      prop="reason"
						      label="故障原因">
						    </el-table-column>
						    <el-table-column
						      prop="repair"
						      label="修复/更换部件">
						    </el-table-column>
						    <el-table-column
						      prop="address"
						      label="修改">
						      <template slot-scope="scope">
						        <el-button type="primary" size="small" icon="edit" @click="editMaintainHandle(scope.row)">修 改</el-button>
						      </template>
						    </el-table-column>
					  	</el-table>
					</div>
				</el-col>
			</el-row>
		</div>

		<!-- 添加报修 -->
		<el-dialog title="故障维修添加" :visible.sync="dialogFormVisible">
			<el-form :model="form" :rules="rules"  ref="ruleForm">

				<el-form-item label="车锁串号：" prop="num" :label-width="formLabelWidth">
					<el-input v-model="form.num" placeholder="请填写车锁串号" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="报修时间：" prop="stime" :label-width="formLabelWidth">
				  	<el-date-picker
				      v-model="form.stime"
				      type="datetime"
				      placeholder="请选择报修时间">
				    </el-date-picker>
				</el-form-item>

				<el-form-item label="修复时间：" prop="etime" :label-width="formLabelWidth" v-if="showItem">
					<el-date-picker
				      v-model="form.etime"
				      type="datetime"
				      placeholder="请选择修复时间">
				    </el-date-picker>
				</el-form-item>

				<el-form-item label="故障原因：" prop="issue" :label-width="formLabelWidth">
					<el-input v-model="form.issue" placeholder="请填写故障原因" auto-complete="off" type="textarea"></el-input>
				</el-form-item>

				<el-form-item label="修复/更换部件：" prop="part" :label-width="formLabelWidth" v-if="showItem">
					<el-input v-model="form.part" placeholder="请填写更换的部件" auto-complete="off"></el-input>
				</el-form-item>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="submitForm('ruleForm')">{{btnConfirm}}</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	import qs from 'qs';
	import mixin from '../../common/mixin.js'
	export default {
		name: 'parkinglockMaintain',
		props: {
			parkinglockMaintainData:{
				type: Object
			}
		},
		mixins: [mixin],
		data(){
			const checkSTime = (rule, value, callback) =>　{
				if(!value){
					return callback(new Error('报修时间不能为空'));
				} else{
					callback()
				}
			}
			const checkETime = (rule, value, callback) =>　{
				if(!value){
					return callback(new Error('修复时间不能为空'));
				} else{
					callback()
				}
			}
			return {
				time1: '',
				time2: '',
				time3: '',
				time4: '',
				loading: false,
				page: 1,
				pageMax: false,
				tableLoading: false,
				tableData:[],
				dialogFormVisible: false,
				form: {
		          num:'',
		          stime:'',
		          etime: '',
		          issue:'',
		          part: ''
		        },
		        formLabelWidth: '120px',
		        total_page: false,
		        btnConfirm: '添加',
		        selectedCol: [],
		        rules: {
		          num: [
		            { required: true, message: '请输入车锁串号', trigger: 'blur' },
		          ],
		          stime: [
		            {validator: checkSTime, required:'true', trigger: 'blur' }
		          ],
		          etime: [
		            {validator: checkETime, required:false, trigger: 'blur' }
		          ],
		          issue: [
		            { required: true, message: '请输入故障原因', trigger: 'blue' }
		          ],
		          part: [
		            { required: false, message: '请输入更换部件', trigger: 'blur' }
		          ]
		        },
		        showItem: false
			}
		},
		components: {

		},
		ready(){
			
		},
		mounted(){
			this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
			this.form.num = this.parkinglockMaintainData.serialNumber
			this.fetchMaintainList();
		},
		methods: {
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
				  if (valid) {
				  	console.log('valid')
				  	this.addtionMaintainHandle()
				  } else {
				    console.log('error submit!!');
				    return false;
				  }
				});
			},
			back( ){
				this.$emit('back')
			},
			fetchMaintainList( page ){
				this.$http.post(this.$request+'?action=parking_lock_repair', {
					admin_id: this.admin_id,
					serialNumber: this.parkinglockMaintainData.serialNumber,
					page: page
				}).then( res => {
					const resp = res.data;

					if(resp.error_code == '0'){
						this.tableData = resp.data;
						this.total_page = resp.total_page;
					} else {
						this.$message({type: 'error', message: resp.msg})
					}
				})
			},
			addtionMaintainHandle(){
				
				const action = this.btnConfirm == '添 加' ? 'parking_lock_addrepair' : 'parking_lock_editrepair'
				this.$http.post(this.$request+'?action='+action,{
					rid: this.form.rid,
					admin_id: this.admin_id,
					serialNumber: this.form.num,
				    reason: this.form.issue,
				    reporttime: this.form.stime,
				    repair: this.form.part,
				    repairtime: this.form.etime
				}).then( res => {
					const resp = res.data;

					if(resp.error_code == '0'){
						this.dialogFormVisible = false;
						this.$message({type: 'success', message: '操作成功'})
						this.fetchMaintainList(this.page)
					} else {
						this.$message({type: 'error', message: resp.msg})
					}
				})
			},
			deleteForm(){
				this.$confirm('此操作将会删除记录， 确定删除吗?', '提示', {
		          confirmButtonText: '确定',
		          cancelButtonText: '取消',
		          type: 'warning'
		        }).then(() => {
		          this.deleteTableItem()
		        }).catch(() => {
		          this.$message({
		            type: 'info',
		            message: '已取消删除'
		          });          
		        });
				
			},
			deleteTableItem(){
				this.$http.post(this.$request, qs.stringify({
					action: 'parking_lock_delrepair',
					admin_id: this.admin_id,
					rid: this.selectedCol.join(',')
				}), {
					headers: {
					    'Content-Type': 'application/x-www-form-urlencoded',
					},
				}).then( res => {
					const resp = res.data;
					if(resp.error_code == '0'){
						this.$message({type: 'success', message: '操作成功'})
						this.fetchMaintainList(this.page)
					} else {
						this.$message({type: 'error', message: resp.msg})
					}
				})
			},
			requestHistory(){

			},

			addMaintainHandle(){
				this.showItem = false;
				this.dialogFormVisible = true
				this.btnConfirm = '添 加';
				for(var i in this.form){
					this.form[i] = ''
				}
				this.form.num = this.parkinglockMaintainData.serialNumber
			},
			editMaintainHandle( obj ){
				this.showItem = true;
				this.dialogFormVisible = true;
				this.form.num = obj.serialNumber
				this.form.rid = obj.id
				this.form.stime = obj.reporttime
				this.form.etime = obj.repairtime
				this.form.issue = obj.reason
				this.form.part = obj.repair;
				this.btnConfirm = '修 改'
			},
			handleSelectionChange( index ){
		      this.selectedCol = []
		      var arr = this.selectedCol;
		      index.forEach( i => {
		         arr.push( parseFloat(i.id) )
		      })
		    },
		}
	}
</script>

<style type="text/css">
	.children-navigation{
		padding: 1em;
		cursor: pointer;
		background: white;
		border: 1px solid #ddd;
		margin-top: 20px;
	}
</style>
