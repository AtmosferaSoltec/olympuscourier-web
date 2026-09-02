import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

export interface DialogFotoData {
  url: string;
  numReparto?: number;
  cliente?: string;
  fecha?: string;
}

@Component({
  selector: 'app-dialog-foto',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, DatePipe],
  template: `
    <div class="flex flex-col w-full h-full overflow-hidden bg-white">
      <!--Cabecera-->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0">
        <div
          class="items-center justify-center hidden w-10 h-10 text-white rounded-full md:flex bg-p1 shrink-0"
        >
          <mat-icon>photo_camera</mat-icon>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-bold truncate text-t">Foto de conformidad</p>
          <p class="text-xs truncate text-textos">
            {{ data.cliente || 'Cliente sin nombre' }}
            @if (data.fecha) {
              · {{ data.fecha | date: 'dd/MM/yyyy, hh:mm a' }}
            }
          </p>
        </div>

        <button
          mat-icon-button
          type="button"
          matTooltip="Alejar"
          [disabled]="zoom() <= 1"
          (click)="alejar()"
        >
          <mat-icon>zoom_out</mat-icon>
        </button>
        <button
          mat-icon-button
          type="button"
          matTooltip="Acercar"
          [disabled]="zoom() >= 4"
          (click)="acercar()"
        >
          <mat-icon>zoom_in</mat-icon>
        </button>
        <button
          mat-icon-button
          type="button"
          matTooltip="Abrir en una pestaña nueva"
          (click)="abrirEnPestana()"
        >
          <mat-icon>open_in_new</mat-icon>
        </button>
        <button mat-icon-button type="button" matTooltip="Cerrar" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!--Imagen-->
      <div class="relative flex-1 overflow-auto bg-neutral-900">
        @if (cargando()) {
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="spinner"></div>
          </div>
        }

        @if (error()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <mat-icon class="text-neutral-500 !w-12 !h-12 !text-5xl">broken_image</mat-icon>
            <p class="text-sm font-medium text-neutral-300">No se pudo cargar la imagen</p>
            <p class="max-w-md text-xs break-all text-neutral-500">{{ data.url }}</p>
          </div>
        } @else {
          <div class="flex items-center justify-center min-h-full p-4">
            <img
              [src]="data.url"
              alt="Foto de conformidad de la entrega"
              class="object-contain max-w-full transition-transform duration-200 origin-center select-none"
              [style.transform]="'scale(' + zoom() + ')'"
              [class.invisible]="cargando()"
              (load)="cargando.set(false)"
              (error)="cargando.set(false); error.set(true)"
            />
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .spinner {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 4px solid rgba(255, 255, 255, 0.25);
        border-top-color: #ffffff;
        animation: girar 0.8s linear infinite;
      }

      @keyframes girar {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class DialogFotoComponent {
  dialogRef = inject(MatDialogRef<DialogFotoComponent>);
  data = inject<DialogFotoData>(MAT_DIALOG_DATA);

  cargando = signal(true);
  error = signal(false);
  zoom = signal(1);

  acercar() {
    this.zoom.update((z) => Math.min(4, z + 0.5));
  }

  alejar() {
    this.zoom.update((z) => Math.max(1, z - 0.5));
  }

  abrirEnPestana() {
    window.open(this.data.url, '_blank', 'noopener');
  }
}
