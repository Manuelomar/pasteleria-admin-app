import { authService } from "./auth.service";
import { productosService } from "./productos.service";
import { clientesService } from "./clientes.service";
import { ventasService } from "./ventas.service";
import { movimientosService } from "./movimientos.service";
import { usuariosService } from "./usuarios.service";
import { entregasService } from "./entregas.service";

export const api = {
  auth: authService,
  productos: productosService,
  clientes: clientesService,
  ventas: ventasService,
  movimientos: movimientosService,
  usuarios: usuariosService,
  entregas: entregasService,
};

export {
  authService,
  productosService,
  clientesService,
  ventasService,
  movimientosService,
  usuariosService,
  entregasService,
};
