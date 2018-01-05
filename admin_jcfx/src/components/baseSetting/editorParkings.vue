<template>
  <div class="create">
    <span v-if="createParkingsVisible">
      <div class="panel_setting" >
        <el-row :gutter="10">
          <el-col :span="2">
            <div class="setting" @click="back"><span  style="line-height:36px;"><i class="el-icon-arrow-left"></i> 设置</span></div>
          </el-col>
          <el-col  :span="9">
            <div class="parking_name">
              <el-row>
                <el-col :span="6"><span style="line-height:36px;"><i style="color:red">*</i>停车场名称：</span></el-col>
                <el-col :span="18"><el-input v-model="parkingdata.name"></el-input></el-col>
              </el-row>
            </div>
          </el-col>
          <el-col  :span="10">
            <div class="map_import">
              <el-row>
                <el-col :span="7"><span style="line-height:36px;">室内地图导入：</span></el-col>
                <el-col :span="17">
                  <el-upload
                    class="upload-demo"
                    action="https://jsonplaceholder.typicode.com/posts/">
                    <el-button size="small" type="primary">点击上传</el-button>
                  </el-upload>
                  <!-- <input type="file" name=""> -->
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="panel_recharg" >
        <el-row :gutter="60">

          <el-col :span="6">
            <div class="parking_space_number panel_setting_container">
              <div class="head blue">添加收费规则</div>
              <div class="body" v-loading="rulePageLoading">
                <p v-if="rulePageMax" class="no-data">没有更多了</p>
                <el-checkbox-group v-model="checkList">
                  <div class="block form_group rulesList" v-for="item in rulesList"><el-checkbox :label="item.gid"></el-checkbox>{{item.ruleName}}</div>
                </el-checkbox-group>
              </div>
              <div class="page-nation">
                <el-button size="small" :disabled="rulePage == 1" icon="arrow-left" @click="handlerRuleTurnpage('left')"></el-button>
                <el-button size="small" :disabled="rulePageMax" icon="arrow-right" @click="handlerRuleTurnpage('right')"></el-button>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="parking_space_number panel_setting_container">
              <div class="head red">免费停车时间设置</div>
              <div class="body">
                <div class="form_group">
                  <p>免费停车时长（分）</p>
                  <div class="block">
                    <el-input placeholder="请输入免费停车时长" v-model="parkingdata.freeTime"></el-input>
                  </div>
                </div>
                <div class="form_group">
                  <p>免费出场时间</p>
                  <div class="block">
                    <el-input placeholder="请输入免费出场时间" v-model="parkingdata.OutTime"></el-input>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="6" >
            <div class="parking_space_number panel_setting_container">
              <div class="head yellow">停车场分区设置</div>
              <div class="body">
                <div class="area_group">
                  <el-button-group>
                    <el-button size="small" icon="plus" @click="handleAreaAdd"></el-button>
                    <el-button size="small" icon="edit" :disabled="canBeEditor"  @click="handleAreaEdit"></el-button>
                    <el-button size="small" icon="delete" :disabled="areaResultList.length == 0"  @click="handleAreaDelete"></el-button>
                  </el-button-group>
                </div>
                <div class="area_list">
                   <el-checkbox-group v-model="areaResultList">
                    <span class="el-list" v-for="item in parkingdata.area" :label="item.qid" :key="item.qid">
                      <el-checkbox :label="item.qid"></el-checkbox>
                      <span v-if="item.areaName">{{item.areaName}}</span>
                      <span v-else>{{item.name}}</span>
                    </span>
                  </el-checkbox-group>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="6" >
            <div class="parking_space_number panel_setting_container">
              <div class="head yellow">停车场楼层设置</div>
              <div class="body">
                <div class="area_group">
                  <el-button-group>
                    <el-button size="small" icon="plus" @click="handleFloorAdd"></el-button>
                    <el-button size="small" icon="edit" :disabled="floorEditorDisabled" @click="handleFloorEdit"></el-button>
                    <el-button size="small" icon="delete" :disabled="floorDeleteDisabled"  @click="handleFloorDelete"></el-button>
                  </el-button-group>
                </div>
                <div class="area_list">
                   <el-checkbox-group v-model="floorIdList">
                    <span class="el-list" v-for="(item, index) in parkingFloorList" :label="item.qid" :key="item.qid">
                      <el-checkbox :label="item.qid" @change="updateFloorName(index)"></el-checkbox>
                      <span v-if="item.areaName">{{item.areaName}}</span>
                      <span v-else>{{item.name}}</span>
                    </span>
                  </el-checkbox-group>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="parking_space_number panel_setting_container">
              <div class="head purple">停车场位置</div>
              <div class="body">
                <div class="form_group">
                  <p v-text="parkingdata.location"></p>
                </div>
                <el-button type="primary" size="small" @click="setParkingLocation">设置</el-button>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="parking_space_number panel_setting_container">
              <div class="head green">预约设置（仅拥有智能锁的停车场可用）</div>
              <div class="body">
                <div class="form_group">
                  车位是否可预约
                  <el-switch
                    class="f_right"
                    v-model="make"
                    on-text=""
                    off-text="">
                  </el-switch>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="parking_space_number panel_setting_container clear_panel">
              <div class="btn_container">
                <div class="block" @click="back"><el-button>取 消</el-button></div>
                <div class="block"><el-button type="primary" @click="handleEditorParkingSpace" >修 改</el-button></div>
              </div>
            </div>
          </el-col>

        </el-row>
      </div>
    </span>

    <set-location v-else :parkingname="parkingdata.name" :location="location" @getlocation="saveLocation" @back="createParkingsVisible = true"></set-location>

    <el-dialog
      title="添加区域"
      :visible.sync="areaAddVisible"
      size="tiny">
      <div class="form_group">
        <p>区域名称</p>
        <el-input placeholder="请输入区域名称" v-model="areaName"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="areaAddVisible = false; areaName = ''" >取 消</el-button>
        <el-button type="primary" @click="handleAreaAddRequest" >确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="修改区域"
      :visible.sync="areaEditVisible"
      size="tiny">
      <div class="form_group">
        <p>区域名称</p>
        <el-input placeholder="请输入区域名称" v-model="areaEditName"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="areaEditVisible = false" >取 消</el-button>
        <el-button type="primary" @click="handleAreaEditRequest" >确 定</el-button>
      </span>
    </el-dialog>

    <create-floor v-if="createFloorVisible" @cancel="hiddenCreateFloorVisible" :pid="pid"></create-floor>
    <editor-floor v-if="editorFloorVisible" @cancel="hiddenEditorFloorVisible" :qid="qid" :floorname="floorNameList"></editor-floor>

  </div>
</template>
<script>
  var base64 = require('base-64')
  import setLocation from '@/components/baseSetting/setLocationParking';

  //楼层
  import createFloor from '@/components/baseSetting/createFloor'
  import editorFloor from '@/components/baseSetting/editorFloor'
  export default {
    name: 'createParkings',
    props: ["parkingdata"],
    data(){
      return {
        make: undefined,
        parkingname: '',
        checkList: [],
        rulesList: [],
        areaResultList: [],
        createParkingsVisible: true,
        address: '',
        coordinateX: '',
        coordinateY: '',
        areaAddVisible: false,
        areaName: '',
        areaEditVisible: false,
        areaEdit: [],
        areaEditName: '',

        createFloorVisible: false,
        editorFloorVisible: false,

        parkingFloorList: [],
        floorIdList: [],

        qid: '',  //楼层id
        floorNameList: [], //楼层名

        rulePage: 1,
        rulePageMax: false,

        rulePageLoading: false
      }
    },

    mounted(){
      const that = this;
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      console.log('parkingdata,'+JSON.stringify(this.parkingdata))
      this.getRules();
      this.make = this.parkingdata.isrese == "1" ? true : false;

      //区域id获取
      if(this.parkingdata.area){
        this.parkingdata.area.forEach(function(item){
          that.areaResultList.push(item.qid)
        })
      }

      //楼层id获取
      if(this.parkingdata.floor){
        this.parkingdata.floor.forEach( item => {
          that.floorIdList.push(item.qid)
          that.floorNameList.push(item.areaName)
        })
      }

      this.getCurLocation()

      //获取楼层列表
      this.getFloorList();
    },
    computed: {
      canBeEditor: function(){
        return this.areaResultList.length >= 2 || this.areaResultList.length == 0
      },
      saveDisabled: function(){
        return this.parkingdata.coordinateX == '' || this.parkingdata.coordinateY ==''
      },
      floorEditorDisabled: function(){
        return this.floorIdList.length >=2 || this.floorIdList.length ==0
      },
      floorDeleteDisabled: function(){
        return this.floorIdList.length ==0
      }
    },
    components: {
      setLocation,
      createFloor,
      editorFloor
    },
    methods: {
      back(){
        this.$emit('back')
      },
      handlerRuleTurnpage( direction ){
        var page = this.rulePage
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getRules(page)
        this.rulePage = page;
      },
      getFloorList(){     //获取楼层列表
        const that = this;

        this.$jquery.post(that.$request, {
          action: 'parkinglot_floorlist',
          pid:  that.parkingdata.pid
        }, res => {
          if(res.error_code == '0'){
            that.parkingFloorList = res.data

            that.floorIdList = []
            that.floorNameList = []
            res.data.forEach( item => {
              that.floorIdList.push(item.qid)
              that.floorNameList.push(item.name)
            })

          } else {
            that.parkingFloorList = []
            that.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      },

      updateFloorName(index){
        const that = this;
        this.floorNameList = this.parkingFloorList[index].name
      },

      hiddenCreateFloorVisible(){     //关闭添加楼层
        this.createFloorVisible = false;
        this.getFloorList()
      },
      hiddenEditorFloorVisible(){    //关闭编辑楼层
        this.editorFloorVisible = false
      },
      handleFloorAdd(){  //增加楼层
        this.pid = this.parkingdata.pid
        this.createFloorVisible = true;
      },

      handleFloorEdit(){ //编辑楼层
        this.qid = this.floorIdList;
        this.editorFloorVisible = true;

      },
      handleFloorDelete(){  //删除楼层
        const that = this;

        var qid = that.floorIdList;

        if(!qid){
          this.$message({type: 'warning', message: '请选择要删除的楼层'})
          return
        }

        this.$jquery.post(that.$request, {
          action: 'parkinglot_floor_del',
          admin_id: that.admin_id,
          pid: that.parkingdata.pid,
          qid: base64.encode(JSON.stringify(qid))
        }, res => {
          if(res.error_code == '0'){
            that.$message({type: 'success', message: res.msg})
            that.getFloorList()
          } else {
            that.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      },

      handleAreaAdd(){
        this.areaAddVisible = true
      },
      handleAreaAddRequest(){
        const that = this;

        this.$jquery.post(that.$request, {
          action: 'parkinglot_area_add',
          admin_id: that.admin_id,
          pid: that.parkingdata.pid,
          name: that.areaName
        }, res => {
          if( res.error_code == '0'){
            this.$message({ type: 'success', message: res.msg })
            this.areaAddVisible = false;
            this.getArea()
            this.areaName = ''

          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }

        }, 'json')
      },
      handleAreaEdit(){
        this.areaEditVisible = true;

        var l = this.parkingdata.area;

        for(var i = 0; i < l.length; i++){
          if(l[i].qid == this.areaResultList[0]){
            this.areaEditName = l[i].areaName || l[i].name
          }
        }

      },
      handleAreaEditRequest(){
        const that = this;

        this.$jquery.post(that.$request, {
          action: 'parkinglot_area_edit',
          admin_id: that.admin_id,
          qid: that.areaResultList[0],
          name: that.areaEditName
        }, res => {
          if( res.error_code == '0'){
            this.$message({ type: 'success',  message: '修改成功' })
            this.getArea()
            this.areaEditVisible = false;
            this.areaResultList = [];
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },
      handleAreaDelete(){
        const that = this;
        this.$confirm('此操作将会删除选择的区域, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$jquery.post(that.$request, {
            action: 'parkinglot_area_del',
            admin_id: that.admin_id,
            pid: that.parkingdata.pid,
            qid: base64.encode(JSON.stringify(that.areaResultList))
          }, res => {
            if( res.error_code == '0'){
              that.$message({type: 'success', message: '删除成功'})
              that.getArea()
              that.areaResultList = [];
            } else {
              that.$message({ type: 'error', message: res.msg })
            }

          }, 'json')
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });

      },
      saveLocation(location){

        this.parkingdata.location = location.address;
        this.coordinateX = location.lng || this.parkingdata.coordinateX;
        this.coordinateY = location.lat || this.parkingdata.coordinateY;
        this.createParkingsVisible = true;
      },
      getCurLocation(){
        let _this = this;
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(showPosition);
        }else{
            this.$message({type: 'warning', message: "Geolocation is not supported by this browser."})
        }

        function showPosition(position){
          // console.log( position.coords.longitude, position.coords.latitude)
        }
      },
      //设置停车场坐标
      setParkingLocation(){
        const that = this;

        if(this.parkingdata.name == ''){
          this.$message({type: 'warning', message: '请填写停车场名称'})
          return
        }
        this.createParkingsVisible = false;
        this.location = {x: that.parkingdata.coordinateX, y: that.parkingdata.coordinateY}
      },

      //获取区域
      getArea(){

        const that = this;
        this.$jquery.post(that.$request, {
          action: 'parkinglot_arealist',
          pid: that.parkingdata.pid
        }, res => {
          if(res.error_code == '0'){
            that.parkingdata.area = res.data;
          } else {
            that.$message({ type: 'error', message: res.msg})
          }
        }, 'json')
      },

      //修改停车场
      handleEditorParkingSpace(){
        const that = this;

        if( that.parkingdata.name == ''){
          this.$message({type: 'warning', message: '请填写停车场名称'})
          return
        }

        var params = {
        "admin_id":that.admin_id,
        "pid":that.parkingdata.pid,
        "data":{
            "name": encodeURI(that.parkingdata.name),
            "ruleid": that.checkList.map(function(i){ return parseInt(i)}),
            "freeTime": that.parkingdata.freeTime,
            "OutTime":  that.parkingdata.OutTime,
            "location": encodeURI(that.parkingdata.location),
            "coordinateX": that.coordinateX || this.parkingdata.coordinateX,
            "coordinateY": that.coordinateY || this.parkingdata.coordinateY,
            "isrese": that.make == true ? 1 : 0
        }}

        this.$jquery.post(that.$request+'?action=parkinglot_edit', JSON.stringify(params), res => {
          if( res.error_code == '0'){
            this.$message({type: 'success', message: '保存成功'})
            this.$emit('edited')
          } else {
            this.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      },

      //获取收费规则列表
      getRules(page){
        const that = this;
        this.rulePageLoading = true;
        that.$jquery.post(that.$request, {
          action: 'parkinglot_rules_list',
          admin_id: that.admin_id,
          page: page
        }, res => {

          if( res.error_code == '0'){
            this.rulesList = res.data;
            var ruleid = this.parkingdata.ruleid;
            if(ruleid.length > 0){
              ruleid.forEach(item => {
                this.checkList.push(item  )
              })

            } else {
              this.checkList.push(ruleid.join(''))
            }
            that.rulePageMax = res.data.length == 0 ? true : false;
          } else {
            this.$message({ type: 'error', message: res.msg})
          }

          that.rulePageLoading = false
        }, 'json')
      }
    }
  }
</script>
<style type="text/css" lang="scss">
  .setting{
    cursor: pointer;
  }
  .body{
    height: 280px;
    overflow-y: scroll;
    .area_list .el-checkbox__label, .rulesList .el-checkbox__label{ display: none;}
    .area_list .el-checkbox__input, .rulesList .el-checkbox__input{ margin-right: 10px;}
    .area_group{ border-bottom: 1px solid #ddd; padding-bottom: 20px;}
    .area_list .el-list{ display: block; margin-left: 0; margin: 10px 0;}
  }
  .form_group{
    margin-bottom: 20px;
  }
  .form_group p{
    margin:0 ;
    margin-bottom: 10px;
  }

</style>
