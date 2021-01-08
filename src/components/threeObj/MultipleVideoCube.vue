<template>
  <Object3D>
    <mesh name="qian" :position="{z:size/2}">
      <geometry type="Plane"  :args="[size, size]"></geometry>
        <material type="MeshLambert">
          <video-texture :url="'static/textures/sintel.mp4'"/>
        </material>
    </mesh>

    <mesh name="you" :position="{x:size/2}" :rotation="{ y: Math.PI / 2 }">
      <geometry type="Plane"  :args="[size, size]"></geometry>
        <material type="MeshLambert">
          <video-texture :url="'static/textures/pano.mp4'"/>
        </material>
    </mesh>

    <mesh name="hou" :position="{z:-size/2}" :rotation="{ y: Math.PI}">
      <geometry type="Plane" :args="[size, size]"></geometry>
        <material type="MeshLambert">
          <video-texture :url="'static/textures/MaryOculus.mp4'"/>
        </material>
    </mesh>

     <mesh name="zuo" :position="{x:-size/2}" :rotation="{ y: -Math.PI / 2 }">
      <geometry type="Plane" :args="[size, size]"></geometry>
        <material type="MeshLambert">
          <video-texture :url="'static/textures/sintel.mp4'"/>
        </material>
    </mesh>

    <mesh name="shang" :position="{y:size/2}" :rotation="{ x: -Math.PI / 2 }">
      <geometry type="Plane" :args="[size, size]"></geometry>
        <material type="MeshLambert">
          <video-texture :url="'static/textures/pano.mp4'"/>
        </material>
    </mesh>

    <mesh name="xia" :position="{y:-size/2}" :rotation="{ x: Math.PI / 2 }">
      <geometry type="Plane" :args="[size, size]"></geometry>
        <material type="MeshLambert">
          <video-texture :url="'static/textures/MaryOculus.mp4'"/>
        </material>
    </mesh>
  </Object3D>
</template>

<script>
import Object3D from '@/components/Object3D'

export default {
  name: 'MultipleVideoCube',
  mixins: [Object3D],
  props: {
    size: Number,
    texture: String,
    visible: {
      type: Boolean, default: true
    }
  },
  components: {
    Object3D
  }
}
</script>
