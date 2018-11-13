import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs/index';
import { debounceTime, map, takeUntil, tap, throttleTime } from 'rxjs/internal/operators';
import { SliderService } from '../slider.service';
import { Sliders, hsl, hexa } from './sliders';

class Coord {
  X: number;
  Y: number;
}

@Component({
  selector: 'app-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss']
})
export class PickerComponent implements OnInit, AfterViewInit, OnDestroy {

  private destroy$ = new Subject<void>();

  sliders$: Observable<Sliders> = this.sliderService.sliders$;
  h$: Observable<number> = this.sliderService.h$;
  s$: Observable<number> = this.sliderService.s$;
  v$: Observable<number> = this.sliderService.v$;
  socket$: Observable<string> = this.sliderService.socket$;

  @ViewChild('sliders') sliders: ElementRef;
  @ViewChild('color') color: ElementRef;
  @ViewChild('s_slider') s_slider: ElementRef;
  @ViewChild('v_slider') v_slider: ElementRef;
  @ViewChild('h') h: ElementRef;
  @ViewChild('s') s: ElementRef;
  @ViewChild('v') v: ElementRef;

  constructor(public sliderService: SliderService) {
  }

  ngOnInit() {
  }


  ngAfterViewInit() {
    this.socket$
    // .pipe(throttleTime(300))
      .subscribe((data) => {
      });
    this.sliders$.pipe(
      tap(x => {
        this.color.nativeElement.style.backgroundColor = hsl(x);
        const s_start = hsl(<Sliders>{
          ...x,
          S: 0
        });
        const v_start = hsl(<Sliders>{
          ...x,
          V: 0
        });
        const s_end = hsl(<Sliders>{
          ...x,
          S: 1
        });
        const v_end = hsl(<Sliders>{
          ...x,
          V: 1
        });
        /* this.s_slider.nativeElement.style.background = `linear-gradient(to right, ${s_start} 0%, ${s_end} 100%)`;
        this.v_slider.nativeElement.style.background = `linear-gradient(to right, ${v_start} 0%, ${v_end} 100%)`; */
      })
    ).subscribe();
    this.h$.subscribe(h => {
      const x = Math.sin(h / 180 * Math.PI);
      const y = Math.cos(h / 180 * Math.PI);
      this.h.nativeElement.style.left = (50 + 40 * x) + '%';
      this.h.nativeElement.style.top = (50 - 40 * y) + '%';
    });

    this.s$.subscribe(v => {
      const x = Math.sin(v  * Math.PI);
      const y = Math.cos(v * Math.PI);
      this.s.nativeElement.style.left = (50 + 40 * x) + '%';
      this.s.nativeElement.style.top = (50 - 40 * y) + '%';
    });
    this.v$.subscribe(v => {
      const x = Math.sin(v  * Math.PI);
      const y = Math.cos(v  * Math.PI);
      this.v.nativeElement.style.left = (50 - 80 * x) + '%';
      this.v.nativeElement.style.top = (50 + 80 * y) + '%';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setColorByTouch(event: TouchEvent, channel: string): void {
    this.setColor(
      event,
      'touchmove',
      'touchend',
      (e: TouchEvent) => {
        return { X: e.touches[0].clientX, Y: e.touches[0].clientY };
      },
      channel
    );
  }

  setColorByMouse(event: MouseEvent, channel: string): void {
    this.setColor(
      event,
      'mousemove',
      'mouseup',
      (e: MouseEvent) => {
        return { X: e.clientX, Y: e.clientY };
      },
      channel
    );
  }

  private setColor(event: Event,
                   moveEventName: string,
                   upEventName: string,
                   getXY: (e: Event) => Coord,
                   channel: string): void {
    const mouseMove = fromEvent(event.target, moveEventName);
    const mouseUp = fromEvent(document, upEventName);
    const { left: offsetX, top: offsetY, width, height } = this.sliders.nativeElement.getBoundingClientRect();
    const coord = getXY(event);
    const center = { X: offsetX + width / 2, Y: offsetY + height / 2 };
    const currentX = ( 2 * (coord.X - center.X) / width);
    const currentY = ( 2 * (coord.Y - center.Y) / height);
    const angle = (Math.PI - Math.atan2(currentX, currentY)) * 180 / Math.PI;

    this.sliderService.setAngle(angle, channel);

    mouseMove.pipe(
      takeUntil(mouseUp),
      takeUntil(this.destroy$),
      map(getXY),
      map(xy => {
          const _currentX = ( 2 * (xy.X - center.X) / width);
          const _currentY = ( 2 * (xy.Y - center.Y) / height);
          const _angle = (Math.PI - Math.atan2(_currentX, _currentY)) * 180 / Math.PI;
          return _angle;
        }
      ),
      // map(x => Math.min(1, Math.max(0, x))),
      tap(xy => this.sliderService.setAngle(xy, channel))
    ).subscribe();

  }


}
