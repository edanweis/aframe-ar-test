<template>
    <div class="wrapper">
    <p><router-link to="/test1">Test Three.ar.js</router-link></p>
    <p><router-link to="/test2">Test aframe-ar</router-link></p>
    <p><router-link to="/test3">Test native WebXRTest</router-link></p>
    <p><router-link to="/test4">Test WebXRTest tutorial</router-link></p>
</div>
</template>

<script>

export default {
  name: 'Home',
  components: {

  },
  created(){
  	// console.log('navigator.xr: ', navigator.xr)
  	// navigator.xr.addEventListener('devicechange', () => {
  	//   navigator.xr.requestDevice()
  	//   .then(device => {
  	//   	console.log('this is an XR Device!')
  	//     // device is of type XRDevice. Use it to get an XRSession object.
  	//   })
  	// })

  }
}
</script>
<style>
	html, body{
		background-color: transparent !important;
	}
</style>
