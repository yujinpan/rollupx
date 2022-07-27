// 主组件
import '@/components/Test.vue';
import HelloWorld from '@/components/HelloWorld.vue';
import '@/styles/index.scss';
import el from 'el-select-tree';
import Vue from 'vue';
alert(el);

// @ts-ignore
HelloWorld.install = (vue: Vue) => {
  vue.component('HelloWorld', HelloWorld);
};

// Vue.component()
export default HelloWorld;
