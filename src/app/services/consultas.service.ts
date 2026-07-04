import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Result } from '../interfaces/state';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ConsultasService {
  http = inject(HttpClient);
  url = `${environment.baseUrl}/api/consultas`;

  async searchDoc(doc: string, tipoDoc: string) {
    try {
      const call = this.http.get(`${this.url}/${tipoDoc}/${doc}`);
      const res: Result = await firstValueFrom(call);
      if (res?.isSuccess) {
        return res.data;
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'No encontrado',
          text: res?.mensaje ?? 'No se pudo encontrar información para el documento ingresado',
        });
        return null;
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo consultar el documento, intente nuevamente',
      });
      return null;
    }
  }
}
