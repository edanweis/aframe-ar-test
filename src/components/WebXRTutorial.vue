<template>
<v-touch ref="touch" v-bind:enabled="true" 
@rotate="onRotate" 
@rotatestart="onRotateStart" 
@swiperight="onSwipeRight" 
@swipeleft="onSwipeLeft" 
@tap="onTap" 
@pinchmove="onPinch" 
@pinchend="onPinchEnd"  
@rotateend="onRotateEnd" 
@pan="onPan"
@doubletap="doubleTap">
  <!-- <div > -->
      <div id="enter-ar-info" class="demo-card mdl-card mdl-shadow--4dp">
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">Augmented Reality with the WebXR Device API</h2>
        </div>
        <div class="mdl-card__supporting-text">
          This is an experiment using augmented reality features with the WebXR Device API.
          Upon entering AR, you will be surrounded by a world of cubes.
          Learn more about these features from the <a href="https://codelabs.developers.google.com/codelabs/ar-with-webxr">Building an augmented reality application with the WebXR Device API</a> Code Lab.
        </div>
        <div v-if="XRDevice" class="mdl-card__actions mdl-card--border" @click="onEnterAR()">
          <a id="enter-ar" class="mdl-button mdl-button--raised mdl-button--accent">
            Start augmented reality
          </a>
        </div>
      </div>

      <div id="unsupported-info" class="demo-card mdl-card mdl-shadow--4dp">
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">Unsupported Browser</h2>
        </div>
        <div v-if="!XRDevice" class="mdl-card__supporting-text">
            Your browser does not support AR features with WebXR. Learn more about these features from the <a href="https://codelabs.developers.google.com/codelabs/ar-with-webxr">Building an augmented reality application with the WebXR Device API</a> Code Lab.
        </div>
      </div>
      <div id="stabilization"></div>
      <canvas v-show="showCanvas" ref="outputCanvas" id="canvas" width="100px" height="800px"></canvas>
      <!-- <a v-if="showCanvas" class="align-center mdl-button mdl-button--raised mdl-button--accent" @click="model.rotateX(-Math.PI / 2)">rotateX</a> -->
      <a v-if="showCanvas" class="align-center mdl-button mdl-button--raised mdl-button--accent" @click="toggleFullScreen()">fullscreen</a>
      <a v-if="showCanvas" class="align-center mdl-button mdl-button--raised mdl-button--accent" @click="toggleShadows()">shadows</a>

  <!-- </div> -->
</v-touch>
</template>
<style src="../../public/material.min.css"></style>
<style src="../../public/app.css"></style>

<script>
import Vuex from 'vuex'
import {DemoUtils, THREE, Reticle} from '../../public/utils'
// require("../../public/MTLLoader.js")
// require("../../public/OBJLoader.js")


export default {
  name: 'WebXRTutorial',
  props: [''],
  components: {},
  data () {
    return {
    	// onXRFrame: null,
    	device: null,
    	showCanvas: false,
    	XRDevice: false,
    	// onClick: null,
    	session: null,
    	renderer: null,
    	gl: null,
    	scene:null,
    	model: null,
      MODEL_SCALE: 0.1,
      selectedModel: null,
      rotateEndScale: 0,
      rotateEndAngle: null,
      modelStartAngle: null,
      pinchEndScale: null,
      shadowMesh: null,
      shadows: true,
      shadowMeshOpacity: 0.25,
      directionalLight: null,
      disablePan: false,
    	camera: null,
    	frameOfRef: null,
      files: [ 'ArcticFox_Posed.obj', 'scene.gltf', 'scene_blueberry.gltf', 'scene_potplant.gltf'],
      currentFile: 'scene.gltf',
      tapCenter: null,
      timer: null
    }
  },
  created(){
  	  // this.checkDevice()
  },
  mounted(){
    this.checkDevice()
    
  },
  computed:{
	...Vuex.mapGetters([]),

  },
  watch:{

  },
  methods:{
	...Vuex.mapMutations([]), 
	...Vuex.mapActions([]),

  freezePan: function(){
    this.disablePan = true
    setTimeout(()=>{
        this.disablePan = false
      }, 250)
  },

  toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); 
      }
    }
  },

  doubleTap: function(){
    this.addModel(this.currentFile)
  },

  iterateModel: async function(direction){
    console.log(this.files.indexOf(this.currentFile))
    if(direction=='forward'){
      var next = this.files.indexOf(this.currentFile) +1
    } else if(direction=='backward'){
      var next = this.files.indexOf(this.currentFile) -1
    }
    if(next >= 0 && next <= this.files.length - 1){
        await this.updateModel(this.files[next])
    }
    console.log('swiped ', direction, 'next: ', next)

  },

  onSwipeLeft: function(){
    this.iterateModel('forward')
  },

  onSwipeRight: function(){ 
    this.iterateModel('backward')
  },

  onRotateStart: function(e){
    this.rotateStartAngle = e.rotation
    if(!this.modelStartAngle){
      this.model.rotation.y
    }
    // console.log('started rotating', this.rotateStartAngle)
  },

  onRotate: function(e){
    // console.log(this.directionalLight)

    // this.model.children.forEach(mesh=>{
    //   mesh.rotateY(this.modelStartAngle - ( (e.rotation - this.rotateStartAngle )) * (Math.PI/180))
    // })
    this.model.rotation.y = this.modelStartAngle - ( (e.rotation - this.rotateStartAngle )) * (Math.PI/180)
    // this.model.children.forEach(mesh => {
    // })

  },
  
  onRotateEnd: function(e){
      this.modelStartAngle = this.model.rotation.y 
      this.freezePan()
      // console.log('finished rotating', this.modelStartAngle)

  },

  onPinch: async function(e){

    await this.moveModel(e)

    // this.$refs.touch.disable('onPan')
    // this.$refs.touch.disable('onTap')

    // this.timer = setTimeout(()=>{
    //     this.$refs.touch.enable('onPan')
    //     this.$refs.touch.enable('onTap')
    //   }, 400)

    

  },

  onPinchEnd: async function(e){
    await this.moveModel(e)
    this.freezePan()

    // this.$refs.touch.enable('onTap')
    // this.$refs.touch.enable('onPan')
    // this.$refs.touch.enable('onPan')
    this.MODEL_SCALE = this.pinchEndScale
  },


  onPan: async function(e){
    await this.moveModel(e)
  },

  setRayCastPosition: async function(e, element){
    var ex = ( e.center.x / window.innerWidth ) * 2 - 1;
    var ey = -( e.center.y / window.innerHeight ) * 2 +1;
    this.tapCenter = {x: ex, y: ey}
    this.raycaster = this.raycaster || new THREE.Raycaster()
    this.raycaster.setFromCamera(this.tapCenter, this.camera)
    
    const ray = this.raycaster.ray
    const origin = new Float32Array(ray.origin.toArray())
    const direction = new Float32Array(ray.direction.toArray())
    const hits = await this.getHits(origin, direction)
    if (hits.length) {
      const hit = hits[0]
      const hitMatrix = new THREE.Matrix4().fromArray(hit.hitMatrix)
      element.position.setFromMatrixPosition(hitMatrix)  
    }

  },

  moveModel: async function(e){
    if (!this.disablePan && this.model){
        //set position of model
        // await this.setRayCastPosition(e, this.model).then(result=>{
          var ex = ( e.center.x / window.innerWidth ) * 2 - 1;
          var ey = -( e.center.y / window.innerHeight ) * 2 +1;
          this.tapCenter = {x: ex, y: ey}
          this.raycaster = this.raycaster || new THREE.Raycaster()
          this.raycaster.setFromCamera(this.tapCenter, this.camera)
          
          const ray = this.raycaster.ray
          const origin = new Float32Array(ray.origin.toArray())
          const direction = new Float32Array(ray.direction.toArray())
          const hits = await this.getHits(origin, direction)
          if (hits.length) {
            const hit = hits[0]
            const hitMatrix = new THREE.Matrix4().fromArray(hit.hitMatrix)
            this.model.position.setFromMatrixPosition(hitMatrix)  
          }
          //move lights and plane with model
          // this.shadowMesh.position.y = this.model.position.y
          this.directionalLight.target.position.set(this.model.position.x, this.model.position.y, this.model.position.z)
          //set scale
          this.model.scale.set(this.MODEL_SCALE * e.scale, this.MODEL_SCALE * e.scale, this.MODEL_SCALE * e.scale)
          this.pinchEndScale = this.MODEL_SCALE * e.scale
          
        // })

    }

  },

	checkDevice(){
		console.info('checking XRdevice...')

		// The entry point of the WebXR Device API is on `navigator.xr`.
		// We also want to ensure that `XRSession` has `requestHitTest`,
		// indicating that the #webxr-hit-test flag is enabled.
		if (navigator.xr && XRSession.prototype.requestHitTest) {
		  try {
		    this.device = this.reqDevice()

		  } catch (e) {
		    // If there are no valid XRDevice's on the system,
		    // `requestDevice()` rejects the promise. Catch our
		    // awaited promise and display message indicating there
		    // are no valid devices.
		    // this.onNoXRDevice()
		    this.XRDevice = false
		    return
		  }
		} else {
		  // If `navigator.xr` or `XRSession.prototype.requestHitTest`
		  // does not exist, we must display a message indicating there
		  // are no valid devices.
			console.error('no valid devices')
		  // this.onNoXRDevice()
		  this.XRDevice = false
		  return
		}
		this.XRDevice = true
  	  // console.log('found device!')
  	  console.info('Found XRDevice!')
  	  // We found an XRDevice! Bind a click listener on our "Enter AR" button
  	  // since the spec requires calling `device.requestSession()` within a
  	  // user gesture.
  	  // document.querySelector('#enter-ar').addEventListener('click', this.onEnterAR)
	},

	async reqDevice(){
		return navigator.xr.requestDevice()	
	},
	/**
	 * Handle a click event on the '#enter-ar' button and attempt to
	 * start an XRSession.
	 */
	async onEnterAR() {
		var self =this
    // this.toggleFullScreen()
	  // Now that we have an XRDevice, and are responding to a user
	  // gesture, we must create an XRPresentationContext on a
	  // canvas element.
	  const ctx = this.$refs.outputCanvas.getContext('xrpresent')
	  // console.info('creating canvas...', this.$refs)
	  // console.log(ctx)

	  try {
	    // Request a session for the XRDevice with the XRPresentationContext
	    // we just created.
	    // Note that `device.requestSession()` must be called in response to
	    // a user gesture, hence this function being a click handler.
	    this.session = await this.reqDevice().then((device)=>{
	    	console.log(device)
	    	return device.requestSession({
	    		      outputContext: ctx,
	    		      environmentIntegration: true,
	    		    })
	    	
	    })

	    console.log('logging session')
	    console.log(this.session)

	    // If `requestSession` is successful, add the canvas to the
	    // DOM since we know it will now be used.
	    // document.body.appendChild(outputCanvas)
	    this.showCanvas = true
	    this.onSessionStarted(this.session)
	  } catch (e) {
	    // If `requestSession` fails, the canvas is not added, and we
	    // call our function for unsupported browsers.
	    // this.onNoXRDevice()
	    console.error(e)
	    console.error('no xr device')
	    this.XRDevice = false
	  }
	},

  async loadGLTF(file){

    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader();
      loader.setCrossOrigin( 'anonymous' );
      // Load a glTF resource
      loader.load(
        // resource URL
        file,
        // called when the resource is loaded
        function ( gltf ) {
          return resolve(gltf.scene)
        },
        // called while loading is progressing
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened', error );
          reject(error)
        }
      );
    });
  },

  async loadObj(file){
    return new Promise((resolve, reject) => {
      console.log(file.slice(0,-3)+"mtl")
      DemoUtils.loadModel(file, file.slice(0,-3)+"mtl").then(model => {
        return resolve(model)
      })
    });
  },

  async loadModel(filename){
    if(filename.slice(-3) == 'obj'){
      return this.loadObj(filename)
    } else if((filename.slice(-4) == 'GLTF')||(filename.slice(-4) == 'gltf')){
      return this.loadGLTF(filename)
    }
  },

  toggleShadows(){
    this.model.children.forEach(mesh=>{
      mesh.castShadow = !this.shadows
      mesh.receiveShadow = !this.shadows
    })
    this.shadows = !this.shadows

  },

  updateModel: async function(filename){

    this.loadModel(filename).then(scene=>{
      this.scene.remove(this.model)
      this.model = new THREE.Group()
      this.model.name = "filename"
      this.model.castShadow = true
      this.model.receiveShadow = true
      
      // handling files where I know the mesh name:

      var mesh1 = scene.getObjectByName('mesh1').rotateX(-Math.PI / 2)
      var mesh2 = scene.getObjectByName('mesh2').rotateX(-Math.PI / 2)
      
      this.dropToFloor(mesh1, 0)
      this.dropToFloor(mesh2, 0)

      this.model.add(mesh1)
      this.model.add(mesh2)

      // console.log(this.model.children)
      this.model.children.forEach(o=>{
        o.castShadow = true
        o.receiveShadow = true
      })



      // handling files where I ddon't know the mesh name:
      // this.model.add(scene)

      this.model.add(this.createShadowPlane(this.model))

      this.model.children.forEach(mesh=>{
        mesh.castShadow = true
        mesh.receiveShadow = true
      })

          // mesh.rotateX(-Math.PI / 2);
          // mesh.castShadow = true
          // mesh.receiveShadow = true
          // this.model.add(mesh)

      // scene.children.forEach(obj3d=>{
      //   var mesh = obj3d.getObjectById('985B1947-1D28-4B24-9F02-FE4130DBF491')
      // })

      // scene.children.filter(uid => (uid.uid=='25A2B18D-7F94-4B9E-BE10-DDCFDD66DBA0') || (uid =='7AE0BFDD-693C-467A-A4C4-993115063DB1')).forEach(mesh=>{
         
      //   })
          // THREE.SceneUtils.detach( mesh, this.model, scene );
          // THREE.SceneUtils.attach( mesh, scene, this.model );
      this.model.position.set(1000,-100,1000)
      this.model.scale.set(this.MODEL_SCALE, this.MODEL_SCALE, this.MODEL_SCALE)
      this.rotateStartAngle = this.model.rotation.y
      this.currentFile = filename
      this.scene.add(this.model)

      })


      // this.model.receiveShadow = true
      // this.model.castShadow = true
      // THREE.SceneUtils.attach( this.model, scene, this.scene );
      
    
  },


  toScreenPosition(obj, camera)
  {
      var vector = new THREE.Vector3();
      var widthHalf = 0.5*this.renderer.context.canvas.width;
      var heightHalf = 0.5*this.renderer.context.canvas.height;

      obj.updateMatrixWorld();
      vector.setFromMatrixPosition(obj.matrixWorld);
      vector.project(this.camera);

      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;

      return { 
          x: vector.x,
          y: vector.y
      };

  },

  dropToFloor(model, floorHeight){
    var bottom = new THREE.Box3().setFromObject(model).min.z
    model.position.z -=  (bottom - floorHeight)
  },

  addModel(filename){
    this.loadGLTF(filename).then(model=>{
      console.log('adding scene to model:', model)
      model.children.forEach(mesh => mesh.castShadow = true)
      model.scale.set(this.MODEL_SCALE, this.MODEL_SCALE, this.MODEL_SCALE)
      this.scene.add(model)
      // this.currentFile = filename
    })
  },  

  createLights(){
    const light = new THREE.AmbientLight(0xffffff, 1);
    this.directionalLight = new THREE.DirectionalLight(0xffffff,0.8);
    this.directionalLight.position.set(0, 2, 0)
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 256
    this.directionalLight.shadow.mapSize.height = 256
    this.directionalLight.radius = 1
    // this.directionalLight.scale.set(0.1,0.1,0.1)
    this.scene.add(light);
    this.scene.add(this.directionalLight);
    this.scene.add(this.directionalLight.target)
    this.directionalLight.shadow.camera.left = -1;
    this.directionalLight.shadow.camera.bottom = -1;
    this.directionalLight.shadow.camera.right = 1;
    this.directionalLight.shadow.camera.top = 1;
  },
  createShadowPlane(model){
    var height = new THREE.Box3().setFromObject(model).min.z
    const planeGeometry = new THREE.PlaneGeometry(100,100);
    planeGeometry.rotateX(-Math.PI / 2);
    var shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({opacity: this.shadowMeshOpacity  }))
    shadowMesh.name = 'shadowMesh';
    shadowMesh.receiveShadow = true;
    shadowMesh.position.y = height
    // this.scene.add(this.shadowMesh);
    return shadowMesh
  },

  createLitScene() {
    this.scene = new THREE.Scene()
    this.scene.castShadow = true
    this.createLights()
    // this.shadowMesh = this.createShadowPlane()
  },
	async onSessionStarted(session) {
	  var self = this
	  // this.session = session

	  // Add the `ar` class to our body, which will hide our 2D components
	  document.body.classList.add('ar')

	  // To help with working with 3D on the web, we'll use three.js. Set up
	  // the WebGLRenderer, which handles rendering to our session's base layer.
	  this.renderer = new THREE.WebGLRenderer({
	    alpha: true,
	    preserveDrawingBuffer: true,
      toneMapping: THREE.ReinhardToneMapping, // THREE.ReinhardToneMapping
      exposure: 1.0,
      shadowMapEnabled: true,
      shadowMapSoft: true
	  })
	  this.renderer.autoClear = false

	  // We must tell the renderer that it needs to render shadows.
	  this.renderer.shadowMap.enabled = true
	  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

	  this.gl = this.renderer.getContext()

	  // Ensure that the context we want to write to is compatible
	  // with our XRDevice
	  this.gl.setCompatibleXRDevice(this.session.device)

	  // Set our session's baseLayer to an XRWebGLLayer
	  // using our new renderer's context
	  this.session.baseLayer = new XRWebGLLayer(this.session, this.gl)

	  // A THREE.Scene contains the scene graph for all objects in the
	  // render scene. Call our utility which gives us a THREE.Scene
	  // with a few lights and surface to render our shadows. Lights need
	  // to be configured in order to use shadows, see `shared/utils.js`
	  // for more information.
	  this.createLitScene()

	  // Fixes an issue with three.js switching framebuffer back to 0
	  // after using a render target, fixes an issue with shadows.
	  DemoUtils.fixFramebuffer(this)

	  


    // Instantiate a loader

    await this.updateModel(this.currentFile)

    

    // We'll update the camera matrices directly from API, so
    // disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    this.camera = new THREE.PerspectiveCamera()
    this.camera.matrixAutoUpdate = false

    // Add a Reticle object, which will help us find surfaces by drawing
    // a ring shape onto found surfaces. See source code
    // of Reticle in shared/utils.js for more details.
    this.reticle = new Reticle(this.session, this.camera)
    this.scene.add(this.reticle)
    // console.log(this.scene)

	  // this.frameOfRef = await this.session.requestFrameOfReference('eye-level')
	  
	  // self.session.requestAnimationFrame(self.onXRFrame())

	  this.frameOfRef = await this.reqFrame().then((frameOfRef)=>{
	  		self.session.requestAnimationFrame(self.onXRFrame)
	    	return frameOfRef
	    })

	  

	  // console.log(this.frameOfRef)
	  

	  // window.addEventListener('click', this.onClick)
	},

	async reqFrame(){
		return this.session.requestFrameOfReference('eye-level')
	},

   /**
   * Called on the XRSession's requestAnimationFrame.
   * Called with the time and XRPresentationFrame.
   */
  onXRFrame: function(time, frame) {
  	var self = this
    let session = frame.session
    let pose = frame.getDevicePose(self.frameOfRef)

    // Update the reticle's position
    this.reticle.update(this.frameOfRef)

    // If the reticle has found a hit (is visible) and we have
    // not yet marked our app as stabilized, do so
    if (this.reticle.visible && !this.stabilized) {
      this.stabilized = true
      document.body.classList.add('stabilized')
    }

    // Queue up the next frame
    session.requestAnimationFrame(this.onXRFrame)

    // Bind the framebuffer to our baseLayer's framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.session.baseLayer.framebuffer)

    if (pose) {
      // Our XRFrame has an array of views. In the VR case, we'll have
      // two views, one for each eye. In mobile AR, however, we only
      // have one view.
      for (let view of frame.views) {
        const viewport = session.baseLayer.getViewport(view)
        this.renderer.setSize(viewport.width, viewport.height)

        // Set the view matrix and projection matrix from XRDevicePose
        // and XRView onto our THREE.Camera.
        this.camera.projectionMatrix.fromArray(view.projectionMatrix)
        const viewMatrix = new THREE.Matrix4().fromArray(pose.getViewMatrix(view))
        this.camera.matrix.getInverse(viewMatrix)
        this.camera.updateMatrixWorld(true)

        this.renderer.clearDepth()

        // Render our scene with our THREE.WebGLRenderer
        this.renderer.render(this.scene, this.camera)
      }
    }
  },

  async getHits(origin, direction){
  	return this.session.requestHitTest(origin, direction, this.frameOfRef)
  },


  /**
   * This method is called when tapping on the page once an XRSession
   * has started. We're going to be firing a ray from the center of
   * the screen, and if a hit is found, use it to place our object
   * at the point of collision.
   */
  onTap: async function(e) {
    // If our model is not yet loaded, abort
    if (!this.model) {
      return
    } else{
    //   await this.moveModel(e).then(r =>{
    //     console.log(this.scene.children)
    var ex = ( e.center.x / window.innerWidth ) * 2 - 1
    var ey = -( e.center.y / window.innerHeight ) * 2 + 1
    
    this.tapCenter = {x: ex, y: ey}
    this.raycaster = this.raycaster || new THREE.Raycaster()
    this.raycaster.setFromCamera(this.tapCenter, this.camera)
    const ray = this.raycaster.ray
    var intersects = this.raycaster.intersectObjects(this.model.children)
      console.log(intersects)

      // })
      // if (intersects.length > 0) {
      //     this.selectedModel = intersects[0].object
      //     console.log('hit one!, ',intersects)
      // }   
      // await this.moveModel(e)
    }    
  }
}




}
</script>

<style>

.wrapper{
  
}

</style>