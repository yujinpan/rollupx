/*!
 * your-component v1.1.0
 * (c) 2019-2020 your-name
 * Released under the MIT License.
 */

import _initializerDefineProperty from '@babel/runtime-corejs2/helpers/esm/initializerDefineProperty';
import _classCallCheck from '@babel/runtime-corejs2/helpers/esm/classCallCheck';
import _possibleConstructorReturn from '@babel/runtime-corejs2/helpers/esm/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime-corejs2/helpers/esm/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime-corejs2/helpers/esm/assertThisInitialized';
import _inherits from '@babel/runtime-corejs2/helpers/esm/inherits';
import '@babel/runtime-corejs2/helpers/esm/defineProperty';
import _applyDecoratedDescriptor from '@babel/runtime-corejs2/helpers/esm/applyDecoratedDescriptor';
import '@babel/runtime-corejs2/helpers/esm/initializerWarningHelper';
import { Component, Prop, Vue } from 'vue-property-decorator';
import styleInject from 'style-inject/dist/style-inject.es.js';
import __vue_normalize__ from 'vue-runtime-helpers/dist/normalize-component.js';

var _dec, _dec2, _class, _class2, _descriptor, _temp;
var HelloWorld = (_dec = Component({
  // 利于 IDE 自动提示
  name: 'HelloWorld'
}), _dec2 = Prop(), _dec(_class = (_class2 = (_temp =
/*#__PURE__*/
function (_Vue) {
  _inherits(HelloWorld, _Vue);

  function HelloWorld() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, HelloWorld);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(HelloWorld)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _initializerDefineProperty(_assertThisInitialized(_this), "msg", _descriptor, _assertThisInitialized(_this));

    return _this;
  }

  return HelloWorld;
}(Vue), _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "msg", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

var css_248z = "h3[data-v-096012e6]{margin:40px 0 0}ul[data-v-096012e6]{list-style-type:none;padding:0}li[data-v-096012e6]{display:inline-block;margin:0 10px}a[data-v-096012e6]{color:#42b983}";
styleInject(css_248z);

/* script */
var __vue_script__ = HelloWorld;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "hello"
  }, [_c('h1', [_vm._v(_vm._s(_vm.msg))])]);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = "data-v-096012e6";
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ =
/*#__PURE__*/
__vue_normalize__({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

export default __vue_component__;
