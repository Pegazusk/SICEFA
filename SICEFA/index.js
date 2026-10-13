let usuarios;


function cargarUsuarios() {

    return fetch("usuariosCentral.json")
        .then(response => response.json())
        .then(data => {
            usuarios = data;
            return data;
        })
        .catch(error => console.error('Error al cargar usuarios:', error));
}




function logear() {
    let user = document.getElementById("usuarioAdmin").value;
    let pass = document.getElementById("clave").value;

    const usuarioEncontrado = usuarios.find(u =>
        u.usuario.nombreUsuario === user && u.usuario.contrasenia === pass
    );

    if (usuarioEncontrado) {
        window.location = "paginasCentral.html";
    } else {
        // Se ejecuta el SweetAlert2 y se le manda un objeto con 2 parametros
        Swal.fire({
            // El tipo de alerta: success, error
            icon: "error",
            // EL titulo de la alerta
            title: "USUARIO O CONTRASEÑA INCORRECTAS",
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios().then(() => {

    });
});
