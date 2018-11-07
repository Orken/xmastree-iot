import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs/index';
import {map, takeUntil, tap} from 'rxjs/internal/operators';
import {SliderService} from '../slider.service';
import {Sliders} from './sliders';

@Component({
  selector: 'app-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss']
})
export class PickerComponent implements OnInit, AfterViewInit, OnDestroy {

  private destroy$ = new Subject<void>();

  sliders$: Observable<Sliders> = this.sliderService.sliders$;
  colorsliders$: Observable<string> = this.sliderService.color$;

  @ViewChild('sliders') sliders: ElementRef;
  @ViewChild('colorsliders') colorsliders: ElementRef;

  constructor(public sliderService: SliderService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.colorsliders$.pipe(
      tap((x) => {
        this.colorsliders.nativeElement.style.backgroundColor = x;
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setColorByTouch(event: TouchEvent, channel: string): void {
    this.setColor(event, 'touchmove', 'touchend', (e: TouchEvent) => e.touches[0].clientX, channel);
  }

  setColorByMouse(event: MouseEvent, channel: string): void {
    this.setColor(event, 'mousemove', 'mouseup', (e: MouseEvent) => e.clientX, channel);
  }

  private setColor(event: Event, moveEventName: string, upEventName: string, getX: (e: Event) => number, channel: string): void {
    console.log(event);
    const mouseMove = fromEvent(event.target, moveEventName);
    const mouseUp = fromEvent(document, upEventName);
    const {left: offsetX, width} = this.sliders.nativeElement.getBoundingClientRect();

    mouseMove.pipe(
      takeUntil(mouseUp),
      takeUntil(this.destroy$),
      map(getX),
      map(x => (Math.round(255 * (x - offsetX) / width))),
      map(x => Math.min(255, Math.max(0, x))),
      tap(x => this.sliderService.setX(x, channel))
    ).subscribe();

  }

}
