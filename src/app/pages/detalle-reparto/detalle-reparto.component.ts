import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DetalleRepartoService } from './detalle-reparto.service';
import { CardItemComponent } from './components/card-item/card-item.component';
import { DialogFotoComponent } from './components/dialog-foto/dialog-foto.component';
import { HistorialReparto } from '../../interfaces/reparto';
import { FormatTelfPipe } from '../../pipes/format-telf.pipe';
import { FormatNumPipe } from '../../pipes/format-num.pipe';

/** Códigos de operación del historial (ver TIPO_OPERACION en el backend). */
const OP_CONFORMIDAD = 4;

interface EstadoInfo {
  texto: string;
  icono: string;
  /** Clases del chip de estado (fondo + texto + borde). */
  clases: string;
  /** Color de acento para la barra superior de la tarjeta de entrega. */
  acento: string;
}

const ESTADOS: Record<string, EstadoInfo> = {
  P: {
    texto: 'Pendiente',
    icono: 'schedule',
    clases: 'bg-amber-50 text-amber-700 border-amber-200',
    acento: 'bg-amber-400',
  },
  C: {
    texto: 'En Ruta',
    icono: 'local_shipping',
    clases: 'bg-blue-50 text-blue-700 border-blue-200',
    acento: 'bg-blue-500',
  },
  E: {
    texto: 'Entregado',
    icono: 'check_circle',
    clases: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    acento: 'bg-emerald-500',
  },
  A: {
    texto: 'Anulado',
    icono: 'cancel',
    clases: 'bg-rose-50 text-rose-700 border-rose-200',
    acento: 'bg-rose-500',
  },
};

const ESTADO_DESCONOCIDO: EstadoInfo = {
  texto: 'Sin Estado',
  icono: 'help',
  clases: 'bg-gray-100 text-gray-600 border-gray-200',
  acento: 'bg-gray-300',
};

const ICONOS_OPERACION: Record<number, string> = {
  1: 'add_circle',
  2: 'block',
  3: 'check_circle',
  4: 'task_alt',
  5: 'local_shipping',
  6: 'cancel',
  7: 'edit',
};

@Component({
  selector: 'app-detalle-reparto',
  templateUrl: './detalle-reparto.component.html',
  styleUrl: './detalle-reparto.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    CardItemComponent,
    FormatTelfPipe,
    FormatNumPipe,
  ],
})
export class DetalleRepartoComponent implements OnInit {
  service = inject(DetalleRepartoService);
  private router = inject(Router);
  private actRoute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  id: number = 0;

  /** Datos visuales del estado actual del reparto. */
  estado = computed<EstadoInfo>(
    () => ESTADOS[this.service.reparto()?.estado ?? ''] ?? ESTADO_DESCONOCIDO,
  );

  cliente = computed(() => this.service.reparto()?.cliente ?? null);

  /** Iniciales del cliente para el avatar (máximo 2 letras). */
  iniciales = computed(() => {
    const nombres = this.cliente()?.nombres?.trim();
    if (!nombres) return '?';
    return nombres
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => palabra.charAt(0))
      .join('')
      .toUpperCase();
  });

  items = computed(() => this.service.reparto()?.items ?? []);

  /** El historial llega en orden de inserción; se muestra del más reciente al más antiguo. */
  historial = computed<HistorialReparto[]>(() =>
    [...(this.service.reparto()?.historial ?? [])].reverse(),
  );

  urlFoto = computed(() => {
    const url = this.service.reparto()?.url_foto?.trim();
    return url ? url : null;
  });

  comprobante = computed(() => {
    const reparto = this.service.reparto();
    if (!reparto?.id_comprobante || !reparto.comprobante) return null;
    const { serie, num_serie } = reparto.comprobante;
    return serie && num_serie ? `${serie} - ${num_serie}` : null;
  });

  /**
   * Fecha en la que se dio conformidad. Se prefiere la del historial porque
   * `fecha_entrega` solo se llena al confirmar la entrega.
   */
  fechaEntrega = computed(() => {
    const reparto = this.service.reparto();
    const movimiento = reparto?.historial?.find((h) => h.id_tipo_operacion === OP_CONFORMIDAD);
    return movimiento?.fecha ?? reparto?.fecha_entrega ?? null;
  });

  /** Usuario que registró la conformidad de la entrega. */
  entregadoPor = computed(
    () =>
      this.service.reparto()?.historial?.find((h) => h.id_tipo_operacion === OP_CONFORMIDAD)
        ?.nombre ?? null,
  );

  totalAdicional = computed(() =>
    this.items().reduce((acc, item) => acc + (Number(item.adicional) || 0), 0),
  );

  totalEnvio = computed(() =>
    this.items().reduce((acc, item) => acc + (Number(item.precio) || 0), 0),
  );

  /** Estado de carga de la miniatura de la foto de conformidad. */
  fotoCargando = signal(true);
  fotoError = signal(false);

  constructor() {
    // Al cambiar de reparto (o al recargar) la miniatura vuelve a su estado inicial.
    effect(() => {
      this.urlFoto();
      this.fotoCargando.set(true);
      this.fotoError.set(false);
    });
  }

  ngOnInit(): void {
    this.actRoute.params.subscribe((params) => {
      this.id = params['id'];
      this.service.getReparto(this.id);
    });
  }

  back() {
    this.router.navigate(['menu', 'repartos']);
  }

  recargar() {
    this.service.getReparto(this.id);
  }

  iconoOperacion(idTipoOperacion?: number): string {
    return ICONOS_OPERACION[idTipoOperacion ?? 0] ?? 'radio_button_checked';
  }

  verFoto() {
    const url = this.urlFoto();
    if (!url) return;

    this.dialog.open(DialogFotoComponent, {
      data: {
        url,
        numReparto: this.service.reparto()?.num_reparto,
        cliente: this.cliente()?.nombres,
        fecha: this.fechaEntrega(),
      },
      panelClass: 'dialog-foto-panel',
      maxWidth: '96vw',
      width: '900px',
      height: '85vh',
      autoFocus: false,
    });
  }

  abrirMapa() {
    const url = this.cliente()?.url_maps;
    if (url) window.open(url, '_blank', 'noopener');
  }
}
