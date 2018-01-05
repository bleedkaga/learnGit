<template>
  <div class="charging_add">
    <el-dialog :visible.sync="dialogVisible" title="添加收费规则" :show-close="false" :close-on-click-modal="false">
      <div class="add_rules_container">
        <div class="left">


          <div class="form-group">
            <p>收费类型</p>
            <el-select size="small" v-model="add_rules_data.type" placeholder="请选择收费类型">
              <el-option v-for="item in add_rules_data.options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
              >{{item.label}}</el-option>
            </el-select>
          </div>

          <span v-if="add_rules_data.type == 0">
            <div class="form-group">
              <p>规则名称</p>
              <el-input placeholder="请输入规则名称" v-model="add_rules_data.name"></el-input>
            </div>

            <div class="form-group">
              <p>首段收费金额（元）</p>
              <el-input type="number" min="0" size="small" v-model="add_rules_data.firstmoney" placeholder="请输入首段金额（元）"></el-input>
            </div>

            <div class="form-group">
              <p>24小时封顶金额（元）</p>
              <el-input type="number" min="0" size="small" v-model="add_rules_data.max24" placeholder="请输入24小时封顶金额（元）"></el-input>
            </div>

            <div class="form-group">
              <p>12小时封顶金额（元）</p>
              <el-input type="number" min="0" size="small" v-model="add_rules_data.max12" placeholder="请输入12小时封顶金额（元）"></el-input>
            </div>

            <div class="form-group">
              <p>首段收费时长（分钟）</p>
              <el-input type="number" min="0" size="small" v-model="add_rules_data.firstDuration" placeholder="请输入首段收费时长"></el-input>
            </div>

            <div class="form-group">
              <p>间隔收费时长（分）</p>
              <el-input type="number" min="0" size="small" v-model="add_rules_data.interval" placeholder="请输入间隔收费时长"></el-input>
            </div>

            <div class="form-group">
              <p>间隔收费金额（元）</p>
              <el-input type="number" min="0" size="small" v-model="add_rules_data.interval_price" placeholder="请输入间隔收费金额"></el-input>
            </div>
          </span>

          <span v-else-if="add_rules_data.type == 1">
            <div class="form-group">
              <p>规则名称</p>
              <el-input placeholder="请输入规则名称" v-model="addFixedRulesData.ruleName"></el-input>
            </div>
            <div class="form-group">
              <p>包期名称</p>
              <el-input size="small" v-model="addFixedRulesData.name" placeholder="请输入包期名称"></el-input>
            </div>
            <div class="form-group">
              <p>包期时间</p>
              <el-select v-model="addFixedRulesData.time" placeholder="请选择包期时间">
                <el-option v-for="item in addFixedRulesData.times" :key="item.key" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="form-group">
              <p>包期金额（元）</p>
              <el-input min="0" type="number" size="small" v-model="addFixedRulesData.money" placeholder="请输入包期金额"></el-input>
            </div>
          </span>

           <span v-else-if="add_rules_data.type == 2">
             <div class="form-group">
              <p>收取金额（元）</p>
              <el-input min="0" type="number" size="small" v-model="addAbnormalRulesData.price" placeholder="请输入收取金额"></el-input>
            </div>
           </span>

           <span v-else-if="add_rules_data.type == 3">

           </span>


        </div>
        <div class="right">
          <div class="form-group">
            <p>描述</p>
            <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入内容"
              style="height: 307px"
              v-model="add_rules_data.desc">
            </el-input>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button v-if="add_rules_data.type == 0" type="primary" @click="addChargingRules">保 存</el-button>
        <el-button v-if="add_rules_data.type == 1" type="primary" @click="addFixedRules">保 存</el-button>
        <el-button v-if="add_rules_data.type == 2" type="primary" @click="addAbnormalRules">保 存</el-button>
        <el-button v-if="add_rules_data.type == 3" type="primary" @click="addSpecialRules">保 存</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script type="text/javascript">
  var base64 = require('base-64')
  export default {
    name: 'chargingAdd',

    data(){
      return {
        add_rules_data: {
          name: '',
          type : '',
          options: [
            { value: '0', label: '按时收费' },
            { value: '1', label: '固定收费' },
            { value: '2', label: '异常车辆收费' },
            { value: '3', label: '特殊车辆不收费' }
          ],
          max24: '',
          max12: '',
          desc: '',
          firstmoney: null,
          interval: '',
          interval_price: ''
        },
        addFixedRulesData: {
          ruleName: '',
          name: '',
          time: '',
          money: '',
          times: []
        },
        dialogVisible: true,
        addAbnormalRulesData: {
          price: ''
        },
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.addTimes()
    },
    methods: {
       //添加包期时间
      addTimes(){
        for(var i = 1; i <= 12; i++){
          this.addFixedRulesData.times.push({
            label: i + '个月',
            value: i
          })
        }
      },

      cancel(){
        this.$emit('cancel')
      },

      //固定车辆收费规则
      addFixedRules(){
        const that = this;
        var params = {
          name : encodeURI(that.addFixedRulesData.name),
          fee: that.addFixedRulesData.money,
          duration: that.addFixedRulesData.time,
          description: encodeURI(that.add_rules_data.desc)
        }
        if(parseInt(that.addFixedRulesData.money) < 0){
          this.$message({type: 'warning', message: '包期金额不能为负数'})
          return
        }

        for(var i in params){
          if(params[i] == ''){
            this.$message({type: 'warning', message: '请填写完整'})
            return
          }
        }

        this.$jquery.post(that.$request, {
          action: 'charge_rules_add',
          admin_id: that.admin_id,
          data: base64.encode(JSON.stringify(params)),
          ruleType: that.add_rules_data.type,
        }, res => {
          const response = res;
          if(response.error_code == '0'){
            this.$message({
              type: 'success',
              message: '添加成功'
            })
            this.cancel()
          } else {
            this.$message({
              type: 'error',
              message: '失败原因：'+response.msg
            })
          }
        }, 'json')
      },

      //添加按时收费规则
      addChargingRules(){
        var that = this;

        var addHoursRules = {
          "name": encodeURI(that.add_rules_data.name),
          "price":that.add_rules_data.interval_price,
          "upLimitFee24": that.add_rules_data.max24,
          "upLimitFee12": that.add_rules_data.max12,
          "firstDuration": that.add_rules_data.firstDuration,
          firstmoney: that.add_rules_data.firstmoney,
          "interval": that.add_rules_data.interval,
          "description": encodeURI(that.add_rules_data.desc)
        }


        for(var i in addHoursRules){
          if(parseInt(addHoursRules[i]) < 0){
            this.$message({type: 'warning', message: '请填写正整数'})
            return
          }
          if(addHoursRules.description == 'description'){
            break
          }
          if(addHoursRules[i] == ''){
            this.$message({type: 'warning', message: '请填写完整'})
            return
          }
        }

        this.add_rules_dialog_show = true;
        this.$jquery.post(that.$request, {
          action: 'charge_rules_add',
          admin_id: that.admin_id,
          ruleType: that.add_rules_data.type,
          data: base64.encode(JSON.stringify(addHoursRules))
        }, res => {
          if( res.error_code == '0'){
            this.$message({
              type: 'success',
              message: '添加收费规则成功'
            })
            this.cancel()
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },

      //添加异常收费规则
      addAbnormalRules(){
        if(this.addAbnormalRulesData.price == ''){
          this.$message({type:'warning', message:'请填写完整'})
          return
        }
        if(parseInt(this.addAbnormalRulesData.price) < 0){
          this.$message({type:'warning', message:'异常收费金额不能为负数'})
          return
        }

        var addAbnormalRulesData = {
          price: this.addAbnormalRulesData.price,
          description: encodeURI(this.add_rules_data.desc)
        }


        this.$jquery.post(this.$request, {
          action: 'charge_rules_add',
          ruleType: this.add_rules_data.type,
          admin_id: this.admin_id,
          data: base64.encode(JSON.stringify(addAbnormalRulesData))
        }, res => {
          if( res.error_code == '0' ) {
            this.$message({ type: 'success', message: '添加成功' })
            this.cancel()
          } else {
            this.$message({ type: 'error', message: '失败原因：'+res.msg })
          }
        }, 'json')
      },

      //添加特殊车辆收费规则
      addSpecialRules(){
        let _this = this;
        var addSpecialRulesData = {
          description: encodeURI(this.add_rules_data.desc)
        };
        var data =  base64.encode(JSON.stringify(addSpecialRulesData))

        this.$jquery.post(_this.$request, {
          action: 'charge_rules_add',
          ruleType: this.add_rules_data.type,
          admin_id: this.admin_id,
          data:data
        }, res => {
          if( res.error_code == '0' ) {
            this.$message({
              type: 'success',
              message: '添加成功'
            })
             this.cancel()
          } else {
            this.$message({
              type: 'error',
              message: '失败原因：'+res.msg
            })
          }
        }, 'json')
      },
    }
  }
</script>
