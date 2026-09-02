import { DatosPago, EstadoPago } from '../interfaces/reparto';

export interface EstadoPagoInfo {
  texto: string;
  icono: string;
  /** Clases del badge (fondo + texto + borde). */
  clases: string;
  /** Color del punto indicador. */
  punto: string;
}

const ESTADOS_PAGO: Record<EstadoPago, EstadoPagoInfo> = {
  SIN_COBRO: {
    texto: 'Sin cobro',
    icono: 'money_off',
    clases: 'bg-gray-100 text-gray-600 border-gray-200',
    punto: 'bg-gray-400',
  },
  PENDIENTE: {
    texto: 'Por cobrar',
    icono: 'schedule',
    clases: 'bg-rose-50 text-rose-700 border-rose-200',
    punto: 'bg-rose-500',
  },
  PARCIAL: {
    texto: 'Pago parcial',
    icono: 'hourglass_bottom',
    clases: 'bg-amber-50 text-amber-700 border-amber-200',
    punto: 'bg-amber-500',
  },
  PAGADO: {
    texto: 'Pagado',
    icono: 'paid',
    clases: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    punto: 'bg-emerald-500',
  },
};

const DESCONOCIDO: EstadoPagoInfo = {
  texto: 'Sin datos',
  icono: 'help',
  clases: 'bg-gray-100 text-gray-500 border-gray-200',
  punto: 'bg-gray-300',
};

export function infoEstadoPago(estado?: EstadoPago): EstadoPagoInfo {
  return estado ? (ESTADOS_PAGO[estado] ?? DESCONOCIDO) : DESCONOCIDO;
}

/**
 * Detalla qué concepto falta cobrar. El backend ya considera que un monto en 0
 * nunca está pendiente, así que acá solo se traduce a texto.
 */
export function detallePendiente(pago: DatosPago | null | undefined): string | null {
  if (!pago || pago.estado_pago !== 'PARCIAL') return null;

  const faltaReparto = (pago.monto_reparto ?? 0) > 0 && pago.pagado_reparto !== 'S';
  return faltaReparto ? 'Falta cobrar el reparto' : 'Falta cobrar el adicional';
}

/** Indica si queda algo por cobrar (para habilitar la acción de marcar pagado). */
export function tienePendiente(pago: DatosPago | null | undefined): boolean {
  return pago?.estado_pago === 'PENDIENTE' || pago?.estado_pago === 'PARCIAL';
}
