import { Injectable, inject, signal } from '@angular/core';
import { RepartoNew } from '../../interfaces/reparto';
import { RepartoService } from '../../services/reparto.service';
import Swal from 'sweetalert2';
import { fechaActual } from '../../util/funciones';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepartosService {
  repartoService = inject(RepartoService);
  //public listRepartos = signal<Reparto[]>([]);
  public isLoading = signal<boolean>(false);

  listRepartosNew = signal<RepartoNew[]>([]);

  activo = signal<string>('T');
  estadoEnvio = signal<string>('T');
  numReparto = signal<string>('');
  nomCliente = signal<string>('');
  idUsuario = signal<number>(0);
  idSubido = signal<number>(0);
  idVehiculo = signal<number>(0);

  desde = signal<string>(fechaActual());
  hasta = signal<string>(fechaActual());

  reset() {
    this.listRepartosNew.set([]);
    this.isLoading.set(false);
  }

  limit = signal<number>(100);
  page = signal<number>(1);

  totalPage = signal<number>(0);

  getAll() {
    this.isLoading.set(true);
    const params = this.getAllParams();
    console.log(params);
    
    this.repartoService.getAllNew(params).subscribe({
      next: (res: any) => {
        this.listRepartosNew.set(res.data);
        this.totalPage.set(res.totalPages);
        this.page.set(res.page);
      },
      error: (err: any) => {
        console.log(err);

        alert(err.message);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  async getAllExcel(): Promise<any> {
    const params = this.getAllParams(10000, 1);
    const call = await lastValueFrom(this.repartoService.getAllNew(params));
    return call;
  }

  private getAllParams(limit = this.limit(), page = this.page()): any {
    const params: any = { limit, page };
    if (this.activo() !== 'T') params.activo = this.activo();
    if (this.estadoEnvio() !== 'T') params.estado = this.estadoEnvio();
    if (this.numReparto()) params.num_reparto = this.numReparto();
    if (this.nomCliente()) params.nom_cliente = this.nomCliente();
    if (this.idUsuario() != 0) params.id_usuario = this.idUsuario();
    if (this.idSubido() != 0) params.id_subido = this.idSubido();
    if (this.idVehiculo() != 0) params.id_vehiculo = this.idVehiculo();
    if (this.desde()) params.desde = this.desde();
    if (this.hasta()) params.hasta = this.hasta();
    return params;
  }

  retaurarReparto(id_reparto: number) {
    this.repartoService.setActivo(id_reparto, 'S').subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          Swal.fire({
            title: 'Recuperado',
            text: 'Se recupero el reparto correctamente',
            icon: 'success',
          });

          this.getAll();
        } else {
          alert(res?.mensaje || 'Error al recuperar el reparto');
        }
      },
      error: (err: any) => {
        alert(err.message);
      },
    });
  }

  /** Registra o revierte el cobro y refresca el listado. */
  marcarPago(
    id_reparto: number,
    conceptos: { pagar_reparto?: boolean; pagar_adicional?: boolean },
  ) {
    this.repartoService.marcarPago(id_reparto, conceptos).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          Swal.fire({
            title: 'Listo',
            text: 'Se actualizó el estado de pago',
            icon: 'success',
            confirmButtonColor: '#047CC4',
          });

          this.getAll();
        } else {
          Swal.fire({
            title: 'Error',
            text: res?.mensaje || 'No se pudo actualizar el estado de pago',
            icon: 'error',
            confirmButtonColor: '#047CC4',
          });
        }
      },
      error: (err: any) => {
        Swal.fire({
          title: 'Error',
          text: err?.error?.mensaje || err?.message || 'Error de conexión',
          icon: 'error',
          confirmButtonColor: '#047CC4',
        });
      },
    });
  }

  eliminarReparto(id_reparto: number) {
    this.repartoService.setActivo(id_reparto, 'N').subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          Swal.fire({
            title: 'Eliminado',
            text: 'Se elimino el reparto correctamente',
            icon: 'success',
          });

          this.getAll();
        } else {
          alert(res?.mensaje || 'Error al eliminar el reparto');
        }
      },
      error: (err: any) => {
        alert(err.message);
      },
    });
  }
}
