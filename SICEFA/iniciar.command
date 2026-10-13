#!/bin/bash
# Doble clic para abrir SICEFA. El proyecto lee archivos JSON, y el navegador
# solo lo permite si las paginas se abren desde un servidor local (no con doble clic al .html).
cd "$(dirname "$0")"
echo "SICEFA abierto en http://localhost:5500  (cierra esta ventana para apagarlo)"
(sleep 1 && open "http://localhost:5500/index.html") &
python3 -m http.server 5500 --bind 127.0.0.1
