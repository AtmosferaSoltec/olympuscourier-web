import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AppService } from '../../app.service';
import { UsuarioService } from '../../services/usuario.service';
import Swal from 'sweetalert2';

interface MenuItem {
  link: string;
  icon: string;
  name: string;
  /** Rutas hijas que también marcan el ítem como activo */
  match: string[];
}

const STORAGE_KEY = 'oc.sidebar.expanded';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, MatIconModule, MatTooltipModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  router = inject(Router);
  usuarioService = inject(UsuarioService);
  appService = inject(AppService);

  listMenu: MenuItem[] = [
    {
      link: 'repartos',
      icon: 'local_shipping',
      name: 'Repartos',
      match: ['repartos', 'detalle-reparto', 'editar-reparto', 'agregar-reparto'],
    },
    { link: 'clientes', icon: 'group', name: 'Clientes', match: ['clientes'] },
    {
      link: 'comprobantes',
      icon: 'description',
      name: 'Comprobantes',
      match: ['comprobantes', 'generar-comprobante'],
    },
    { link: 'pagos', icon: 'payments', name: 'Pagos', match: ['pagos'] },
  ];

  adminItem: MenuItem = {
    link: 'panel-admin/usuarios',
    icon: 'admin_panel_settings',
    name: 'Panel Admin',
    match: ['panel-admin'],
  };

  /** Desktop: sidebar expandido o compacto (persistido) */
  expanded = signal(this.leerPreferencia());
  /** Mobile: drawer abierto */
  mobileOpen = signal(false);

  isDesktop = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 768px)')
      .pipe(map((r) => r.matches)),
    { initialValue: window.matchMedia('(min-width: 768px)').matches }
  );

  /** Sidebar en modo solo-íconos */
  compact = computed(() => this.isDesktop() && !this.expanded());

  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** Primer segmento después de /menu/ */
  private seccion = computed(() => this.url().split('?')[0].split('/')[2] ?? '');

  seccionActual = computed(() => {
    const todos = [...this.listMenu, this.adminItem];
    if (this.enMiCuenta()) return 'Mi cuenta';
    return todos.find((i) => this.isActive(i))?.name ?? 'Olympus Courier';
  });

  saludo = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, String(this.expanded()));
      } catch {}
    });
    // Bloquea el scroll del body mientras el drawer mobile está abierto
    effect(() => {
      document.body.style.overflow = this.mobileOpen() && !this.isDesktop() ? 'hidden' : '';
    });
    // Si se pasa a desktop con el drawer abierto, se cierra
    effect(() => {
      if (this.isDesktop()) this.mobileOpen.set(false);
    });
  }

  ngOnInit(): void {
    this.usuarioService.validarSesion();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.mobileOpen()) {
      this.mobileOpen.set(false);
    }
    // Ctrl/Cmd + B alterna el sidebar en desktop
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && this.isDesktop()) {
      e.preventDefault();
      this.toggleExpanded();
    }
  }

  isActive(item: MenuItem): boolean {
    return item.match.includes(this.seccion());
  }

  toggleExpanded() {
    this.expanded.update((v) => !v);
  }

  openMobile() {
    this.mobileOpen.set(true);
  }

  close() {
    this.mobileOpen.set(false);
  }

  closeOnMobile() {
    if (!this.isDesktop()) this.mobileOpen.set(false);
  }

  esAdmin(): boolean {
    const codRol = this.usuarioService.usuario()?.cod_rol;
    return codRol === 'A' || codRol === 'S';
  }

  getIniciales(): string {
    const nombres = this.usuarioService.usuario()?.nombres || '';
    const apellidos = this.usuarioService.usuario()?.apellidos || '';
    const iniciales = `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
    return iniciales || '?';
  }

  /** Página "Mi cuenta" (perfil y cambio de contraseña) */
  enMiCuenta = computed(() => this.seccion() === 'mi-cuenta');

  logout() {
    this.closeOnMobile();
    Swal.fire({
      title: '¿Estas seguro?',
      text: 'Cerrar sesión',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#047CC4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        this.router.navigate(['login']);
      }
    });
  }

  getRol() {
    const codRol = this.usuarioService.usuario()?.cod_rol || '';
    switch (codRol.toUpperCase()) {
      case 'A':
        return 'Admin';
      case 'U':
        return 'Usuario';
      case 'S':
        return 'Super Admin';
      case 'D':
        return 'Delivery';
      default:
        return 'Sin Rol';
    }
  }

  getNombre() {
    const nombres = this.usuarioService.usuario()?.nombres || '';
    const apePaterno = this.usuarioService.usuario()?.apellidos || '';
    const primeraLetraApellido = apePaterno.length > 0 ? apePaterno.charAt(0) + '.' : '';
    return `${nombres} ${primeraLetraApellido}`;
  }

  private leerPreferencia(): boolean {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v !== null) return v === 'true';
    } catch {}
    return window.matchMedia('(min-width: 1280px)').matches;
  }
}
