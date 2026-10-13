// Declaración de variable en nulo
var datos = null;
// El html se vuelve a insertar cada vez que se entra al modulo, por eso las ventanas emergentes se obtienen al usarlas
// Funcion para realizar la carga los datos del json
export function cargarDatos() {
    // Petición hacia el archivo json
    fetch('./modules/homeModuleSucursal/sucursales/sucursales.json')
        .then(function (data) {
            // Se retorna el contenido del archivo para manipularlo
            return data.json();
        })
        .then(function (sucursales) {
            // Se valida si la variable esta null entonces se cargaran una sola vez los datos del json
            if (datos == null) {
                // Asignación del json a la variable global
                datos = sucursales;
            }
            // Declaración de variable vacia
            var tabla = "";
            // Ciclo para recorrer las filas de los datos
            for (var i = 0; i < datos.length; i++) {
                // Validar si esta activo la sucursal con un estatus igual a 1
                if (datos[i].estatus == 1) {
                    // Creacion de la tabla en html 
                    tabla +=
                        "<tr>" +
                        "<td>" + datos[i].nombre + "</td>" +
                        "<td>" + datos[i].Domicilio.calle + "</td>" +
                        "<td>" + datos[i].Domicilio.colonia + "</td>" +
                        "<td>" + datos[i].Domicilio.ciudad + "</td>" +
                        "<td>" + datos[i].Domicilio.estado + "</td>" +
                        "<td>" + datos[i].Domicilio.codPostal + "</td>" +
                        "<td>" + datos[i].telefono + "</td>" +
                        "<td><div class=\"d-flex\"><button type=\"button\" class=\"btn btn-primary btn-sm me-2\" onclick=\"controladorSucursal.mostrarSucursal(" + i + ")\">Editar</button><button type=\"button\" class=\"btn btn-danger btn-sm\" onclick=\"controladorSucursal.eliminarSucursal(" + i + ")\">Eliminar</button></td>" +
                        "</div></tr>";
                }
            }
            // Insertar la tabla dibujada en el codigo anterior
            document.getElementById("contenido").innerHTML = tabla;
        });
}

// Guardar los datos de la sucursal
export function altaSucursal() {
    // De claración de las variables obteniendo el valor del los input
    let nombre = document.getElementById("txtNombre").value;
    let calle = document.getElementById("txtCalle").value;
    let colonia = document.getElementById("txtColonia").value;
    let ciudad = document.getElementById("txtCiudad").value;
    let estado = document.getElementById("txtEstado").value;
    let codPostal = document.getElementById("txtCodPostal").value;
    let longitud = document.getElementById("txtLongitud").value;
    let latitud = document.getElementById("txtLatitud").value;
    let telefono = document.getElementById("txtTelefono").value;

    // Creación de un objeto el cual se isertaran los datos nuevos
    let value = {
        id: 1,
        nombre: "",
        Domicilio: {
            calle: "",
            colonia: "",
            ciudad: "",
            estado: "",
            codPostal: ""
        },
        Coordenadas: {
            longitud: "",
            latitud: ""
        },
        telefono: "",
        estatus: 1
    };
    // Cambiando los valodes de cada uno de los objetos
    value.id = (parseInt(datos[datos.length - 1].id) + 1);
    value.nombre = nombre;
    value.Domicilio.calle = calle;
    value.Domicilio.colonia = colonia;
    value.Domicilio.ciudad = ciudad;
    value.Domicilio.estado = estado;
    value.Domicilio.codPostal = codPostal;
    value.Coordenadas.longitud = longitud;
    value.Coordenadas.latitud = latitud;
    value.telefono = telefono;
    // Agregando el objeto a la variable global
    datos.push(value);
    // Ejecutando la funcion de cargarDatos y volver a dibujar el html
    cargarDatos();
    // Ocultando la ventana emergente del Alta de la Sucursal
    bootstrap.Modal.getOrCreateInstance('#modalAltaSucursal').hide();
}

// Mostrar los valodes en el modal de editar Sucursal
export function mostrarSucursal(indice) {
    // Asignando los valodes utilizando el indice del valor a mostrar
    document.getElementById("indice").value = indice;
    document.getElementById("txtEditarNombre").value = datos[indice].nombre;
    document.getElementById("txtEditarCodPostal").value = datos[indice].Domicilio.codPostal;;
    document.getElementById("txtEditarCalle").value = datos[indice].Domicilio.calle;
    document.getElementById("txtEditarTelefono").value = datos[indice].telefono;
    document.getElementById("txtEditarColonia").value = datos[indice].Domicilio.colonia;
    document.getElementById("txtEditarLongitud").value = datos[indice].Coordenadas.longitud;
    document.getElementById("txtEditarCiudad").value = datos[indice].Domicilio.ciudad;
    document.getElementById("txtEditarLatitud").value = datos[indice].Coordenadas.latitud;
    document.getElementById("txtEditarEstado").value = datos[indice].Domicilio.estado;

    // Mostrando la ventana emergente
    bootstrap.Modal.getOrCreateInstance('#modalEditarSucursal').show();
}

// Actualizando los datos de la sucursal
export function editarSucursal() {
    // Declarando los valores de cada objeto
    let indice = document.getElementById("indice").value;
    let nombre = document.getElementById("txtEditarNombre").value;
    let calle = document.getElementById("txtEditarCalle").value;
    let colonia = document.getElementById("txtEditarColonia").value;
    let ciudad = document.getElementById("txtEditarCiudad").value;
    let estado = document.getElementById("txtEditarEstado").value;
    let codPostal = document.getElementById("txtEditarCodPostal").value;
    let longitud = document.getElementById("txtEditarLongitud").value;
    let latitud = document.getElementById("txtEditarLatitud").value;
    let telefono = document.getElementById("txtEditarTelefono").value;

    // Cambiando el valor de los objetos utilizando el indice
    datos[indice].nombre = nombre;
    datos[indice].Domicilio.calle = calle;
    datos[indice].Domicilio.colonia = colonia;
    datos[indice].Domicilio.ciudad = ciudad;
    datos[indice].Domicilio.estado = estado;
    datos[indice].Domicilio.codPostal = codPostal;
    datos[indice].Coordenadas.longitud = longitud;
    datos[indice].Coordenadas.latitud = latitud;
    datos[indice].telefono = telefono;
    // Dibujar nuevamente el html
    cargarDatos();
    // Ocultar la ventana emergente de editar Sucursal
    bootstrap.Modal.getOrCreateInstance('#modalEditarSucursal').hide();
}

// Eliminar la Sucursal
export function eliminarSucursal(indice) {
    // Mostrar una ventana emergente la cual es para confirmar o cancelar la eliminación 
    Swal.fire({
        title: "Eliminar Sucursal",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si",
        cancelButtonText: "No"
    }).then((result) => {
        // Validar si confirmo la eliminación
        if (result.isConfirmed) {
            // Mostrar una alerta de confirmación
            Swal.fire({
                icon: "success",
                title: "Se ha Eliminado"
            });
            // Editando el estatus del registro
            datos[indice].estatus = 0;
            // Dibujar nuevamente el html
            cargarDatos();
        } else {
            // Mostrar una alerta de Cancelado
            Swal.fire({
                icon: "error",
                title: "Cancelado"
            });
        }
    });
}