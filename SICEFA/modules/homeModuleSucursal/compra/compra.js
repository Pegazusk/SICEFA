var pedidos = null;

// Se ejecuta cada vez que se entra al modulo: el json solo se lee la primera vez
export function cargarDatos() {
    fetch('./modules/homeModuleSucursal/compra/compra.json')
        .then(function (data) {
            return data.json();
        })
        .then(function (compras) {
            if (pedidos == null) {
                pedidos = compras;
            }
            document.getElementById('listaPedidosBody').innerHTML = '';
            pedidos.forEach(agregarPedidoATabla);
        });
}

export function realizarPedido() {
    const producto = document.getElementById('producto').value;
    const cantidad = document.getElementById('cantidad').value;

    if (!producto || !cantidad) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const nuevoPedido = {
        id: generateId(),
        producto: producto,
        cantidad: cantidad,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        estado: 'Pendiente'
    };

    pedidos.push(nuevoPedido);

    agregarPedidoATabla(nuevoPedido);
    document.getElementById('pedidoCompraForm').reset();
}

function agregarPedidoATabla(pedido) {
    const listaPedidosBody = document.getElementById('listaPedidosBody');

    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.cantidad}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.hora}</td>
            <td>${pedido.estado}</td>
            <td><button class="btn btn-danger btn-sm" onclick="controlador.eliminarPedido(${pedido.id})">Eliminar</button></td>
        `;

    listaPedidosBody.appendChild(nuevaFila);
}

export function eliminarPedido(id) {
    pedidos = pedidos.filter(pedido => pedido.id !== id);

    document.getElementById('listaPedidosBody').innerHTML = '';

    pedidos.forEach(agregarPedidoATabla);
}

// El siguiente consecutivo despues del id mas grande
function generateId() {
    return pedidos.reduce((mayor, pedido) => Math.max(mayor, pedido.id), 0) + 1;
}
