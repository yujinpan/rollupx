import fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import typescript, {
  CompilerOptions,
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript';

import type { Options } from './config';

import { getFiles, pickVueScript, transformToRelativePath } from './utils';

export async function build(options: Options) {
  const { inputDir, outputDir, inputFiles, excludeFiles, typesGlobal } =
    options;

  const tsConfig = options.tsConfig || defaultTsConfig();

  let typesOutputDir = path.resolve(options.typesOutputDir);
  if (typesOutputDir === process.cwd()) {
    typesOutputDir = outputDir;
  }

  if (typesOutputDir !== outputDir) {
    fs.rmSync(typesOutputDir, { recursive: true, force: true });
    fs.mkdirSync(typesOutputDir);
  }

  const compilerOptions: CompilerOptions = {
    ...tsConfig.compilerOptions,
    strict: false,
    declaration: true,
    emitDeclarationOnly: true,
    declarationDir: typesOutputDir,
    paths: options.aliasConfig,
  };

  const files = getFiles(inputFiles, inputDir, /\.(ts|tsx|vue)$/, [
    ...excludeFiles,
    '**/*.d.ts',
  ]).map((file) => {
    let content = fs.readFileSync(file).toString();
    if (file.endsWith('.vue')) {
      content = pickVueScript(content);
    }
    content = transformToRelativePath(
      content,
      file,
      options.aliasConfig,
      options.extensions,
      false,
    );

    const temp = file
      .replace(/\.(ts|vue)$/, '.temp.ts')
      .replace(/\.tsx$/, '.temp.tsx');
    fs.writeFileSync(temp, content);

    return temp;
  });

  const host = typescript.createCompilerHost(compilerOptions);
  host.writeFile = async (fileName, text) => {
    const outputFileName = fileName.replace(/\.temp\.d\.(ts|tsx)$/, '.d.ts');
    await makeDir(path.dirname(outputFileName));
    fs.writeFileSync(outputFileName, text);
  };
  const program = typescript.createProgram(files, compilerOptions, host);

  program.emit();

  files.forEach((item) => fs.rmSync(item, { force: true }));
}

function defaultTsConfig(): { compilerOptions: CompilerOptions } {
  return {
    compilerOptions: {
      target: ScriptTarget.ESNext,
      module: ModuleKind.ESNext,
      jsx: JsxEmit.Preserve,
      moduleResolution: ModuleResolutionKind.NodeJs,
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      allowJs: true,
    },
  };
}
