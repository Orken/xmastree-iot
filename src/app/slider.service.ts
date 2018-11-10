import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sliders, hexa } from './picker/sliders';
import * as socketIo from 'socket.io-client';
import { distinctUntilChanged, distinctUntilKeyChanged, map } from 'rxjs/internal/operators';


const SERVER_URL = 'ws://192.168.10.21:81';

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
    this.socket.send(hexa(slider));
  }


}
