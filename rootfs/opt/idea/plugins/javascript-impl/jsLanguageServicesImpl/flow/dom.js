/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type EventHandler = (event: Event) => mixed
type MouseEventHandler = (event: MouseEvent) => mixed
type MouseEventListener = {handleEvent: MouseEventHandler} | MouseEventHandler
type FocusEventHandler = (event: FocusEvent) => mixed
type FocusEventListener = {handleEvent: FocusEventHandler} | FocusEventHandler
type KeyboardEventHandler = (event: KeyboardEvent) => mixed
type KeyboardEventListener = {handleEvent: KeyboardEventHandler} | KeyboardEventHandler
type TouchEventHandler = (event: TouchEvent) => mixed
type TouchEventListener = {handleEvent: TouchEventHandler} | TouchEventHandler
type WheelEventHandler = (event: WheelEvent) => mixed
type WheelEventListener = {handleEvent: WheelEventHandler} | WheelEventHandler
type AbortProgressEventHandler = (event: ProgressEvent) => mixed
type AbortProgressEventListener = {handleEvent: AbortProgressEventHandler} | AbortProgressEventHandler
type ProgressEventHandler = (event: ProgressEvent) => mixed
type ProgressEventListener = {handleEvent: ProgressEventHandler} | ProgressEventHandler
type DragEventHandler = (event: DragEvent) => mixed
type DragEventListener = {handleEvent: DragEventHandler} | DragEventHandler
type PointerEventHandler = (event: PointerEvent) => mixed
type PointerEventListener = {handleEvent: PointerEventHandler} | PointerEventHandler
type AnimationEventHandler = (event: AnimationEvent) => mixed
type AnimationEventListener = {handleEvent: AnimationEventHandler} | AnimationEventHandler
type ClipboardEventHandler = (event: ClipboardEvent) => mixed
type ClipboardEventListener = {handleEvent: ClipboardEventHandler} | ClipboardEventHandler

type MouseEventTypes = 'contextmenu' | 'mousedown' | 'mouseenter' | 'mouseleave' | 'mousemove' | 'mouseout' | 'mouseover' | 'mouseup' | 'click' | 'dblclick';
type FocusEventTypes = 'blur' | 'focus' | 'focusin' | 'focusout';
type KeyboardEventTypes = 'keydown' | 'keyup' | 'keypress';
type TouchEventTypes = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';
type WheelEventTypes = 'wheel';
type AbortProgressEventTypes = 'abort';
type ProgressEventTypes = 'abort' | 'error' | 'load' | 'loadend' | 'loadstart' | 'progress' | 'timeout';
type DragEventTypes = 'drag' | 'dragend' | 'dragenter' | 'dragexit' | 'dragleave' | 'dragover' | 'dragstart' | 'drop';
type PointerEventTypes = 'pointerover' | 'pointerenter' | 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'pointerout' | 'pointerleave' | 'gotpointercapture' | 'lostpointercapture';
type AnimationEventTypes = 'animationstart' | 'animationend' | 'animationiteration';
type ClipboardEventTypes = 'clipboardchange' | 'cut' | 'copy' | 'paste';

type EventListenerOptionsOrUseCapture = boolean | {
  capture?: boolean,
  once?: boolean,
  passive?: boolean
};

type Event$Init = {
  bubbles?: boolean,
  cancelable?: boolean,
  composed?: boolean,
  scoped?: boolean
}

type CustomEvent$Init = Event$Init & {
  detail?: any;
}

type MouseEvent$MouseEventInit = {
  screenX?: number,
  screenY?: number,
  clientX?: number,
  clientY?: number,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  altKey?: boolean,
  metaKey?: boolean,
  button?: number,
  buttons?: number,
  region?: string | null,
  relatedTarget?: string | null,
};

type PointerEvent$PointerEventInit = MouseEvent$MouseEventInit & {
  pointerId?: number;
  width?: number;
  height?: number;
  pressure?: number;
  tangentialPressure?: number;
  tiltX?: number;
  tiltY?: number;
  twist?: number;
  pointerType?: string;
  isPrimary?: boolean;
};

// https://w3c.github.io/clipboard-apis/ as of 15 May 2018
type ClipboardEvent$Init = Event$Init & {
  clipboardData: DataTransfer | null;
};

// from https://www.w3.org/TR/custom-elements/#extensions-to-document-interface-to-register
type ElementRegistrationOptions = {
  +prototype?: {
    // from https://www.w3.org/TR/custom-elements/#types-of-callbacks
    +createdCallback?: () => mixed;
    +attachedCallback?: () => mixed;
    +detachedCallback?: () => mixed;
    +attributeChangedCallback?:
    // attribute is set
    ((
      attributeLocalName: string,
      oldAttributeValue: null,
      newAttributeValue: string,
      attributeNamespace: string
    ) => mixed) &
    // attribute is changed
    ((
      attributeLocalName: string,
      oldAttributeValue: string,
      newAttributeValue: string,
      attributeNamespace: string
    ) => mixed) &
    // attribute is removed
    ((
      attributeLocalName: string,
      oldAttributeValue: string,
      newAttributeValue: null,
      attributeNamespace: string
    ) => mixed);
  };
  +extends?: string;
}


declare class HitRegionOptions {
  path?: Path2D,
  fillRule?: CanvasFillRule,
  id?: string,
  parentID?: string;
  cursor?: string;
  control?: Element;
  label: ?string;
  role: ?string;
};

declare class CanvasDrawingStyles {
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  miterLimit: number;

  // dashed lines
  setLineDash(segments: Array<number>): void;
  getLineDash(): Array<number>;
  lineDashOffset: number;

  // text
  font: string;
  textAlign: string;
  textBaseline: string;
  direction: string;
};

;

;

;

;


interface WebGLObject {
};

type BufferDataSource = ArrayBuffer | $ArrayBufferView;

type VertexAttribFVSource =
  Float32Array |
  Array<number>;

declare class AudioTrack {
  id: string;
  kind: string;
  label: string;
  language: string;
  enabled: boolean;
}

declare class AudioTrackList extends EventTarget {
  length: number;
  [index: number]: AudioTrack;

  getTrackById(id: string): ?AudioTrack;

  onchange: (ev: any) => any;
  onaddtrack: (ev: any) => any;
  onremovetrack: (ev: any) => any;
}

declare class VideoTrack {
  id: string;
  kind: string;
  label: string;
  language: string;
  selected: boolean;
}

declare class VideoTrackList extends EventTarget {
  length: number;
  [index: number]: VideoTrack;
  getTrackById(id: string): ?VideoTrack;
  selectedIndex: number;

  onchange: (ev: any) => any;
  onaddtrack: (ev: any) => any;
  onremovetrack: (ev: any) => any;
}

// http://www.w3.org/TR/html5/forms.html#dom-textarea/input-setselectionrange
type SelectionDirection = 'backward' | 'forward' | 'none';

declare class HTMLAppletElement extends HTMLElement {}

declare class TextRange {
  boundingLeft: number;
  htmlText: string;
  offsetLeft: number;
  boundingWidth: number;
  boundingHeight: number;
  boundingTop: number;
  text: string;
  offsetTop: number;
  moveToPoint(x: number, y: number): void;
  queryCommandValue(cmdID: string): any;
  getBookmark(): string;
  move(unit: string, count?: number): number;
  queryCommandIndeterm(cmdID: string): boolean;
  scrollIntoView(fStart?: boolean): void;
  findText(string: string, count?: number, flags?: number): boolean;
  execCommand(cmdID: string, showUI?: boolean, value?: any): boolean;
  getBoundingClientRect(): ClientRect | DOMRect;
  moveToBookmark(bookmark: string): boolean;
  isEqual(range: TextRange): boolean;
  duplicate(): TextRange;
  collapse(start?: boolean): void;
  queryCommandText(cmdID: string): string;
  select(): void;
  pasteHTML(html: string): void;
  inRange(range: TextRange): boolean;
  moveEnd(unit: string, count?: number): number;
  getClientRects(): ClientRectList | DOMRectList;
  moveStart(unit: string, count?: number): number;
  parentElement(): Element;
  queryCommandState(cmdID: string): boolean;
  compareEndPoints(how: string, sourceRange: TextRange): number;
  execCommandShowHelp(cmdID: string): boolean;
  moveToElementText(element: Element): void;
  expand(Unit: string): boolean;
  queryCommandSupported(cmdID: string): boolean;
  setEndPoint(how: string, SourceRange: TextRange): void;
  queryCommandEnabled(cmdID: string): boolean;
}

declare class ClientRectList { // extension
  @@iterator(): Iterator<ClientRect>;
  length: number;
  item(index: number): ClientRect;
  [index: number]: ClientRect;
}

declare class TrackDefaultList {
  [index: number]: TrackDefault;
  length: number;
}

declare class TrackDefault {
  type: "audio" | "video" | "text";
  byteStreamTrackID: string;
  language: string;
  label: string;
  kinds: Array<string>;
}

// TODO: The use of `typeof` makes this function signature effectively
// (node: Node) => number, but it should be (node: Node) => 1|2|3
type NodeFilterCallback = (node: Node) =>
typeof NodeFilter.FILTER_ACCEPT |
typeof NodeFilter.FILTER_REJECT |
typeof NodeFilter.FILTER_SKIP;

type NodeFilterInterface = NodeFilterCallback | { acceptNode: NodeFilterCallback }

declare opaque type AnimationFrameID;
declare opaque type IdleCallbackID;

