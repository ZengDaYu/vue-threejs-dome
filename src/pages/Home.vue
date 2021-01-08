<template>
  <renderer :size="size" :limes="ui.special.limes">
    <dat-gui :setup="uiSetup" :model="ui"/>
    <scene :showFog="ui.special.showFog" :name="'scene'">
      <orbit-controls
        :position="getPosition"
        :autoRotate="ui.autoRotate"
        :target="getTarget"
        :flayTo="{x:-10,y:5,z:-20}"
        :isFly="ui.special.fly"
        :offset="getPosition"
      >
        <camera :name="'camera'">
          <audio-listener />
        </camera>
        <!-- <camera-ortho :name="'camera'">
          <audio-listener />
        </camera-ortho> -->
      </orbit-controls>
      <shadow-light
        :hex="0xdfebff"
        :intensity="2"
        :position="{ x: 50, y: 200, z: 100 }"
        />
      <!-- <light
        :hex="0xefefff"
        :intensity="2"
        :position="{ x: 50, y: 50, z: 50 }"
      ></light>
      <light
        :hex="0xefefff"
        :intensity="2"
        :position="{ x: -50, y: -50, z: -50 }"
      ></light> -->
      <sf03
        :position="ui.sf03.position"
        :scale="ui.sf03.scale"
        :rotation="ui.sf03.rotate"
        :visible="ui.sf03.visible"
        :name="'plan'"
      ></sf03>
      <cube
        v-for="t of ui.textures.number"
        :key="t"
        :name="'cube'"
        :texture="'diamond'"
        :position="{ x: -10*t,y:5,z:-20 }"
        :visible="ui.textures.visible"
        :size="1"
        >
      </cube>

      <Text3D
        :name="'Text3D'"
        :position="{ x:-25,y:10 }"
        :texture="'redwool'"
        :color="0x00fff0"
        :showLine="true"
      ></Text3D>

      <scale-cube
        :name="'scale-cube'"
        :texture="'cobblestone'"
        :position="{ x:-20 }"
        :size="1"
        :paused="ui.special.suspend">
      </scale-cube>

      <sphere
        :position="{x:10,y:0,z:5}"
        :radius="2"
        :segments="40"
        :name="'test'"
        :color="ui.special.color"
        :opacity="ui.special.opacity"
        :showLine="ui.special.showLine"
      />

      <sound-ball
        v-if="ui.special.playIt"
        :position="{x:-10,y:5,z:10}"
        :name="'sound-ball'"
        :radius="1"
        :segments="20"
        :color="0xa09945"
      />

      <multiple-video-cube
        v-if="ui.special.playIt"
        :name="'video-cube'"
        :position="{ y:5,z:15 }"
        :size="5"
      />

      <echarts-sprite
        v-if="ui.special.showEcharts"
        :name="'echarts-sprite'"
        :position="{ x:-5,y:15,z:-15 }"
        :scale="20"
      />

      <video-cube
        v-if="ui.special.playIt"
        :name="'video-cube'"
        :position="{ y:10,z:-20 }"
        :size="5"
      />

      <ocean :position="ui.ocean"></ocean>
      <grassland
        :position="{y:-2}"
        :scale="0.05"
        :name="'floor'"
      />
      <move-cube :texture="'redwool'" :size="1"></move-cube>

        <oimo-world :options="{ gravity: [0, 0, 0] }">
          <space-system :m-scale="10 ** 4">
            <space-object v-for="t of ui.textures.number" :key="t">
              <oimo-body :options="{ move: true, density: 1 ,restitution:5,pos:[textures[t].position.x||0,5,textures[t].position.z||0]}">
                <cube :name="'cube'" :texture="textures[t].type" :size="1"></cube>
              </oimo-body>
            </space-object>
            <!-- <space-object>
              <oimo-body :options="{ move: true, density: 1 ,restitution:5,pos:[0,5,0]}">
                <move-cube :texture="'redwool'" :size="1"></move-cube>
              </oimo-body>
            </space-object> -->
          </space-system>
        </oimo-world>
    </scene>
  </renderer>
</template>

<script>
import * as gui from '@/gui'
import Ocean from '@/components/Ocean'
import SF03 from '@/components/SF03'
import DatGui from '@/components/DatGui'
import Text3D from '@/components/Text3D'
import Grassland from '@/components/Grassland.vue'

export default {
  name: 'Home',
  components: {
    Ocean,
    sf03: SF03,
    DatGui,
    Text3D,
    Grassland
  },

  data() {
    let uiSetup = gui.setupPanel
    let ui = gui.getModel()
    return {
      textures: [
        {},
        {
          type: 'cobblestone',
          position: { x: 10 }
        },
        {
          type: 'diamond',
          position: { z: 10 }
        },
        {
          type: 'redwool',
          position: { }
        }
      ],
      ui,
      uiSetup,
      size: {
        w: window.innerWidth,
        h: window.innerHeight
      },
      up: 1.05,
      down: 0.95,
      maxFar: 75
    }
  },
  mounted() {
    window.onresize = () => (() => {
      this.size.w = document.body.clientWidth
      this.size.h = document.body.clientHeight
    })()
    // this.animation()
  },
  computed: {
    getTarget() {
      if(this.ui.sf03.followMe) {
        return this.ui.sf03.position
      }
      return this.ui.target
    },
    getPosition() {
      if(this.ui.sf03.followMe) {
        let data = {}
        let {position} = this.ui.sf03
        data.x = position.x + 9
        data.y = position.y + 21
        data.z = position.z + 20
        return data
      }
      return this.ui.camera
    }
  },
  methods: {
    animation() {
      // this.ui.sysKey += 1
      requestAnimationFrame(this.animation)
    }
  }
}
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>
