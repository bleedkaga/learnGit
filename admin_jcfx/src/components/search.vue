<template lang="html">
  <div class="panel_search" id="search">
    <el-input :placeholder="placeholder" v-model="input">
      <el-button slot="append" icon="search" v-on:click="search"></el-button>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'search',
  props: ['placeholder'],
  data(){
    return {
      input: '',
      counter: 0
    }
  },
  methods: {
    search(){
      var val = this.input
      this.$emit('search', val)
    }
  }
}
</script>

<style lang="css">
.panel_search{
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  background: white;
  margin-bottom: 10px;
}
</style>
