/* =====================================================
   1. IMPORTACIONES
===================================================== */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';


/* =====================================================
   2. CARRUSEL DE IMÁGENES
===================================================== */

const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");

const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentIndex = 0;

function updateCarousel() {

    if (!track || slides.length === 0) return;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
    });

}

// Botón siguiente
if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        currentIndex++;

        if (currentIndex >= slides.length) {
            currentIndex = 0;
        }

        updateCarousel();

    });

}

// Botón anterior
if (prevBtn) {

    prevBtn.addEventListener("click", () => {

        currentIndex--;

        if (currentIndex < 0) {
            currentIndex = slides.length - 1;
        }

        updateCarousel();

    });

}

// Indicadores del carrusel
dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        currentIndex = index;

        updateCarousel();

    });

});

// Mostrar la primera diapositiva
updateCarousel();


/* =====================================================
   3. CONTENIDO DINÁMICO
===================================================== */

window.mostrarContenido = function(tipo) {

    const contenedor = document.getElementById("contenido-dinamico");

    if (!contenedor) {
        console.error("No se encontró #contenido-dinamico");
        return;
    }

    const contenidos = {

        Reel_informativo: `
            <iframe
                src="https://www.youtube.com/embed/DuWoA69TP-4"
                title="Reel informativo"
                allowfullscreen>
            </iframe>
        `,

        teaser: `
            <iframe
                src="https://www.youtube.com/embed/k-nc-GfDLEI"
                title="Teaser"
                allowfullscreen>
            </iframe>
        `,

        fuentes: `
            <iframe
                src="https://www.instagram.com/reel/DePg7EfMjWm/embed"
                title="Influencer"
                allowfullscreen>
            </iframe>
        `

    };

    contenedor.innerHTML = contenidos[tipo] || `
        <p>Contenido no disponible</p>
    `;

    console.log("Contenido mostrado:", tipo);

};


/* =====================================================
   4. GALERÍA 3D - PUEBLO MUMU
===================================================== */

// ELEMENTOS HTML

const panels = document.querySelectorAll(".mojojoy-panel");

const modal = document.getElementById("mojojoy-modal");

const closeModal = document.getElementById("close-modal");

const contenedor3D = document.getElementById("modelo_mojojoy");


/* =====================================================
   5. RUTAS DE LOS MODELOS
===================================================== */

const modelos3D = {

    modelo1: "/modelos/hui/huitoto_ps1.glb",

    modelo2: "/modelos/mojo/mojojoy.glb",

    modelo3: "/modelos/mangu/manguare_ps1.glb"

};


/* =====================================================
   6. VARIABLES THREE.JS
===================================================== */

let scene = null;

let camera = null;

let renderer = null;

let controls = null;

let modeloActual = null;

let animacionIniciada = false;


/* =====================================================
   7. INICIALIZAR VISOR 3D
===================================================== */

function iniciarVisor3D() {

    if (!contenedor3D) {

        console.error("No existe el contenedor #modelo_mojojoy");

        return;

    }

    // Evitar inicializaciones duplicadas
    if (renderer) return;

    const width = contenedor3D.clientWidth || 600;

    const height = contenedor3D.clientHeight || 450;


    // ESCENA

    scene = new THREE.Scene();


    // CÁMARA

    camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.01,
        1000
    );

    camera.position.set(0, 1, 5);


    // RENDERIZADOR

    renderer = new THREE.WebGLRenderer({

        alpha: true,

        antialias: true

    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(width, height);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    contenedor3D.appendChild(renderer.domElement);


    // ILUMINACIÓN AMBIENTAL

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        2
    );

    scene.add(ambientLight);


    // LUZ PRINCIPAL

    const directionalLight = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    directionalLight.position.set(4, 5, 5);

    scene.add(directionalLight);


    // LUZ DE RELLENO

    const fillLight = new THREE.DirectionalLight(
        0xffffff,
        1.5
    );

    fillLight.position.set(-4, 2, -3);

    scene.add(fillLight);


    // CONTROLES DEL MOUSE

    controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.05;

    controls.enableZoom = true;

    controls.enableRotate = true;

    controls.enablePan = false;


    // INICIAR ANIMACIÓN

    if (!animacionIniciada) {

        animacionIniciada = true;

        animarVisor3D();

    }

}


/* =====================================================
   8. CARGAR MODELO GLB
===================================================== */

function cargarModelo3D(nombre) {

    const ruta = modelos3D[nombre];

    if (!ruta) {

        console.error("No existe una ruta para este modelo:", nombre);

        return;

    }

    iniciarVisor3D();

    if (!renderer) return;


    // ELIMINAR MODELO ANTERIOR

    if (modeloActual) {

        scene.remove(modeloActual);

        modeloActual = null;

    }


    // CARGADOR GLB

    const loader = new GLTFLoader();

    console.log("Cargando modelo:", ruta);


    loader.load(

        ruta,

        function(gltf) {

            modeloActual = gltf.scene;


            // CALCULAR DIMENSIONES

            const box = new THREE.Box3().setFromObject(
                modeloActual
            );

            const center = box.getCenter(
                new THREE.Vector3()
            );

            const size = box.getSize(
                new THREE.Vector3()
            );


            // CENTRAR MODELO

            modeloActual.position.sub(center);


            // AJUSTAR ESCALA

            const maxDimension = Math.max(
                size.x,
                size.y,
                size.z
            );

            if (maxDimension > 0) {

                const escala = 2.5 / maxDimension;

                modeloActual.scale.multiplyScalar(escala);

            }


            // AGREGAR MODELO A LA ESCENA

            scene.add(modeloActual);


            // AJUSTAR CÁMARA

            const esfera = new THREE.Sphere();

            new THREE.Box3()
                .setFromObject(modeloActual)
                .getBoundingSphere(esfera);

            const radio = Math.max(esfera.radius, 0.1);

            const distancia = radio /
                Math.sin(
                    THREE.MathUtils.degToRad(camera.fov / 2)
                ) * 0.7;


            camera.position.set(
                distancia * 0.8,
                distancia * 0.5,
                distancia * 1.5
            );

            camera.near = Math.max(radio / 100, 0.001);

            camera.far = distancia * 10;

            camera.updateProjectionMatrix();


            // CONFIGURAR CONTROLES

            controls.target.set(0, 0, 0);

            controls.minDistance = radio * 0.5;

            controls.maxDistance = radio * 8;

            controls.update();


            console.log(
                "Modelo cargado correctamente:",
                nombre
            );

        },


        // PROGRESO DE CARGA

        function(xhr) {

            if (xhr.total > 0) {

                const porcentaje = Math.round(
                    xhr.loaded / xhr.total * 100
                );

                console.log("Carga:", porcentaje + "%");

            }

        },


        // ERROR DE CARGA

        function(error) {

            console.error(
                "Error cargando el modelo:",
                ruta,
                error
            );

        }

    );

}


/* =====================================================
   9. ANIMACIÓN DEL VISOR
===================================================== */

function animarVisor3D() {

    requestAnimationFrame(animarVisor3D);

    if (!renderer || !scene || !camera) return;

    if (controls) {

        controls.update();

    }

    renderer.render(scene, camera);

}


/* =====================================================
   10. REDIMENSIONAR VISOR
===================================================== */

function ajustarVisor3D() {

    if (!renderer || !camera || !contenedor3D) return;

    const width = contenedor3D.clientWidth;

    const height = contenedor3D.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}


/* =====================================================
   11. SELECCIÓN DE MODELOS
===================================================== */

panels.forEach(panel => {

    panel.addEventListener("click", () => {


        // QUITAR SELECCIÓN ANTERIOR

        panels.forEach(item => {

            item.classList.remove("active");

        });


        // ACTIVAR PANEL SELECCIONADO

        panel.classList.add("active");


        // IDENTIFICAR MODELO

        const nombreModelo = panel.dataset.model;


        // COMPROBAR QUE EXISTA LA RUTA

        if (!modelos3D[nombreModelo]) {

            console.error(
                "No hay una ruta configurada para:",
                nombreModelo
            );

            return;

        }


        // ABRIR MODAL

        if (modal) {

            modal.classList.add("active");

        } else {

            console.error("No se encontró el modal 3D");

            return;

        }


        // ESPERAR A QUE EL MODAL SEA VISIBLE

        requestAnimationFrame(() => {

            iniciarVisor3D();

            ajustarVisor3D();

            cargarModelo3D(nombreModelo);

        });

    });

});


/* =====================================================
   12. CERRAR MODAL
===================================================== */

if (closeModal && modal) {

    closeModal.addEventListener("click", () => {

        modal.classList.remove("active");

    });

}


// CERRAR CON TECLA ESCAPE

document.addEventListener("keydown", event => {

    if (event.key === "Escape" && modal) {

        modal.classList.remove("active");

    }

});


/* =====================================================
   13. DETECTAR CAMBIOS DE TAMAÑO
===================================================== */

window.addEventListener("resize", ajustarVisor3D);


/* =====================================================
   14. INICIAR PÁGINA
===================================================== */

function iniciarPagina() {

    // Estas funciones se ejecutan si están definidas
    // en el proyecto.

    if (typeof configurarMenu === "function") {

        configurarMenu();

    }

    if (typeof configurarAnimacionesEntrada === "function") {

        configurarAnimacionesEntrada();

    }

    console.log(
        "PUEBLO MUMU: página iniciada correctamente"
    );

}


// EJECUTAR CUANDO EL HTML ESTÉ DISPONIBLE

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarPagina
    );

} else {

    iniciarPagina();

}
