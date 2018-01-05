<template >
  <div id="parkingset">
    <panel-title title="车位设置"></panel-title>
    <set-location :parkingname="locParkingname" :location="geoLocation" v-if="setLocationVisible" @getlocation="saveLocation"  @back="setLocationVisible = false"></set-location>
    <template v-else >
      <admin-list v-if="adminListVisible" :cid="cid" :adminid="adminid" @back="distributionBack"></admin-list>
        <span v-else>
          <search placeholder="请输入关键字标签" @search="search"></search>
          <div class="panel_parking">
            <el-row :gutter="20">
              <el-col :span="5">
                <div class="parking-query" v-loading="getParkingspaceConditionLoading">

                  <div class="panel_group">
                    <p>车锁状态</p>
                    <div class="block">
                      <el-select v-model="requestCondition.lockStatus">
                        <!-- <options v-for="item in queryCondition.lockStatus">{{item.name}}</options> -->
                        <el-option v-for="item in queryCondition.lockStatus" :key="item.key" :label="item.name" :value="item.key"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <div class="panel_group">
                    <p>车位类型</p>
                    <div class="block">
                      <el-select v-model="requestCondition.parkingType">
                        <el-option v-for="item in queryCondition.parkingType" :key="item.key" :label="item.name" :value="item.key"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <div class="panel_group">
                    <p>地磁状态</p>
                    <div class="block">
                      <el-select v-model="requestCondition.geoStatus">
                        <el-option v-for="item in queryCondition.GeoStatus" :key="item.key" :label="item.name" :value="item.key"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <div class="panel_group">
                    <p>标签</p>
                    <div class="block">
                      <el-select v-model="requestCondition.label">
                        <el-option v-for="item in queryCondition.label_all" :key="item.key" :label="item.name" :value="item.key"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <div class="panel_group">
                    <p>按管理员查询</p>
                    <div class="block">
                      <el-select v-model="requestCondition.admin">
                        <el-option v-for="item in queryCondition.admin_all" :key="item.key" :label="item.name" :value="item.key"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <div class="panel_group">
                    <p>是否空闲</p>
                    <div class="block">
                      <el-select v-model="requestCondition.idle">
                        <el-option v-for="item in queryCondition.idle" :key="item.key" :label="item.name" :value="item.key"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <div class="panel_group">
                    <p>所属停车场</p>
                    <div class="block">
                      <el-select v-model="requestCondition.parkinglot">
                        <el-option v-for="item in queryCondition.parkinglot_all" :key="item.key" :label="item.name" :value="item.key"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <div class="panel_group">
                    <el-button type="primary"   @click="btnRequestQuery">查询</el-button>
                  </div>
                </div>
              </el-col>
              <el-col :span="19">
                <div class="panel_recharge_item activity_table_list parking_set_table">
                  <div class="operation">
                    <el-button-group>
                      <el-button @click="addParkingSpace" size="small"><i class="el-icon-plus"></i></el-button>
                      <el-button @click="deleteParkingspace" size="small" :disabled="selectedParkingRow.length == 0"> <i class="el-icon-delete"></i></el-button>
                    </el-button-group>

                    <span class="ui-btn-group">
                      <el-button size="small" @click="addParkingLabel"      :disabled="selectedParkingRow.length == 0 || selectedParkingRow.length  > 1">添加标签</el-button>
                      <el-button size="small" @click="labelManagment"       ><i class="iconfont iconfont-biaoqian"></i>标签管理</el-button>
                      <el-button size="small" @click="liftLockOperation(1)" :disabled="selectedParkingRow.length == 0"><i class="custom-icon-stop"></i>升锁</el-button>
                      <el-button size="small" @click="liftLockOperation(2)" :disabled="selectedParkingRow.length == 0"><i class="custom-icon-stop"></i>降锁</el-button>
                      <el-button size="small" @click="distributionAdmin"    :disabled="selectedParkingRow.length == 0">分配管理员</el-button>
                    </span>

                    <span class="f_right">
                      <el-button-group>
                        <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                        <el-button size="small" icon="arrow-right":disabled="pageMax"   @click="turnPage('right')"></el-button>
                      </el-button-group>
                    </span>
                  </div>  <!--opration end-->

                  <div class="activity_table">
                    <el-table
                      ref="multipleTable"
                      :data="parkingListData"
                      tooltip-effect="dark"
                      v-loading="reuestStatusLoading"
                      style="width: 100%"
                      @selection-change="handleSelectionChange">

                      <el-table-column
                        type="selection"
                        @select="handleSelectionChange"
                        align="center"
                        width="54">
                      </el-table-column>

                      <el-table-column
                        prop="parkinglotName"
                        label="停车场"
                        align="center"
                        width="110">
                      </el-table-column>

                      <el-table-column
                        prop="parNumber"
                        label="车位编号"
                        align="center"
                        width="120">
                      </el-table-column>

                      <el-table-column
                        prop="parkingType"
                        label="车位类型"
                        min-width="120"
                        align="center">
                        <template scope="scope">
                          <span v-if="scope.row.parkingType == 0">普通车位</span>
                          <span v-else-if="scope.row.parkingType == 1">充电桩车位</span>
                          <span v-else>--</span>
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="isRevatation"
                        label="是否预约"
                        align="center"
                        width="110">
                        <template scope="scope">
                          <span v-if="scope.row.isRevatation == 0">不可预约</span>
                          <span v-else-if="scope.row.isRevatation == 1">可预约</span>
                          <span v-else>--</span>
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="lock_state"
                        label="车锁状态"
                        min-width="160"
                        align="center"
                        show-overflow-tooltip>
                        <template scope="scope">
                          <span v-if="scope.row.lock_state == 0 ">未连接</span>
                          <span v-else-if="scope.row.lock_state == 1 ">升起</span>
                          <span v-else-if="scope.row.lock_state == 2 ">降下</span>
                          <span v-else-if="scope.row.lock_state == 3 ">外力碰撞</span>
                          <span v-else-if="scope.row.lock_state == 4 ">升起受阻</span>
                          <span v-else-if="scope.row.lock_state == 5 ">硬件故障</span>
                          <span v-else-if="scope.row.lockNumber == null ">未绑定车位锁串号</span>
                          <span v-else>未知</span>
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="gui_status"
                        label="红绿灯状态"
                        min-width="80"
                        align="center"
                        show-overflow-tooltip>
                      </el-table-column>

                      <el-table-column
                        prop="carimg"
                        label="红绿灯图片"
                        min-width="140"
                        align="center">
                        <template scope="scope">
                          <img style="max-width: 120px;" :src="scope.row.carimg" alt="">
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="carno"
                        label="车牌号"
                        min-width="120"
                        align="center"
                        show-overflow-tooltip>
                      </el-table-column>
                      <el-table-column
                        prop="lock_power"
                        label="车位锁电量"
                        align="center"
                        show-overflow-tooltip>
                      </el-table-column>

                      <el-table-column
                        prop="par_state"
                        label="是否空闲"
                        align="center"
                        show-overflow-tooltip>
                        <template slot-scope="scope">
                          <span v-if="scope.row.par_state == 0 ">空闲</span>
                          <span v-else-if="scope.row.par_state == 1 ">占用</span>
                          <span v-else-if="scope.row.par_state == 2 ">已预约</span>
                          <span v-else>未知</span>
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="geo_power"
                        label="地磁电量"
                        min-width="120"
                        align="center"
                        show-overflow-tooltip>
                      </el-table-column>

                      <el-table-column
                        prop="geo_state"
                        label="地磁状态"
                        min-width="140"
                        align="center"
                        show-overflow-tooltip>
                        <template scope="scope">
                          <span v-if="scope.row.geo_state == 0 ">初始化</span>
                          <span v-else-if="scope.row.geo_state == 1 ">空闲</span>
                          <span v-else-if="scope.row.geo_state == 2 ">占用</span>
                          <span v-else-if="scope.row.geo_state == 3 ">错误</span>
                          <span v-else-if="scope.row.geo_state == 4 ">未知</span>
                          <span v-else-if="scope.row.geo_state == 5 ">离线</span>
                          <span v-else-if="scope.row.geoNumber == null">未绑定地磁串号</span>
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="label"
                        label="标签"
                        align="center"
                        show-overflow-tooltip>
                        <template scope="scope">
                          <!-- <span class="parking_label_setting" v-if="scope.row.label" @click="parkingLabelEdit(scope.row)">{{scope.row.label}}</span>
                          <a class="parking_label_setting" v-else @click="parkingLabelSetting(scope.row)">设置</a> -->
                          <span>{{scope.row.label}}</span>
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="record"
                        label="位置"
                        align="center"
                        show-overflow-tooltip>
                        <template scope="scope">
                          <a class="ui-toview-location" @click="viewLocation(scope.row)" href="javascript:;">查看</a>
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="record"
                        label="车位设置"
                        align="center"
                        min-width="120"
                        show-overflow-tooltip>
                        <template scope="scope">
                          <span class="ui-btn-parking-setting pointer" @click="parkingSpaceSetting(scope.row)">设置</span>
                        </template>
                      </el-table-column>

                      <el-table-column
                        prop="admin"
                        label="管理员"
                        min-width="160"
                        align="center"
                        show-overflow-tooltip>
                        <template scope="scope">
                          <span v-if="scope.row.admin !== ''" v-text="scope.row.admin"></span>
                          <el-button  v-else type="primary" size="small" @click="handleParkingSetAdmin(scope.row.cid)">设 置</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </span>
    </template>

    <el-dialog
      title="增加车位"
      :visible.sync="dialogVisible"
      size="tiny"
     >
      <div class="parking_add_container">
        <div class="left">
          <div class="add_item">
            <p>请选择所属停车场<i style="color:red">*</i></p>
            <el-select v-model="add.parking" v-loading="add.parkingListLoading" placeholder='请选择' @change="getAreaLists">
              <el-option v-for="item in add.addParkingList" :key="item.pid" :label="item.name" :value="item.pid"></el-option>
            </el-select>
          </div>
          <div class="add_item">
            <p>所属区域</p>
            <el-select v-model="add.area" v-loading="add.areaLoading"  placeholder='请选择'>
              <el-option v-for="item in add.areaList" :key="item.qid" :label="item.name" :value="item.qid"></el-option>
            </el-select>
          </div>
          <div class="add_item">
            <p>是否可预约 </p>
            <el-select v-model="add.isRevatation" :disabled="parkingLotIsRevatation"  placeholder='请选择是否可预约'>
               <el-option v-for="item in add.isRevatation_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>

          </div>
          <div class="add_item">
            <p>选择添加方式</p>
            <el-select v-model="add.style" placeholder='请选择'>
               <el-option v-for="item in add.styleOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="add_item" v-if="add.style=='1'">
            <p>输入车位号</p>
            <el-input v-model="add.number" placeholder='请输入车位号'></el-input>
          </div>
          <div class="add_item" v-if="add.style=='1'">
            <p>所属楼层</p>
            <el-select v-model="add.floorId" placeholder='请选择楼层' >
               <el-option v-for="item in add.floorId_options" :key="item.qid" :label="item.name" :value="item.qid"></el-option>
            </el-select>
          </div>
          <div class="add_item" v-else-if="add.style == '2' ">
            <a class="el-btn-default" :href="template" :download="template">下载导入文件格式案例</a>
            <br><br>
            <input type="file"  name="filedata" id="upload">
            <br><br>
            <el-button type="primary" size="small" @click="upload">{{uploadStatusText}}</el-button>
          </div>
        </div>
        <div class="right">
          <div class="create_parking">
            <el-button type="primary" @click="createParkingspace" :loading="createParkingspaceLoading">创建停车场</el-button>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addSpaceItem" :loading="addLoading" v-if="add.style == '1' ">添加单个车位</el-button>
        <el-button type="primary" @click="batchImport" :disabled="uploadFileUrl == ''" :loading="addLoading" v-else-if="add.style == '2' ">批量添加车位</el-button>
      </span>
    </el-dialog>

    <el-dialog title="车位设置" :visible.sync="parkingSpaceSettingVisible">
      <div class="setting">
        <div class="form_group">
          <p>所属区域</p>
          <el-select placeholder="请选择区域" v-model="areaId">
            <el-option v-for="item in areaList" :key="item.qid" :label="item.name" :value="item.qid"></el-option>
          </el-select>
        </div>
        <div class="form_group">
          <p>车位编号</p>
          <el-input v-model="parkingNo" placeholder="请输入车位编号" ></el-input>
        </div>
        <div class="form_group">
          <p>所属楼层</p>
          <el-select placeholder="请选择楼层" v-model="floorId">
            <el-option v-for="item in floorId_options" :key="item.qid" :label="item.name" :value="item.qid"></el-option>
          </el-select>
        </div>
        <div class="form_group">
          <p>是否可预约</p>
          <el-select placeholder="请选择是否可预约" v-model="isRevatation">
            <el-option v-for="item in isRevatation_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
        <div class="form_group">
          <p>车位类型</p>
          <el-select placeholder="请选择车位类型" v-model="parkingType">
            <el-option v-for="item in parkingType_options" :key="item.key" :label="item.name" :value="item.key"></el-option>
          </el-select>
        </div>
        <div class="form_group">
          <p>车位管理员</p>
          <p >{{parkingAdminlist}}</p>
        </div>
        <div class="form_group">
          <p>地磁串号</p>
          <span>{{numberCount}}</span>
        </div>
        <div class="form_group">
          <p>车位锁串号</p>
          <span>{{parkingnumber}}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="parkingSpaceSettingVisible = false" >取 消</el-button>
        <el-button type="primary" @click="submitParkingSetting" :disabled="parkingNo == '' || areaId == ''" >保 存</el-button>
      </span>
    </el-dialog>

    <!-- 车位标签添加 -->
    <label-add :ty="0" :cid="cid" :selectedLabel="selectedLabel" v-if="parkingLabelVisible" @cancel="cancel" @done="requestList"></label-add>

    <!-- 车位标签修改 -->
    <label-edit :ty="0"  v-if="parkingLabelEditVisible"  @cancel="parkingLabelEditVisible = false"></label-edit>
  </div>
</template>

<script type="text/javascript">
const base64 = require('base-64');
import panelTitle from '@/components/panel_title'
import search from '@/components/search'
import adminList from '@/components/common/adminList'
import setLocation from '@/components/baseSetting/setLocationParking'
import labelAdd from '@/components/common/parking-label'
import labelEdit from '@/components/common/parking-label-edit'
var _admin_id = undefined;
var files = undefined;
export default{
  name : 'parkingset',
  data(){
    return {
      template: "/parking_Import.xlsx",
      file: null,
      admin_id: '',
      parkingListData: [],
      uploadInterface: '',
      dialogLabel: false,
      dialogVisible: false,
      checked: '',
      labelText: '',
      recharge_query: {
        start: '',
        end: ''
      },
      add: {
        parking: '',
        area: '',
        style: '',
        styleOptions: [{
          value: '1',
          label: '添加单个车位'
        }, {
          value: '2',
          label: '批量导入'
        }],
        number: '',
        addParkingList: [],
        areaList: [],
        areaLoading: false,
        floorId: '',

        isRevatation: '',  //默认可预约
        isRevatation_options: [
          {label: '是', value: '1'},
          {label: '否', value: '0'},
        ]
      },
      tableData: [],
      labelList: [],
      getParkingspaceConditionLoading: true,
      queryCondition: {},

      requestCondition: {
        lockStatus: "",
        geoStatus: "",
        label: "",
        idle: "",
        admin: "",
        parkinglot:"",
        parkingType: ""
      },

      reuestStatusLoading: false,
      page : 1,
      pageMax: false,
      selectedParkingRow: [],
      labelLoading: false,
      parkingListLoading: true,
      createParkingspaceLoading: false,
      addLoading : false,
      adminListVisible: false, //管理员列表,
      cid: [], //管理员分配需要的cid,

      setLocationVisible: false,
      locParkingname: '',
      geoLocation: {},

      parkingSpaceSettingVisible: false,
      parkingAdminlist : '',
      numberCount: '',
      parkingnumber: '',
      areaList: [],
      areaId: '',
      cid: '',
      parkingNo: '',
      floorId: '',
      floorId_options: [],

      //车位设置是否可预约
      parkingType: '',
      isRevatation: '',
      isRevatation_options:[
        {label: '是', value: '1'},
        {label: '否', value: '0'},
      ],
      //标签
      parkingLabelVisible: false,
      did: '',
      management: false,

      //标签修改
      parkingLabelEditVisible: false,
      uploadFileUrl : '',
      uploadStatusText : '上传到服务器',

      //分配管理员默认选中的管理员id
      adminid: '',//

      parkingLotIsRevatation: false,

      parkingType_options: [
        { key: '0', name: '普通车位'},
        { key: '1', name: '充电桩车位'},
      ]
    }
  },
  methods: {

    //设置车位管理员
    handleParkingSetAdmin(id){
      this.adminListVisible = true;
      var cids = [];
      cids.push(parseInt(id))
      this.cid = cids;
      this.adminid = ''
    },
    upload(){
      let _this = this;
      let $ = this.$jquery;
      var formData = new FormData();
      formData.append("filedata",$("#upload")[0].files[0]);
      formData.append("action", "upload_file")
      formData.append("admin_id", _this.admin_id)
      $.ajax({
        url : _this.$request,
        type : 'POST',
        data : formData,
        processData : false,
        contentType : false,
        dataType: 'json',
        beforeSend:function(){
          _this.uploadStatusText = '正在上传，请稍后...'
        },
        success : function(res) {
            if(res.error_code == '0'){
               _this.uploadStatusText = '上传成功'
               _this.uploadFileUrl = res.url
            } else {
              _this.uploadStatusText = '上传失败'
            }
        },
        error : function(responseStr) {
          _this.$message({type: 'error', message: '批量导入文件请求错误'})
        }
      });
    },
    //批量添加车位
    batchImport(){
      const that = this;
      if(that.add.parking == '' || that.uploadFileUrl == ''){
        this.$message({type:'warning', message: '请填写完整'})
        return
      }
      that.$jquery.post(that.$request, {
        action: 'parking_import',
        admin_id: that.admin_id,
        pid: that.add.parking,
        url: that.uploadFileUrl
      }, res => {
        if(res.error_code == '0'){
          this.$message({type: 'success', message: '导入成功'})
          this.dialogVisible = false;
          this.requestQuery()
          this.uploadFileUrl = ''
        } else {
          this.$message({type: 'error', message: res.msg})
        }
      }, 'json')
    },

    search(res){
      this.keyword = res;
      this.requestQuery(res);
    },

    viewLocation( obj ){
      this.setLocationVisible = true;
      this.locParkingname = obj.parkinglotName;
      this.loid = obj.cid;
      this.loid = obj.cid;

      this.geoLocation = {
        x: obj.coordinateX,
        y: obj.coordinateY
      }
    },

    //车位设置
    parkingSpaceSetting( obj ){
      const that = this;

      this.parkingSpaceSettingVisible = true;
      this.cid = obj.cid;
      this.parkingAdminlist = obj.admin
      this.numberCount = obj.geoNumber
      this.parkingnumber = obj.lockNumber
      this.areaId = obj.areaId;
      this.parkingNo = obj.parNumber
      this.add.floorId = obj.floorId
      this.floorId = obj.floorId
      this.isRevatation = obj.isRevatation
      this.parkingType = obj.parkingType;
      this.add.areaLoading = true
      this.$jquery.post(this.$request, {
        action: 'parkinglot_arealist',
        pid: obj.pid
      }, res => {
        that.areaList = res.data;
      }, 'json')

      this.$jquery.post(that.$request, {
        action: 'parkinglot_floorlist',
        pid:  obj.pid
      }, res => {

        if(res.error_code == '0'){
          that.floorId_options = res.data
        } else {
          that.floorId_options = [];
          that.$message({type: 'error', message: res.msg})
        }
      }, 'json')
    },

    //车位标签设置
    parkingLabelSetting( obj ){
      this.parkingLabelVisible = true;
      this.selectedLabel = []
      this.cid = obj.cid;
    },

    //车位标签修改
    parkingLabelEdit( obj ){
      this.parkingLabelVisible = true;
      this.cid = obj.cid;
      this.selectedLabel = obj.labelid;
    },

    submitParkingSetting(){
      const that = this;
      var data = {
        "areaId":that.areaId,
        "parkingNo": that.parkingNo,
        "floorId": that.floorId,
        "isRevatation": that.isRevatation,
        "parkingType": that.parkingType
      }
      data = base64.encode(JSON.stringify(data))
      that.$jquery.post(that.$request, {
        action: 'parking_edit',
        admin_id: that.admin_id,
        cid: that.cid,
        data: data
      }, res => {
        if(res.error_code == '0'){
          this.$message({ type: 'success', message: '设置成功'})
          this.requestQuery('', base64.encode(JSON.stringify(that.requestCondition)), that.page);
          this.parkingNo = ''
          this.parkingSpaceSettingVisible = false;
        } else {
          this.$message({ type: 'error', message: res.msg})
        }
      }, 'json')
    },

    saveLocation( location ){
      let _this = this;
      var data = {
        "coordinateX": location.lng,
        "coordinateY": location.lat
      }

      data = base64.encode(JSON.stringify(data))
      this.$jquery.post(_this.$request, {
        action: 'parking_coor_edit',
        admin_id: _this.admin_id,
        cid: _this.loid,
        data: data
      }, res => {
        if(res.error_code == '0'){
          this.$message({type: 'success', message: '保存成功'})
           this.setLocationVisible = false;
           this.requestQuery()
        } else {
          this.$message({type: 'error', message: res.msg})
        }
      }, 'json')

    },

    //分配管理员返回
    distributionBack(){
      this.adminListVisible = false;
      let _this = this;
      var page = this.page;
      var data =base64.encode(JSON.stringify(_this.requestCondition))
      this.requestQuery(this.keyword, data, page)
    },

    //分配管理员
    distributionAdmin(){
      this.adminListVisible = true;
      this.cid = this.selectedParkingRow;
    },


    //添加单个车位
    addSpaceItem(){
      var that = this;
      var params = {
          "pid": that.add.parking,
          "qid": that.add.area,
          "parnumber": that.add.number,
          "isRevatation": that.add.isRevatation,
          "floorId": that.add.floorId,
      };
      console.log("开始添加单个停车位")
      try{
        params = base64.encode(JSON.stringify(params));
      } catch(e){
        this.$message({type: 'warning', message: e.message})
        return ;
      }

      this.addLoading = true;
      this.$jquery.post(that.$request, {
        action: 'parking_add',
        admin_id: that.admin_id,
        data: params
      }, res =>{
        if(res.error_code == '0'){
          this.$message({ type: 'success', message: res.msg})
          that.dialogVisible = false;

          that.add.number = '';
          that.add.area = '';
          that.add.style = '';
          that.add.floorId = ''

          this.requestQuery()
        } else {
          this.$message({ type: 'error', message: res.msg})
        }
        console.log(res.msg)
        this.addLoading = false;
      }, 'json')
    },

    btnRequestQuery(){
      var data = JSON.stringify(this.requestCondition)
      data = base64.encode(data);
      this.page = 1;
      this.requestQuery(this.keyword, data, 1)
    },

    turnPage( direction ){
      var data = JSON.stringify(this.requestCondition)
      data = base64.encode(data);
      var page = this.page;
      if( direction == 'left'){
        page--
      } else {
        page++
      }
      this.requestQuery(undefined, data, page)
      this.page = page;
    },


    //创建停车场
    createParkingspace(){
      this.$router.push('base-setting')
    },

    //获取楼层
    getFloorList(){
      const that = this;
      console.log("开始获取楼层列表")
      this.$jquery.post(that.$request, {
        action: 'parkinglot_floorlist',
        pid:that.add.parking
      }, res => {
        if(res.error_code == '0'){
          that.add.floorId_options = res.data
        } else {
          that.add.floorId_options = [];
          that.$message({type: 'error', message: res.msg})
        }
      }, 'json')
    },

    //添加车位
    addParkingSpace(){
      this.dialogVisible = true;
      this.getParkingList();
    },

    //获取停车场列表
    getParkingList(){
      this.add.parkingListLoading = true;
      var that = this;

      this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id,{}, res => {
        that.add.parkingListLoading = false
        that.add.addParkingList = res.data;
      }, 'json')
    },

    //获取区域列表
    getAreaLists(){
      const that = this;
      this.add.areaLoading = true
      this.$jquery.post(this.$request, {
        action: 'parkinglot_arealist',
        pid: that.add.parking
      }, res => {
        if(res.error_code == '0'){
          this.add.areaList = res.data;
          this.add.area = "";
          this.add.areaLoading = false;
        } else {
          that.$message({type: 'error', message: res.msg})
        }

        var parking = that.add.addParkingList;
        for(var i = 0; i < parking.length; i++){
          if(that.add.parking == parking[i].pid){
            console.log(parking[i].name)
          }
        }
      }, 'json')

      this.getFloorList()
    },

    //添加车位标签
    requestAddLabel(){
      this.$http.get(this.$request, {
        params: {
          action: 'parking_label_add',
          admin_id: this.admin_id,
          label: this.labelText
        }
      }).then( res => {
        const response = res.data;

        if( response.error_code == "0"){
          this.$notify({
            type : 'success',
            title: '成功',
            message: '车位标签添加成功'
          })
        } else {
          this.$notify({
            type: 'error',
            title: '错误',
            message: response.msg
          })
        }
      })
    },

    //删除车位
    deleteParkingspace(){
      const labelId = base64.encode(JSON.stringify(this.selectedParkingRow))
      const condition = base64.encode(JSON.stringify(this.requestCondition))
      const page = this.page;
      const that = this;

      this.$confirm('此操作将会删除选中的停车位, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$jquery.post(that.$request, {
            action : 'parking_del',
            admin_id: that.admin_id,
            cid: labelId
          }, res => {
            if( res.error_code == "0"){
              that.$message({
                type : 'success',
                message: res.msg
              })
              that.requestQuery(that.keyword, condition, page)
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
    requestList(){
      let _this = this;
      let page  = this.page;
      let data = base64.encode(JSON.stringify(_this.requestCondition))

      this.requestQuery(_this.keyword, data, page);
      this.parkingLabelVisible = false;
    },
    requestQuery(labelName='', data={}, page=1){
      const that = this;
      this.reuestStatusLoading = true;
      var params = {
        action: "parking_list",
        admin_id: that.admin_id,
        label_name: labelName,
        data:data,
        page:page
      }
      console.log("请求查询中")
      this.$jquery.post(that.$request, params, res => {
        if(res.error_code == '0'){
          this.parkingListData = res.data;
        } else {
          this.$message({ type: 'error', message: res.msg})
        }
        this.pageMax = res.data ? false : true;
        this.reuestStatusLoading = false;
      }, 'json')

    },

    handleSelectionChange( index ){
      this.selectedParkingRow = []
      var arr = this.selectedParkingRow;
      index.forEach( i => {
         arr.push( parseFloat(i.cid) )
      })
      this.adminid = index[0].adminid;
      this.selectedLabel = index;
    },

    //升降锁操作
    liftLockOperation(type){
      var parkingRow = this.selectedParkingRow, that = this;
      var lockCid = base64.encode(JSON.stringify(parkingRow));
      var page = this.page;
      this.$jquery.post(that.$request, {
        action: 'parkinglock_status',
        admin_id: that.admin_id,
        cid: lockCid,
        type: type
      }, res => {
        if( res.error_code == '0'){
          this.$message({ type: 'success', message: '操作成功' })
          this.requestQuery(null, that.$base64.encode(JSON.stringify(this.requestCondition)), page)
        } else {
          this.$message({ type: 'error',  message: res.msg })
        }
      }, 'json')
    },

    //获取车位查询条件
    getParkingspaceCondition(){
      const that = this;

      this.getParkingspaceConditionLoading = true;

      this.$jquery.post(this.$request, {
        action: 'parking_Inquire',
        admin_id: that.admin_id
      }, res => {
        if( res.error_code == '0') {
          this.queryCondition = res.data;;
          this.getParkingspaceConditionLoading = false;
        } else {
          this.$notify({
            type: 'error',
            title: '错误',
            message: '车位查询条件获取失败，原因 ：' + res.msg
          })
        }

      }, 'json')
    },

    //添加标签
    addParkingLabel(){
      this.parkingLabelVisible = true;
      this.cid = this.selectedParkingRow
      var selectedLabel = this.selectedLabel[0].labelid;

      if(selectedLabel == null){
        this.selectedLabel = []
      } else {
      }
    },

    //管理标签
    labelManagment(){
      this.parkingLabelEditVisible = true;
    },

    //隐藏车位标签
    cancel(){
      this.parkingLabelVisible = false;
    },

    //获取标签列表
    getLabelList(){
      var that = this;
      this.$http.get(this.$request, {
        params: {
          action: 'parking_label',
          admin_id: that.admin_id
        }
      }).then( res => {
        if(res.data.error_code != '0'){
          this.$message({
            type: 'error',
            message: res.data.msg
          })
          that.dialogLabel = false
        } else {
          this.labelList = res.data.data
        }
        this.labelLoading = false;
      }).catch( res => {
        this.$message({ type: 'error', message: res.data.msg })
        that.dialogLabel = false
        this.labelLoading = false;
      })
    }
  },

  mounted(){
    this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
    this.getParkingspaceCondition();
    this.requestQuery()
  },
  components: {
    panelTitle,
    search,
    adminList,
    setLocation,
    labelAdd,
    labelEdit
  }
}
</script>
<style  lang="scss">

#parkingset{
  .parking_set_table{
    padding: 20px;
  }
  .parking_label_setting{
    cursor: pointer;
    color: #188fff;
  }
  .setting .el-select{
    width: 100%;
  }
  a.ui-toview-location{
    text-decoration: none;
    color:#ed943f
  }
  span.ui-btn-parking-setting{
    color:#6cdb36;
  }
  .el-btn-default{
    width: 100%;
    background: #188fff;
    border: 1px solid #188fff;
    border-radius: 4px;
    text-align: center;
    font-size: 12px;
    color: white;
    padding: 6px 0;
    display: inline-block;
    text-decoration: none;
  }
  padding: 0 20px;
  .panel_parking{
    margin-top: 30px;
  }
  .panel_recharge_item{
    background: white;
    border:1px solid #bfcbd9;
    overflow: hidden;
    border-radius: 4px;
    .f_left{
      float: left;
      width: 60%;
      padding-left: 20px;
    }
    .f_right{
      float: right;
      width: 30%;
      margin-right: 0px;
      text-align: right;
    }
    .operation{
      margin-bottom: 20px;
    }
    .ui-btn-group{
      padding-left: 10px;
      padding-top: 1px;
      display: inline-block;
      vertical-align: middle;
    }
  }
  .label_content{
    .top{
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;
    }
    .center{
      margin-top: 20px;
    }
    .bottom{
      margin-top: 20px;
    }
  }
  .parking_add_container{
    overflow: hidden;
    .left, .right{
      width: 50%;
      float: left;
    }
    .create_parking{
      margin-top: 30px;
      text-align: center;
    }
    .left .el-select{
      width: 100%;
    }
    .top{
      height: 120px;
      border-top: 8px solid green
    }

    .add_item{
      p{
        margin:0px;
        margin-bottom: 10px;
      }
      margin-bottom: 20px;
    }
  }
  .setting .form_group > p{
    margin: 0px;
    margin-bottom: 5px;
    margin-top: 10px;
  }
  .btn-group{
    display: block;
    overflow: hidden;
    .left{
      float: left;
    }
    .center{
      float: left;
      margin-left: 200px;
    }
    .pull-right{
      float: right;
      margin-left: 200px;
    }
  }
  .parking-query{
    background: #fff;
    border: 1px solid #bfcbd9;
    padding: 20px 0;
  }
  .panel_group{
    padding: 0 20px;
    p{
      margin: 0;
      margin-bottom: 5px;
    }
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
      margin-top: 100px;
    }
  }
}
</style>
