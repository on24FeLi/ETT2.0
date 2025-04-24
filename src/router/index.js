import { createRouter, createWebHistory } from 'vue-router';
import Homepage from '../views/Homepage.vue';
import Login from '../views/Login.vue';
import Tagesanzeige from '../views/Tagesanzeige.vue';
import Dashboard from '../views/Dashboard.vue'
import Wochenansicht from '@/views/Wochenansicht.vue';
//import { hasRole } from '../utils/auth';

const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/homepage', component: Homepage },
    { path: '/tagesanzeige', component: Tagesanzeige },
    { path: '/dashboard', component: Dashboard },
    { path: '/Wochenansicht', component: Wochenansicht }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;