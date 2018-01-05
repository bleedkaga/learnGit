<template>
  <div id="earth">
    <panel-title title="定位标签"></panel-title>
    <warning-notice :ty="4" @back="back" v-show="warningShow"></warning-notice>

    <search placeholder="请输入设备ID" @search="search" v-show="!warningShow"></search>
    <div class="earth_container" v-show="!warningShow">
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="earth_query">
            <div class="form_group">
              <p>停车场</p>
              <div class="block">
                <el-select v-model="parking">
                  <el-option v-for="item in parkings_options" :label="item.name" :key="item.pid" :value="item.pid"></el-option>
                </el-select>
              </div>
            </div>

            <div class="form_group query">
              <el-button type="primary" @click="query" :loading="queryLoading">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="table">
            <div class="operation">
              <span slot-scope="scope" >
               <!--  <el-button size="small" @click="addPositioningShow"><i class="el-icon-plus"></i> 添加定位标签</el-button> -->
                <!-- <el-button size="small" @click="tagsManagement" :disabled="selectedParkingRow.length==0 || selectedParkingRow.length > 1" ><i class="iconfont icon-17"></i> 标签管理</el-button> -->
                <!-- <el-button size="small" @click="deleteLabel" :disabled="selectedParkingRow.length == 0"><i class="el-icon-delete"></i> 删除定位标签</el-button> -->
                <!-- <el-button size="small" @click="warningNoticeHandler">告警消息</el-button> -->
                <el-button size="small" type="primary" :disabled="selectedParkingRow.length == 0" @click="exportList">导出列表</el-button>
              </span>

              <span class="f_right">
                <el-button-group>
                  <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                  <el-button size="small" icon="arrow-right":disabled="pageMax"   @click="turnPage('right')"></el-button>
                </el-button-group>
              </span>
            </div>

            <el-table
              ref="multipleTable"
              :data="positioningLabelTable"
              tooltip-effect="dark"
              v-loading="positioningLabelTableLoading"
              style="width: 100%"
              @selection-change="handleSelectionChange">
              <el-table-column
                type="selection"
                @select="handleSelectionChange"
                width="55">
              </el-table-column>
              <el-table-column
                prop="equNumber"
                label="设备序列号"
                width="180">
              </el-table-column>
              <el-table-column
                prop="parkinglotName"
                label="所属停车场"
                width="220">
              </el-table-column>
              <el-table-column
                prop="power"
                label="电池电量"
                width="120"
                show-overflow-tooltip>
                 <template slot-scope="scope">
                  <span v-if="scope.row.power < 20" style="color: red;">{{scope.row.power}}%</span>
                  <span v-else>{{scope.row.power}}%</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="uuid"
                label="UUID"
                min-width="220"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="Major"
                label="Major"
                min-width="120"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="Minor"
                label="Minor"
                min-width="120"
                show-overflow-tooltip>
              </el-table-column>
              <!-- <el-table-column
                prop=""
                label="修改"
                show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-button size="small" type="primary" @click="editLabel(scope.row)"><i class="el-icon-edit"></i> 修改</el-button>
                </template>
              </el-table-column>-->
            </el-table>

          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      :title="title"
      :visible.sync="addTagsShow"
      size="tiny">
      <div class="positioning_add">
        <el-row :gutter="30">

          <el-col :span="12">
            <div class="form_group">
              <p>设备序列号</p>
              <el-input v-model="equNumber" placeholder="请输入设备序列号"></el-input>
            </div>
            <div class="form_group">
              <p>所属停车场</p>
              <el-select v-model="create_parking" placeholder="请选择停车场">
                <el-option v-for="item in create_positioning_parkings" :key="item.pid" :label="item.name" :value="item.pid"></el-option>
              </el-select>
            </div>
            <div class="form_group">
              <p>UUID</p>
              <el-input v-model="uuid" placeholder="请输入设备UUID"></el-input>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="form_group">
              <p>Major</p>
              <el-input v-model="Major" placeholder="请输入设备Major"></el-input>
            </div>
            <div class="form_group">
              <p>Minor</p>
               <el-input v-model="minor" placeholder="请输入Minor"></el-input>
            </div>
          </el-col>

        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addTagsShow = false">取 消</el-button>
        <el-button v-if="title == '添加定位标签'" type="primary" :loading="saveLoading" @click="savePositionLabel">确 定</el-button>
        <el-button v-else type="primary" :loading="saveLoading" @click="editPositionLabel">修 改</el-button>
      </span>
    </el-dialog>

  </div>


</template>
<script type="text/javascript">
import search from '@/components/search';
import carList from '@/components/common/carlist';
import warningNotice from '@/components/common/warning';
import panelTitle from '@/components/panel_title';
const base64 = require('base-64');
const cityOptions = ['上海', '北京', '广州', '深圳'];
// import $ from 'jquery';
// $.extend({
//     StandardPost:function(url,args){
//         var form = $("<form method='post'></form>"),
//             input;
//         form.attr({"action":url});
//         $.each(args,function(key,value){
//             input = $("<input type='hidden'>");
//             input.attr({"name":key});
//             input.val(value);
//             form.append(input);
//         });
//         form.appendTo($('body'))
//         form.submit();
//     }
// });
export default {
    name: 'earthMagnetic',
    data() {
      return {
        warning: false,
        deleteCheckebox: false,
        title: '添加定位标签',
        iconDelete: false,
        warningShow: false,
        checkAll: true,
        checkedCities: ['上海', '北京'],
        cities: cityOptions,
        positioningLabelTableLoading: false,
        edit: false,
        equNumber: '',
        parking: '',
        uuid: '',
        Major: '',
        minor: '',
        posid: '',
        page: 1,
        pageMax: false,
        saveLoading:false,
        parkings_options: [],
        queryLoading: false,
        earthQuery: {

          stateOptions: [
            {
              label: '状态1',
              value: '1'
            },
            {
              label: '状态2',
              value: '2'
            }
          ],
          earthState: '',
        },
        positioningLabelTable: [],
        addTagsShow: false,
        tags: '',
        selectedParkingRow: [],
        create_parking: '',
        create_positioning_parkings: [],

        //设备id
        deviceId: ''
      }
    },
    components: {
      search,
      carList,
      warningNotice,
      panelTitle
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getFixedLabel()
      this.getParkingsList()
    },
    methods: {
      //按设备id搜索
      search( id ){
        this.deviceId = id;
        this.getFixedLabel(id)
      },
      back(){
        this.warningShow = false
        console.log('返回了')
      },
      //标签警告
      warningNoticeHandler(){
        this.warningShow = true
      },
      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow
        index.forEach( i => {
           arr.push( parseFloat(i.posid) )
        })
      },
      getParkingsList(){
        const that = this;

        this.$jquery.get(that.$request, {
          action: 'parkinglot_admin_all',
          admin_id: that.admin_id
        }, res => {
          that.parkings_options = res.data;
        }, 'json')
      },

      query(val){
        const that = this;
        this.queryLoading = true;
        var params = {
          pid: that.parking
        };

        this.getFixedLabel(that.deviceId, base64.encode(JSON.stringify(params)), 1)
      },
      getCreatingParkingLots(){
        const that = this;
        this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id, function ( res ) {
          that.create_positioning_parkings = res.data;
        }, 'json')
      },

      //添加定位标签
      addPositioningShow(){
        this.addTagsShow = true;
        this.title = '添加定位标签';
        this.equNumber = "";
        this.parking = "";
        this.uuid = "";
        this.Major = "";
        this.minor = "";

        this.getCreatingParkingLots()
      },

      //表格
      getFixedLabel(number, data, page){
        const that = this;
        this.positioningLabelTableLoading = true;
        this.$jquery.post(that.$request, {
          action: 'positioning_list',
          admin_id: that.admin_id,
          number: number,
          data: data,
          page: page
        }, res => {
          if(res.error_code == '0'){
            this.positioningLabelTable = res.data;
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          console.log( res.data.length)
          this.pageMax = res.data.length > 0 ? false : true;
          this.positioningLabelTableLoading = this.queryLoading = false;
        }, 'json')
      },

      //翻页
      turnPage( direction ){
        const that = this;
        var params = {
          pid: that.parking
        };
        params = base64.encode(JSON.stringify(params))
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getFixedLabel(that.deviceId,params,page)
        this.page = page;
      },

      change( val ){
        this.parking = val
      },

      editLabel( obj ){
        this.posid = obj.posid;
        this.title = '修改定位标签'
        this.addTagsShow = true;
        this.equNumber = obj.equNumber;
        this.create_parking = obj.parkinglotId;
        this.uuid = obj.uuid;
        this.Major = obj.Major;
        this.minor = obj.Minor;
        this.getCreatingParkingLots()
      },

      editPositionLabel(){
        const that = this;
        var posid = this.posid;
        var data = {
          "equNumber": that.equNumber,
          "parkinglotId": that.create_parking,
          "uuid": that.uuid,
          "Major": that.Major,
          "Minor": that.minor
        }
        data = base64.encode(JSON.stringify(data))
        this.saveLoading = true
        this.$jquery.post(this.$request, {
          action: 'positioning_edit',
          posid: posid,
          admin_id: that.admin_id,
          data: data
        }, res => {
          if(res.error_code == '0'){
            this.$message({ type :'success', message: '修改成功'})
            this.getFixedLabel()
          } else {
            this.$message({ type :'error', message: res.msg})
          }
           this.saveLoading = this.addTagsShow =  false;
        }, 'json')
      },

      //添加定位标签
      savePositionLabel(){
        const that = this;
        this.title = '添加定位标签'
        var data = {
          "equNumber": that.equNumber,
          "parkinglotId": that.create_parking,
          "uuid": that.uuid,
          "Major": that.Major,
          "Minor": that.minor
        }
        for(var i in data){
          if(data[i] == ''){
            this.$message({type:'warning', message: '请填写完整'})
            return
          }
        }
        data = base64.encode(JSON.stringify(data))
        this.saveLoading = true
        this.$jquery.post(this.$request, {
          action: 'positioning_add',
          admin_id: that.admin_id,
          data: data
        }, res => {
          if(res.error_code == '0'){
            this.$message({ type :'success', message: '添加成功'})
            this.getFixedLabel()
          } else {
            this.$message({ type :'error', message: res.msg})
          }

          this.saveLoading = this.addTagsShow =  false;
        }, 'json')
      },

      //导出定位列表
      exportList(){
        var posid = base64.encode(JSON.stringify(this.selectedParkingRow));
        const that = this;

        // $.StandardPost(that.$request + '?positioning_exp&admin_id='+that.admin_id+'&posid='+posid, { admin_id : that.admin_id, posid : posid})
        this.$jquery.post(that.$request, {
          action: 'positioning_exp',
          admin_id: that.admin_id,
          posid: posid
        }, res => {
          window.location.href = that.$request + '?action=positioning_exp&admin_id='+that.admin_id+'&posid='+posid;
        })

      },

      //删除定位标签
      deleteLabel(){
        const that = this;
        var posid = base64.encode(JSON.stringify(this.selectedParkingRow));
        this.$jquery.post(that.$request, {
          action: 'positioning_del',
          admin_id: that.admin_id,
          posid: posid
        }, res => {
          if(res.error_code == '0'){
            this.$message({ type :'success', message: '删除成功'})
            this.getFixedLabel()
          } else {
            this.$message({ type :'error', message: res.msg})
          }
        }, 'json')
      },
      addTags(){
        this.iconDelete = false;
        this.cities.push(this.tags)
        this.tags = ''
      },

      tagsManagement(){
        this.addTagsShow = true
        this.title = '修改定位标签';
        this.iconDelete = true;
      },
      deleteCheckeboxs(){
        this.cities.length = 0;
      }
    }
  }
</script>
<style lang="scss">

.pay_record{
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  background: white;
  margin-bottom: 10px;
  overflow: hidden;
  display: flex;
  span{
    cursor: pointer;
  }
  .pay_record_search{
    width: 100%;
  }
  em{
    width: 79.5%;
    display: inline-block;
    font-style: normal;
  }
}
.form_group{
        p{ margin: 0; margin-bottom: 5px;}
        margin-bottom: 20px;
      }
  #earth{
    padding: 0 20px;
    .earth_container{
      margin-top: 30px;
      .earth_query{
        padding: 20px;
        background: white;
        border: 1px solid #bfcbd9;
      }
      .el-select{
        width: 100%;
      }

      .query{
        padding-top: 200px;
        button,input{
          width: 100%;
        }
      }
    }
    .operation{
      margin-bottom: 20px;
    }
    .table{
      background: white;
      padding: 20px;
      border: 1px solid #bfcbd9;
      border-radius: 2px;
    }
    .iconfont{
      font-size: 12px;
      margin: 0px;
    }
    .f_right{
      float: right;
    }
  }

  .panel_title{
    text-align: left;
    background: white;
    margin: 10px;
    margin-top: 30px;
    margin-left: 0px;
    padding: 30px 10px;
    font-size: 20px;
    border: 1px solid #ddd;
  }
  .select_tags_all{
    padding: 10px 0;

  }
  .tags{
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
    margin-bottom: 20px;
  }
</style>
