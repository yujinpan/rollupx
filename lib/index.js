/*!
 * your-component v1.0.0
 * (c) 2019-2020 your-name
 * Released under the MIT License.
 */

import require$$0 from 'core-js/library/fn/object/define-property';
import require$$0$1 from 'core-js/library/fn/symbol/iterator';
import require$$0$2 from 'core-js/library/fn/symbol';
import require$$0$3 from 'core-js/library/fn/object/get-prototype-of';
import require$$0$4 from 'core-js/library/fn/object/set-prototype-of';
import require$$0$5 from 'core-js/library/fn/object/create';
import require$$0$6 from 'core-js/library/fn/object/keys';
import { Prop, Component, Vue } from 'vue-property-decorator';

var defineProperty = require$$0;

function _initializerDefineProperty(target, property, descriptor, context) {
  if (!descriptor) return;
  defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var iterator = require$$0$1;

var symbol = require$$0$2;

function _typeof(obj) {
  if (typeof symbol === "function" && typeof iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof symbol === "function" && obj.constructor === symbol && obj !== symbol.prototype ? "symbol" : typeof obj;
    };
  }
  return _typeof(obj);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }
  return _assertThisInitialized(self);
}

var getPrototypeOf = require$$0$3;

var setPrototypeOf = require$$0$4;

function _getPrototypeOf(o) {
  _getPrototypeOf = setPrototypeOf ? getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

var create = require$$0$5;

function _setPrototypeOf(o, p) {
  _setPrototypeOf = setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

var keys = require$$0$6;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }
  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }
  if (desc.initializer === void 0) {
    defineProperty(target, property, desc);
    desc = null;
  }
  return desc;
}

var _dec, _class, _class2, _descriptor, _temp;
var HelloWorld = (_dec = Prop(), Component(_class = (_class2 = (_temp =
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
}(Vue), _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "msg", [_dec], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;
  if (!css || typeof document === 'undefined') { return; }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = "h3[data-v-a375dee2]{margin:40px 0 0}ul[data-v-a375dee2]{list-style-type:none;padding:0}li[data-v-a375dee2]{display:inline-block;margin:0 10px}a[data-v-a375dee2]{color:#42b983}";
styleInject(css);

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  }
  var options = typeof script === 'function' ? script.options : script;
  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true;
    if (isFunctionalTemplate) {
      options.functional = true;
    }
  }
  if (scopeId) {
    options._scopeId = scopeId;
  }
  var hook;
  if (moduleIdentifier) {
    hook = function hook(context) {
      context = context ||
      this.$vnode && this.$vnode.ssrContext ||
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext;
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      }
      if (style) {
        style.call(this, createInjectorSSR(context));
      }
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    };
    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function (context) {
      style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }
  if (hook) {
    if (options.functional) {
      var originalRender = options.render;
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }
  return script;
}
var normalizeComponent_1 = normalizeComponent;

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

var __vue_scope_id__ = "data-v-a375dee2";
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = normalizeComponent_1({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

var css$1 = "[class*=\" your-component-\"],[class^=your-component-]{-webkit-box-sizing:border-box;box-sizing:border-box}.your-component-flex-1,.your-component-flex-spacer,.your-component-overflow-hidden{overflow:hidden}.your-component-background-full{background:0 0/100% 100% no-repeat}.your-component-full{width:100%;height:100%}.your-component-full-width{width:100%}.your-component-full-height{height:100%}.your-component-text-left{text-align:left!important}.your-component-text-center{text-align:center!important}.your-component-text-right{text-align:right!important}.your-component-text-ellipsis{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.your-component-text-secondary{color:#909399}.your-component-list-unstyled{list-style-type:none;padding-left:0}.your-component-scrollbar-default::-webkit-scrollbar-track-piece{background:#d3dce6}.your-component-scrollbar-default::-webkit-scrollbar{width:4px;height:4px}.your-component-scrollbar-default::-webkit-scrollbar-thumb{background:#99a9bf}.your-component-flex,.your-component-flex-center,.your-component-flex-center-align,.your-component-flex-center-justify,.your-component-flex-column,.your-component-flex-end,.your-component-flex-end-align,.your-component-flex-end-justify,.your-component-flex-space-between,.your-component-flex-wrap{display:-webkit-box;display:-ms-flexbox;display:flex}.your-component-flex-end,.your-component-flex-end-justify{-webkit-box-align:end;-ms-flex-align:end;align-items:flex-end;-ms-flex-line-pack:end;align-content:flex-end}.your-component-flex-end,.your-component-flex-end-align{-webkit-box-pack:end;-ms-flex-pack:end;justify-content:flex-end;justify-items:flex-end}.your-component-flex-center,.your-component-flex-center-align,.your-component-flex-end,.your-component-flex-end-align{-webkit-box-align:center;-ms-flex-align:center;align-items:center}.your-component-flex-center,.your-component-flex-center-justify,.your-component-flex-end,.your-component-flex-end-justify{-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.your-component-flex-space-between{-webkit-box-align:center;-ms-flex-align:center;align-items:center;-ms-flex-line-pack:center;align-content:center;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between}.your-component-flex-wrap{-ms-flex-wrap:wrap;flex-wrap:wrap}.your-component-flex-column{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column}.your-component-flex-1,.your-component-flex-spacer{-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1}.your-component-flex-none{-webkit-box-flex:0;-ms-flex:none;flex:none}.your-component-box-shadow-default{-webkit-box-shadow:0 2px 12px 0 rgba(0,0,0,.1);box-shadow:0 2px 12px 0 rgba(0,0,0,.1)}.your-component-box-shadow-base{-webkit-box-shadow:0 2px 4px rgba(0,0,0,.12),0 0 6px rgba(0,0,0,.04);box-shadow:0 2px 4px rgba(0,0,0,.12),0 0 6px rgba(0,0,0,.04)}.your-component-transition-default{-webkit-transition:all .3s;transition:all .3s}.your-component-margin-none{margin:0}.your-component-margin-base{margin:8px}.your-component-margin-medium{margin:16px}.your-component-margin-large{margin:24px}.your-component-margin-top-none{margin-top:0}.your-component-margin-top-base{margin-top:8px}.your-component-margin-top-medium{margin-top:16px}.your-component-margin-top-large{margin-top:24px}.your-component-margin-right-none{margin-right:0}.your-component-margin-right-base{margin-right:8px}.your-component-margin-right-medium{margin-right:16px}.your-component-margin-right-large{margin-right:24px}.your-component-margin-bottom-none{margin-bottom:0}.your-component-margin-bottom-base{margin-bottom:8px}.your-component-margin-bottom-medium{margin-bottom:16px}.your-component-margin-bottom-large{margin-bottom:24px}.your-component-margin-left-none{margin-left:0}.your-component-margin-left-base{margin-left:8px}.your-component-margin-left-medium{margin-left:16px}.your-component-margin-left-large{margin-left:24px}.your-component-padding-none{padding:0}.your-component-padding-base{padding:8px}.your-component-padding-medium{padding:16px}.your-component-padding-large{padding:24px}.your-component-padding-top-none{padding-top:0}.your-component-padding-top-base{padding-top:8px}.your-component-padding-top-medium{padding-top:16px}.your-component-padding-top-large{padding-top:24px}.your-component-padding-right-none{padding-right:0}.your-component-padding-right-base{padding-right:8px}.your-component-padding-right-medium{padding-right:16px}.your-component-padding-right-large{padding-right:24px}.your-component-padding-bottom-none{padding-bottom:0}.your-component-padding-bottom-base{padding-bottom:8px}.your-component-padding-bottom-medium{padding-bottom:16px}.your-component-padding-bottom-large{padding-bottom:24px}.your-component-padding-left-none{padding-left:0}.your-component-padding-left-base{padding-left:8px}.your-component-padding-left-medium{padding-left:16px}.your-component-padding-left-large{padding-left:24px}";
styleInject(css$1);

// 主组件

// @ts-ignore
__vue_component__.install = function (vue) {
  vue.component('HelloWorld', __vue_component__);
}; // Vue.component()

export default __vue_component__;
//# sourceMappingURL=index.js.map
