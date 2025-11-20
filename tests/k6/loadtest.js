import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 10,          // 10 usuarios virtuales
  duration: '10s',  // durante 10 segundos
};

export default function () {
  http.get('http://localhost:8081');
  sleep(1);
}
