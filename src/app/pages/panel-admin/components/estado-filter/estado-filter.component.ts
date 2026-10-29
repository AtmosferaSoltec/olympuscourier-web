import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, output, signal, viewChild } from '@angular/core';

type Estado = 'S' | 'N';

@Component({
  selector: 'app-estado-filter',
  template: `
    <div #seg class="adm-seg" role="group" aria-label="Filtrar por estado">
      @if (indicator(); as ind) {
      <span class="adm-seg-indicator" [class.no-anim]="!animar()"
        [style.width.px]="ind.w" [style.height.px]="ind.h"
        [style.transform]="'translate(' + ind.x + 'px,' + ind.y + 'px)'"></span>
      }
      @for (op of opciones; track op.value) {
      <button type="button" [attr.data-value]="op.value" [class.active]="value() === op.value"
        (click)="valueChange.emit(op.value)">{{ op.label }}</button>
      }
    </div>
  `,
})
export class EstadoFilterComponent implements AfterViewInit, OnDestroy {
  value = input.required<Estado>();
  valueChange = output<Estado>();

  opciones: { value: Estado; label: string }[] = [
    { value: 'S', label: 'Activos' },
    { value: 'N', label: 'Inactivos' },
  ];

  indicator = signal<{ x: number; y: number; w: number; h: number } | null>(null);
  animar = signal(false);

  private seg = viewChild.required<ElementRef<HTMLElement>>('seg');
  private observer?: ResizeObserver;
  private listo = false;

  constructor() {
    effect(() => {
      this.value();
      if (this.listo) this.actualizar(true);
    });
  }

  ngAfterViewInit(): void {
    this.listo = true;
    this.observer = new ResizeObserver(() => this.actualizar(false));
    this.observer.observe(this.seg().nativeElement);
    this.actualizar(false);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private actualizar(animar: boolean) {
    requestAnimationFrame(() => {
      const activo = this.seg().nativeElement.querySelector<HTMLElement>('button.active');
      if (!activo) return;
      this.animar.set(animar);
      this.indicator.set({ x: activo.offsetLeft, y: activo.offsetTop, w: activo.offsetWidth, h: activo.offsetHeight });
    });
  }
}
