/**
 * Paquete de funciones cargado bajo demanda para las animaciones de layout.
 * `domAnimation` (provider raíz) no incluye `layout`/`layoutId`, así que este
 * módulo se importa de forma asíncrona solo donde se usan ese tipo de animaciones.
 */
export { domMax as default } from "framer-motion";
