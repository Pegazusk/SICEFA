let menuInicio = document.getElementById("menuInicio");
let menuCliente = document.getElementById("menuCliente");
let menuCompra = document.getElementById("menuCompra");
let menuEmpleado = document.getElementById("menuEmpleado");
let menuProducto = document.getElementById("menuProducto");
let menuVenta = document.getElementById("menuVenta");

let menus = [menuInicio, menuCliente, menuCompra, menuEmpleado, menuProducto, menuVenta];

let controlador = null;

// Marca el menu seleccionado, inserta el html del modulo y, si tiene JavaScript, lo importa
function cargarModulo(menu, rutaHtml, rutaJs) {
    menus.forEach(function (m) {
        m.classList.remove("active-nav");
    });
    menu.classList.add("active-nav");

    fetch(rutaHtml)
        .then(function (data) {
            return data.text();
        })
        .then(function (html) {
            document.getElementById("paginas").innerHTML = html;

            if (rutaJs) {
                import(rutaJs).then(function (data) {
                    controlador = data;
                    // El import solo ejecuta el JavaScript la primera vez, por eso la tabla se dibuja aqui
                    controlador.cargarDatos();
                });
            }
        });
}

menuInicio.addEventListener("click", function () {
    cargarModulo(menuInicio, './modules/homeModuleSucursal/homeSucursal.html');
});

menuCliente.addEventListener("click", function () {
    cargarModulo(menuCliente, './modules/homeModuleSucursal/clientes/clientes.html', './modules/homeModuleSucursal/clientes/clientes.js');
});

menuCompra.addEventListener("click", function () {
    cargarModulo(menuCompra, './modules/homeModuleSucursal/compra/compra.html', './modules/homeModuleSucursal/compra/compra.js');
});

menuEmpleado.addEventListener("click", function () {
    cargarModulo(menuEmpleado, './modules/homeModuleSucursal/empleados/empleados.html', './modules/homeModule/catEmpleados.js');
});

menuProducto.addEventListener("click", function () {
    cargarModulo(menuProducto, './modules/homeModuleSucursal/productos/productos.html', './modules/homeModuleSucursal/productos/productos.js');
});

menuVenta.addEventListener("click", function () {
    cargarModulo(menuVenta, './modules/homeModuleSucursal/ventas/ventas.html', './modules/homeModuleSucursal/ventas/ventas.js');
});

cargarModulo(menuInicio, './modules/homeModuleSucursal/homeSucursal.html');
