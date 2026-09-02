import { Cliente } from './cliente';
import { ItemReparto } from './item-reparto';

/** Estado de cobro derivado en el backend a partir de los montos y las banderas. */
export type EstadoPago = 'SIN_COBRO' | 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

/** Campos de cobro que acompañan a un reparto en el listado y en el detalle. */
export interface DatosPago {
  estado_pago?: EstadoPago;
  pagado_reparto?: 'S' | 'N';
  pagado_adicional?: 'S' | 'N';
  monto_reparto?: number;
  monto_adicional?: number;
  monto_por_cobrar?: number;
}

export interface Reparto extends DatosPago {
  id?: number;
  id_ruc?: string;
  num_reparto?: number;
  anotacion?: string;
  clave?: string;
  estado?: string;
  fecha_creacion?: string;
  fecha_entrega?: string;
  id_cliente?: number;
  id_usuario?: number;
  url_foto?: string;
  nombre_usuario?: string;
  cliente?: Cliente;
  id_comprobante?: number;
  comprobante?: {
    tipo_comprobante?: number;
    serie?: string;
    num_serie?: number;
  };
  items?: ItemReparto[];
  total?: number;
  activo?: string;
  historial?: HistorialReparto[];
}

export interface HistorialReparto {
  id?: number;
  id_reparto?: number;
  id_usuario?: number;
  id_tipo_operacion?: number;
  tipo_operacion?: string;
  fecha?: string;
  nombre?: string;
}

export interface RepartoNew extends DatosPago {
  id?: number;
  num_reparto?: number;
  usuario?: string;
  cliente?: string;
  maps?: string;
  fecha_creacion?: Date;
  estado?: string;
  activo?: string;
  costo_adicional?: number;
  costo_reparto?: number;
  comprobante?: string;
  items?: ItemReparto[];


  entregado?: string;
  telefono?: string;
  direccion?: string;
  distrito?: string;
}
