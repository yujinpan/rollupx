// 主组件
import '@/class';
import '@/components';
import HelloWorld from '@/components/HelloWorld.vue';

import '@/styles/index.scss';
import '@/plugins/index.css';
import el from 'el-select-tree';
import Vue from 'vue';

alert(el);

// @ts-ignore
HelloWorld.install = (vue: Vue) => {
  vue.component('HelloWorld', HelloWorld);
};

export const test = 1;

// Vue.component()
export default HelloWorld;
