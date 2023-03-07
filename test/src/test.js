import './test.scss';
import 'test/src/test1.css';
import 'element-ui/lib/theme-chalk/index.css';
import jpg from './test.jpg';
import json from './test.json';
import png from './test.png';

/**
 * 测试
 * @param {string} [name]
 * @return {string}
 */
function test(name) {
  alert(123);
  if (name) return jpg;
  // eslint-disable-next-line no-console
  console.log(json);
  return png;
}

test();
