import { Component, Inject, inject } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { DialogUsuarioComponent } from '../dialog-usuario/dialog-usuario.component';
import { Distrito } from '../../../../../interfaces/distrito';
import { DistritoService } from '../../../../../services/distrito.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-dialog-distritos',
    imports: [MatIconModule, ReactiveFormsModule, MatIconModule, MatRadioModule],
    templateUrl: './dialog-distritos.component.html',
    styleUrl: './dialog-distritos.component.scss'
})
export class DialogDistritosComponent {

  formulario: FormGroup;

  private fb = inject(FormBuilder);
  private distritoService = inject(DistritoService);

  constructor(
    public dialogRef: MatDialogRef<DialogUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Distrito | undefined
  ) {

    this.formulario = this.fb.group({
      nombre: [this.data?.nombre || '', [Validators.required]],
    })

  }

  closeDialog() {
    this.dialogRef.close();
  }

  guardar() {
    if (this.formulario.valid) {
      //Verificar si es nuevo o editar
      if (this.data?.id) {
        this.distritoService.update(this.data?.id, this.formulario.get('nombre')?.value).subscribe({
          next: (data: any) => {
            if (data?.isSuccess){
              Swal.fire({
                title: "Actualizado!",
                text: "Distrito actualizado.",
                icon: "success",
                confirmButtonText: "Continuar",
                confirmButtonColor: "#047CC4",
              }).then((result) => {
                if (result.isConfirmed) {
                  this.dialogRef.close()
                }
                this.distritoService.getAll()
              });

            }else{
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: data?.mensaje || 'Error al actualizar',
                confirmButtonText: "Cerrar",
                confirmButtonColor: "#047CC4",
              });
            }
          },
          error: (err:any) => console.log(err?.message)

        })
      }else{
        this.distritoService.add(this.formulario.get('nombre')?.value).subscribe({
          next: (data: any) => {
            if (data?.isSuccess){
              Swal.fire({
                title: "Insertado!",
                text: "Distrito insertado.",
                icon: "success",
                confirmButtonText: "Continuar",
                confirmButtonColor: "#047CC4",
              }).then((result) => {
                if (result.isConfirmed) {
                  this.dialogRef.close()
                }
                this.distritoService.getAll()
              });

            }else{
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: data?.mensaje || 'Error al insertar',
                confirmButtonText: "Cerrar",
                confirmButtonColor: "#047CC4",
              });
            }
          },
          error: (err) => console.log(err)

        })
      }
    }
  }
}
