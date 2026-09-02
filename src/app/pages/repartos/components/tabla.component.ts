import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import {
  HistorialReparto,
  Reparto,
  RepartoNew,
} from '../../../interfaces/reparto';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import Swal from 'sweetalert2';
import { MostrarEstadoPipe } from '../../../pipes/mostrar-estado.pipe';
import { RepartosService } from '../repartos.service';
import { FormatNumPipe } from '../../../pipes/format-num.pipe';
import { MostrarActivoPipe } from '../../../pipes/mostrar-activo.pipe';
import {
  detallePendiente,
  infoEstadoPago,
  tienePendiente,
} from '../../../shared/estado-pago';

@Component({
  selector: 'app-tabla',
  template: `
    <div
      class="rounded-2xl border border-white/10 bg-white/50 dark:bg-neutral-900/60 shadow-sm"
    >
      <!-- Tabla responsive horizontal -->
      <div class="overflow-x-auto rounded-2xl">
        <table class="w-full text-sm text-left text-textos">
          <!-- THEAD sticky -->
          <thead
            class="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-white/10"
          >
            <tr class="text-[11px] uppercase tracking-wide text-textos/70">
              <th scope="col" class="px-4 py-3">N° Reparto</th>
              <th scope="col" class="px-4 py-3">Cliente</th>
              <th scope="col" class="px-4 py-3">Creado</th>
              <th scope="col" class="px-4 py-3">Estado Envío</th>
              <th scope="col" class="px-4 py-3">Estado Pago</th>
              <th scope="col" class="px-4 py-3">Estado</th>
              <th scope="col" class="px-4 py-3 hidden md:table-cell">
                C. Adicional
              </th>
              <th scope="col" class="px-4 py-3 hidden md:table-cell">
                C. Reparto
              </th>
              <th scope="col" class="px-4 py-3">Total</th>
              <th scope="col" class="px-2 py-3 text-right w-10"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-white/10">
            <!-- LOADING: skeleton rows -->
            @if (repartosService.isLoading()) {
              @for (_ of [0, 1, 2, 3, 4, 5]; track $index) {
                <tr class="bg-white dark:bg-neutral-900">
                  <td colspan="9" class="px-4 py-3">
                    <div class="grid grid-cols-8 gap-3 animate-pulse">
                      <div
                        class="h-4 bg-black/5 dark:bg-white/10 rounded col-span-2"
                      ></div>
                      <div
                        class="h-4 bg-black/5 dark:bg-white/10 rounded col-span-2"
                      ></div>
                      <div
                        class="h-4 bg-black/5 dark:bg-white/10 rounded col-span-1"
                      ></div>
                      <div
                        class="h-4 bg-black/5 dark:bg-white/10 rounded col-span-1"
                      ></div>
                      <div
                        class="h-4 bg-black/5 dark:bg-white/10 rounded col-span-1"
                      ></div>
                      <div
                        class="h-4 bg-black/5 dark:bg-white/10 rounded col-span-1"
                      ></div>
                    </div>
                  </td>
                </tr>
              }
            } @else {
              <!-- ROWS -->
              @for (item of repartosService.listRepartosNew(); track $index) {
                <tr
                  class="bg-white dark:bg-neutral-900 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  <!-- N° Reparto / Usuario -->
                  <td class="px-4 py-2 align-top">
                    <div class="font-mono text-[13px] font-semibold">
                      #{{ item.num_reparto | formatNum: 6 }}
                    </div>
                    <div class="text-[11px] text-textos/70">
                      {{ item.usuario | uppercase }}
                    </div>
                  </td>

                  <!-- Cliente -->
                  <td class="px-4 py-2 align-top">
                    <div
                      class="font-semibold truncate max-w-[18ch] md:max-w-[28ch]"
                      [title]="item.cliente"
                    >
                      {{ item.cliente }}
                    </div>
                  </td>

                  <!-- Creado -->
                  <td class="px-4 py-2 align-top">
                    <span class="inline-flex items-center gap-1 text-xs">
                      <mat-icon class="!text-[16px] text-textos/60"
                        >event</mat-icon
                      >
                      {{ item.fecha_creacion | date: 'dd/MM/yyyy' }}
                    </span>
                  </td>

                  <!-- Estado Envío (badge por estado) -->
                  <td class="px-4 py-2 align-top">
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1"
                      [ngClass]="{
                        'bg-emerald-50 text-emerald-700 ring-emerald-200':
                          item.estado === 'E',
                        'bg-amber-50 text-amber-700 ring-amber-200':
                          item.estado === 'P',
                        'bg-sky-50 text-sky-700 ring-sky-200':
                          item.estado === 'R',
                        'bg-rose-50 text-rose-700 ring-rose-200':
                          item.estado === 'C',
                        'bg-slate-50 text-slate-700 ring-slate-200':
                          item.estado !== 'E' &&
                          item.estado !== 'P' &&
                          item.estado !== 'R' &&
                          item.estado !== 'C',
                      }"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full"
                        [ngClass]="{
                          'bg-emerald-500': item.estado === 'E',
                          'bg-amber-500': item.estado === 'P',
                          'bg-sky-500': item.estado === 'R',
                          'bg-rose-500': item.estado === 'C',
                          'bg-slate-400':
                            item.estado !== 'E' &&
                            item.estado !== 'P' &&
                            item.estado !== 'R' &&
                            item.estado !== 'C',
                        }"
                      ></span>
                      {{ item.estado | mostrarEstado }}
                    </span>
                  </td>

                  <!-- Estado de Pago -->
                  <td class="px-4 py-2 align-top">
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                      [class]="infoPago(item).clases"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full"
                        [class]="infoPago(item).punto"
                      ></span>
                      {{ infoPago(item).texto }}
                    </span>

                    @if (detallePendiente(item); as detalle) {
                      <div class="text-[11px] text-textos/60 mt-0.5">
                        {{ detalle }}
                      </div>
                    }
                  </td>

                  <!-- Estado (activo) -->
                  <td class="px-4 py-2 align-top">
                    <span
                      class="inline-flex items-center rounded-md bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[11px] font-medium"
                    >
                      {{ item.activo | mostrarActivo }}
                    </span>
                  </td>

                  <!-- C. Adicional -->
                  <td class="px-4 py-2 align-top hidden md:table-cell">
                    <div class="font-mono text-[13px]">
                      S/{{ item.costo_adicional | number: '1.2-2' }}
                    </div>
                  </td>

                  <!-- C. Reparto -->
                  <td class="px-4 py-2 align-top hidden md:table-cell">
                    <div class="font-mono text-[13px]">
                      S/{{ item.costo_reparto | number: '1.2-2' }}
                    </div>
                  </td>

                  <!-- Total + Comprobante -->
                  <td class="px-4 py-2 align-top">
                    <div class="font-mono text-[13px] font-bold">
                      S/{{
                        (item.costo_adicional ?? 0) + (item.costo_reparto ?? 0)
                          | number: '1.2-2'
                      }}
                    </div>
                    <div class="text-[11px] text-textos/60">
                      @if (item.comprobante) {
                        {{ item.comprobante }}
                      } @else {
                        —
                      }
                    </div>
                  </td>

                  <!-- Acciones -->
                  <td class="px-2 py-2 align-top text-right">
                    <!-- Usa el input correcto: [matMenuTriggerFor] -->
                    <button mat-icon-button [matMenuTriggerFor]="acciones">
                      <mat-icon>more_vert</mat-icon>
                    </button>

                    <!-- Define el menú en la misma fila y usa un nombre fijo -->
                    <mat-menu #acciones="matMenu">
                      @if (item.activo == 'S') {
                        <button mat-menu-item (click)="toDetalle(item.id)">
                          <span>Ver Detalle</span>
                          <mat-icon>visibility</mat-icon>
                        </button>

                        @if (item.estado !== 'E') {
                          <button mat-menu-item (click)="toEditar(item.id)">
                            <mat-icon>edit</mat-icon>
                            <span>Editar</span>
                          </button>
                        }

                        <!-- Cobro: marcar o revertir según lo que falte -->
                        @if (tienePendiente(item)) {
                          <button mat-menu-item (click)="marcarPagado(item)">
                            <mat-icon>paid</mat-icon>
                            <span>Marcar como pagado</span>
                          </button>
                        } @else if (item.estado_pago === 'PAGADO') {
                          <button mat-menu-item (click)="revertirPago(item)">
                            <mat-icon>undo</mat-icon>
                            <span>Revertir pago</span>
                          </button>
                        }
                        @if (
                          usuarioService.usuario()?.cod_rol == 'A' &&
                          !item.comprobante
                        ) {
                          <button mat-menu-item (click)="deleteReparto(item)">
                            <mat-icon>delete</mat-icon>
                            Eliminar
                          </button>
                        }
                      } @else {
                        @if (usuarioService.usuario()?.cod_rol == 'A') {
                          <button
                            mat-menu-item
                            (click)="recuperarReparto(item)"
                          >
                            <mat-icon>restart_alt</mat-icon>
                            Restaurar
                          </button>
                        }
                      }
                    </mat-menu>
                  </td>
                </tr>
              } @empty {
                <!-- EMPTY STATE -->
                <tr>
                  <td colspan="10" class="px-6 py-10">
                    <div
                      class="flex flex-col items-center justify-center gap-2 text-center"
                    >
                      <div
                        class="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
                      >
                        <mat-icon>hourglass_empty</mat-icon>
                      </div>
                      <div class="text-sm font-semibold">Sin datos</div>
                      <div class="text-xs text-textos/60 max-w-sm">
                        No encontramos repartos para mostrar. Ajusta los filtros
                        o vuelve a intentarlo.
                      </div>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    .loader {
      width: 120px;
      height: 22px;
      border-radius: 20px;
      color: var(--colorP1);
      border: 2px solid;
      position: relative;
    }
    .loader::before {
      content: '';
      position: absolute;
      margin: 2px;
      inset: 0 100% 0 0;
      border-radius: inherit;
      background: currentColor;
      animation: l6 2s infinite;
    }
    @keyframes l6 {
      100% {
        inset: 0;
      }
    }
  `,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MostrarEstadoPipe,
    FormatNumPipe,
    MostrarActivoPipe,
  ],
})
export class TablaComponent {
  repartosService = inject(RepartosService);
  usuarioService = inject(UsuarioService);
  router = inject(Router);

  infoPago = (reparto: RepartoNew) => infoEstadoPago(reparto.estado_pago);
  detallePendiente = detallePendiente;
  tienePendiente = tienePendiente;

  /**
   * Marca el cobro. Si hay dos conceptos pendientes se pregunta cuál se cobró,
   * porque el cliente puede pagar solo una parte.
   */
  async marcarPagado(reparto: RepartoNew) {
    if (!reparto.id) return;

    const faltaReparto = (reparto.monto_reparto ?? 0) > 0 && reparto.pagado_reparto !== 'S';
    const faltaAdicional = (reparto.monto_adicional ?? 0) > 0 && reparto.pagado_adicional !== 'S';

    let conceptos: { pagar_reparto?: boolean; pagar_adicional?: boolean };

    if (faltaReparto && faltaAdicional) {
      const { value } = await Swal.fire({
        title: '¿Qué se cobró?',
        input: 'radio',
        inputOptions: {
          ambos: `Todo (S/ ${(reparto.monto_por_cobrar ?? 0).toFixed(2)})`,
          reparto: `Solo el reparto (S/ ${(reparto.monto_reparto ?? 0).toFixed(2)})`,
          adicional: `Solo el adicional (S/ ${(reparto.monto_adicional ?? 0).toFixed(2)})`,
        },
        inputValue: 'ambos',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#047CC4',
      });

      if (!value) return;

      conceptos = {
        pagar_reparto: value === 'ambos' || value === 'reparto',
        pagar_adicional: value === 'ambos' || value === 'adicional',
      };
    } else {
      const monto = faltaReparto ? reparto.monto_reparto : reparto.monto_adicional;
      const concepto = faltaReparto ? 'el reparto' : 'el cobro adicional';

      const { isConfirmed } = await Swal.fire({
        title: '¿Confirmar cobro?',
        text: `Se marcará como pagado ${concepto} por S/ ${(monto ?? 0).toFixed(2)}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#047CC4',
      });

      if (!isConfirmed) return;

      conceptos = faltaReparto ? { pagar_reparto: true } : { pagar_adicional: true };
    }

    this.repartosService.marcarPago(reparto.id, conceptos);
  }

  /** Corrige un pago marcado por error. Solo disponible desde la web. */
  async revertirPago(reparto: RepartoNew) {
    if (!reparto.id) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Revertir el pago?',
      text: 'El reparto volverá a figurar como pendiente de cobro. Queda registrado en el historial.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Revertir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#047CC4',
    });

    if (!isConfirmed) return;

    this.repartosService.marcarPago(reparto.id, {
      pagar_reparto: false,
      pagar_adicional: false,
    });
  }

  toDetalle(id: number | undefined) {
    this.router.navigate(['/menu/detalle-reparto', id]);
  }

  toEditar(id: number | undefined) {
    this.router.navigate(['/menu/editar-reparto', id]);
  }

  // Alerta para eliminar un reparto
  deleteReparto(reparto: RepartoNew) {
    if (reparto.comprobante) {
      //No se puede elimnar porque tiene un comprobante asociado
      Swal.fire({
        title: 'No se puede eliminar',
        text: 'El reparto seleccionado tiene un comprobante asociado',
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Confirmar',
        confirmButtonColor: '#047CC4',
      });
      return;
    }

    Swal.fire({
      title: '¿Estas seguro?',
      text: 'Se eliminara el reparto seleccionado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#047CC4',
    }).then((result) => {
      if (result.isConfirmed) {
        if (!reparto.id) {
          return alert('No se pudo eliminar el reparto');
        }
        this.repartosService.eliminarReparto(reparto.id);
      }
    });
  }

  // Alerta para recuperar un reparto
  recuperarReparto(reparto: RepartoNew) {
    Swal.fire({
      title: '¿Estas seguro?',
      text: 'Se recuperara el reparto seleccionado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result?.isConfirmed) {
        if (!reparto.id) {
          return alert('No se pudo recuperar el reparto');
        }
        this.repartosService.retaurarReparto(reparto.id);
      }
    });
  }
}
