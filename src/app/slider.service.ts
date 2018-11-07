import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Sliders} from './picker/sliders';

@Injectable({
  providedIn: 'root'
})
export class SliderService {

  private _sliders$ = new BehaviorSubject<Sliders>(new Sliders());
  readonly sliders$ = this._sliders$.asObservable();
  private _color$ = new BehaviorSubject<string>('background-color: rgb(128,128,128)');
  readonly color$ = this._color$.asObservable();

  constructor() {
  }

  setX(x, channel) {
    const slider = this._sliders$.getValue();
    this._sliders$.next({
      ...slider,
      [channel]: x
    });
    this._color$.next('rgb(' + slider.R + ', ' + slider.G + ', ' + slider.B + ')');
  }

}
