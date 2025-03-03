<template>
    <div id="app">
        <NavbarComponent />
        <router-view />
    </div>
</template>

<script>
import { onBeforeMount, computed } from 'vue';
import { useUserStore } from '@/store/userStore';
import NavbarComponent from './views/components/NavBar.vue';

export default {
    setup() {
        const store = useUserStore();

        onBeforeMount(() => {
            store.fetchUser();
        });

        return {
            store,
            user: computed(() => store.user),
        };
    },
    methods: {
        logout() {
            this.store.logout();
        },
    },
    components: {
        NavbarComponent,
    },
}
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
}
</style>
