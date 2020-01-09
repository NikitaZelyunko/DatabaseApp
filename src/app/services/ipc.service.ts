import { Injectable, NgZone } from '@angular/core';

import { IpcRenderer } from 'electron';
import { Observable, of } from 'rxjs';

@Injectable()
export class IpcService {
  private _ipc: IpcRenderer | undefined = void 0;

  constructor(
    private zone: NgZone
  ) {
    if (window.require) {
      try {
        this._ipc = window.require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
  }

  public on(channel: string) {
    if (!this._ipc) {
      return of(null as {event: Electron.IpcRendererEvent, args: any[]});
    }
    return new Observable<{ event: Electron.IpcRendererEvent, args: any[] }>((observer) => {
      const listener = (event, ...args) => {
        console.log(event, args);
        // WTF
        this.zone.run(() => {
          observer.next({ event, args });
        })
      };
      this._ipc.on(channel, listener);
      return {
        unsubscribe: () => {
          this._ipc.removeListener(channel, listener);
        }
      };
    });
  }

  public send(channel: string, ...args): void {
    if (!this._ipc) {
      return;
    }
    this._ipc.send(channel, ...args);
  }
}
