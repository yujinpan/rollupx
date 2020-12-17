/*!
 * your-component v1.1.0
 * (c) 2019-2020 your-name
 * Released under the MIT License.
 */

import HelloWorld from './components/HelloWorld.vue';
import './styles/index.scss';

// 主组件

// @ts-ignore
HelloWorld.install = function (vue) {
  vue.component('HelloWorld', HelloWorld);
}; // Vue.component()

export default HelloWorld;
