import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Opciones de carga y criterios de aceptación (quality gates de rendimiento)
 */
export const options = {
  // Modelo de carga: subimos usuarios, mantenemos, y bajamos
  stages: [
    { duration: '20s', target: 5 },   // ramp-up suave hasta 5 usuarios
    { duration: '40s', target: 20 },  // subimos hasta 20 usuarios
    { duration: '1m',  target: 20 },  // mantenemos 20 usuarios durante 1 minuto (steady load)
    { duration: '20s', target: 0 },   // bajamos a 0 (ramp-down)
  ],

  // Umbrales de calidad (si se incumplen, el test se considera FAIL)
  thresholds: {
    http_req_duration: [
      'p(95)<500',   // el 95% de las peticiones debe responder en < 500ms
      'p(99)<800',   // el 99% debe estar por debajo de 800ms
    ],
    http_req_failed: [
      'rate<0.01',   // menos del 1% de peticiones pueden fallar
    ],
  },
};

/**
 * Lista de rutas a ejercitar.
 * Ajusta esto según las rutas reales de tu app.
 * De momento usamos solo la raíz (/) para no suponer nada.
 */
const BASE_URL = 'http://localhost:8081';

const paths = [
  '/',         // página principal (UI)
  // '/add/1/2',  // ejemplo de API (descomenta si existe en tu app)
  // '/health',   // ejemplo de endpoint de salud, si lo tuvieras
];

/**
 * Función que ejecuta cada usuario virtual en bucle durante la prueba.
 */
export default function () {
  // Elegimos una ruta al azar de la lista
  const path = paths[Math.floor(Math.random() * paths.length)];
  const url = `${BASE_URL}${path}`;

  const res = http.get(url);

  // Checks básicos de calidad por petición
  check(res, {
    'status es 200': (r) => r.status === 200,
    'respuesta en menos de 500ms': (r) => r.timings.duration < 500,
  });

  // Pequeña pausa para simular tiempo de "pensar" del usuario
  sleep(1);
}
