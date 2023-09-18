import Vue from 'vue';

export class Test {
  constructor(protected readonly a) {}
  render() {
    return <div></div>;
  }
  test(): Vue.Ref {}
}
