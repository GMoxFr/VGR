<template>

    <div @keydown.esc="closeModal" @click.self="closeModal" tabindex="0">
        <p>Register Modal</p>

        <form @submit.prevent="register">
            <input type="text" v-model="username" placeholder="Username" />
            <input type="password" v-model="password" placeholder="Password" />
            <input type="password" v-model="passwordConfirmation" placeholder="Confirm Password" />
            <input type="submit" value="Register" />
        </form>

        <button @click="closeModal">Close</button>
    </div>

</template>

<script>

import { useUserStore } from '@/store/userStore';

export default {
    name: 'RegisterComponent',
    setup() {
        const store = useUserStore();

        return { store };
    },
    data() {
        return {
            username: '',
            password: '',
            passwordConfirmation: '',
        };
    },
    mounted() {
        this.username = '';
        this.password = '';
        this.passwordConfirmation = '';
    },
    methods: {
        async register() {
            try {
                await this.store.register(this.username, this.password, this.passwordConfirmation);
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