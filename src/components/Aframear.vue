<template>
	  <a-scene ar>
      <a-box width="0.25" height="0.25" depth="0.25" position="-0.25 0.125 -0.75" rotation="0 45 0" color="#4CC3D9" shadow></a-box>
      <a-sphere position="0 0.3125 -1.25" radius="0.3125" color="#EF2D5E" shadow></a-sphere>
      <a-cylinder position="0.25 0.1875 -0.75" radius="0.125" height="0.375" color="#FFC65D" shadow></a-cylinder>
      <a-plane position="0 0 -1" rotation="-90 0 0" width="1" height="1" color="#7BC8A4" shadow></a-plane>
      <ar-camera></ar-camera>
    </a-scene>
</template>

<script>
// import "aframe";
// var AFRAME = require('aframe');
// import { Scene, WebGLRenderer } from 'three';
import { ARUtils, ARPerspectiveCamera, ARView, ARDebug, ARDisplay } from 'three.ar.js';
require('aframe-ar');

	export default {

		name: 'Aframear',
		props: [''],
		components: {},
		data () {
			return {

			}
		},
		created(){

		},
		computed:{


		},
		watch:{

		},
		methods:{

		},
	}
</script>

<style  scoped>

.wrapper{
	position: relative;
	top: 0;
	left: 0;		
}
a-scene{
	display: block;
	position: absolute;
	left: 0;
	top: 0;
	width: 100vw;
	height: 100vh;
	background-color: transparent !important;
}

</style>