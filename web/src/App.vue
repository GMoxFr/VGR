<template>
    <div id="app">
        <NavbarComponent />
        <router-view />
    </div>
</template>

<script setup>
import { onBeforeMount } from 'vue';
import { useUserStore } from '@/store/userStore';
import NavbarComponent from './views/components/NavBar.vue';

const store = useUserStore();

onBeforeMount(() => {
    store.fetchUser();
});
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

body {
    margin: 0;
    padding: 0;
    background-color: #222;
}
</style>