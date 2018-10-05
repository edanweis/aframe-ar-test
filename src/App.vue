<template>
  <div id="app">
    <router-view/>
    <!-- <pre class="code">{{con}}</pre> -->
  </div>
</template>

<script>
export default {
  data () {
    return {
      con: null
    }
  },
  watch: {
    $route (to, from){
           this.con = null
       }
     },
  created(){
    var self = this
    if (typeof console  != "undefined") 
        if (typeof console.log != 'undefined')
            console.olog = console.log;
        else
            console.olog = function() {};

    console.log = function(message) {
        console.olog(message);
        self.con += '<p>' + message + '</p>';
    };
    console.error = console.debug = console.info =  console.log

  },
  computed:{


  },
  watch:{

  },
  methods:{

  }
}
</script>


<style>
.code{
  position: absolute;
  left: 0;
  bottom: 20px;
  font-size: 8px;
  width: 100vw;
  height: 200px;
  padding: 3vw;
  overflow-y : scroll;
  background-color: rgba(255,255,255,0.9)

}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: transparent !important;
}

</style>
