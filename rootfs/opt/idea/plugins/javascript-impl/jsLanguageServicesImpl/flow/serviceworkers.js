/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type ForeignFetchOptions = {
  scopes: Iterator<string>,
  origins: Iterator<string>,
};

declare class InstallEvent extends ExtendableEvent {
  registerForeignFetch(options: ForeignFetchOptions): void,
}

type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';

declare class NavigationPreloadState {
  enabled: boolean,
  headerValue: string,
}

declare class NavigationPreloadManager {
  enable: Promise<void>,
  disable: Promise<void>,
  setHeaderValue(value: string): Promise<void>,
  getState: Promise<NavigationPreloadState>,
}

declare class ServiceWorkerMessageEvent {
  data: any,
  lastEventId :string,
  origin: string,
  ports: Array<MessagePort>,
  source: ?(ServiceWorker | MessagePort),
}

// Service worker global scope
// https://www.w3.org/TR/service-workers/#service-worker-global-scope
declare var clients: Clients;

declare var registration: ServiceWorkerRegistration;
declare function skipWaiting(): Promise<void>;
declare var onactivate: ?EventHandler;
declare var oninstall: ?EventHandler;
declare var onfetch: ?EventHandler;
declare var onforeignfetch: ?EventHandler;

