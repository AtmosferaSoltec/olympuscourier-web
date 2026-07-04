import { Component, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { ClienteService } from '../../services/cliente.service';

import { DistritoService } from '../../services/distrito.service';
import { Cliente } from '../../interfaces/cliente';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DocumentoService } from '../../services/documento.service';
import { ConsultasService } from '../../services/consultas.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dialog-add-cliente',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-add-cliente.component.html',
  styleUrl: './dialog-add-cliente.component.scss',
})
export class DialogAddClienteComponent {
  clienteService = inject(ClienteService);
  selectedDistrito: any;

  documentoService = inject(DocumentoService);
  consultasService = inject(ConsultasService);
  distritoService = inject(DistritoService);

  constructor(
    public dialogRef: MatDialogRef<DialogAddClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente | undefined,
  ) {}

  formulario = new FormGroup({
    tipo: new FormControl(this.data?.cod_tipodoc, [Validators.required]),
    doc: new FormControl(this.data?.documento, [
      Validators.required,
      Validators.minLength(8),
    ]),
    nombres: new FormControl(this.data?.nombres, [
      Validators.required,
      Validators.maxLength(100),
    ]),
    cel: new FormControl(this.data?.telefono, [
      Validators.required,
      Validators.minLength(9),
    ]),
    genero: new FormControl(this.data?.genero ?? 'S'),
    correo: new FormControl(this.data?.correo, Validators.email),
    distrito: new FormControl(this.data?.id_distrito, [Validators.required]),
    direc: new FormControl(this.data?.direc, [
      Validators.required,
      Validators.maxLength(100),
    ]),
    ref: new FormControl(this.data?.referencia),
    maps: new FormControl(this.data?.url_maps),
  });

  progressBuscarDoc = signal<boolean>(false);

  async buscarDoc() {
    this.progressBuscarDoc.set(true);
    const { doc, tipo } = this.formulario.value;

    if (!doc) {
      this.progressBuscarDoc.set(false);
      return;
    }

    if (!tipo) {
      this.progressBuscarDoc.set(false);
      return;
    }

    let tipoDoc: string | undefined;

    if (tipo == '1') {
      tipoDoc = 'dni';
      if (doc.length != 8) {
        this.progressBuscarDoc.set(false);
        return;
      }
    }
    if (tipo == '6') {
      tipoDoc = 'ruc';
      if (doc.length != 11) {
        this.progressBuscarDoc.set(false);
        return;
      }
    }
    if (!tipoDoc) {
      this.progressBuscarDoc.set(false);
      return;
    }

    try {
      const data: any = await this.consultasService.searchDoc(doc, tipoDoc);

      if (data) {
        this.formulario.get('nombres')?.setValue(`${data.nombres}`);
        this.formulario.get('direc')?.setValue(`${data.direc ?? ''}`);
      }
    } finally {
      this.progressBuscarDoc.set(false);
    }
  }

  resetDoc() {
    this.formulario.get('doc')?.reset();
  }

  getMaxLength(): number {
    const { tipo } = this.formulario.value;
    if (tipo == '1') {
      return 8;
    } else if (tipo == '6') {
      return 11;
    } else if (tipo == '4') {
      return 12;
    } else {
      return 15;
    }
  }

  guardar() {
    const {
      tipo,
      doc,
      nombres,
      cel,
      genero,
      correo,
      distrito,
      direc,
      ref,
      maps,
    } = this.formulario.value;

    if (!tipo) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Tipo de documento es obligatorio',
      });
      return;
    }
    if (!doc) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Documento es obligatorio',
      });
      return;
    }
    if (!nombres) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Nombres es obligatorio',
      });
      return;
    }
    if (!cel) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Celular es obligatorio',
      });
      return;
    }
    if (!distrito) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Distrito es obligatorio',
      });
      return;
    }
    if (!direc) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Dirección es obligatorio',
      });
      return;
    }

    const body = {
      cod_tipodoc: Number(tipo),
      documento: doc,
      nombres: nombres,
      telefono: cel,
      genero: genero ?? 'S',
      correo: correo ?? '',
      id_distrito: Number(distrito),
      direc: direc ?? '',
      referencia: ref ?? '',
      url_maps: maps ?? '',
    };

    if (!this.data?.id) {
      this.clienteService.addCliente(body).subscribe({
        next: (data: any) => {
          this.dialogRef.close(data?.id);
          Swal.fire({
            icon: 'success',
            title: 'Cliente registrado',
            text: 'Cliente registrado correctamente',
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al insertar',
            text: err?.message,
          });
        },
      });
    } else {
      this.clienteService.updateCliente(this.data?.id, body).subscribe({
        next: (data: any) => {
          this.dialogRef.close(data?.id);
          Swal.fire({
            icon: 'success',
            title: 'Cliente actualizado',
            text: 'Cliente actualizado correctamente',
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err?.message,
          });
        },
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
