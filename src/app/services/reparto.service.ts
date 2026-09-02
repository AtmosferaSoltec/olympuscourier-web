import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Result } from '../interfaces/state';

@Injectable({
  providedIn: 'root',
})
export class RepartoService {
  http = inject(HttpClient);
  url = `${environment.baseUrl}/api/repartos`;
  newUrl = `${environment.baseUrl}/api/reparto`;

  get(id: number) {
    return this.http.get<Result>(`${this.url}/${id}`);
  }

  getAll(params: any) {
    return this.http.get<Result>(this.url, { params: params });
  }

  getAllNew(params: any) {
    const query = this.http.get(this.newUrl, { params: params });
    return query;
  }

  setActivo(id_reparto: number, activo: 'S' | 'N') {
    return this.http.patch<Result>(`${this.url}/activo/${id_reparto}`, {
      activo,
    });
  }

  insert(body: any) {
    return this.http.post<Result>(this.url, body);
  }

  /**
   * Marca o revierte el cobro de un reparto. Cada concepto es opcional: el que
   * no se envía queda como está.
   */
  marcarPago(
    id_reparto: number,
    conceptos: { pagar_reparto?: boolean; pagar_adicional?: boolean },
  ) {
    return this.http.post<Result>(`${this.url}/marcarPago`, {
      id_reparto,
      ...conceptos,
    });
  }

  update(id: number, body: any) {
    return this.http.patch<Result>(`${this.url}/${id}`, body);
  }
}
