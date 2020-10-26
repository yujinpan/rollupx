<template>
  <div class="app your-component-padding-medium your-component-text-center">
    <h2>your-component</h2>
    <p class="your-component-text-secondary">
      author: your-name - version: v{{ version }}
    </p>
    <el-divider></el-divider>
    <el-row class="your-component-text-left" type="flex">
      <el-col :span="12">
        <Highlight :code="code" lang="xml" />
      </el-col>
      <el-col class="your-component-text-left" :span="12">
        <div class="your-component-flex-center-align">
          <label>Function 1:</label>
          <HelloWorld />
        </div>
        <el-divider></el-divider>
        <el-link
          type="primary"
          href="https://github.com/your-name/your-component#attributes"
          >https://github.com/your-name/your-component</el-link
        >
      </el-col>
    </el-row>
  </div>
</template>

<script>
import HelloWorld from '@/index.ts';
import '@/element-ui.ts';

const version = require('../package').version;

export default {
  components: {
    HelloWorld
  },
  data() {
    return {
      version,
      code: require('./template/example1').default
    };
  }
};
</script>

<style lang="scss" scoped>
@import './styles/common-variables';

.app {
  .el-col {
    padding: $spacing-medium;
    border-right: $--border-base;
    &:last-of-type {
      border-right: 0;
    }
  }
}
</style>
