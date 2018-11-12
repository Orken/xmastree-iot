import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs/index';
import { map, takeUntil, tap } from 'rxjs/internal/operators';
import { SliderService } from '../slider.service';
import { Sliders, hsl, hexa } from './sliders';

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
  @ViewChild('colorsliders') colorsliders: ElementRef;
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
    this.socket$.subscribe((data) => {
      console.log(data);
    });
    this.sliders$.pipe(
      tap(x => {
        this.colorsliders.nativeElement.style.backgroundColor = hsl(x);
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
        this.s_slider.nativeElement.style.background = `linear-gradient(to right, ${s_start} 0%, ${s_end} 100%)`;
        this.v_slider.nativeElement.style.background = `linear-gradient(to right, ${v_start} 0%, ${v_end} 100%)`;
      })
    ).subscribe();
    this.h$.subscribe(h => this.h.nativeElement.style.left = (100 * h) + '%');
    this.s$.subscribe(s => this.s.nativeElement.style.left = (100 * s) + '%');
    this.v$.subscribe(v => this.v.nativeElement.style.left = (100 * v) + '%');
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
    const mouseMove = fromEvent(event.target, moveEventName);
    const mouseUp = fromEvent(document, upEventName);
    const { left: offsetX, width } = this.sliders.nativeElement.getBoundingClientRect();
    const currentX = ( (getX(event) - offsetX) / width);
    this.sliderService.setX(currentX, channel);

    mouseMove.pipe(
      takeUntil(mouseUp),
      takeUntil(this.destroy$),
      map(getX),
      map(x => ((x - offsetX) / width)),
      map(x => Math.min(1, Math.max(0, x))),
      tap(x => this.sliderService.setX(x, channel))
    ).subscribe();

  }


}
