<template>
  <object3D :position="pos">
    <mesh name="Cube">
      <geometry type="Box" :args="[size, size, size]"></geometry>
      <material type="MeshBasic" :visible="visible">
        <texture :url="`static/textures/${texture}.png`"></texture>
      </material>
    </mesh>
    <animation :fn="animate"></animation>
  </object3D>
</template>

<script>
import Object3D from '@/components/Object3D'
import Animation from '@/components/Animation'

export default {
  name: 'MoveCube',
  mixins: [Object3D],
  props: {
    size: Number,
    texture: String,
    visible: {
      type: Boolean, default: true
    }
  },
  components: {
    Object3D,
    Animation
  },
  data() {
    return {
      pos: null
    }
  },
  methods: {
    animate(tt) {
      this.pos = { y: Math.sin(tt) * 10, x: Math.cos(tt) * 10, z: 0}
    }
  }
}
</script>
