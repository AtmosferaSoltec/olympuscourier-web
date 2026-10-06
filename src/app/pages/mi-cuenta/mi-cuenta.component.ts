import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsuarioService } from '../../services/usuario.service';

type Campo = 'passAnterior' | 'passNueva' | 'passNuevaConfirmar';

const MIN_LENGTH = 6;

function passwordsValidator(group: AbstractControl): ValidationErrors | null {
  const anterior = group.get('passAnterior')?.value;
  const nueva = group.get('passNueva')?.value;
  const confirmar = group.get('passNuevaConfirmar')?.value;
  const errors: ValidationErrors = {};
  if (nueva && confirmar && nueva !== confirmar) errors['noCoinciden'] = true;
  if (anterior && nueva && anterior === nueva) errors['igualAnterior'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-mi-cuenta',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './mi-cuenta.component.html',
})
export class MiCuentaComponent {
  private fb = inject(FormBuilder);
  usuarioService = inject(UsuarioService);

  readonly minLength = MIN_LENGTH;

  formulario = this.fb.nonNullable.group(
    {
      passAnterior: ['', Validators.required],
      passNueva: ['', [Validators.required, Validators.minLength(MIN_LENGTH)]],
      passNuevaConfirmar: ['', Validators.required],
    },
    { validators: passwordsValidator }
  );

  private valores = toSignal(this.formulario.valueChanges, {
    initialValue: this.formulario.getRawValue(),
  });

  visible = signal<Record<Campo, boolean>>({
    passAnterior: false,
    passNueva: false,
    passNuevaConfirmar: false,
  });

  enviando = signal(false);
  errorServidor = signal<string | null>(null);
  exito = signal(false);

  usuario = computed(() => this.usuarioService.usuario());

  nombreCompleto = computed(() => {
    const u = this.usuario();
    return `${u?.nombres ?? ''} ${u?.apellidos ?? ''}`.trim();
  });

  rol = computed(() => {
    const roles: Record<string, string> = { A: 'Admin', U: 'Usuario', S: 'Super Admin', D: 'Delivery' };
    return roles[(this.usuario()?.cod_rol ?? '').toUpperCase()] ?? 'Sin Rol';
  });

  iniciales = computed(() => {
    const u = this.usuario();
    return `${u?.nombres?.charAt(0) ?? ''}${u?.apellidos?.charAt(0) ?? ''}`.toUpperCase() || '?';
  });

  miembroDesde = computed(() => {
    const f = this.usuario()?.fecha_creacion;
    if (!f) return null;
    const d = new Date(f);
    return isNaN(d.getTime())
      ? null
      : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  /** Requisitos en vivo */
  requisitos = computed(() => {
    const v = this.valores();
    const nueva = v.passNueva ?? '';
    const confirmar = v.passNuevaConfirmar ?? '';
    const anterior = v.passAnterior ?? '';
    return [
      { ok: nueva.length >= MIN_LENGTH, texto: `Mínimo ${MIN_LENGTH} caracteres` },
      { ok: !!nueva && nueva !== anterior, texto: 'Distinta a la actual' },
      { ok: !!confirmar && nueva === confirmar, texto: 'Las contraseñas coinciden' },
    ];
  });

  /** 0 a 4 */
  fuerza = computed(() => {
    const p = this.valores().passNueva ?? '';
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) score++;
    return Math.max(1, score);
  });

  fuerzaInfo = computed(() => {
    const niveles = [
      { label: '', color: 'bg-gray-200', text: 'text-textos' },
      { label: 'Débil', color: 'bg-red-500', text: 'text-red-600' },
      { label: 'Regular', color: 'bg-amber-500', text: 'text-amber-600' },
      { label: 'Buena', color: 'bg-p-500', text: 'text-p-600' },
      { label: 'Excelente', color: 'bg-emerald-500', text: 'text-emerald-600' },
    ];
    return niveles[this.fuerza()];
  });

  esVisible(campo: Campo): boolean {
    return this.visible()[campo];
  }

  control(campo: Campo) {
    return this.formulario.controls[campo];
  }

  toggleVisible(campo: Campo) {
    this.visible.update((v) => ({ ...v, [campo]: !v[campo] }));
  }

  mostrarError(campo: Campo): boolean {
    const c = this.formulario.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  confirmarInvalido(): boolean {
    const c = this.formulario.controls.passNuevaConfirmar;
    return !!this.formulario.errors?.['noCoinciden'] && (c.touched || c.dirty);
  }

  limpiar() {
    this.formulario.reset();
    this.errorServidor.set(null);
    this.exito.set(false);
  }

  guardar() {
    this.errorServidor.set(null);
    this.exito.set(false);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { passAnterior, passNueva } = this.formulario.getRawValue();
    this.enviando.set(true);

    this.usuarioService.cambiarPass(passAnterior, passNueva).subscribe({
      next: (res: any) => {
        this.enviando.set(false);
        if (res?.isSuccess) {
          this.formulario.reset();
          this.exito.set(true);
        } else {
          this.errorServidor.set(res?.mensaje || 'No se pudo cambiar la contraseña.');
        }
      },
      error: (err: any) => {
        console.log(err);
        this.enviando.set(false);
        this.errorServidor.set('No se pudo conectar con el servidor. Inténtalo nuevamente.');
      },
    });
  }
}
