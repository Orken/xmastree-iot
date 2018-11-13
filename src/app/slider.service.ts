import {Injectable} from '@angular/core';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {Sliders, hexa, Socket} from './picker/sliders';
import * as socketIo from 'socket.io-client';
import {auditTime, debounceTime, distinctUntilChanged, distinctUntilKeyChanged, map, throttleTime} from 'rxjs/internal/operators';
import {WebSocketSubject} from 'rxjs/internal/observable/dom/WebSocketSubject';


const SERVER_URL = 'ws://echo.websocket.org';

@Injectable({
  providedIn: 'root'
})
export class SliderService {

  private _sliders$ = new BehaviorSubject<Sliders>(new Sliders());
  readonly sliders$ = this._sliders$.asObservable();

  readonly h$ = this._sliders$.pipe(
    map(slider => slider.H),
    distinctUntilChanged()
  );
  readonly s$ = this._sliders$.pipe(
    map(slider => slider.S),
    distinctUntilChanged()
  );
  readonly v$ = this._sliders$.pipe(
    map(slider => slider.V),
    distinctUntilChanged()
  );
  private _socket$ = new WebSocketSubject<string>({
    url: SERVER_URL,
    serializer: (msg: string) => msg
  });
  readonly socket$ = this._socket$
    .asObservable();

  constructor() {
    // this.socket = new WebSocket(SERVER_URL);
    // this._socket$ = WebSocketSubject.create(SERVER_URL);
    this.sliders$
      .pipe(
        auditTime(250)
      )
      .subscribe(
        (data) => {
          console.log(data);
          const slider = (data as Sliders);
          if (slider.H) {
            this._socket$.next(JSON.stringify(slider));
          }
        }
      );
  }

  public sendMessage(text: string) {
  }

  setX(x, channel) {
    const slider = <Sliders>{
      ...this._sliders$.getValue(),
      [channel]: x
    };
    this._sliders$.next(<Sliders>slider);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }


}
