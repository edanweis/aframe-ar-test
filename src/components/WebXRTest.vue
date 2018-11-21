<template>
	<div open>
	  <summary>Phone AR</summary>
	  <p>
	    This sample demonstrates use of a non-exclusive XRSession to present
	    Augmented Reality content.
	    <a class="back" href="./">Back</a>
	  </p>
	</div>
</template>

<script>
// import * as THREE from 'three';
// import { Scene, WebGLRenderer } from 'three';

export default {

  name: 'WebXRTest',

  data () {
    return {

    }
  },
  created(){

  	// If requested, initialize the WebXR polyfill
  	// if (QueryArgs.getBool('allowPolyfill', false)) {
  	//   var polyfill = new WebXRPolyfill();
  	// }
  	// Apply the version shim after the polyfill is instantiated, to ensure
  	// that the polyfill also gets patched if necessary.
  	// var versionShim = new WebXRVersionShim();

  	// XR globals.
  	let xrButton = null;
  	let xrFrameOfRef = null;

  	// AR sessions must have an outputContext, just like magic window
  	// sessions.
  	let outputCanvas = document.createElement('canvas');
  	outputCanvas.setAttribute('id', 'output-canvas');
  	let ctx = outputCanvas.getContext('xrpresent');

  	// WebGL scene globals.
  	let gl = null;
  	let renderer = null;
  	let scene = new Scene();
  	let solarSystem = new Gltf2Node({url: '../media/gltf/space/space.gltf'});
  	// The solar system is big (citation needed). Scale it down so that users can
  	// move around the planets more easily.
  	solarSystem.scale = [0.1, 0.1, 0.1];
  	scene.addNode(solarSystem);

  	// No skybox is added to this scene, and we're not clearing the background to
  	// black because we want the real world to show through.
  	scene.clear = false;

  	// Called every time a XRSession requests that a new frame be drawn.
  	// Start the XR application.
  	this.initXR();
  },
  methods:{
  	onSessionEnded: function(event) {
  	  	  xrButton.setSession(null);
  	  },

  	onEndSession: function(session) {
  	  session.end();
  	  // Remove the injected output canvas from the DOM.
  	  document.body.removeChild(document.querySelector('#output-canvas'));
  	},
  	
  	onXRFrame: function(t, frame) {
  		var self = this
  	  	  let session = frame.session;
  	  	  let pose = frame.getDevicePose(xrFrameOfRef);

  	  	  scene.startFrame();

  	  	  session.requestAnimationFrame(self.onXRFrame);

  	  	  scene.drawXRFrame(frame, pose);

  	  	  scene.endFrame();
  	  	},

  	initXR() {
  		var self=this
  	  xrButton = new XRDeviceButton({
  	    onRequestSession: self.onRequestSession,
  	    onEndSession: self.onEndSession,
  	    textEnterXRTitle: "START AR",
  	    textXRNotFoundTitle: "AR NOT FOUND",
  	    textExitXRTitle: "EXIT  AR",
  	  });
  	  document.querySelector('header').appendChild(xrButton.domElement);

  	  if (navigator.xr) {
  	    navigator.xr.requestDevice().then((device) => {
  	      // Checks to ensure that environment integration (AR) is available,
  	      // and only enables the button if so.
  	      device.supportsSession({ environmentIntegration: true, outputContext: ctx }).then(() => {
  	        xrButton.setDevice(device);
  	      });
  	    });
  	  }
  	},

  	onSessionStarted: function(session) {
  		var self=this
  	  	  session.addEventListener('end', this.onSessionEnded);

  	  	  if (!gl) {
  	  	    gl = createWebGLContext({
  	  	      compatibleXRDevice: session.device
  	  	    });

  	  	    renderer = new Renderer(gl);

  	  	    scene.setRenderer(renderer);
  	  	  }

  	  	  session.baseLayer = new XRWebGLLayer(session, gl);

  	  	  session.requestFrameOfReference('eye-level').then((frameOfRef) => {
  	  	    xrFrameOfRef = frameOfRef;
  	  	    session.requestAnimationFrame(self.onXRFrame);
  	  	  });
  	  	},

  	onRequestSession: function(device) {
  	  	  // Requests an inline (non-immersive) session with environment integration
  	  	  // to get AR via video passthrough.

  	  	  // Even though this is a non-immersive session, the fact that it's
  	  	  // using environment integration means it must be requested in a user
  	  	  // activation event so that appropriate permissions can be granted.
  	  	  // This will likely prompt the user to allow camera use, so the promise
  	  	  // may remain outstanding for a while.
  	  	  device.requestSession({ environmentIntegration: true, outputContext: ctx })
  	  	      .then((session) => {
  	  	        // Add the canvas to the document once we know that it will be
  	  	        // rendered to.
  	  	        document.body.appendChild(outputCanvas);
  	  	        xrButton.setSession(session);
  	  	        this.onSessionStarted(session);
  	  	      });
  	  	}


  }
}
</script>

<style lang="css" scoped>
body {
  background-color: #F0F0F0;
  font: 1rem/1.4 -apple-system, BlinkMacSystemFont,
    Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans,
    Droid Sans, Helvetica Neue, sans-serif;
}

header {
  position: relative;
  z-index: 2;
  left: 0px;
  text-align: left;
  max-width: 420px;
  padding: 0.5em;
  background-color: rgba(255, 255, 255, 0.90);
  margin-bottom: 0.5em;
  border-radius: 2px;
}

details summary {
  font-size: 1.0em;
  font-weight: bold;
}

details[open] summary {
  font-size: 1.4em;
  font-weight: bold;
}

header h1 {
  margin-top: 0px;
}

canvas {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  touch-action: none;
}

.back {
  float: right;
  text-decoration: none;
}

.back:hover {
  text-decoration: underline;
}

.back::before {
  display: inline-block;
  content: attr(data-index) '<';
  font-weight: bold;
  white-space: nowrap;
  margin-right: 0.2em;
  margin-left: 0.2em;
}
</style>