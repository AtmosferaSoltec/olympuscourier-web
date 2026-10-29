import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { PanelAdminService } from './panel-admin.service';

@Component({
  selector: 'app-panel-admin',
  imports: [MatIconModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.scss',
})
export class PanelAdminComponent implements AfterViewInit, OnDestroy {
  data = [
    { label: 'Usuarios', url: 'usuarios', icon: 'group' },
    { label: 'Distritos', url: 'distritos', icon: 'location_city' },
    { label: 'Método de pago', url: 'metodo-pago', icon: 'payments' },
    { label: 'Vehículos', url: 'vehiculos', icon: 'local_shipping' },
  ];

  indicator = signal<{ x: number; y: number; w: number; h: number } | null>(null);
  animar = signal(false);

  private nav = viewChild.required<ElementRef<HTMLElement>>('nav');
  private router = inject(Router);
  private panelService = inject(PanelAdminService);
  private sub?: Subscription;
  private observer?: ResizeObserver;

  ngAfterViewInit(): void {
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.actualizar(true));
    // Reubica el indicador si cambia el ancho (resize, carga de fuentes, salto de línea)
    this.observer = new ResizeObserver(() => this.actualizar(false));
    this.observer.observe(this.nav().nativeElement);
    this.actualizar(false);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.observer?.disconnect();
    this.panelService.reset();
  }

  private actualizar(animar: boolean) {
    // routerLinkActive aplica la clase después de NavigationEnd
    requestAnimationFrame(() => {
      const activo = this.nav().nativeElement.querySelector<HTMLElement>('.adm-tab.active');
      if (!activo) return;
      this.animar.set(animar);
      this.indicator.set({ x: activo.offsetLeft, y: activo.offsetTop, w: activo.offsetWidth, h: activo.offsetHeight });
    });
  }
}
