import { Component, OnInit, inject } from '@angular/core';
import { EstadoFilterComponent } from '../estado-filter/estado-filter.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Usuario } from '../../../../interfaces/usuario';
import { MatDialog } from '@angular/material/dialog';
import { DialogUsuarioComponent } from '../dialogs/dialog-usuario/dialog-usuario.component';
import Swal from 'sweetalert2';
import { MostrarRolPipe } from "../../../../pipes/mostrar-rol.pipe";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { MostrarActivoPipe } from "../../../../pipes/mostrar-activo.pipe";
import { FormatTelfPipe } from "../../../../pipes/format-telf.pipe";
import { PanelAdminService } from '../../panel-admin.service';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrl: './usuarios.component.scss',
    imports: [EstadoFilterComponent, CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MostrarRolPipe, ReactiveFormsModule, MostrarActivoPipe, FormatTelfPipe]
})
export class UsuariosComponent {

  formulario: FormGroup;

  panelAdminService = inject(PanelAdminService)
  dialog = inject(MatDialog)

  constructor(
    private fb: FormBuilder
  ) {
    this.formulario = this.fb.group({
      estado: ['S']
    })
  }

  skeleton = [1, 2, 3, 4, 5];

  setEstado(estado: 'S' | 'N') {
    this.formulario.patchValue({ estado });
    this.panelAdminService.listarUsuarios(estado);
  }

  iniciales(item: Usuario): string {
    return `${item.nombres?.[0] ?? ''}${item.apellidos?.[0] ?? ''}`.toUpperCase();
  }

  openDialog(item: Usuario | undefined = undefined) {
    this.dialog.open(DialogUsuarioComponent, {
      data: item,
      width: "560px",
      maxWidth: "95vw",
      panelClass: "adm-dialog-panel"
    });

  }

  eliminar(item: Usuario, estado: 'S' | 'N') {
    let texto = "";
    if (estado == "N") {
      texto = "Se eliminara este usuario!"
    } else if (estado === "S") {
      texto = "Se restaurara este usuario!"
    }
    Swal.fire({
      title: "¿Estas seguro?",
      text: texto,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      confirmButtonColor: "#047CC4",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        if (!item.id) {
          return alert("No se pudo eliminar el usuario");
        }
        this.panelAdminService.setEstadoUsuario(item.id, estado)
      }
    });
  }

}
