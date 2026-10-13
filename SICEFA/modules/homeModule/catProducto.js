const productos = [];

const getElement = (id) => document.getElementById(id);

const MODAL_ALTA_ID = 'modalAltaProducto';
const MODAL_ELIMINAR_ID = 'modalEliminitProducto';
const MODAL_EDITAR_ID = 'modalEditarProducto';

// Propiedad del producto (igual que en catProducto.json) : terminacion del id del input en los formularios
const CAMPOS_ALTA = {
    nombre: 'nombreNuevo',
    nombreGenerico: 'nombreGenericoNuevo',
    formaFarmaceutica: 'formulaFarmaceuticaNueva',
    unidadDeMedida: 'unidadMedidaNueva',
    presentacion: 'presentacionNueva',
    principalIndicacion: 'principalIndicacionNuevo',
    contraindicaciones: 'contraIndicacionesNuevo',
    concentracion: 'concentracionNuevo',
    unidadesEnEnvase: 'unidadesEnvaseNuevas',
    precioUnitario: 'precioUnitarioNuevo',
    rutaDeLaFoto: 'rutaFotoNueva',
    codigoDeBarras: 'codigoBarrasNuevo',
    estatus: 'estatusNuevo'
};

const CAMPOS_EDITAR = {
    nombre: 'nombreEdit',
    nombreGenerico: 'nombreGenericoEdit',
    formaFarmaceutica: 'formulaFarmaceuticaEdit',
    unidadDeMedida: 'unidadMedidaEdit',
    presentacion: 'presentacionEdit',
    principalIndicacion: 'principalIndicacionEdit',
    contraindicaciones: 'contraIndicacionesEdit',
    concentracion: 'concentracionEdit',
    unidadesEnEnvase: 'unidadesEnvaseEdit',
    precioUnitario: 'precioUnitarioEdit',
    rutaDeLaFoto: 'rutaFotoEdit',
    codigoDeBarras: 'codigoBarrasEdit',
    estatus: 'estatusEdit'
};

// Se ejecuta cada vez que se entra al modulo: el json solo se lee la primera vez
export function cargarDatos() {
    getElement('btnAgregarProducto').onclick = agregarNuevoProducto;

    if (productos.length > 0) {
        mostrarProductos(true);
        return;
    }

    fetch('./modules/homeModule/catProducto.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`¡Error HTTP! Estado: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            productos.push(...data);
            mostrarProductos(true);
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
}

function limpiarCamposModal() {
    for (const key in CAMPOS_ALTA) {
        getElement(CAMPOS_ALTA[key]).value = '';
    }
}

function agregarNuevoProducto() {
    const nuevoProducto = {};
    for (const key in CAMPOS_ALTA) {
        nuevoProducto[key] = getElement(CAMPOS_ALTA[key]).value;
    }
    // Si no se selecciona el estatus el producto queda activo
    if (nuevoProducto.estatus === '') {
        nuevoProducto.estatus = '1';
    }

    productos.push(nuevoProducto);

    limpiarCamposModal();

    ocultarModal(MODAL_ALTA_ID);

    mostrarProductos(true);
}

// soloActivos en true muestra los productos con estatus 1, en false los muestra todos
export function mostrarProductos(soloActivos) {
    const productosBody = getElement('productosBody');
    if (!productosBody) {
        console.error('Elemento productosBody no encontrado en el DOM.');
        return;
    }

    productosBody.innerHTML = '';

    productos.forEach(producto => {
        if (!soloActivos || producto.estatus == 1) {
            const row = document.createElement('tr');
            const propiedadesAMostrar = ['nombre', 'nombreGenerico', 'unidadDeMedida', 'presentacion', 'precioUnitario'];

            propiedadesAMostrar.forEach(key => {
                const cell = document.createElement('td');
                cell.textContent = producto[key];
                row.appendChild(cell);
            });

            const accionesCell = document.createElement('td');
            const acciones = document.createElement('div');
            acciones.className = 'd-flex justify-content-center';
            acciones.appendChild(createButton('Editar', 'btn-primary', () => editarProducto(producto)));
            if (producto.estatus == 1) {
                acciones.appendChild(createButton('Eliminar', 'btn-danger', () => eliminarProducto(producto)));
            }
            accionesCell.appendChild(acciones);

            row.appendChild(accionesCell);
            productosBody.appendChild(row);
        }
    });

    buscarProducto(getElement('buscarProducto').value);
}

// Oculta las filas que no contienen el texto escrito en el buscador
export function buscarProducto(texto) {
    const filas = getElement('productosBody').querySelectorAll('tr');
    filas.forEach(fila => {
        fila.style.display = fila.textContent.toLowerCase().includes(texto.toLowerCase()) ? '' : 'none';
    });
}

function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `btn ${className} btn-sm me-1`;
    button.onclick = onClick;
    return button;
}

function editarProducto(producto) {
    for (const key in CAMPOS_EDITAR) {
        getElement(CAMPOS_EDITAR[key]).value = producto[key] ?? '';
    }

    getElement('btnEditarProductoModal').onclick = () => actualizarProducto(producto);

    mostrarModal(MODAL_EDITAR_ID);
}

function actualizarProducto(producto) {
    // Actualizar el objeto producto con los valores del formulario
    for (const key in CAMPOS_EDITAR) {
        producto[key] = getElement(CAMPOS_EDITAR[key]).value;
    }

    // Ocultar el modal después de actualizar
    ocultarModal(MODAL_EDITAR_ID);

    mostrarProductos(true);
}

function eliminarProducto(producto) {
    const modalEliminar = getElement(MODAL_ELIMINAR_ID);

    modalEliminar.querySelector('.modal-title').textContent = `¿Estás seguro de eliminar el producto ${producto.nombre}?`;

    // El boton Eliminar da de baja el producto y despues muestra la ventana de confirmado
    getElement('btnEliminarProducto').onclick = () => confirmarEliminarProducto(producto);

    mostrarModal(MODAL_ELIMINAR_ID);
}

function confirmarEliminarProducto(producto) {
    // La baja es logica: el producto sigue apareciendo en "Mostrar Todos"
    producto.estatus = '0';
    mostrarProductos(true);
}

function ocultarModal(modalId) {
    bootstrap.Modal.getOrCreateInstance(getElement(modalId)).hide();
}

function mostrarModal(modalId) {
    bootstrap.Modal.getOrCreateInstance(getElement(modalId)).show();
}
