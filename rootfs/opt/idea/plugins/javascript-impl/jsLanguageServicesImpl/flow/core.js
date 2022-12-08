/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare var undefined: void;

// Well known Symbols.
declare class $SymbolHasInstance mixins Symbol {}
declare class $SymboIsConcatSpreadable mixins Symbol {}
declare class $SymbolIterator mixins Symbol {}
declare class $SymbolMatch mixins Symbol {}
declare class $SymbolReplace mixins Symbol {}
declare class $SymbolSearch mixins Symbol {}
declare class $SymbolSpecies mixins Symbol {}
declare class $SymbolSplit mixins Symbol {}
declare class $SymbolToPrimitive mixins Symbol {}
declare class $SymbolToStringTag mixins Symbol {}
declare class $SymbolUnscopables mixins Symbol {}


/* All the Array.prototype methods and properties that don't mutate the array.
 */
declare class $ReadOnlyArray<+T> {
    @@iterator(): Iterator<T>;
    toLocaleString(): string;
    // concat creates a new array
    concat<S, Item: $ReadOnlyArray<S> | S>(...items: Array<Item>): Array<T | S>;
    entries(): Iterator<[number, T]>;
    every(callbackfn: (value: T, index: number, array: $ReadOnlyArray<T>) => any, thisArg?: any): boolean;
    filter(callbackfn: typeof Boolean): Array<$NonMaybeType<T>>;
    filter(callbackfn: (value: T, index: number, array: $ReadOnlyArray<T>) => any, thisArg?: any): Array<T>;
    find(callbackfn: (value: T, index: number, array: $ReadOnlyArray<T>) => any, thisArg?: any): T | void;
    findIndex(callbackfn: (value: T, index: number, array: $ReadOnlyArray<T>) => any, thisArg?: any): number;
    forEach(callbackfn: (value: T, index: number, array: $ReadOnlyArray<T>) => any, thisArg?: any): void;
    includes(searchElement: mixed, fromIndex?: number): boolean;
    indexOf(searchElement: mixed, fromIndex?: number): number;
    join(separator?: string): string;
    keys(): Iterator<number>;
    lastIndexOf(searchElement: mixed, fromIndex?: number): number;
    map<U>(callbackfn: (value: T, index: number, array: $ReadOnlyArray<T>) => U, thisArg?: any): Array<U>;

    reduce(
      callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: $ReadOnlyArray<T>) => T,
      initialValue: void
    ): T;
    reduce<U>(
      callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: $ReadOnlyArray<T>) => U,
      initialValue: U
    ): U;
    reduceRight(
      callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: $ReadOnlyArray<T>) => T,
      initialValue: void
    ): T;
    reduceRight<U>(
      callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: $ReadOnlyArray<T>) => U,
      initialValue: U
    ): U;
    slice(start?: number, end?: number): Array<T>;
    some(callbackfn: (value: T, index: number, array: $ReadOnlyArray<T>) => any, thisArg?: any): boolean;
    values(): Iterator<T>;
    +[key: number]: T;
    +length: number;
}

type RegExp$flags = $CharSet<"gimsuy">;
type RegExp$matchResult = Array<string> & {index: number, input: string, groups: ?{[name: string]: string}};

declare class CallSite {
    getThis(): any;
    getTypeName(): string;
    getFunction(): ?Function;
    getFunctionName(): string;
    getMethodName(): string;
    getFileName(): ?string;
    getLineNumber(): ?number;
    getColumnNumber(): ?number;
    getEvalOrigin(): ?CallSite;
    getScriptNameOrSourceURL(): ?string;
    isToplevel(): bool;
    isEval(): bool;
    isNative(): bool;
    isConstructor(): bool;
    toString(): string;
}

interface $Iterator<+Yield,+Return,-Next> {
    @@iterator(): $Iterator<Yield,Return,Next>;
    next(value?: Next): IteratorResult<Yield,Return>;
}

interface $Iterable<+Yield,+Return,-Next> {
    @@iterator(): $Iterator<Yield,Return,Next>;
}

declare function $iterate<T>(p: Iterable<T>): T;

/* Async Iterable/Iterator/Generator */

interface $AsyncIterator<+Yield,+Return,-Next> {
    @@asyncIterator(): $AsyncIterator<Yield,Return,Next>;
    next(value?: Next): Promise<IteratorResult<Yield,Return>>;
}

interface $AsyncIterable<+Yield,+Return,-Next> {
    @@asyncIterator(): $AsyncIterator<Yield,Return,Next>;
}

declare function $asyncIterator<T>(p: AsyncIterable<T>): T;

/* Maps and Sets */

declare class $ReadOnlyMap<K, V> {
    @@iterator(): Iterator<[K, V]>;
    entries(): Iterator<[K, V]>;
    forEach(callbackfn: (value: V, index: K, map: $ReadOnlyMap<K, V>) => mixed, thisArg?: any): void;
    get(key: K): V | void;
    has(key: K): boolean;
    keys(): Iterator<K>;
    size: number;
    values(): Iterator<V>;
}

declare class $ReadOnlyWeakMap<K: {}, V> {
    get(key: K): V | void;
    has(key: K): boolean;
}

declare class $ReadOnlySet<T> {
    @@iterator(): Iterator<T>;
    entries(): Iterator<[T, T]>;
    forEach(callbackfn: (value: T, index: T, set: $ReadOnlySet<T>) => mixed, thisArg?: any): void;
    has(value: T): boolean;
    keys(): Iterator<T>;
    size: number;
    values(): Iterator<T>;
}

declare class $ReadOnlyWeakSet<T: Object> {
    has(value: T): boolean;
}

// we use this signature when typing await expressions
declare function $await<T>(p: Promise<T> | T): T;

// This is a helper type to simplify the specification, it isn't an interface
// and there are no objects implementing it.
// https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
type $ArrayBufferView = $TypedArray | DataView;

// The TypedArray intrinsic object is a constructor function, but does not have
// a global name or appear as a property of the global object.
// http://www.ecma-international.org/ecma-262/6.0/#sec-%typedarray%-intrinsic-object
declare class $TypedArray {
    static BYTES_PER_ELEMENT: number;
    static from(iterable: Iterable<number>, mapFn?: (element: number) => number, thisArg?: any): this;
    static of(...values: number[]): this;

    constructor(length: number): void;
    constructor(typedArray: $TypedArray): void;
    constructor(iterable: Iterable<number>): void;
    constructor(buffer: ArrayBuffer, byteOffset?: number, length?: number): void;

    [index: number]: number;

    @@iterator(): Iterator<number>;

    buffer: ArrayBuffer;
    byteLength: number;
    byteOffset: number;
    length: number;

    copyWithin(target: number, start: number, end?: number): void;
    entries(): Iterator<[number, number]>;
    every(callback: (value: number, index: number, array: this) => mixed, thisArg?: any): boolean;
    fill(value: number, start?: number, end?: number): this;
    filter(callback: (value: number, index: number, array: this) => mixed, thisArg?: any): this;
    find(callback: (value: number, index: number, array: this) => mixed, thisArg?: any): number | void;
    findIndex(callback: (value: number, index: number, array: this) => mixed, thisArg?: any): number;
    forEach(callback: (value: number, index: number, array: this) => mixed, thisArg?: any): void;
    includes(searchElement: number, fromIndex?: number): boolean;
    indexOf(searchElement: number, fromIndex?: number): number; // -1 if not present
    join(separator?: string): string;
    keys(): Iterator<number>;
    lastIndexOf(searchElement: number, fromIndex?: number): number; // -1 if not present
    map(callback: (currentValue: number, index: number, array: this) => number, thisArg?: any): this;
    reduce(
      callback: (previousValue: number, currentValue: number, index: number, array: this) => number,
      initialValue: void
    ): number;
    reduce<U>(
      callback: (previousValue: U, currentValue: number, index: number, array: this) => U,
      initialValue: U
    ): U;
    reduceRight(
      callback: (previousValue: number, currentValue: number, index: number, array: this) => number,
      initialValue: void
    ): number;
    reduceRight<U>(
      callback: (previousValue: U, currentValue: number, index: number, array: this) => U,
      initialValue: U
    ): U;
    reverse(): this;
    set(array: Array<number> | $TypedArray, offset?: number): void;
    slice(begin?: number, end?: number): this;
    some(callback: (value: number, index: number, array: this) => mixed, thisArg?: any): boolean;
    sort(compare?: (a: number, b: number) => number): void;
    subarray(begin?: number, end?: number): this;
    values(): Iterator<number>;
}

declare opaque type TimeoutID;
declare opaque type IntervalID;


/* Proxy */

type Proxy$traps<T> = {
  getPrototypeOf?: (target: T) => Object|null;
  setPrototypeOf?: (target: T, prototype: Object|null) => boolean;
  isExtensible?: (target: T) => boolean;
  preventExtensions?: (target: T) => boolean;
  getOwnPropertyDescriptor?: <T>(target: T, property: string) => void | PropertyDescriptor<T>;
  defineProperty?: <T>(target: T, property: string, descriptor: PropertyDescriptor<T>) => boolean;
  has?: (target: T, key: string) => boolean;
  get?: (target: T, property: string, receiver: Proxy<T>) => any;
  set?: (target: T, property: string, value: any, receiver: Proxy<T>) => boolean;
  deleteProperty?: (target: T, property: string) => boolean;
  ownKeys?: (target: T) => Array<string>;
  apply?: (target: T, context: any, args: Array<any>) => any;
  construct?: (target: T, args: Array<any>, newTarget: Function) => Object;
};

type Proxy$revocable<T> = T & {
  revoke(): void;
};

/* CommonJS */

declare var global: any;

declare var module: {
    exports: any;
    require(id: string): any;
    id: string;
    filename: string;
    loaded: boolean;
    parent: any;
    children: Array<any>;
};
declare var require: {
  (id: string): any;
  resolve: (id: string) => string;
  cache: any;
  main: typeof module;
};
declare var exports: any;

/* Opaque type for module reference magic strings */
declare opaque type $Flow$ModuleRef<T>;


