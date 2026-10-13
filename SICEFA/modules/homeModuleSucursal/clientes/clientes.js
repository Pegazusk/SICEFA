var datos = null;
// El html se vuelve a insertar cada vez que se entra al modulo, por eso las ventanas emergentes se obtienen al usarlas
export function cargarDatos() {
   fetch('./modules/homeModuleSucursal/clientes/clientes.json')
      .then(function (data) {
         return data.json();
      })
      .then(function (clientes) {
         if (datos == null) {
            datos = clientes;
         }
         var tabla = "";
         for (var i = 0; i < datos.length; i++) {
            if (datos[i].estatus == 1) {
               tabla +=
                  "<tr id=\"contenido" + i + "\">" +
                  "<td>" + datos[i].Persona.nombre + " " + datos[i].Persona.apellidoPaterno + " " + datos[i].Persona.apellidoMaterno + "</td>" +
                  "<td>" + datos[i].Persona.RFC + "</td>" +
                  "<td>" + datos[i].Persona.domicilio + "</td>" +
                  "<td>" + datos[i].Persona.telefono + "</td>" +
                  "<td>" + datos[i].correo + "</td>" +
                  "<td>" + datos[i].fechaRegistro + "</td>" +

                  "<td><div class=\"d-flex\"><button type=\"button\" class=\"btn btn-primary btn-sm me-2\" onclick=\"controlador.editarCliente(" + i + ")\">Editar</button><button type=\"button\" class=\"btn btn-danger btn-sm\" onclick=\"controlador.eliminarCliente(" + i + ")\">Eliminar</button></td>" +
                  "</div></tr>";
            }
         }
         document.getElementById("contenido").innerHTML = tabla;
         buscarCliente(document.getElementById("buscarCliente").value);
      });

}

// Oculta las filas que no contienen el texto escrito en el buscador
export function buscarCliente(texto) {
   document.querySelectorAll("#contenido tr").forEach(function (fila) {
      fila.style.display = fila.textContent.toLowerCase().includes(texto.toLowerCase()) ? "" : "none";
   });
}

export function eliminarCliente(id) {
   Swal.fire({
      title: "Eliminar Cliente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No"
   }).then((result) => {
      if (result.isConfirmed) {
         Swal.fire({
            icon: "success",
            title: "Se ha Eliminado"
         });
         datos[id].estatus = 0;
         document.getElementById("contenido" + id).remove();
      } else {
         Swal.fire({
            icon: "error",
            title: "Cancelado"
         });
      }
   });
}

export function editarCliente(indice) {

   document.getElementById("editarId").value = datos[indice].id;
   document.getElementById("editarrNombre").value = datos[indice].Persona.nombre;
   document.getElementById("editarApellidoPaterno").value = datos[indice].Persona.apellidoPaterno;
   document.getElementById("editarApellidoMaterno").value = datos[indice].Persona.apellidoMaterno;
   document.getElementById("editarGenero").value = datos[indice].Persona.genero;
   document.getElementById("editarFechaNacimiento").value = datos[indice].Persona.fechaNacimiento;
   document.getElementById("editarRFC").value = datos[indice].Persona.RFC;
   document.getElementById("editarCurp").value = datos[indice].Persona.Curp;
   document.getElementById("editarFoto").value = datos[indice].Persona.foto;
   document.getElementById("editarDomicilio").value = datos[indice].Persona.domicilio;
   document.getElementById("editarCodPostal").value = datos[indice].Persona.codPostal;
   document.getElementById("editarCiudad").value = datos[indice].Persona.ciudad;
   document.getElementById("editarEstado").value = datos[indice].Persona.estado;
   document.getElementById("editarTelefono").value = datos[indice].Persona.telefono;
   document.getElementById("editarFechaRegistro").value = datos[indice].fechaRegistro;
   document.getElementById("editarCorreo").value = datos[indice].correo;
   bootstrap.Modal.getOrCreateInstance('#modalEditarCliente').show();

}

export function guardarCliente() {
   

   let id = document.getElementById("editarId").value;
   let nombre = document.getElementById("editarrNombre").value;
   let apellidoPaterno = document.getElementById("editarApellidoPaterno").value;
   let apellidoMaterno = document.getElementById("editarApellidoMaterno").value;
   let genero = document.getElementById("editarGenero").value;
   let fechaNacimiento = document.getElementById("editarFechaNacimiento").value;
   let RFC = document.getElementById("editarRFC").value;
   let Curp = document.getElementById("editarCurp").value;
   let foto = document.getElementById("editarFoto").value;
   let domicilio = document.getElementById("editarDomicilio").value;
   let codPostal = document.getElementById("editarCodPostal").value;
   let ciudad = document.getElementById("editarCiudad").value;
   let estado = document.getElementById("editarEstado").value;
   let telefono = document.getElementById("editarTelefono").value;
   let fechaRegistro = document.getElementById("editarFechaRegistro").value;
   let correo = document.getElementById("editarCorreo").value;
   var datosG = [];
   datos.forEach(function (value, indice) {
      if (value.id == id) {
         value.Persona.nombre = nombre;
         value.Persona.apellidoPaterno = apellidoPaterno;
         value.Persona.apellidoMaterno = apellidoMaterno;
         value.Persona.genero = genero;
         value.Persona.fechaNacimiento = fechaNacimiento;
         value.Persona.RFC = RFC;
         value.Persona.Curp = Curp;
         value.Persona.foto = foto;
         value.Persona.domicilio = domicilio;
         value.Persona.codPostal = codPostal;
         value.Persona.ciudad = ciudad;
         value.Persona.estado = estado;
         value.Persona.telefono = telefono;
         value.fechaRegistro = fechaRegistro;
         value.correo = correo;
      }
      datosG.push(value);
   });

   datos = datosG;
   cargarDatos();

   bootstrap.Modal.getOrCreateInstance('#modalEditarCliente').hide();
   Swal.fire({
      icon: "success",
      title: "Se ha Editado"
   });
}

export function altaCliente() {
   const hoy = new Date(Date.now());
   let nombre = document.getElementById("agregarNombre").value;
   let apellidoPaterno = document.getElementById("agregarApellidoPaterno").value;
   let apellidoMaterno = document.getElementById("agregarApellidoMaterno").value;
   let genero = document.getElementById("agregarGenero").value;
   let fechaNacimiento = document.getElementById("agregarFechaNacimiento").value;
   let RFC = document.getElementById("agregarRFC").value;
   let curp = document.getElementById("agregarCurp").value;
   let foto = document.getElementById("agregarFoto").value;
   let domicilio = document.getElementById("agregarDomicilio").value;
   let codPostal = document.getElementById("agregraCodPostal").value;
   let ciudad = document.getElementById("agregarCiudad").value;
   let estado = document.getElementById("agregarEstado").value;
   let telefono = document.getElementById("agregarTelefono").value;
   let correo = document.getElementById("agregarCorreo").value;
   let value = {
      id: 1,
      Persona: {
         nombre: "",
         apellidoPaterno: "",
         apellidoMaterno: "",
         genero: "",
         fechaNacimiento: "",
         RFC: "",
         Curp: "",
         foto: "",
         domicilio: "",
         codPostal: "",
         ciudad: "",
         estado: "",
         telefono: ""
      },
      fechaRegistro: hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate(),
      correo: "",
      estatus: 1
   };
   // Esto es para obtener el ultimo registro obtener el ID y luego sumarle 1 para que ahora de el siguiente consecutivo
   value.id = (parseInt(datos[datos.length - 1].id) + 1);
   value.Persona.nombre = nombre;
   value.Persona.apellidoPaterno = apellidoPaterno;
   value.Persona.apellidoMaterno = apellidoMaterno;
   value.Persona.genero = genero;
   value.Persona.fechaNacimiento = fechaNacimiento;
   value.Persona.RFC = RFC;
   value.Persona.Curp = curp;
   value.Persona.foto = foto;
   value.Persona.domicilio = domicilio;
   value.Persona.codPostal = codPostal;
   value.Persona.ciudad = ciudad;
   value.Persona.estado = estado;
   value.Persona.telefono = telefono;
   value.correo = correo;
   datos.push(value);
   cargarDatos();
   bootstrap.Modal.getOrCreateInstance('#modalAgregarCliente').hide();
}