/**
 * 按需加载 element-ui 组件
 * @description
 * [参考官网 - 按需加载](https://element.eleme.cn/#/zh-CN/component/quickstart#an-xu-yin-ru)
 */
import Vue from 'vue';
import { Button, Message, Loading } from 'element-ui';

Vue.use(Button);
Vue.use(Loading.directive);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$message = Message;
