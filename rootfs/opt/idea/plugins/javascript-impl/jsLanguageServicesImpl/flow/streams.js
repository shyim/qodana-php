/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type TextEncodeOptions = {options?: boolean};

declare class ReadableStreamBYOBRequest {
  constructor(controller: ReadableStreamController, view: $TypedArray): void,

  view: $TypedArray,

  respond(bytesWritten: number): ?any,
  respondWithNewView(view: $TypedArray): ?any,
}

declare class ReadableByteStreamController extends ReadableStreamController {
  constructor(
    stream: ReadableStream,
    underlyingSource: UnderlyingSource,
    highWaterMark: number,
  ): void,

  byobRequest: ReadableStreamBYOBRequest,
}

type PipeToOptions = {
  preventClose?: boolean,
  preventAbort?: boolean,
  preventCancel?: boolean,
};

declare interface WritableStreamController {
  error(error: Error): void,
}

declare interface WritableStreamWriter {
  closed: Promise<any>,
  desiredSize?: number,
  ready: Promise<any>,

  abort(reason: string): ?Promise<any>,
  close(): Promise<any>,
  releaseLock(): void,
  write(chunk: any): Promise<any>,
}

