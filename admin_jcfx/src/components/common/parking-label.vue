<template>
  <div class="label-management">
    <el-dialog title="添加标签" :visible.sync="dialogLabelVisible" :close-on-click-modal="false" :show-close="false" >
      <div class="label_content_list parking-label-setting">
        <ul class="label_head">
          <li><input type="checkbox" id="check" v-model="checked" v-on:click="checkedAll"><span class="input_checkbox_inner"></span> <label for="check">全选</label></li>
        </ul>
        <ul class="label_body"  v-loading="loading">
          <li v-for="item in list" :key="item.label_id"><input type="checkbox" :id="item.label_id" v-model="checkModel" :value="item.label_id" ><span class="input_checkbox_inner"></span> <label :for="item.label_id">{{item.name}}</label></li>
        </ul>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <!-- <el-button v-if="!isManagement" type="primary" @click="save">保 存1</el-button> -->
        <el-button type="primary" @click="addParkingLabel">保 存</el-button>
      </span>

    </el-dialog>

  </div>
</template>
<script>
  var cityOptions = [];
  var compare = [];
  var base64 = require('base-64')
  export default {
    name : 'parkingLabelManagement',
    props: ['ty', 'cid', 'selectedLabel'],
    data(){
      return {
        dialogLabelVisible:true,
        loading: false,
        labelName: '',
        list: [],
        checked: '',
        checkModel: []
      }
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
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getLabelList()

      if(this.selectedLabel.length > 0){
        this.checkModel = this.selectedLabel[0].labelid.split(",")
      }

    },
    methods: {

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
          } else {
            this.$message({ type: 'error', message: res.msg})
          }
          this.loading = false;

        }, 'json')
      },

      addParkingLabel(){
        const that = this;
        const cid = that.$props.cid.toString();
        var labelid = base64.encode(JSON.stringify(that.checkModel));

        this.$jquery.post(that.$request, {
          action: 'parlabel_add',
          admin_id: that.admin_id,
          cid: cid,
          labelid: labelid
        }, res => {
          if( res.error_code == '0'){
            this.$message({type: 'success', message: '添加成功'})
            this.$emit('done')
          } else {
            this.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      },
      save(){
        this.$emit('cancel')
      },

      editLabel(){

        var labelid = base64.encode(JSON.stringify(labelId))
        this.$jquery.post(that.$request, {
          action: 'geom_label_add',
          admin_id: that.admin_id,
          labelid: labelid,
          did: did.toString()
        }, res => {
          if( res.error_code == '0'){
            this.$message({type: 'success', message: '修改成功'})
            this.$emit('done')
          } else {
            this.$message({type: 'error', message: res.msg})
          }
          this.$emit('cancel')
        }, 'json')
      },
      deleteLabel(){
        var that = this;
        if(that.getChecked().length == 0){
          this.$message({type: 'warning', message: '请勾选标签'})
          return
        }

        var labelid = base64.encode(JSON.stringify(that.checkModel))
        this.$jquery.post(that.$request, {
          action: 'parking_label_del',
          admin_id: that.admin_id,
          ty:that.$props.ty,
          labelid: labelid
        }, res => {
          if( res.error_code == '0'){
            this.$message({type: 'success', message: '删除成功'})
            this.getLabelList()
          } else {
            this.$message({type: 'error', message: res.msg})
          }
        }, 'json')
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
      padding: 10px 0;
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
