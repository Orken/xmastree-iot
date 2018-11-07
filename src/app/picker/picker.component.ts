import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, merge } from 'rxjs/index';
import { log } from 'util';
import { mergeMap, takeUntil, tap } from 'rxjs/internal/operators';

@Component({
  selector: 'app-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss']
})
export class PickerComponent implements OnInit, AfterViewInit {

  r = 128;
  g = 128;
  b = 128;
  @ViewChild('sliders') sliders: ElementRef;
  @ViewChild('color') color: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const mouseDown = fromEvent(this.sliders.nativeElement, 'touchstart');
    const mouseMove = fromEvent(this.sliders.nativeElement, 'touchmove');
    const mouseUp = fromEvent(document, 'touchend');
    const listenMoveUntilUp = mouseMove.pipe(takeUntil(mouseUp));

    mouseDown.pipe(mergeMap(() => listenMoveUntilUp))
      .subscribe((e: Event) => {
        const x = e.clientX || e.touches[0].clientX;
        const offsetX = e.target.offsetLeft;
        const left = Math.max(0, x - offsetX);
        if (e.target !== e.currentTarget) {
          e.target.querySelector('.pointer').style.left = left + 'px';
        }
      });
  }


}
