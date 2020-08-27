// 主组件
import HelloWorld from '@/components/HelloWorld.vue';
import './styles/index.scss';
import { VueConstructor } from 'vue';

// @ts-ignore
HelloWorld.install = (vue: VueConstructor) => {
  vue.component('HelloWorld', HelloWorld);
};

// Vue.component()
export default HelloWorld;
