# Plan de Implementación: Auto-Ataque del Mago y Habilidades Especiales

El objetivo es darle al Mago un ataque base infinito (sin desgaste de durabilidad) que dispare esferas mágicas cada 0.5 segundos con 10 de daño. Además, implementaremos un sistema de Habilidades Especiales con barra de carga (tecla R) tanto para el Guerrero como para el Mago.

> [!IMPORTANT]  
> **Necesito tu confirmación:** Mencionas que la barra recarga `0.01%` por enemigo eliminado. Si usamos ese porcentaje, ¡haría falta matar 10,000 enemigos para cargarla! Asumiré que te referías a un **10%** o **20%** por enemigo (para usarla cada 5-10 bajas). También asumiré que la "pelotita" del mago se disparará hacia donde apunte tu mouse automáticamente mientras tengas presionado, o bien usaré auto-apuntado al enemigo más cercano (tú decides abajo).

## 1. Opciones de Habilidades Especiales (¡Elige una para cada clase!)

### 🧙‍♂️ Opciones para el Mago (Mage)
1. **Lluvia de Meteoros:** Causa un gran daño en área en la posición del mouse o alrededor del jugador, limpiando a los enemigos cercanos.
2. **Agujero Negro:** Crea un vórtice mágico que atrae a todos los enemigos a un punto central durante 4 segundos y los inmoviliza, haciéndoles daño continuo.
3. **Nova de Hielo:** Congela a todos los enemigos en pantalla durante 5 segundos y les inflige un daño inicial, permitiéndote reposicionarte fácilmente.

### ⚔️ Opciones para el Guerrero (Knight)
1. **Furia Berserker:** Durante 10 segundos, el guerrero se vuelve rojo, duplica su velocidad de movimiento y su daño, y no sufre empuje (knockback) al ser golpeado.
2. **Terremoto (Stomp):** El guerrero golpea el suelo causando un temblor. Aturde (stunea) a los enemigos cercanos por 3 segundos y les hace un daño físico masivo.
3. **Torbellino de Cuchillas (Whirlwind):** El guerrero gira su arma a toda velocidad durante 4 segundos, volviéndose invulnerable y dañando continuamente a todo lo que toque mientras se mueve libremente.

> [!TIP]
> **Responde en el chat qué opción (1, 2 o 3) prefieres para el Mago y qué opción para el Guerrero.**

## 2. Cambios Propuestos en el Código

### `InputManager.js`
#### [MODIFY] `InputManager.js`
- Agregar la detección de la tecla `R` o `r` (acción `SPECIAL`) en `isActionPressed` y `onKeyDown`.

### `Nivel_1.js`
#### [MODIFY] `Nivel_1.js`
- **Mago Auto-ataque:** Si `window.playerState.clase === 'mage'`, sobreescribir el ataque por defecto para que dispare un proyectil mágico infinito cada `0.5s` de `10` de daño, sin consumir desgaste de armas de inventario.
- **Barra de Habilidad:** Agregar `this.specialCharge = 0;` (0 a 100).
- **Recarga:** En el evento de muerte de enemigo (donde sueltan monedas), añadir `this.specialCharge += 15` (o la cantidad acordada).
- **Interfaz (HUD):** Añadir una barra amarilla/azul pequeña debajo o junto a los corazones de vida para indicar el estado de recarga de la tecla [R].
- **Lógica de Tecla R:** En el método `update`, verificar si `this.inputManager.isActionPressed('SPECIAL')` y `this.specialCharge >= 100`. Si se cumple, ejecutar la habilidad especial según la clase del jugador y resetear la carga a 0.

---

## Preguntas Abiertas para Ti:
1. ¿Qué **Habilidad Especial de Mago** eliges? (1, 2 o 3)
2. ¿Qué **Habilidad Especial de Guerrero** eliges? (1, 2 o 3)
3. ¿Cuánto quieres que recargue exactamente matar a un enemigo? (Ej. 10%, 20%, 25% por enemigo).
4. Para el Mago: ¿El disparo sale solo apuntando al enemigo más cercano (auto-aim), o sale disparado hacia el mouse automáticamente?
