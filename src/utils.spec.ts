import path from 'path';

import { normalizeFilePath, readFileTempExt } from './utils';

describe('utils', () => {
  it('should normalizeFilePath', () => {
    const base = path.resolve(process.cwd(), './src');
    const extensions = ['.ts'];

    expect(normalizeFilePath('./utils', extensions, base)).toBe('./utils.ts');
    expect(normalizeFilePath('./src', extensions, process.cwd())).toBe(
      './src/index.ts',
    );
  });

  it('should readFileTempExt', () => {
    expect(readFileTempExt('[dir][name][ext]')).toBe('.js');
    expect(readFileTempExt('[dir][name].js')).toBe('.js');
    expect(readFileTempExt('[dir][name].cjs')).toBe('.cjs');
    expect(readFileTempExt('[dir][name].cjs.js')).toBe('.cjs.js');
  });
});
