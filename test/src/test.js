import './test.scss';
import 'test/src/test1.css';
import 'element-ui/lib/theme-chalk/index.css';
import png from './test.png';
import jpg from './test.jpg';

function test(name) {
  alert(123);
  if (name) return jpg;
  return png;
}

test();
