<template>
  <div>
    <mesh name="Grassland" @update:obj="handleMesh">
      <geometry type="Plane" :args="[20000, 20000, 40, 40]"></geometry>
      <material type="MeshLambert" :color="0xFFFFFF">
        <texture :options="txtOpts"></texture>
      </material>
    </mesh>
  </div>
</template>

<script>
import { RepeatWrapping, sRGBEncoding } from 'three'
import Object3D from '@/components/Object3D'

// http://threejs.org/examples/#webgl_geometry_dynamic
export default {
  name: 'Grassland',
  mixins: [Object3D],
  components: {
  },
  data() {
    return {
      txtOpts: {
        url: 'img/grasslight-big.jpg',
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        repeat: [25, 25],
        anisotropy: 16, //各向异性
        encoding: sRGBEncoding
      },
      geom: null
    }
  },

  methods: {
    handleMesh(mesh) {
      if(!mesh) return
      let g = mesh.geometry
      g.rotateX(-Math.PI / 2)
      // for(let i = 0, l = g.vertices.length; i < l; i++) {
      //   g.vertices[i].y = 10 * Math.sin(i / 2)
      // }
      this.geom = g
    }
  }
}
</script>
