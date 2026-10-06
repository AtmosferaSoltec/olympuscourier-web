import { Route } from '@angular/router';
import { AgregarRepartoComponent } from '../agregar-reparto/agregar-reparto.component';
import { ClientesComponent } from '../clientes/clientes.component';
import { ComprobantesComponent } from '../comprobantes/comprobantes.component';
import { DetalleRepartoComponent } from '../detalle-reparto/detalle-reparto.component';
import { PanelAdminComponent } from '../panel-admin/panel-admin.component';
import { RepartosComponent } from '../repartos/repartos.component';
import { GenerarComprobanteComponent } from '../generar-comprobante/generar-comprobante.component';
import { isAdminGuard } from '../../guard/is-admin.guard';
import { PagosComponent } from '../pagos/pagos.component';
import { MiCuentaComponent } from '../mi-cuenta/mi-cuenta.component';

export default [
    { path: 'repartos', component: RepartosComponent },
    { path: 'detalle-reparto/:id', component: DetalleRepartoComponent },
    { path: 'editar-reparto/:id', component: AgregarRepartoComponent },
    { path: 'generar-comprobante', component: GenerarComprobanteComponent },
    { path: 'clientes', component: ClientesComponent },
    { path: 'comprobantes', component: ComprobantesComponent },
    { path: 'pagos', component: PagosComponent },
    { path: 'mi-cuenta', component: MiCuentaComponent },
    {
        path: 'panel-admin',
        component: PanelAdminComponent,
        loadChildren: () => import('../panel-admin/panel.routes'),
        canActivate: [isAdminGuard]
    },
    { path: 'agregar-reparto', component: AgregarRepartoComponent },
] as Route[]