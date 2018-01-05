<template>
  <div class="create">
    <el-dialog title="增加固定车辆停车位" :visible="visible" :show-close="false">
      <div class="create_invoice">
        <el-row :gutter="30">
          <el-col :span="12">
            <div class="form_group">
              <p>所属停车场</p>
              <el-select v-model="parkings" @change="getFixedRules">
                <el-option v-for="item in parkingLot_options" :key="item.pid" :label="item.name" :value="item.pid">{{item.name}}</el-option>
              </el-select>
            </div>
            <div class="form_group">
              <p>包期类型</p>
              <el-select v-model="type" placeholder="请选择包期类型" :disabled="parkings == ''" v-loading="rulesLoading">
                <el-option v-for="item in rules" :label="item.name" :key="item.ruleId" :value="item.ruleId"></el-option>
              </el-select>
            </div>
            <div class="form_group">
              <p>包期时长</p>
              <el-select v-model="duration" placeholder="请选择包期时长" :disabled="parkings == ''" v-loading="rulesLoading">
                <el-option v-for="item in rules" :label="item.duration" :key="item.duration" :value="item.duration" ></el-option>
              </el-select>
            </div>
            <div class="form_group">
              <p>包期金额</p>
              <el-input type="number" readonly  v-model="rules[0].fee" placeholder="请输入包期金额" :disabled="parkings == ''" v-loading="rulesLoading"></el-input>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="form_group">
              <p>分配车位</p>
              <el-input placeholder="请输入分配车位" v-model="parkingSpace"></el-input>
            </div>
            <div class="form_group">
              <p>车主姓名</p>
              <el-input placeholder="请输入车主姓名" v-model="username"></el-input>
            </div>
            <div class="form_group">
              <p>车主电话</p>
              <el-input type="number" placeholder="请输入车主电话" v-model="userPhone"></el-input>
            </div>
            <div class="form_group">
              <p>车牌号码</p>
              <el-input v-model="carNumber" placeholder="请输入车牌号码"></el-input>
            </div>

          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" :loading="save"  @click="requestSaveNewFixedParking">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import parkingList from '@/components/common/carlist';
  var base64 = require('base-64')
  export default {
    name : 'createFixedCar',

    data(){
      return {
        parkings: '',
        parkingLot_options: [],
        rulesLoading: false,
        createParkingsVisible:false,
        carNumber: '',
        type: '',
        type_options: [],
        duration: '',
        duration_options: [],
        fee: '',
        parkingSpace: '',
        visible: true,
        username: '',
        userPhone: '',
        parking: '',
        rules: [{fee: 0}],
        save: false
      }
    },
    methods: {
      //获取停车场
      getParkingLot(){

        let _this = this;
        this.$jquery.get(_this.$request+'?action=parkinglot_admin_all&admin_id='+_this.admin_id,{}, res => {
          if( res.error_code == '0'){
            _this.parkingLot_options = res.data;

            if(res.data.length == 0){
              return
            }
          }
        }, 'json')
      },
      //保存新添加的停车位
      requestSaveNewFixedParking(){
        const that = this;

        var data = {
          "carNumber": encodeURI(that.carNumber),
          "parkinglotId": encodeURI(that.parkings),
          "type": encodeURI(that.type),
          "fee": encodeURI(that.rules[0].fee),
          "duration": encodeURI(that.duration),
          "parkingId": encodeURI(that.parkingSpace),
          "ownerName": encodeURI(that.username),
          "phoneNumber": encodeURI(that.userPhone)
        }
        for(var i in data){
          if(data[i] === ''){
            this.$message({type:'warning', message: '请填写完整'})
            return
          }
        }
        this.save = true
        data = base64.encode(JSON.stringify(data))
        this.$jquery.post(that.$request, {
          action: 'whitelist_add',
          admin_id: that.admin_id,
          data: data
        }, res => {
          if(res.error_code == '0'){
            this.$message({
              type: 'success',
              message: '保存成功'
            })

            this.$emit('hideModel')
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }

          this.save = false
        }, 'json')
      },
      cancel(){
        this.$emit('hideModel')
      },
      getFixedRules(){
        const that = this;

        this.rulesLoading = true;
        this.fee = '';
        this.duration = '';
        this.type = '';

        that.$jquery.post(that.$request, {
          action: 'parkinglot_white_rule',
          admin_id: that.admin_id,
          pid: that.parkings
        }, res => {

          if( res.error_code == '0'){
            this.rules = res.data;
          } else {
            this.$message({ type: 'error', message: res.msg })
          }

          if(res.data.length == 0){
            this.parking = ''
            this.rules = [{"ruleId":"","name":"","fee":"","duration":""}]
          }
          that.rulesLoading = false;

        }, 'json')
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getParkingLot()
    },
    computed(){
      console.log('props', this.$props.visible)
      this.createParkingsVisible = this.$props.visible;
      this.getFixedRules();

    },
    components: {
      parkingList
    }
  }
</script>
