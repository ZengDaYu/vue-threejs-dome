<template>
  <mesh name="Cube">
    <geometry type="Box" :args="[size, size, size]"></geometry>
    <material type="MeshLambert" :visible="visible">
      <texture :url="`static/textures/${texture}.png`"></texture>
    </material>
  </mesh>
</template>

<script>
import Object3D from '@/components/Object3D'

export default {
  name: 'cube',
  mixins: [Object3D],
  props: {
    size: Number,
    texture: String,
    visible: {
      type: Boolean, default: true
    }
  }
}
</script>
