<template>
  <div id="info">
    <span class="title">Tap to spawn objects on surfaces.</span><br/>
    <span class="links">
      <a href="https://github.com/google-ar/three.ar.js">three.ar.js</a> -
      <a href="https://developers.google.com/ar/develop/web/getting-started#examples">examples</a>
    </span>
    <div ref="vrDisplay">{{myDebug}}</div>
  </div>
</template>

<script>

// import * as THREE from 'three';
// import { Scene, WebGLRenderer } from 'three';
import * as VRControls from 'three-vrcontrols-module'
import { ARUtils, ARPerspectiveCamera, ARView, ARDebug, ARDisplay } from 'three.ar.js';



export default {
  name: 'Threearjs',
  props: {},
  data (){
    return {
      vrDisplay: null,
      vrControls: null,
      arView: null,
      arDebug: null,
      canvas: null,
      camera: null,
      scene: null,
      renderer: null,
      cube: null,
      BOX_SIZE: 0.2,
      myDebug: null,
      colors: [
            new window.THREE.Color( 0xffffff ),
            new window.THREE.Color( 0xffff00 ),
            new window.THREE.Color( 0xff00ff ),
            new window.THREE.Color( 0xff0000 ),
            new window.THREE.Color( 0x00ffff ),
            new window.THREE.Color( 0x00ff00 ),
            new window.THREE.Color( 0x0000ff ),
            new window.THREE.Color( 0x000000 )
          ],

    }
  },
  
  created(){
    var self = this
    console.log(ARUtils)

    ARUtils.getARDisplay().then(function (display) {
      if (display) {
        var vrDisplay = display;
        console.log(display, 'doing init!')
        self.myDebug = 'VR ready - initialising...'
        self.init()
      } else {
        console.log('browser unsupported')
        self.myDebug = 'browser unsupported'
        ARUtils.displayUnsupportedMessage();
      }
    })
  },
  methods: {
    init(){
      // Turn on the debugging panel
      this.arDebug = new ARDebug(this.$refs.vrDisplay);

      // document.body.appendChild(this.arDebug.getElement());
      // Setup the three.js rendering environment
      this.renderer = new window.THREE.WebGLRenderer({ alpha: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.autoClear = false;
      this.canvas = this.renderer.domElement;
      document.body.appendChild(this.canvas);
      this.scene = new window.THREE.Scene();

      // Creating the ARView, which is the object that handles
      // the rendering of the camera stream behind the three.js
      // scene
      this.arView = new ARView(self.vrDisplay, self.renderer);

      // The ARPerspectiveCamera is very similar to THREE.PerspectiveCamera,
      // except when using an AR-capable browser, the camera uses
      // the projection matrix provided from the device, so that the
      // perspective camera's depth planes and field of view matches
      // the physical camera on the device.
      this.camera = new ARPerspectiveCamera(
        this.vrDisplay,
        60,
        window.innerWidth / window.innerHeight,
        this.vrDisplay.depthNear,
        this.vrDisplay.depthFar
      );

      // VRControls is a utility from three.js that applies the device's
      // orientation/position to the perspective camera, keeping our
      // real world and virtual world in sync.
      this.vrControls = new VRControls(this.camera);

      // Create the cube geometry and add it to the scene. Set the position
      // to (Infinity, Infinity, Infinity) so that it won't appear visible
      // until the first hit is found, and move it there
      var geometry = new window.THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
      var faceIndices = ['a', 'b', 'c'];
      for (var i = 0; i < geometry.faces.length; i++) {
        var f  = geometry.faces[i];
        for (var j = 0; j < 3; j++) {
          var vertexIndex = f[faceIndices[ j ]];
          f.vertexColors[j] = colors[vertexIndex];
        }
      }
      // Shift the cube geometry vertices upwards, so that the "pivot" of
      // the cube is at it's base. When the cube is added to the scene,
      // this will help make it appear to be sitting on top of the real-
      // world surface.
      // geometry.applyMatrix( new THREE.Matrix4().setTranslation( 0, BOX_SIZE / 2, 0 ) );
      geometry.translate( 0, BOX_SIZE / 2, 0 );
      var material = new window.THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
      this.cube = new window.THREE.Mesh(geometry, material);

      // Place the cube very far to initialize
      this.cube.position.set(10000, 10000, 10000);

      this.scene.add(this.cube);

      // Bind our event handlers
      window.addEventListener('resize', this.onWindowResize, false);
      this.canvas.addEventListener('touchstart', this.onClick, false);

      // Kick off the render loop!
      this.update();
    },
    update(){
      // Clears color from the frame before rendering the camera (arView) or scene.
      this.renderer.clearColor();

      // Render the device's camera stream on screen first of all.
      // It allows to get the right pose synchronized with the right frame.
      this.arView.render();
      console.log('rendering camera to screen..')

      // Update our camera projection matrix in the event that
      // the near or far planes have updated
      this.camera.updateProjectionMatrix();

      // Update our perspective camera's positioning
      this.vrControls.update();

      // Render our three.js virtual scene
      this.renderer.clearDepth();
      this.renderer.render(scene, camera);

      // Kick off the requestAnimationFrame to call this function
      // when a new VRDisplay frame is rendered
      this.vrDisplay.requestAnimationFrame(update);
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    /**
     * When clicking on the screen, fire a ray from where the user clicked
     * on the screen and if a hit is found, place a cube there.
     */
    onClick(e) {
      // If we don't have a touches object, abort
      // TODO: is this necessary?
      if (!e.touches[0]) {
        return;
      }

      // Inspect the event object and generate normalize screen coordinates
      // (between 0 and 1) for the screen position.
      var x = e.touches[0].pageX / window.innerWidth;
      var y = e.touches[0].pageY / window.innerHeight;

      // Send a ray from the point of click to the real world surface
      // and attempt to find a hit. `hitTest` returns an array of potential
      // hits.
      var hits = this.vrDisplay.hitTest(x, y);

      // If a hit is found, just use the first one
      if (hits && hits.length) {
        var hit = hits[0];
        // Use the `placeObjectAtHit` utility to position
        // the cube where the hit occurred
        ARUtils.placeObjectAtHit(this.cube,  // The object to place
                                       hit,   // The VRHit object to move the cube to
                                       1,     // Easing value from 0 to 1; we want to move
                                              // the cube directly to the hit position
                                       true); // Whether or not we also apply orientation

      }

  }
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
body {
     font-family: monospace;
     margin: 0;
     overflow: hidden;
     position: fixed;
     width: 100%;
     height: 100vh;
     -webkit-user-select: none;
     user-select: none;
     color:#000;
   }
   #info {
     position: absolute;
     left: 50%;
     bottom: 0;
     transform: translate(-50%, 0);
     margin: 1em;
     z-index: 10;
     display: block;
     line-height: 2em;
     text-align: center;
   }
   #info * {
     color: #000;
   }
   .title {
     background-color: rgba(40, 40, 40, 0.4);
     padding: 0.4em 0.6em;
     border-radius: 0.1em;
   }
   .links {
     background-color: rgba(40, 40, 40, 0.6);
     padding: 0.4em 0.6em;
     border-radius: 0.1em;
   }
   canvas {
     position: absolute;
     top: 0;
     left: 0;
   }
</style>
