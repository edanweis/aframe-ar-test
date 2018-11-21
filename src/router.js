import Vue from 'vue'
import Router from 'vue-router'
// import Test1 from './views/Test1.vue'
// import Test2 from './views/Test2.vue'
// import Test3 from './views/Test3.vue'
import Test4 from './views/Test4.vue'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    // {
    //   path: '/test2',
    //   name: 'Test2',
    //   component: Test2
    // },
    // {
    //   path: '/test3',
    //   name: 'Test3',
    //   component: Test3 
    // },
    {
      path: '/test4',
      name: 'Test4',
      component: Test4 
    },
    // {
    //   path: '/test1',
    //   name: 'Test1',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/Test1.vue')
    // }
  ]
})
