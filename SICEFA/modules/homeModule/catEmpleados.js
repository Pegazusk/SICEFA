var datos = null;

// Campo del formulario (terminacion del id) : donde se guarda en el empleado
// Los que empiezan con "Persona." van dentro del objeto Persona, igual que en clientes.json
const CAMPOS = {
   Nombre: "Persona.nombre",
   ApellidoPaterno: "Persona.apellidoPaterno",
   ApellidoMaterno: "Persona.apellidoMaterno",
   Genero: "Persona.genero",
   FechaNacimiento: "Persona.fechaNacimiento",
   RFC: "Persona.RFC",
   Curp: "Persona.Curp",
   Foto: "Persona.foto",
   Domicilio: "Persona.domicilio",
   CodPostal: "Persona.codPostal",
   Ciudad: "Persona.ciudad",
   Telefono: "Persona.telefono",
   EstadoCivil: "estadoCivil",
   Puesto: "puesto",
   SalarioMensual: "salarioMensual",
   FechaIngreso: "fechaIngreso",
   Correo: "correo"
};

// Lee el valor de un empleado, por ejemplo "Persona.nombre"
function leerCampo(empleado, ruta) {
   if (ruta.startsWith("Persona.")) {
      return empleado.Persona[ruta.replace("Persona.", "")];
   }
   return empleado[ruta];
}

function escribirCampo(empleado, ruta, valor) {
   if (ruta.startsWith("Persona.")) {
      empleado.Persona[ruta.replace("Persona.", "")] = valor;
   } else {
      empleado[ruta] = valor;
   }
}

export function cargarDatos() {
   fetch('./modules/homeModule/catEmpleados.json')
      .then(function (data) {
         return data.json();
      })
      .then(function (empleados) {
         if (datos == null) {
            datos = empleados;
         }
         // En Sucursal no existe el formulario de alta: ahi solo se pueden consultar y editar
         var puedeEliminar = document.getElementById("modalAltaEmpleado") != null;
         var tabla = "";
         for (var i = 0; i < datos.length; i++) {
            if (datos[i].estatus == 1) {
               tabla +=
                  "<tr>" +
                  "<td>" + datos[i].Persona.nombre + "</td>" +
                  "<td>" + datos[i].Persona.apellidoPaterno + "</td>" +
                  "<td>" + datos[i].Persona.apellidoMaterno + "</td>" +
                  "<td>" + datos[i].claveEmpleado + "</td>" +
                  "<td><button type=\"button\" class=\"btn btn-primary btn-sm me-2\" onclick=\"controlador.editarEmpleado(" + i + ")\"><i class=\"fa fa-edit\"></i> Editar</button>" +
                  (puedeEliminar ? "<button type=\"button\" class=\"btn btn-danger btn-sm\" onclick=\"controlador.eliminarEmpleado(" + i + ")\"><i class=\"fa fa-trash\"></i> Eliminar</button>" : "") +
                  "</td></tr>";
            }
         }
         document.getElementById("contenidoEmpleados").innerHTML = tabla;
         buscarEmpleado(document.getElementById("buscarEmpleado").value);
      });
}

// Oculta las filas que no contienen el texto escrito en el buscador
export function buscarEmpleado(texto) {
   document.querySelectorAll("#contenidoEmpleados tr").forEach(function (fila) {
      fila.style.display = fila.textContent.toLowerCase().includes(texto.toLowerCase()) ? "" : "none";
   });
}

export function eliminarEmpleado(indice) {
   Swal.fire({
      title: "Eliminar Empleado",
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
         datos[indice].estatus = 0;
         cargarDatos();
      } else {
         Swal.fire({
            icon: "error",
            title: "Cancelado"
         });
      }
   });
}

export function editarEmpleado(indice) {
   document.getElementById("editarEmpId").value = datos[indice].id;
   for (var campo in CAMPOS) {
      document.getElementById("editarEmp" + campo).value = leerCampo(datos[indice], CAMPOS[campo]);
   }
   bootstrap.Modal.getOrCreateInstance('#modalEditarEmpleado').show();
}

export function guardarEmpleado() {
   let id = document.getElementById("editarEmpId").value;
   datos.forEach(function (value) {
      if (value.id == id) {
         for (var campo in CAMPOS) {
            escribirCampo(value, CAMPOS[campo], document.getElementById("editarEmp" + campo).value);
         }
      }
   });

   cargarDatos();

   bootstrap.Modal.getOrCreateInstance('#modalEditarEmpleado').hide();
   Swal.fire({
      icon: "success",
      title: "Se ha Editado"
   });
}

export function altaEmpleado() {
   const hoy = new Date(Date.now());
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
      claveEmpleado: "",
      puesto: "",
      salarioMensual: "",
      fechaIngreso: "",
      correo: "",
      estadoCivil: "",
      estatus: 1
   };
   // Esto es para obtener el ultimo registro obtener el ID y luego sumarle 1 para que ahora de el siguiente consecutivo
   value.id = (parseInt(datos[datos.length - 1].id) + 1);
   for (var campo in CAMPOS) {
      escribirCampo(value, CAMPOS[campo], document.getElementById("agregarEmp" + campo).value);
      document.getElementById("agregarEmp" + campo).value = "";
   }
   // La clave se forma con las iniciales y la fecha de hoy, como los folios de los usuarios (AG20230901)
   value.claveEmpleado = (value.Persona.nombre.charAt(0) + value.Persona.apellidoPaterno.charAt(0)).toUpperCase() +
      hoy.getFullYear() + String(hoy.getMonth() + 1).padStart(2, "0") + String(hoy.getDate()).padStart(2, "0");
   datos.push(value);
   cargarDatos();
   bootstrap.Modal.getOrCreateInstance('#modalAltaEmpleado').hide();
}
