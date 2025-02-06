<template>

    <div @keydown.esc="closeModal" @click.self="closeModal" tabindex="0">
        <p>Login Modal</p>

        <form @submit.prevent="login">
            <input type="text" v-model="username" placeholder="Username" />
            <input type="password" v-model="password" placeholder="Password" />
            <input type="submit" value="Login" />
        </form>
    </div>

</template>

<script>

import { useUserStore } from '@/store/userStore';

export default {
    name: 'LoginComponent',
    setup() {
        const store = useUserStore();

        return { store };
    },
    data() {
        return {
            username: '',
            password: '',
        };
    },
    mounted() {
        console.log('LoginComponent mounted');
        this.username = '';
        this.password = '';
    },
    methods: {
        async login() {
            try {
                await this.store.login(this.username, this.password);
                this.closeModal();
            } catch (error) {
                console.error(error);
            }
        },
        closeModal() {
            this.$emit('close');
        },
    },
}

</script>