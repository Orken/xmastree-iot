import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sliders } from './picker/sliders';
import * as socketIo from 'socket.io-client';
import { distinctUntilChanged, distinctUntilKeyChanged, map } from 'rxjs/internal/operators';


const SERVER_URL = 'ws://192.168.10.21:81';

@Injectable({
  providedIn: 'root'
})
export class SliderService {

  private _sliders$ = new BehaviorSubject<Sliders>(new Sliders());
  readonly sliders$ = this._sliders$.asObservable();
  private _color$ = new BehaviorSubject<string>('background-color: rgb(128,128,128)');
  readonly color$ = this._color$.asObservable();

  readonly r$ = this._sliders$.pipe(
    map(slider => slider.R),
    distinctUntilChanged()
  );
  readonly g$ = this._sliders$.pipe(
    map(slider => slider.G),
    distinctUntilChanged()
  );
  readonly b$ = this._sliders$.pipe(
    map(slider => slider.B),
    distinctUntilChanged()
  );
  private socket;

  constructor() {
    this.socket = new WebSocket(SERVER_URL);
    this.socket.onopen = (event) => {
      console.log('open');
    };
    this.socket.onerror = function (event) {
      console.log('error');
      this.socket.send('#FF0000');
    };
  }


  setX(x, channel) {
    const slider = <Sliders>{
      ...this._sliders$.getValue(),
      [channel]: x
    };
    this._sliders$.next(<Sliders>slider);
    const hexa = this.hexa(slider);
    this._color$.next(hexa);
    this.socket.send(hexa);
  }

  private hexa(slider: Sliders): string {
    return `#${this.int2hex(slider.R)}${this.int2hex(slider.G)}${this.int2hex(slider.B)}`;
  }


  private int2hex(number: number): string {
    let s = number.toString(16);
    if (s.length === 1) {
      s = `0${s}`;
    }
    return s;
  }


}
