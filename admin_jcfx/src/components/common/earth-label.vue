<template>
  <div class="label-management">
    <el-dialog :title="title" :visible.sync="dialogLabelVisible" :close-on-click-modal="false" :show-close="false">
      <div class="label_content_list parking-label-setting">
        <ul class="label_head">
          <li><input type="checkbox" id="check" v-model="checked" v-on:click="checkedAll"><span class="input_checkbox_inner"></span> <label for="check">全选</label> <i class="el-icon-delete" v-if="isManagement" @click="deleteLabel"></i></li>
        </ul>
        <ul class="label_body"  v-loading="loading">
          <li v-for="item in list" :key="item.label_id"><input type="checkbox" :id="item.label_id" v-model="checkModel" :value="item.label_id" ><span class="input_checkbox_inner"></span> <label :for="item.label_id">{{item.name}}</label></li>
        </ul>

        <el-input placeholder="请输入要添加的标签名称" v-model="labelName" v-if="isManagement">
          <el-button slot="append" type="primary" @click="addLabelName">添 加</el-button>
        </el-input>

      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button v-if="did" type="primary" @click="addLabel">保 存</el-button>
        <el-button v-else type="primary" @click="saveLabel">保 存</el-button>
      </span>

    </el-dialog>

  </div>
</template>
<script>

  var cityOptions = [];
  var compare = [];
  var base64 = require('base-64')
  export default {
    name : 'labelManagement',
    props: ['ty', 'did', 'selectedLabel','isManagement'],
    data(){
      return {
        dialogLabelVisible:true,
        checkedCities: [],
        cities: cityOptions,
        isIndeterminate: true,
        dids: '',
        labelName: '',
        loading: false,
        list: [],
        checkModel: [],
        checked: ""
      }
    },
    computed: {
      title(){
        return this.$props.did ? '添加标签' : '标签管理';
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      console.log('selectedLabel', JSON.stringify(this.selectedLabel))
      if(this.selectedLabel.length > 0){
        this.checkModel = this.selectedLabel[0].labelid.split(",")
      }

      this.getLabelList()
    },
    watch: {
      "checkModel": {
        handler: function(val, oldVal){
          if( this.checkModel.length === this.list.length ){
            this.checked = true
          } else {
            this.checked = false
          }
        },
        deep: true
      }
    },
    methods: {

      persetSelectedLabel( ids ){
        if(ids.length <= 0){
          return
        }

        var id = ids.split(',')[0] ;
        this.checkModel = id;
      },

      checkedAll: function(){
        let _this = this;

        if(this.checkModel.length === this.list.length){
          _this.checkModel = []
        } else {
          _this.checkModel = [];
          _this.list.forEach( item => {
            _this.checkModel.push(item.label_id)
          })
        }
      },
      addLabelName(){
        const that = this;
        that.$jquery.post(that.$request, {
          action: 'parking_label_add',
          admin_id: that.admin_id,
          ty: that.$props.ty,
          label: that.labelName
        }, res => {
          if( res.error_code == '0'){
            this.$message({ type: 'success', message: '添加成功'})
            this.getLabelList()
            this.labelName = ''
          } else {
            this.$message({ type: 'error', message: res.msg})
          }
        }, 'json')
      },
      getLabelList(){
        const that = this;
        this.loading = true;
        this.$jquery.post(that.$request, {
          action: 'parking_label',
          admin_id: that.admin_id,
          ty: this.$props.ty
        }, res => {
          if(res.error_code == '0'){
            for( var i = 0; i < res.data.length; i++){
              res.data[i].checked = false;
            }
            this.list = res.data;
            // this.persetSelectedLabel(this.selectedLabel)
          } else {
            this.$message({ type: 'error', message: res.msg})
          }
          this.loading = false;

        }, 'json')
      },

      editLabel(){
        var list = this.checkedCities;
        var labelId = [];
        var that = this;
        for(var i = 0; i < compare.length; i++){
          if(list[i] == compare[i].name){
            labelId.push(compare[i].label_id)
          }
        }

        this.$jquery.post(that.$request, {
          action: 'parking_label_add',
          admin_id: that.admin_id,
          ty: that.$props.ty,
          label: that.labelName
        }, res => {
          if( res.error_code == '0'){
            this.$message({type: 'success', message: '添加成功'})
            this.getLabelList();
          } else {
            this.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      },
      saveLabel(){
        this.$emit('cancel')
      },
      save(){
        this.addLabel()
      },
      addLabel(){

        let _this = this;
        let labelid = base64.encode(JSON.stringify(this.checkModel))
        let did = this.$props.did.toString();
        console.log(labelid, did)
        this.$jquery.post(_this.$request, {
          action: 'geom_label_add',
          admin_id: _this.admin_id,
          labelid: labelid,
          did: did
        }, res => {
          if(res.error_code == '0'){
            this.$message({type: 'success', message: '修改成功'})
            this.$emit('cancel')
            this.$emit('done')
          } else {
            this.$message({type: 'error', message: res.msg})
          }
        }, 'json')

      },
      deleteLabel(){
        var that = this;
        var labelid = base64.encode(JSON.stringify(that.checkModel))

        if(that.checkModel.length == 0){
          this.$message({type: 'warning', message: '请勾选标签'})
          return
        }

        this.$confirm('此操作将会删除所选择的标签, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$jquery.post(that.$request, {
            action: 'parking_label_del',
            admin_id: that.admin_id,
            ty:that.$props.ty,
            labelid: labelid
          }, res => {
            if( res.error_code == '0'){
              that.$message({type: 'success', message: '删除成功'})
              that.getLabelList()
              that.checkModel = []
            } else {
              that.$message({type: 'error', message: res.msg})
            }
          }, 'json')
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },

      //取消
      cancel(){
        this.$emit('cancel')
      }
    }
  }
</script>
<style type="text/css" lang="scss" scoped>
  .label_content_list{
    .el-icon-delete{
      cursor: pointer;
    }
  }
  .parking-label-setting{
    .label_head{
      border-bottom: 1px solid #ddd;
    }
    .label_body{
      min-height: 40px;
      padding: 10px 0
    }
    ul{
      overflow: hidden;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -o-user-select: none;
    }
    li{
      list-style-type: none;
      float: left;
      height: 20px;
      margin-right: 30px;
      margin-bottom: 10px;
      text-align: left;
      cursor: pointer;
      position: relative;
      input, label{
        cursor: pointer;
      }
      span.input_checkbox_inner{
        width: 16px;
        height: 16px;
        display: inline-block;
        border: 1px solid #ddd;
        border-radius: 4px;
        vertical-align: middle;
      }
      input:checked + span.input_checkbox_inner{
        background: #188fff;
        transition: background .3s ease-in-out;
        border-color: #188fff;
      }
      input:checked + span.input_checkbox_inner:after{
        width: 8px;
        height: 4px;
        display: inline-block;
        border-left: 2px solid #fff;
        border-bottom: 2px solid #fff;
        content: "";
        margin-left: 2px;
        transform: rotate(-45deg);
        position: absolute;
        left: 2px;
        top: 7px;
        transition: transform .3s linear;
      }
      input{
        opacity: 0;
        margin:0px;
        position: absolute;
        left: 0px;
        top:0px;
        width: 18px;
        height: 18px;
      }
    }
  }
</style>
