var ventas = null;

// Se ejecuta cada vez que se entra al modulo: el json solo se lee la primera vez
export function cargarDatos() {
    fetch('./modules/homeModuleSucursal/ventas/ventas.json')
        .then(function (data) {
            return data.json();
        })
        .then(function (datos) {
            if (ventas == null) {
                ventas = datos;
            }
            mostrarVentas();
        });
}

export function registrarVenta() {
    const cliente = document.getElementById('cliente').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const empleado = document.getElementById('empleado').value;
    const productos = document.getElementById('productos').value;
    const cantidad = document.getElementById('cantidad').value;
    const precioUnitario = document.getElementById('precioUnitario').value;

    if (!cliente || !fecha || !hora || !empleado || !productos || !cantidad || !precioUnitario) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const nuevaVenta = {
        cliente: cliente,
        fecha: fecha,
        hora: hora,
        empleado: empleado,
        productos: productos,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        activa: true
    };

    ventas.push(nuevaVenta);

    alert('Venta registrada correctamente');

    document.getElementById('registroVentasForm').reset();

    mostrarVentas();
}

export function cancelarVenta(index) {
    ventas[index].activa = false;

    alert('Venta cancelada correctamente');

    mostrarVentas();
}

// Dibuja las ventas que cumplen la condicion; sin condicion las dibuja todas
function mostrarVentas(condicion) {
    const listaVentasBody = document.getElementById('listaVentasBody');
    listaVentasBody.innerHTML = '';

    ventas.forEach((venta, index) => {
        if (condicion && !condicion(venta)) {
            return;
        }
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
                <td>${index + 1}</td>
                <td>${venta.cliente}</td>
                <td>${venta.fecha}</td>
                <td>${venta.hora}</td>
                <td>${venta.empleado}</td>
                <td>${venta.productos}</td>
                <td>${venta.cantidad}</td>
                <td>${venta.precioUnitario}</td>
                <td>${venta.activa ? 'Activa' : 'Inactiva'}</td>
                <td>
                    ${venta.activa ? `<button onclick="controlador.cancelarVenta(${index})" class="btn btn-danger btn-sm">Cancelar</button>` : ''}
                </td>
            `;

        listaVentasBody.appendChild(nuevaFila);
    });
}

export function filtrarVentas() {
    const empleadoFiltro = document.getElementById('sucursalFiltro').value;
    const estadoFiltro = document.getElementById('estadoFiltro').value;

    mostrarVentas(venta =>
        (venta.empleado.toLowerCase().includes(empleadoFiltro.toLowerCase())) &&
        ((estadoFiltro === 'activa' && venta.activa) || (estadoFiltro === 'inactiva' && !venta.activa))
    );
}
