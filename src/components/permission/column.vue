<template>
  <div class="role_column">
    <div class="device">
      <div class="head">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{title}}</el-checkbox>
      </div>
      <div class="body">
        <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
          <el-checkbox :label="val"   v-for="val in cities" :key="val.menuNo"></el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>
<script>
  var cityOptions = [];
  export default {
    props: ['title', 'menu','index'],
    data() {
      return {
        checkAll: true,
        checkedCities: ['上海', '北京'],
        cities: cityOptions,
        isIndeterminate: true
      };
    },
    mounted(){
      const that = this;
      var index = this.$props.index;
      var obj = this.$props.menu;

      obj.forEach( r => {
        console.log(r.menuName)
        cityOptions.push(r.menuName)
      })
      console.log(this.cities)
       cityOptions = this.cities;
    },
    methods: {
      handleCheckAllChange(event) {
        this.checkedCities = event.target.checked ? cityOptions : [];
        this.isIndeterminate = false;
      },
      handleCheckedCitiesChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.cities.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length;
      }
    }
  };
</script>
