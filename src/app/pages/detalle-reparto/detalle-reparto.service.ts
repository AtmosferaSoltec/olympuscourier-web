import { Injectable, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { Reparto } from '../../interfaces/reparto';
import { RepartoService } from '../../services/reparto.service';

@Injectable({
  providedIn: 'root',
})
export class DetalleRepartoService {
  reparto = signal<Reparto | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  private repartoService = inject(RepartoService);

  getReparto(id: number) {
    this.cargando.set(true);
    this.error.set(null);

    this.repartoService.get(id).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res?.isSuccess) {
          this.reparto.set(res.data);
        } else {
          this.reparto.set(null);
          this.mostrarError(res?.mensaje || 'No se pudo obtener el reparto.');
        }
      },
      error: (err: any) => {
        this.cargando.set(false);
        this.reparto.set(null);
        this.mostrarError(err?.error?.mensaje || err?.message || 'Error de conexión con el servidor.');
      },
    });
  }

  private mostrarError(mensaje: string) {
    this.error.set(mensaje);
    Swal.fire({
      title: 'Error',
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#047CC4',
    });
  }
}
