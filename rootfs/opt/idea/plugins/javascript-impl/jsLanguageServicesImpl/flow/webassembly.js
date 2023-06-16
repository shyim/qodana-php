type ImportExportKind = 'function' | 'table' | 'memory' | 'global';
type ImportObject = Object;
type ResultObject = { module: WebAssembly$Module, instance: WebAssembly$Instance };

// https://github.com/WebAssembly/design/blob/master/JS.md#exported-function-exotic-objects
declare class ExportedFunctionExoticObject extends Function {
  (): mixed;
}

declare class WebAssembly$Module {
  constructor(bufferSource: BufferSource): void;

  static exports(moduleObject: WebAssembly$Module): Array<{ name: string, kind: ImportExportKind }>;
  static imports(moduleObject: WebAssembly$Module): Array<{ name: string, name: string, kind: ImportExportKind }>;
  static customSections(moduleObject: WebAssembly$Module, sectionName: string): Array<ArrayBuffer>;
}

declare class WebAssembly$Instance {
  constructor(moduleObject: WebAssembly$Module, importObject?: ImportObject): void;

  +exports: { [exportedFunction: string]: ExportedFunctionExoticObject };
}

type MemoryDescriptor = { initial: number, maximum?: number };

declare class WebAssembly$Memory {
  constructor(memoryDescriptor: MemoryDescriptor): void;

  +buffer: ArrayBuffer;

  grow(delta: number): number;
}

type TableDescriptor = { element: 'anyfunc', initial: number, maximum?: number };

declare class WebAssembly$Table {
  constructor(tableDescriptor: TableDescriptor): void;

  +length: number;

  grow(delta: number): number;
  get(index: number): ExportedFunctionExoticObject;
  set(index: number, value: ExportedFunctionExoticObject): void;
}

declare class WebAssembly$CompileError extends Error {}
declare class WebAssembly$LinkError extends Error {}
declare class WebAssembly$RuntimeError extends Error {}

declare function WebAssembly$instantiate(bufferSource: BufferSource, importObject?: ImportObject): Promise<ResultObject>;
declare function WebAssembly$instantiate(moduleObject: WebAssembly$Module, importObject?: ImportObject): Promise<WebAssembly$Instance>;


