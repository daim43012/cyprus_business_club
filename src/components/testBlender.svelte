<script lang="ts">
  import { onMount } from 'svelte'
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

  let el: HTMLDivElement

  onMount(() => {
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      1000
    )
    camera.position.set(3, 2, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const dir = new THREE.DirectionalLight(0xffffff, 1.2)
    dir.position.set(5, 5, 5)
    scene.add(dir)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2
    controls.maxDistance = 15
    controls.target.set(0, 0.8, 0)

    const loader = new GLTFLoader()

    let mixer: THREE.AnimationMixer | null = null
    let action: THREE.AnimationAction | null = null
    const clock = new THREE.Clock()

    loader.load('/assets/forsite3.glb', (gltf) => {
      scene.add(gltf.scene)

      // Посмотри, есть ли анимации в файле
      console.log('Animations:', gltf.animations)

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(gltf.scene)

        // Обычно берём первую анимацию
        action = mixer.clipAction(gltf.animations[0])
        action.play()

        // (опционально) если хочешь "туда-обратно" как в Blender:
        // action.setLoop(THREE.LoopPingPong, Infinity)
        // action.play()
      } else {
        console.warn('В GLB нет анимаций. Проверь экспорт из Blender.')
      }
    })

    const onResize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    const tick = () => {
      const delta = clock.getDelta()

      // ВАЖНО: обновляем миксер каждый кадр
      if (mixer) mixer.update(delta)

      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      el.innerHTML = ''
    }
  })
</script>

<div bind:this={el} style="width:100%; height:500px;"></div>
