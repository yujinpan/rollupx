# your-component

your-component description

## Usage

### Install

```
npm install --save your-component
```

### Require element-ui

If your project does not use element-ui,
you need to introduce a separate element-ui package, like this:

```js
import 'your-component/lib/element-ui';
```

### Global registration

```js
import Vue from 'vue';
import Component from 'your-component';

Vue.use(Component);
```

### In-component registration

```js
import Component from 'your-component';

export default {
  components: {
    Component
  }
};
```

### Complete example

```xml
<template>
  <div></div>
</template>

<script>
export default {};
</script>
```
