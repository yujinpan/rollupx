<template>
  <div>Test</div>
</template>

<script lang="tsx">
export default {
  name: 'DeepClass',
  render() {
    return <div>test-tsx</div>;
  },
};
</script>

<style lang="scss">
:deep(.test) {
  background-color: #fff;
}
</style>
