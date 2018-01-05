<template>
  <div class="renewal">
    <el-dialog title="固定车辆续费" :visible="visible" size="tiny" :show-close="false">
      <div class="create_invoice">
        <el-row :gutter="30">
          <el-col>
            <div class="form_group">
              <p>车牌号码</p>
              <p v-text="carNumber">&nbsp;</p>
            </div>
            <div class="form_group">
              <p>包期类型</p>
              <el-select v-model="type" placeholder="请选择包期类型" :disabled="parking == ''" v-loading="rulesLoading">
                <el-option v-for="item in rules" :label="item.name" :key="item.ruleId" :value="item.ruleId"></el-option>
              </el-select>
            </div>
            <div class="form_group">
              <p>包期时长</p>
              <!-- <el-select readonly v-model="duration" placeholder="请选择包期时长" :disabled="parking == ''" v-loading="rulesLoading">
                <el-option v-for="item in rules":label="item.duration" :key="item.ruleId" :value="item.ruleId" ></el-option>
              </el-select> -->
              <el-input readonly v-model="duration" placeholder="请输入包期金额" :disabled="parking == ''" v-loading="rulesLoading"></el-input>
            </div>
            <div class="form_group">
              <p>包期金额</p>
              <el-input readonly v-model="fee" placeholder="请输入包期金额" :disabled="parking == ''" v-loading="rulesLoading"></el-input>
            </div>
          </el-col>

        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" :loading="save"  @click="payFee">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  const base64 = require('base-64');
  export default {
    name: 'renewal',
    props: ['visible', 'carNumber', 'parking', 'fixedCarId'],
    data(){
      return {
        type: '',
        rules: [],
        duration: '',
        save: false,
        fee: '',
        rulesLoading: false,
      }
    },
    mounted(){
      console.log(this.$props)
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getFixedRules(this.$props.parking)
    },
    methods: {
      cancel(){
        this.$emit('hideRenewalFee')
      },
      payFee(){
        const that = this;
        this.save = true;
        var tid = this.$props.fixedCarId, data = {
          "type": that.type,
          "fee": that.fee,
          "duration": that.duration
        };
        console.log(JSON.stringify( data))
        data = base64.encode(JSON.stringify( data))

        this.$jquery.post(that.$request, {
          action: 'whitelist_charge_add',
          admin_id: that.admin_id,
          tid: tid,
          data: data
        }, res => {
          if(res.error_code == '0'){
            this.$message({ type: 'success', message: '缴费成功'})
          } else {
            this.$message({ type: 'error', message: res.msg})
          }
          this.save = false;
          this.cancel()
        }, 'json')
      },
      getFixedRules(id){
        const that = this;
        this.rulesLoading = true;
        that.$jquery.post(that.$request, {
          action: 'parkinglot_white_rule',
          admin_id: that.admin_id,
          pid: id
        }, res => {
          console.log('rules', res)
          if( res.error_code == '0'){
            this.rules = res.data;
            this.type = res.data[0].ruleId
            this.fee = res.data[0].fee
            this.duration = res.data[0].duration
          } else {
            this.$message({ type: 'error', message: res.msg })
          }

          if(res.data.length == 0){
            this.parking = ''
          }
          that.rulesLoading = false;

        }, 'json')
      }
    },

  }
</script>
