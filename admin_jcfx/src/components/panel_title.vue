<template lang="html">
  <h1 class="panel_title">{{title}}</h1>
</template>

<script>
export default {
  name: 'title',
  props: ['title'],
  mounted(){

  }
}
</script>

<style lang="scss" scoped>
.panel_title{
  text-align: left;
  background: white;
  margin: 10px;
  margin-top: 30px;
  margin-left: 0px;
  padding: 20px 10px;
  font-size: 20px;
  border: 1px solid #ddd;
  font-family: 'Microsoft Yahei', Arial;
}
</style>
