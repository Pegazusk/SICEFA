// En Sucursal los productos solo se consultan: es la misma lista del catalogo de Central
export function cargarDatos() {
    fetch('./modules/homeModule/catProducto.json')
        .then(function (data) {
            return data.json();
        })
        .then(function (productos) {
            var tabla = "";
            for (var i = 0; i < productos.length; i++) {
                if (productos[i].estatus == 1) {
                    tabla +=
                        "<tr>" +
                        "<td>" + productos[i].nombre + "</td>" +
                        "<td>" + productos[i].nombreGenerico + "</td>" +
                        "<td>" + productos[i].unidadDeMedida + "</td>" +
                        "<td>" + productos[i].presentacion + "</td>" +
                        "<td>" + productos[i].concentracion + "</td>" +
                        "<td>" + productos[i].precioUnitario + "</td>" +
                        "</tr>";
                }
            }
            document.getElementById("productosSucursalBody").innerHTML = tabla;
        });
}
