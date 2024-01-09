import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Inicializa a cena, câmera e renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adiciona textura
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('perfil2.png'); 
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// Inicializa o GLTFLoader
const loader = new GLTFLoader();
let model; // Variável para armazenar o modelo 3D

// Carrega o modelo 3D
loader.load('wellblender/scene.gltf', function(gltf) {
    model = gltf.scene;
    model.position.set(0, 0, 0); // Centraliza o modelo

    // Aplicar a textura a todos os materiais do modelo
    model.traverse((child) => {  // Itera sobre todos os objetos do modelo
      if (child.isMesh) {// Verifica se o objeto é uma malha
        child.material.map = texture;// Aplica a textura ao material da malha
        child.material.specular = new THREE.Color(0xffffff); // Adiciona brilho
        child.material.shininess = 40; // Ajusta o brilho
        child.material.needsUpdate = true; // Marca o material para atualização
    
      }
    });
    scene.add(model);

    // Ajustar a câmera para enquadrar o objeto
    const box = new THREE.Box3().setFromObject(model);// Cria uma caixa delimitadora ao redor do modelo
    const center = box.getCenter(new THREE.Vector3()); // Calcula o centro da caixa
    const size = box.getSize(new THREE.Vector3());// Calcula o tamanho da caixa
    const maxDim = Math.max(size.x, size.y, size.z);// Encontra a maior dimensão da caixa
    const fov = camera.fov * (Math.PI / 180);// Converte o campo de visão da câmera para radianos
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));// Calcula a distância da câmera para enquadrar o objeto
    cameraZ *= 1.5; // Ajuste baseado no fator de zoom
    camera.position.z = cameraZ;// Define a posição da câmera

    // Inicializa os controles de órbita
   // Configura os controles de órbita para interação com a câmera
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.copy(center); // Define o ponto central dos controles de órbita para o centro do modelo
orbit.enableZoom = true; // Habilita a capacidade de zoom
orbit.minAzimuthAngle = -Infinity; // Permite rotação horizontal ilimitada
orbit.maxAzimuthAngle = Infinity; // Permite rotação horizontal ilimitada
orbit.minPolarAngle = Math.PI / 2; // Restringe o movimento vertical para olhar diretamente de frente
orbit.maxPolarAngle = Math.PI / 2; // Restringe o movimento vertical para olhar diretamente de frente

orbit.update(); // Atualiza os controles de órbita com as novas configurações
camera.lookAt(center.x, center.y, center.z); // Ajusta a câmera para olhar diretamente para o centro do modelo
}, undefined, function(error) {
    console.error(error); // Exibe no console qualquer erro que ocorra durante o carregamento do modelo
});

// Variáveis para controlar o arrasto
let isDragging = false; // Indica se o arrasto está ativo
let previousMouseY = 0; // Armazena a posição vertical do mouse antes do movimento

// Função para iniciar o arrasto
function onMouseDown(event) {
    isDragging = true; // Ativa o estado de arrasto
    previousMouseY = event.clientY; // Armazena a posição inicial do mouse
    orbit.enabled = false; // Desativa os controles de órbita durante o arrasto
}

// Função para realizar o arrasto
function onMouseMove(event) {
    if (isDragging && model) {
        const deltaY = event.clientY - previousMouseY; // Calcula a mudança na posição do mouse
        previousMouseY = event.clientY; // Atualiza a posição anterior do mouse
        const movementScale = 0.1; // Define a escala do movimento
        model.position.y -= deltaY * movementScale; // Move o modelo verticalmente com base no movimento do mouse
    }
}

// Função para finalizar o arrasto
function onMouseUp(event) {
    isDragging = false; // Desativa o estado de arrasto
    orbit.enabled = true; // Reativa os controles de órbita após o arrasto
}

// Adiciona ouvintes de eventos do mouse ao elemento de renderização para gerenciar o arrasto
renderer.domElement.addEventListener('mousedown', onMouseDown);
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseup', onMouseUp);

// Função de animação para renderizar a cena
function animate() {
    requestAnimationFrame(animate); // Solicita a próxima frame de animação
    renderer.render(scene, camera); // Renderiza a cena com a câmera configurada
}

// Chama a função de animação para iniciar o ciclo de renderização
animate();