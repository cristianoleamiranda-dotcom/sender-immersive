/**
 * SIGNAL FIELD — 01 SIGNAL
 *
 * No es una esfera, ni un orbe, ni una nube de partículas al azar. Es lo que
 * Sender hace: una onda que nace en un mástil, se propaga radialmente, pierde
 * amplitud con la distancia y es barrida por el frente de onda.
 *
 * Cada brizna del campo es un punto del terreno. Su altura y su color son la
 * energía instantánea de la onda en ese punto. La cámara la atraviesa, y el
 * scroll es el que la mueve. DESIGN DNA §8.1 y §8.2.
 *
 * Presupuesto (§8.3): un solo draw call, ~24 000 vértices, sin postprocesado.
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Los colores del sistema, en el espacio del shader. */
const AZUL_NOCHE = new THREE.Color("#061424");
const AZUL = new THREE.Color("#1E73BE");
const AZUL_ALTO = new THREE.Color("#8CBCE6");
const CIAN = new THREE.Color("#33A3CC");

const ANCHO = 150;
const FONDO = 190;
const COLUMNAS = 96;
const FILAS = 110;
const ALTO_MAX = 9;

const vertice = /* glsl */ `
  uniform float uTiempo;
  uniform float uEnergia;
  uniform vec2  uFuente;

  attribute float aAltura;   // 0 en la base de la brizna, 1 en la punta
  attribute float aFase;     // desfase por brizna: rompe la simetría perfecta

  varying float vEnergia;
  varying float vPunta;
  varying float vDist;

  // Onda radial con decaimiento. Es la forma de la propagación, no un ruido.
  float propagacion(vec2 p, vec2 fuente, float t) {
    float d = distance(p, fuente);

    // Frente principal: viaja hacia afuera a velocidad constante.
    float frente = sin(d * 0.30 - t * 1.45);

    // La energía cae con la distancia — ley física, no gusto.
    float decaimiento = exp(-d * 0.011);

    // Una segunda componente más lenta da el batido de la portadora.
    float portadora = sin(d * 0.115 - t * 0.62) * 0.45;

    return (frente + portadora) * decaimiento;
  }

  void main() {
    vec3 pos = position;

    // La fuente vibra levemente: un transmisor nunca está quieto del todo.
    vec2 fuente = uFuente + vec2(sin(uTiempo * 0.23) * 1.2, cos(uTiempo * 0.19) * 1.2);

    float energia = propagacion(pos.xz, fuente, uTiempo);

    // Modulación por el scroll: al avanzar, el campo se excita.
    energia *= mix(0.55, 1.35, uEnergia);

    // Saturación suave: nunca una aguja descontrolada.
    energia = tanh(energia * 1.25) * 0.85;

    float d = distance(pos.xz, fuente);

    // La brizna crece desde su base hacia arriba.
    pos.y += aAltura * energia * ${ALTO_MAX.toFixed(1)} * (0.30 + 0.70 * exp(-d * 0.010));
    // Y se inclina en el sentido de la propagación: la onda empuja.
    pos.x += aAltura * energia * 0.35 * normalize(pos.xz - fuente + 0.001).x;
    pos.z += aAltura * energia * 0.35 * normalize(pos.xz - fuente + 0.001).y;

    // Ruido fino para que el campo no se lea como una superficie matemática.
    pos.y += sin(aFase + uTiempo * 0.9) * 0.12;

    vEnergia = energia;
    vPunta = aAltura;
    vDist = d;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmento = /* glsl */ `
  precision highp float;

  uniform vec3 uAzulNoche;
  uniform vec3 uAzul;
  uniform vec3 uAzulAlto;
  uniform vec3 uCian;
  uniform float uEnergia;

  varying float vEnergia;
  varying float vPunta;
  varying float vDist;

  void main() {
    // El color sigue la energía: vacío → azul profundo → azul → cian.
    float e = clamp(vEnergia * 0.9 + 0.5, 0.0, 1.0);

    vec3 color = mix(uAzulNoche, uAzul, smoothstep(0.0, 0.55, e));
    color = mix(color, uAzulAlto, smoothstep(0.55, 0.85, e));
    // El cian queda para el pico: es la señal, no el fondo (DNA §1.4).
    color = mix(color, uCian, smoothstep(0.86, 1.0, e));

    // La punta brilla más que la base: el campo tiene altura.
    float punta = smoothstep(0.15, 1.0, vPunta);
    float alfa = (0.06 + punta * 0.5) * (0.35 + e * 0.65);

    // Se desvanece en el horizonte: no hay borde visible del mundo.
    float horizonte = 1.0 - smoothstep(${FONDO.toFixed(1)} * 0.30, ${FONDO.toFixed(1)} * 0.52, vDist);
    alfa *= horizonte;

    // Y también hacia atrás, para que la fuente no quede huérfana.
    float cercania = smoothstep(2.0, 16.0, vDist);
    alfa *= mix(0.25, 1.0, cercania);

    if (alfa < 0.004) discard;

    gl_FragColor = vec4(color, alfa);
  }
`;

/**
 * El mástil: el origen. Una línea vertical en el centro del campo, del que la
 * onda nace. Sin él la propagación flota sin causa, y una onda sin fuente es
 * exactamente el tipo de adorno sin significado que el DNA prohíbe.
 */
function Mastil() {
  const objeto = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 26, 0]), 3),
    );
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#33A3CC"),
      transparent: true,
      opacity: 0.85,
    });
    return new THREE.Line(geo, mat);
  }, []);

  // Se libera al desmontar: geometría y material (§8.3).
  useEffect(() => () => {
    objeto.geometry.dispose();
    (objeto.material as THREE.Material).dispose();
  }, [objeto]);

  return <primitive object={objeto} />;
}

export default function SignalField({ energia = 0 }: { energia?: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const refEnergia = useRef(energia);
  refEnergia.current = energia;

  /**
   * Un único `LineSegments`: dos vértices por brizna, un solo draw call.
   * La geometría se construye una vez y se libera al desmontar (§8.3).
   */
  const geometria = useMemo(() => {
    const total = COLUMNAS * FILAS;
    const posiciones = new Float32Array(total * 2 * 3);
    const alturas = new Float32Array(total * 2);
    const fases = new Float32Array(total * 2);

    let v = 0;
    for (let i = 0; i < COLUMNAS; i++) {
      for (let j = 0; j < FILAS; j++) {
        // Distribución con leve irregularidad: un terreno, no una rejilla.
        const u = i / (COLUMNAS - 1) - 0.5;
        const w = j / (FILAS - 1) - 0.5;
        const x = u * ANCHO + Math.sin(j * 1.7) * 0.5;
        const z = w * FONDO + Math.cos(i * 2.1) * 0.5;
        const fase = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;

        // Base
        posiciones[v * 3 + 0] = x;
        posiciones[v * 3 + 1] = 0;
        posiciones[v * 3 + 2] = z;
        alturas[v] = 0;
        fases[v] = fase;
        v++;

        // Punta (el shader la levanta)
        posiciones[v * 3 + 0] = x;
        posiciones[v * 3 + 1] = 0;
        posiciones[v * 3 + 2] = z;
        alturas[v] = 1;
        fases[v] = fase;
        v++;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
    g.setAttribute("aAltura", new THREE.BufferAttribute(alturas, 1));
    g.setAttribute("aFase", new THREE.BufferAttribute(fases, 1));
    g.computeBoundingSphere();
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTiempo: { value: 0 },
      uEnergia: { value: 0 },
      uFuente: { value: new THREE.Vector2(0, 0) },
      uAzulNoche: { value: AZUL_NOCHE },
      uAzul: { value: AZUL },
      uAzulAlto: { value: AZUL_ALTO },
      uCian: { value: CIAN },
    }),
    [],
  );

  useFrame((_, delta) => {
    const m = material.current;
    if (!m) return;
    // Delta acotado: al volver de una pestaña en segundo plano no hay salto.
    m.uniforms.uTiempo.value += Math.min(delta, 1 / 30);
    // La energía sigue al scroll con inercia, no de golpe.
    const target = refEnergia.current;
    m.uniforms.uEnergia.value += (target - m.uniforms.uEnergia.value) * 0.06;
  });

  return (
    <group>
      <Mastil />
      <lineSegments geometry={geometria} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertice}
        fragmentShader={fragmento}
        transparent
        depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
