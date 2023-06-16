/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type GamepadPose = {
  angularAcceleration: null | Float32Array;
  angularVelocity: null | Float32Array;
  hasOrientation: boolean;
  hasPosition: boolean;
  linearAcceleration: null | Float32Array;
  linearVelocity: null | Float32Array;
  orientation: null | Float32Array;
  position: null | Float32Array;
}

type BatteryManager = {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    onchargingchange: ?Function;
    onchargingtimechange: ?Function;
    ondischargingtimechange: ?Function;
    onlevelchange: ?Function;
}

declare class NavigatorCommon {
    appName: 'Netscape';
    appVersion: string;
    platform: string;
    userAgent: string;
    language: string;
    languages: Array<string>;
    onLine: boolean;
    hardwareConcurrency: number;
}


type PerformanceEntryFilterOptions = {
    name: string;
    entryType: string;
    initiatorType: string;
}


type MutationObserverInitRequired =
    | { childList: true }
    | { attributes: true }
    | { characterData: true }

declare type IntersectionObserverOptions = {
    root?: Node | null,
    rootMargin?: string,
    threshold?: number | Array<number>,
};


declare class XDomainRequest {
    timeout: number;
    onerror: (ev: Event) => any;
    onload: (ev: Event) => any;
    onprogress: (ev: Event) => any;
    ontimeout: (ev: Event) => any;
    responseText: string;
    contentType: string;
    open(method: string, url: string): void;
    abort(): void;
    send(data?: any): void;
    addEventListener(type: string, listener: (evt: any) => void, useCapture?: boolean): void;

    statics: {
        create(): XDomainRequest;
    }
}


declare class Position {
    coords: Coordinates;
    timestamp: number;
}

declare class Coordinates {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
}

declare class PositionError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
}

declare class CanvasCaptureMediaStream extends MediaStream {
  canvas: HTMLCanvasElement;
  requestFrame(): void;
}


type CacheType =  'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
type CredentialsType = 'omit' | 'same-origin' | 'include';
type ModeType = 'cors' | 'no-cors' | 'same-origin';
type RedirectType = 'follow' | 'error' | 'manual';
type ReferrerPolicyType =
    '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'same-origin' |
    'origin' | 'strict-origin' | 'origin-when-cross-origin' |
    'strict-origin-when-cross-origin' | 'unsafe-url';

type RequestOptions = {
    body?: ?BodyInit;

    cache?: CacheType;
    credentials?: CredentialsType;
    headers?: HeadersInit;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: ModeType;
    redirect?: RedirectType;
    referrer?: string;
    referrerPolicy?: ReferrerPolicyType;
    signal?: ?AbortSignal;
    window?: any;
}

type ResponseOptions = {
    status?: number;
    statusText?: string;
    headers?: HeadersInit
}


type TextEncoder$availableEncodings = 'utf-8' | 'utf8' | 'unicode-1-1-utf-8' | 'utf-16be' | 'utf-16' | 'utf-16le';

type TextDecoder$availableEncodings =
  | '866'
  | 'ansi_x3.4-1968'
  | 'arabic'
  | 'ascii'
  | 'asmo-708'
  | 'big5-hkscs'
  | 'big5'
  | 'chinese'
  | 'cn-big5'
  | 'cp1250'
  | 'cp1251'
  | 'cp1252'
  | 'cp1253'
  | 'cp1254'
  | 'cp1255'
  | 'cp1256'
  | 'cp1257'
  | 'cp1258'
  | 'cp819'
  | 'cp866'
  | 'csbig5'
  | 'cseuckr'
  | 'cseucpkdfmtjapanese'
  | 'csgb2312'
  | 'csibm866'
  | 'csiso2022jp'
  | 'csiso2022kr'
  | 'csiso58gb231280'
  | 'csiso88596e'
  | 'csiso88596i'
  | 'csiso88598e'
  | 'csiso88598i'
  | 'csisolatin1'
  | 'csisolatin2'
  | 'csisolatin3'
  | 'csisolatin4'
  | 'csisolatin5'
  | 'csisolatin6'
  | 'csisolatin9'
  | 'csisolatinarabic'
  | 'csisolatincyrillic'
  | 'csisolatingreek'
  | 'csisolatinhebrew'
  | 'cskoi8r'
  | 'csksc56011987'
  | 'csmacintosh'
  | 'csshiftjis'
  | 'cyrillic'
  | 'dos-874'
  | 'ecma-114'
  | 'ecma-118'
  | 'elot_928'
  | 'euc-jp'
  | 'euc-kr'
  | 'gb_2312-80'
  | 'gb_2312'
  | 'gb18030'
  | 'gb2312'
  | 'gbk'
  | 'greek'
  | 'greek8'
  | 'hebrew'
  | 'hz-gb-2312'
  | 'ibm819'
  | 'ibm866'
  | 'iso_8859-1:1987'
  | 'iso_8859-1'
  | 'iso_8859-2:1987'
  | 'iso_8859-2'
  | 'iso_8859-3:1988'
  | 'iso_8859-3'
  | 'iso_8859-4:1988'
  | 'iso_8859-4'
  | 'iso_8859-5:1988'
  | 'iso_8859-5'
  | 'iso_8859-6:1987'
  | 'iso_8859-6'
  | 'iso_8859-7:1987'
  | 'iso_8859-7'
  | 'iso_8859-8:1988'
  | 'iso_8859-8'
  | 'iso_8859-9:1989'
  | 'iso_8859-9'
  | 'iso-2022-cn-ext'
  | 'iso-2022-cn'
  | 'iso-2022-jp'
  | 'iso-2022-kr'
  | 'iso-8859-1'
  | 'iso-8859-10'
  | 'iso-8859-11'
  | 'iso-8859-13'
  | 'iso-8859-14'
  | 'iso-8859-15'
  | 'iso-8859-16'
  | 'iso-8859-2'
  | 'iso-8859-3'
  | 'iso-8859-4'
  | 'iso-8859-5'
  | 'iso-8859-6-e'
  | 'iso-8859-6-i'
  | 'iso-8859-6'
  | 'iso-8859-7'
  | 'iso-8859-8-e'
  | 'iso-8859-8-i'
  | 'iso-8859-8'
  | 'iso-8859-9'
  | 'iso-ir-100'
  | 'iso-ir-101'
  | 'iso-ir-109'
  | 'iso-ir-110'
  | 'iso-ir-126'
  | 'iso-ir-127'
  | 'iso-ir-138'
  | 'iso-ir-144'
  | 'iso-ir-148'
  | 'iso-ir-149'
  | 'iso-ir-157'
  | 'iso-ir-58'
  | 'iso8859-1'
  | 'iso8859-10'
  | 'iso8859-11'
  | 'iso8859-13'
  | 'iso8859-14'
  | 'iso8859-15'
  | 'iso8859-2'
  | 'iso8859-3'
  | 'iso8859-4'
  | 'iso8859-6'
  | 'iso8859-7'
  | 'iso8859-8'
  | 'iso8859-9'
  | 'iso88591'
  | 'iso885910'
  | 'iso885911'
  | 'iso885913'
  | 'iso885914'
  | 'iso885915'
  | 'iso88592'
  | 'iso88593'
  | 'iso88594'
  | 'iso88595'
  | 'iso88596'
  | 'iso88597'
  | 'iso88598'
  | 'iso88599'
  | 'koi'
  | 'koi8_r'
  | 'koi8-r'
  | 'koi8-u'
  | 'koi8'
  | 'korean'
  | 'ks_c_5601-1987'
  | 'ks_c_5601-1989'
  | 'ksc_5601'
  | 'ksc5601'
  | 'l1'
  | 'l2'
  | 'l3'
  | 'l4'
  | 'l5'
  | 'l6'
  | 'l9'
  | 'latin1'
  | 'latin2'
  | 'latin3'
  | 'latin4'
  | 'latin5'
  | 'latin6'
  | 'latin9'
  | 'logical'
  | 'mac'
  | 'macintosh'
  | 'ms_kanji'
  | 'shift_jis'
  | 'shift-jis'
  | 'sjis'
  | 'sun_eu_greek'
  | 'tis-620'
  | 'unicode-1-1-utf-8'
  | 'us-ascii'
  | 'utf-16'
  | 'utf-16be'
  | 'utf-16le'
  | 'utf-8'
  | 'utf8'
  | 'visual'
  | 'windows-1250'
  | 'windows-1251'
  | 'windows-1252'
  | 'windows-1253'
  | 'windows-1254'
  | 'windows-1255'
  | 'windows-1256'
  | 'windows-1257'
  | 'windows-1258'
  | 'windows-31j'
  | 'windows-874'
  | 'windows-949'
  | 'x-cp1250'
  | 'x-cp1251'
  | 'x-cp1252'
  | 'x-cp1253'
  | 'x-cp1254'
  | 'x-cp1255'
  | 'x-cp1256'
  | 'x-cp1257'
  | 'x-cp1258'
  | 'x-euc-jp'
  | 'x-gbk'
  | 'x-mac-cyrillic'
  | 'x-mac-roman'
  | 'x-mac-ukrainian'
  | 'x-sjis'
  | 'x-user-defined'
  | 'x-x-big5';


declare class VRDisplay extends EventTarget {
  capabilities: VRDisplayCapabilities;
  depthFar: number;
  depthNear: number;
  displayId: number;
  displayName: string;
  isPresenting: boolean;
  stageParameters: null | VRStageParameters;

  cancelAnimationFrame(number): void;
  exitPresent(): Promise<void>;
  getEyeParameters(VREye): VREyeParameters;
  getFrameData(VRFrameData): boolean;
  getLayers(): VRLayerInit[];
  requestAnimationFrame(cb: (number) => mixed): number;
  requestPresent(VRLayerInit[]): Promise<void>;
  submitFrame(): void;
}

type VRSource = HTMLCanvasElement;

type VRLayerInit = {
  leftBounds?: number[];
  rightBounds?: number[];
  source?: null | VRSource;
};

type VRDisplayCapabilities = {
  canPresent: boolean;
  hasExternalDisplay: boolean;
  hasPosition: boolean;
  maxLayers: number;
};

type VREye = 'left' | 'right';

type VRPose = {
  angularAcceleration?: Float32Array;
  angularVelocity?: Float32Array;
  linearAcceleration?: Float32Array;
  linearVelocity?: Float32Array;
  orientation?: Float32Array;
  position?: Float32Array;
};

declare class VRFrameData {
  leftProjectionMatrix: Float32Array;
  leftViewMatrix: Float32Array;
  pose: VRPose;
  rightProjectionMatrix: Float32Array;
  rightViewMatrix: Float32Array;
  timestamp: number;
}

type VREyeParameters = {
  offset: Float32Array;
  renderWidth: number;
  renderHeight: number;
};

type VRStageParameters = {
  sittingToStandingTransform: Float32Array;
  sizeX: number;
  sizeZ: number;
};

type VRDisplayEventReason = 'mounted' | 'navigation' | 'requested' | 'unmounted';

type VRDisplayEventInit = {
  display: VRDisplay;
  reason: VRDisplayEventReason;
};

declare class VRDisplayEvent extends Event {
  display: VRDisplay;
  reason?: VRDisplayEventReason;

  constructor(type: string, eventInitDict: VRDisplayEventInit): VRDisplayEvent;
}

declare type MediaQueryListListener = MediaQueryListEvent => void;


