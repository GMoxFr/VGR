<template>
    <div ref="chartContainer"></div>
</template>

<script setup>
import { ref, watch, onMounted, defineProps } from "vue";
import Plotly from "plotly.js-dist";

const props = defineProps({
    data: Array,
    layout: Object,
});

const chartContainer = ref(null);

onMounted(() => {
    if (props.data && props.layout) {
        Plotly.newPlot(chartContainer.value, props.data, props.layout);
    }
});

watch(
    () => [props.data, props.layout],
    ([newData, newLayout], [oldData, oldLayout]) => {
        if (!newData || !newLayout) return;

        // Vérifier si les données ont réellement changé
        if (JSON.stringify(newData) !== JSON.stringify(oldData) || JSON.stringify(newLayout) !== JSON.stringify(oldLayout)) {
            console.log("Mise à jour du graphique");
            Plotly.react(chartContainer.value, newData, newLayout);
        }
    },
    { deep: true }
);
</script>