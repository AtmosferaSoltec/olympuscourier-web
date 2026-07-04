import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Result } from '../interfaces/state';

@Injectable({
  providedIn: 'root',
})
export class ConsultasService {
  http = inject(HttpClient);
  url = `${environment.baseUrl}/api/consultas`;

  /** Devuelve los datos del documento o lanza un Error con un mensaje para mostrar al usuario. */
  async searchDoc(doc: string, tipoDoc: string) {
    try {
      const call = this.http.get(`${this.url}/${tipoDoc}/${doc}`);
      const res: Result = await firstValueFrom(call);
      if (res?.isSuccess) {
        return res.data;
      }
      throw new Error(res?.mensaje ?? 'No se pudo encontrar información para el documento ingresado');
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('No se pudo consultar el documento, intente nuevamente');
    }
  }
}
