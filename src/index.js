// 主组件
import HelloWorld from '@/components/HelloWorld';
import './styles/index.scss';

// Vue.use()
HelloWorld.install = (Vue) => {
  Vue.component('HelloWorld', HelloWorld);
};

// Vue.component()
export default HelloWorld;
