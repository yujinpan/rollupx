<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

/**
 * 组件
 * @class
 */
@Component({
  // 利于 IDE 自动提示
  name: 'HelloWorld'
})
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  /**
   * 构造函数
   * @param {string} str
   */
  constructor(str: any) {
    super(str);
  }

  /**
   * 测试
   */
  test() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '~module1/test.scss';
@import '~@/styles/common-variables.scss';
@import '~element-ui/lib/theme-chalk/index.css';

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
