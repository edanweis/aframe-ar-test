<template>
	<div class="wrapper">
		<a-scene antialias="true" embedded ar>
			 <a-sphere radius="0.01" position="0 0.005 -0.5"></a-sphere>
		</a-scene>
	</div>
</template>

<script>

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
}

</style>