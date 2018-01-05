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
                <el-col :span="18"><el-input v-model="parkingname"></el-input></el-col>
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
          <!-- <el-col :span="6" >
            <div class="parking_space_number panel_setting_container">
              <div class="head yellow">车位数设置</div>
              <div class="body">
                <div class="form_group">
                  <p>所属停车场</p>
                  <div class="block">
                    <el-input></el-input>
                  </div>
                </div>
                <div class="form_group">
                  <p>已停车位</p>
                  <div class="block">
                    <el-input></el-input>
                  </div>
                </div>
                <div class="form_group">
                  <p>剩余车位</p>
                  <div class="block">
                    <el-input></el-input>
                  </div>
                </div>
              </div>
            </div>
          </el-col> -->
          <!-- <el-col :span="6">
            <div class="parking_space_number panel_setting_container">
              <div class="head green">允许车辆通过类型</div>
              <div class="body">
                <div class="block form_group"><el-checkbox >大型车</el-checkbox></div>
                <div class="block form_group"><el-checkbox >中型车</el-checkbox></div>
                <div class="block form_group"><el-checkbox >小型车</el-checkbox></div>
                <div class="block form_group"><el-checkbox >其他</el-checkbox></div>
              </div>
            </div>
          </el-col> -->
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
                    <el-input placeholder="请输入免费停车时长" v-model="freeTime"></el-input>
                  </div>
                </div>
                <div class="form_group">
                  <p>免费出场时间</p>
                  <div class="block">
                    <el-input placeholder="请输入免费出场时间" v-model="OutTime"></el-input>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6" v-if="isPartition">
            <div class="parking_space_number panel_setting_container">
              <div class="head yellow">停车场分区设置</div>
              <div class="body">
                <div class="area_group">
                  <el-button-group>
                    <el-button size="small" icon="plus" @click="handleAreaAdd"></el-button>
                    <el-button size="small" icon="edit" :disabled="areaResultList.length >= 2 || areaResultList.length == 0"  @click="handleAreaEdit"></el-button>
                    <el-button size="small" icon="delete" :disabled="areaResultList.length == 0"  @click="handleAreaDelete"></el-button>
                  </el-button-group>
                </div>
                <div class="area_list">
                   <el-checkbox-group v-model="areaResultList">
                    <span class="el-list" v-for="item in arealist" :label="item.qid" :key="item.qid"><el-checkbox :label="item.qid"></el-checkbox>{{item.name}}</span>
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
                  <p v-text="address"></p>
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
                <div class="block" @click="back"><el-button>取消</el-button></div>
                <div class="block"><el-button type="primary" @click="handleCreateParkingSpace" :disabled="coordinateX == '' || coordinateY ==''">保存</el-button></div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </span>
    <set-location v-else :parkingname="parkingname" :location="location" @getlocation="saveLocation" @back="createParkingsVisible = true"></set-location>

    <el-dialog
      title="添加区域"
      :visible.sync="areaAddVisible"
      size="tiny">
      <div class="form_group">
        <p>区域名称</p>
        <el-input placeholder="请输入区域名称" v-model="areaName"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="areaAddVisible = false" >取 消</el-button>
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

  </div>
</template>
<script>
  var base64 = require('base-64')
  import setLocation from '@/components/baseSetting/setLocationParking';
  export default {
    name: 'createParkings',
    props: ['isPartition','parkingid'],
    data(){
      return {
        make: false,
        parkingname: '',
        freeTime: '',
        OutTime: '',
        rulesList: [],
        checkList: [],
        arealist: [],
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
        rulePage: 1,
        rulePageMax: false,
        rulePageLoading: false
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      console.log('this.$props.parkingid', this.$props.parkingid)
      if(this.$props.parkingid != ''){

        this.getArea()
      }
      this.getRules();
      this.getCurLocation()
    },
    components: {
      setLocation
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
      handleAreaAdd(){
        this.areaAddVisible = true
      },
      handleAreaAddRequest(){
        const that = this;
        this.$jquery.post(that.$request, {
          action: 'parkinglot_area_add',
          admin_id: that.admin_id,
          pid: that.$props.parkingid,
          name: that.areaName
        }, res => {
          if( res.error_code == '0'){
            this.$notify({
              type: 'success',
              title: '成功',
              message: '添加区域成功'
            })
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
        console.log(this.areaResultList[0])
        var l = this.arealist;
        for(var i in l){
          if(l[i].qid == this.areaResultList[0]){
            this.areaEditName = l[i].name
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
            this.$notify({
              type: 'success',
              title: '成功',
              message: '修改成功'
            })
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
        this.$jquery.post(that.$request, {
          action: 'parkinglot_area_del',
          admin_id: that.admin_id,
          pid: that.$props.parkingid,
          qid: base64.encode(JSON.stringify(that.areaResultList))
        }, res => {
          if( res.error_code == '0'){
            this.$notify({
              type: 'success',
              title: '成功',
              message: '删除成功'
            })
            this.getArea()
            this.areaResultList = [];
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }

        }, 'json')
      },
      saveLocation(location){
        console.log(location.address)
        this.address = location.address;
        this.coordinateX = location.lng;
        this.coordinateY = location.lat;
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
          console.log( position.coords.longitude, position.coords.latitude)
        }
      },
      //设置停车场坐标
      setParkingLocation(){
        if(this.parkingname == ''){
          this.$message({type: 'warning', message: '请填写停车场名称'})
          return
        }
        this.createParkingsVisible = false;
        // this.getCurLocation()
        this.location = {x: 106.56709269999999, y: 29.5603739}
      },

      //获取区域
      getArea(){
        const that = this;
        this.$jquery.post(that.$request, {
          action: 'parkinglot_arealist',
          pid: that.$props.parkingid
        }, res => {

          if(res.error_code == '0'){
            console.log(JSON.stringify(res.data))
            that.arealist = res.data;
          } else {
            that.$message({ type: 'error', message: res.msg})
          }
        }, 'json')
      },

      //创建停车场
      handleCreateParkingSpace(){
        const that = this;

        if( that.parkingname == ''){
          this.$message({type: 'warning', message: '请填写停车场名称'})
          return
        }

        var params = {
          "name": encodeURI(that.parkingname),
          "ruleid": that.checkList,
          "freeTime": that.freeTime,
          "OutTime":  that.OutTime,
          "location": encodeURI(that.address),
          "coordinateX": that.coordinateX,
          "coordinateY": that.coordinateY,
          "isrese": that.make == true ? 1 : 0
        }

        this.$jquery.post(that.$request, {
          action: 'parkinglot_add',
          admin_id: that.admin_id,
          data: base64.encode(JSON.stringify(params))
        }, res => {
          if( res.error_code == '0'){
            this.$message({type: 'success', message: '保存成功'})
            this.$emit('created')
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
          that.rulePageLoading = false;
          if( res.error_code == '0'){
            this.rulesList = res.data;
          } else {
            this.$message({ type: 'error', message: res.msg})
          }
          that.rulePageMax = res.data.length == 0 ? true : false;

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
