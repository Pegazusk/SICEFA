let menuInicio = document.getElementById("menuInicio");
let menuSucursal = document.getElementById("menuSucursal");
let menuProducto = document.getElementById("menuProducto");
let menuEmpleado = document.getElementById("menuEmpleado");
let menuCliente = document.getElementById("menuCliente");

let controlador = null;

let controladorSucursal = null;

menuInicio.addEventListener("click", function () {
    htmlInicio();
    menuInicio.classList.add("active-nav");
    menuSucursal.classList.remove("active-nav");
    menuProducto.classList.remove("active-nav");
    menuEmpleado.classList.remove("active-nav");
    menuCliente.classList.remove("active-nav");
});

function htmlInicio() {
    fetch('./modules/homeModule/home.html')
        .then(function (data) {
            return data.text();
        })
        .then(function (html) {
            document.getElementById("paginas").innerHTML = html;
        });
}
htmlInicio();

// El menu de Cliente cuando hace el click se ejecutara una funcion 
menuCliente.addEventListener("click", function () {
    // En este aso se debe de activar el menu y para hacer eso es agregar la clase active-nav al menu
    menuCliente.classList.add("active-nav");

    // Y en estos 4 de abajo se le debe de quitar
    menuInicio.classList.remove("active-nav");
    menuSucursal.classList.remove("active-nav");
    menuProducto.classList.remove("active-nav");
    menuEmpleado.classList.remove("active-nav");

    // En esta parte se debe de hacer una peticion para obtener el html de la pagina
    fetch('./modules/homeModuleSucursal/clientes/clientes.html')
        .then(function (data) {
            return data.text();
        })
        .then(function (html) {
            // Cuando regrese el valor en la variable html se debe de insertar en la pagina en este caso en 
            // paginasCentral.html
            document.getElementById("paginas").innerHTML = html;

            // Se importa el JavaScript
            import("./modules/homeModuleSucursal/clientes/clientes.js").then(function (data) {
                // Y se declara en la variable de controlador
                controlador = data;
                // El import solo ejecuta el JavaScript la primera vez, por eso la tabla se dibuja aqui
                controlador.cargarDatos();
            });
        });
});

menuProducto.addEventListener("click", function () {
    menuProducto.classList.add("active-nav");

    menuInicio.classList.remove("active-nav");
    menuSucursal.classList.remove("active-nav");
    menuCliente.classList.remove("active-nav");
    menuEmpleado.classList.remove("active-nav");

    fetch('./modules/homeModule/catProducto.html')
        .then(function (data) {
            return data.text();
        })
        .then(function (html) {
            document.getElementById("paginas").innerHTML = html;

            import("./modules/homeModule/catProducto.js").then(function (data) {
                controlador = data;
                controlador.cargarDatos();
            });
        });
});


menuSucursal.addEventListener("click", function (){

    menuSucursal.classList.add("active-nav");

    menuInicio.classList.remove("active-nav");
    menuCliente.classList.remove("active-nav");
    menuProducto.classList.remove("active-nav");
    menuEmpleado.classList.remove("active-nav");

    fetch('./modules/homeModuleSucursal/sucursales/catSucursal.html')
    .then(function (data) {
        return data.text();
    })
    .then(function (html) {
        document.getElementById("paginas").innerHTML = html;
        import("./modules/homeModuleSucursal/sucursales/sucursales.js").then(function (data) {
            controladorSucursal = data;
            controladorSucursal.cargarDatos();
        });
    });  
})

menuEmpleado.addEventListener("click", function () {
    menuEmpleado.classList.add("active-nav");

    menuInicio.classList.remove("active-nav");
    menuSucursal.classList.remove("active-nav");
    menuProducto.classList.remove("active-nav");
    menuCliente.classList.remove("active-nav");

    fetch('./modules/homeModule/catEmpleados.html')
        .then(function (data) {
            return data.text();
        })
        .then(function (html) {
            document.getElementById("paginas").innerHTML = html;

            import("./modules/homeModule/catEmpleados.js").then(function (data) {
                controlador = data;
                controlador.cargarDatos();
            });
        });
});
