import { Component, Inject, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ItemReparto } from '../../../interfaces/item-reparto';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaqueteService } from '../../../services/paquete.service';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-dialog-add-item-reparto',
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, InputComponent],
  template: `
    <div class="flex flex-col">
      <!-- Header -->
      <div
        class="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100"
      >
        <div
          class="w-9 h-9 rounded-xl bg-p-100 flex items-center justify-center flex-shrink-0"
        >
          <svg
            class="w-5 h-5 text-p-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-base font-bold text-t">
            {{ data ? 'Editar Item' : 'Agregar Item' }}
          </h2>
          <p class="text-xs text-textos/60">
            {{
              data
                ? 'Modifica los datos del item'
                : 'Completa los datos del nuevo item'
            }}
          </p>
        </div>
      </div>

      <!-- Formulario -->
      <div class="px-6 py-5">
        <div class="flex flex-col gap-4">
          <!-- N° de Guía -->
          <app-input
            label="N° de Guía"
            placeholder="Ingrese número de guía"
            [(ngModel)]="num_guia"
          ></app-input>

          <!-- Precio + Adicional -->
          <div class="flex flex-col gap-1.5">
            <div class="grid grid-cols-2 gap-3">
              <app-input
                label="Precio (S/)"
                hint="(opcional)"
                type="number"
                placeholder="0.00"
                [(ngModel)]="precio"
                [error]="errors.precio"
              ></app-input>
              <app-input
                label="Adicional (S/)"
                hint="(opcional)"
                type="number"
                placeholder="0.00"
                [(ngModel)]="adicional"
                [error]="errors.adicional"
              ></app-input>
            </div>

            <p class="flex items-start gap-1.5 text-xs text-textos/70">
              <mat-icon class="!w-4 !h-4 !text-[16px] !leading-4 shrink-0 mt-px">info</mat-icon>
              Déjalos vacíos si la guía de remisión ya viene pagada. Se registran como S/ 0.00.
            </p>
          </div>

          <!-- Clave -->
          <app-input
            label="Clave"
            hint="(exactamente 4 caracteres)"
            placeholder="Ej: AB12"
            [maxlength]="4"
            inputClass="tracking-widest font-mono"
            [(ngModel)]="clave"
            [error]="errors.clave"
          ></app-input>

          <!-- Detalle -->
          <app-input
            label="Detalle"
            placeholder="Ingresa descripción del pedido"
            [multiline]="true"
            [rows]="5"
            [(ngModel)]="detalle"
            [error]="errors.detalle"
          ></app-input>
        </div>
      </div>

      <!-- Footer acciones -->
      <div class="flex items-center justify-end gap-2 px-6 py-4">
        <button
          (click)="closeDialog()"
          class="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          (click)="onAceptar()"
          class="px-4 py-2 text-sm font-semibold text-white bg-p-600 hover:bg-p-700 rounded-xl transition-colors shadow-sm"
        >
          {{ data ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </div>
  `,
})
export class DialogAddItemRepartoComponent {
  paqueteService = inject(PaqueteService);

  num_guia = '';
  precio = '';
  adicional = '';
  clave = '';
  detalle = '';

  errors = {
    precio: '',
    adicional: '',
    clave: '',
    detalle: '',
  };

  constructor(
    public dialogRef: MatDialogRef<DialogAddItemRepartoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ItemReparto | undefined,
  ) {
    if (data) {
      console.log(data);
      this.num_guia = data.num_guia ?? '';
      this.precio = data.precio ? data.precio.toString() : '';
      this.adicional = data.adicional ? data.adicional.toString() : '';
      this.clave = data.clave ?? '';
      this.detalle = data.detalle ?? '';
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * Los montos son opcionales: las guías de remisión que ya vienen pagadas se
   * registran sin cobro. Un campo vacío equivale a 0.
   */
  private validarMonto(valor: string, etiqueta: string): string {
    if (!valor?.trim()) return '';

    const numero = Number(valor);
    if (isNaN(numero)) return `El ${etiqueta} debe ser un número válido`;
    if (numero < 0) return `El ${etiqueta} no puede ser negativo`;
    return '';
  }

  /** Convierte el monto del formulario a número, tomando el vacío como 0. */
  private montoANumero(valor: string): number {
    return valor?.trim() ? Number(valor) : 0;
  }

  onAceptar() {
    this.errors = { precio: '', adicional: '', clave: '', detalle: '' };

    this.errors.precio = this.validarMonto(this.precio, 'precio');
    this.errors.adicional = this.validarMonto(this.adicional, 'adicional');

    //Validar si el detalle no esta vacio
    if (!this.detalle) {
      this.errors.detalle = 'El detalle no puede estar vacio';
    }

    //Validar si la clave tiene 4 caracteres
    if (this.clave.length !== 4) {
      this.errors.clave = 'La clave debe tener 4 caracteres';
    }

    if (
      this.errors.precio ||
      this.errors.adicional ||
      this.errors.clave ||
      this.errors.detalle
    ) {
      return;
    }

    const itemReparto: ItemReparto = {
      num_guia: this.num_guia,
      precio: this.montoANumero(this.precio),
      adicional: this.montoANumero(this.adicional),
      clave: this.clave,
      detalle: this.detalle,
    };

    this.dialogRef.close(itemReparto);
  }
}
