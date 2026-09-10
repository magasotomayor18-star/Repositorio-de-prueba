# Auditoría de accesibilidad, UX y responsive

**Alcance:** `index.html`, `styles.css` y `script.js` de la página estática de Cristiano Ronaldo.

**Método:** inspección estática del código, `node --check` para JavaScript, comprobación HTTP local y pruebas manuales en navegador a 320, 398, 768 y 1440 px de ancho. También se verificaron foco mediante teclado, activación del filtro, dimensiones de objetivos, carga de imágenes y ausencia de errores de consola.

**Limitación:** este informe no sustituye una auditoría completa con lector de pantalla, axe/WAVE, pruebas de zoom, modo de alto contraste, navegación táctil real ni revisión de todos los estados de red.

## 1. Resumen ejecutivo

La página tiene una base semántica y responsive sólida. Usa `lang="es"`, `header`, `nav`, `main`, `section` y `footer`; tiene un único `h1`, una jerarquía coherente de `h2` y `h3`, enlaces y botones nativos, `alt` descriptivos en las tres imágenes de contenido, foco visible y una línea de tiempo operativa.

No se observó overflow horizontal en 320, 398, 768 ni 1440 px. El filtro de trayectoria funciona con teclado o puntero, actualiza `aria-pressed` y no produjo errores JavaScript.

Se identifican dos problemas que impiden considerar cumplido WCAG 2.2 AA de forma estricta:

1. Algunos textos dorados y grises sobre fondos claros no alcanzan el contraste mínimo.
2. Los enlaces de navegación tienen áreas calculadas de aproximadamente 15-18 px de alto; funcionan con teclado, pero son objetivos táctiles pequeños y no alcanzan una dimensión cómoda de 44 px.

La imagen principal está implementada como `background-image` sobre un `div` con `aria-label`. Es perceptible en el árbol accesible del navegador probado, pero no es tan robusta ni semántica como una imagen HTML con `alt` cuando la imagen aporta información.

## 2. Hallazgos críticos, altos, medios y bajos

### Críticos

Ninguno observado mediante las pruebas realizadas.

### Altos

Ninguno observado mediante las pruebas realizadas.

### Medios

#### M-01. Contraste insuficiente en textos sobre fondos claros

- **Criterio relacionado:** WCAG 2.2, 1.4.3 Contraste mínimo (AA).
- **Severidad:** Media.
- **Evidencia:** `styles.css`, variables `--gold: #c8a45d` y `--muted: #756f64`; se aplican a `.eyebrow`, `.quote cite`, `.gallery-card figcaption span` y `.bio-content` sobre fondos claros.
- **Medición:** el dorado `rgb(200, 164, 93)` sobre `rgb(243, 240, 233)` produce una relación aproximada de **2.07:1**. El gris `rgb(117, 111, 100)` sobre el mismo fondo produce **4.38:1**.
- **Impacto:** los textos pequeños pueden ser difíciles de distinguir para personas con baja visión. El dorado falla incluso el umbral de texto grande de 3:1 cuando se usa como texto decorativo o informativo pequeño.
- **Cumplimiento relacionado:** los textos claros sobre el fondo oscuro sí presentaron contraste suficiente en las muestras comprobadas: `.hero-intro`, aproximadamente 10.28:1, y `.timeline-item p`, aproximadamente 7.07:1.
- **Recomendación de corrección:** oscurecer el dorado usado como texto sobre fondos claros o cambiar el fondo/texto para lograr al menos 4.5:1 en texto normal y 3:1 en texto grande. Revisar de nuevo cada combinación después del ajuste.

#### M-02. Objetivos táctiles pequeños en la navegación

- **Criterio relacionado:** WCAG 2.2, 2.5.8 Tamaño del objetivo (AA) y buenas prácticas de UX móvil.
- **Severidad:** Media.
- **Evidencia:** `styles.css`, `.main-nav a` no define `padding`, `min-height` ni `min-width`; en 1440 px las áreas calculadas fueron aproximadamente 15-18 px de alto. Los enlaces del pie también quedaron en torno a 17 px de alto.
- **Impacto:** los enlaces son navegables y visibles, pero resultan difíciles de activar con precisión en pantallas táctiles. El espaciado visual entre enlaces no garantiza por sí solo un área de interacción amplia.
- **Cumplimiento relacionado:** los botones de filtro sí son elementos `button` nativos y midieron aproximadamente 39 px de alto en 398 px de ancho; superan el mínimo WCAG 2.2 de 24x24 px, aunque todavía pueden beneficiarse de mayor altura táctil.
- **Recomendación de corrección:** añadir un área de interacción de al menos 24x24 CSS px para cumplir el criterio 2.5.8 y preferiblemente aproximadamente 44x44 px en navegación móvil, manteniendo el diseño mediante `padding` y `margin` adecuados.

### Bajos

#### B-01. Imagen hero informativa implementada como fondo CSS

- **Criterio relacionado:** WCAG 2.2, 1.1.1 Contenido no textual (A) y robustez semántica.
- **Severidad:** Baja.
- **Evidencia:** `index.html`, `.hero-figure` es un `div` con `aria-label="Imagen de un futbolista celebrando en un estadio"`; `styles.css`, `.hero-image` usa `background-image`.
- **Resultado observado:** el navegador probado expuso el contenedor como un elemento genérico con nombre accesible, y la imagen visual cargó correctamente. No se detectó un error de consola.
- **Riesgo:** el `aria-label` sobre un `div` genérico no ofrece la misma interoperabilidad que un elemento `<img>` con `alt`, especialmente con diferentes lectores de pantalla o modos de navegación.
- **Recomendación de corrección:** si la imagen es informativa, preferir `<img alt="...">` con CSS de posicionamiento y `object-fit`. Si es puramente decorativa, eliminar el nombre accesible y marcarla explícitamente como decorativa.

#### B-02. Actualización del filtro sin mensaje textual específico

- **Criterio relacionado:** WCAG 2.2, 4.1.3 Mensajes de estado (AA), sujeto a validación con lector de pantalla.
- **Severidad:** Baja, pendiente de confirmación.
- **Evidencia:** `index.html`, `.timeline` tiene `aria-live="polite"`; `script.js` solo alterna la clase `.is-hidden` y el atributo `aria-pressed`.
- **Resultado observado:** visualmente el filtro funciona y deja un único artículo visible, por ejemplo `madrid`, y el botón seleccionado pasa a `aria-pressed="true"`.
- **Riesgo:** ocultar y mostrar elementos mediante CSS no garantiza que todos los lectores de pantalla anuncien qué filtro se aplicó ni cuántos resultados quedan.
- **Recomendación de corrección:** validar con un lector de pantalla. Si no se anuncia de forma consistente, añadir un mensaje de estado breve y visible para tecnologías de asistencia, por ejemplo “Mostrando: Real Madrid”, actualizado desde JavaScript.

## 3. Evidencia concreta por área

### Estructura semántica y encabezados

- **Cumple:** `index.html` contiene `header`, `nav`, `main` y `footer`.
- **Cumple:** existe un solo `h1` (`#hero-title`), cuatro `h2` de sección y cinco `h3` para los artículos de la trayectoria.
- **Cumple:** las secciones principales tienen `aria-labelledby` apuntando a sus encabezados.
- **Cumple:** los controles de filtro están agrupados con `role="group"` y un nombre accesible.

### Nombres accesibles, enlaces, botones y ARIA

- **Cumple:** la navegación tiene `aria-label="Navegación principal"`.
- **Cumple:** el enlace de marca tiene `aria-label` y el contenido textual visible sigue presente.
- **Cumple:** los filtros son `<button type="button">`, tienen texto visible y utilizan correctamente `aria-pressed`.
- **Cumple:** el símbolo de flecha del botón hero está oculto con `aria-hidden="true"` y no añade ruido al nombre.
- **Cumple:** no se observó uso de ARIA que sustituya controles nativos innecesariamente.
- **Observación:** la robustez de `aria-live` y del `aria-label` de la imagen hero requiere validación con lector de pantalla; se documenta en B-01 y B-02.

### Textos alternativos e imágenes

- **Cumple:** las tres imágenes `<img>` tienen `alt` descriptivo y no vacío.
- **Cumple:** las imágenes cargaron correctamente en navegador: 3/3 con `complete=true` y `naturalWidth` mayor que cero.
- **Observación:** las tres imágenes y el fondo hero dependen de URLs remotas de Unsplash; sin red no se garantiza su disponibilidad. Esto es una dependencia operativa, no un error de sintaxis.

### Contraste y foco

- **Hallazgo:** M-01 afecta al dorado y al gris usados sobre superficies claras.
- **Cumple:** el foco está definido con `a:focus-visible, button:focus-visible { outline: 3px solid ...; outline-offset: 4px; }`.
- **Prueba realizada:** al avanzar con `Tab`, el foco quedó en un botón y su estilo calculado incluyó `outline-style: solid`.
- **Cumple parcial:** existe `prefers-reduced-motion` para reducir transiciones y desplazamiento suave.

### Responsive, móvil y overflow

| Ancho probado | Overflow horizontal | Navegación principal visible | Artículos visibles inicialmente | Resultado |
|---:|:---:|---:|---:|:---|
| 320 px | No | 1 enlace | 5 | Sin overflow detectado |
| 398 px | No | 1 enlace | 5 | Sin overflow detectado |
| 768 px | No | 2 enlaces | 5 | Sin overflow detectado |
| 1440 px | No | 4 enlaces | 5 | Sin overflow detectado |

- **Cumple:** `scrollWidth` no superó `innerWidth` en ninguno de los cuatro anchos.
- **Observación UX:** en 320 y 398 px se ocultan enlaces del menú mediante `:nth-child`; no hay un menú alternativo para acceder a esos destinos desde la navegación principal. Los mismos destinos siguen apareciendo en el contenido y el pie, pero convendría validar si la reducción intencional del menú satisface el flujo móvil esperado.
- **Cumple:** la galería pasa a una columna en anchos de hasta 430 px y la línea de tiempo pasa de cinco columnas a una lista vertical.

### JavaScript y comportamiento

- **Cumple:** `script.js` superó `node --check` sin errores.
- **Cumple:** el filtro “Real Madrid” dejó visible únicamente el artículo con `data-stage="madrid"` y actualizó el botón a `aria-pressed="true"`.
- **Cumple:** no se detectaron errores `pageerror` ni mensajes de consola de tipo error durante la prueba.
- **Cumple:** el script usa APIs estándar del navegador y no declara dependencias externas.

## 4. Recomendación de corrección priorizada

1. Ajustar primero los colores de texto dorado y gris sobre fondo claro y comprobar las combinaciones con una herramienta de contraste.
2. Aumentar las áreas de interacción de los enlaces de navegación, especialmente en móvil.
3. Convertir la imagen hero a `<img>` con `alt` si es contenido informativo, o hacerla decorativa de forma explícita si no lo es.
4. Validar el anuncio del filtro con un lector de pantalla y añadir un mensaje de estado si `aria-live` no resulta suficiente.
5. Decidir y probar una estrategia de navegación móvil para los enlaces actualmente ocultos.

## 5. Pruebas que deberían repetirse después de corregir

- Ejecutar axe, WAVE o Accessibility Insights y resolver los errores restantes.
- Medir contraste de cada combinación de texto y fondo en estados normal, hover y foco; confirmar 4.5:1 para texto normal y 3:1 para texto grande.
- Probar navegación completa solo con teclado: `Tab`, `Shift+Tab`, `Enter`, activación de todos los filtros y enlace de salto.
- Probar con al menos un lector de pantalla, comprobando nombres, encabezados, regiones, estado seleccionado y anuncio del filtrado.
- Repetir la medición responsive en 320, 398, 768 y escritorio, incluyendo `scrollWidth`, zoom al 200% y orientación horizontal.
- Verificar que todos los enlaces y botones tengan áreas de interacción adecuadas en un dispositivo táctil real.
- Simular fallo de red para confirmar que la página mantiene una experiencia aceptable cuando no cargan las imágenes remotas.
- Ejecutar `node --check script.js` y probar cada filtro después de cualquier modificación del comportamiento.
