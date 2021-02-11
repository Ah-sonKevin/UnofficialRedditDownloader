<template>
	<div id="app">
		<header class="header">
			<TheNavigation></TheNavigation>
		</header>

		<router-view v-slot="{ Component }">
			<transition name="fade" mode="out-in">
				<component :is="Component" />
			</transition>
		</router-view>
		<TheFooter></TheFooter>
	</div>
</template>

<script lang="ts">
import TheFooter from "@/components/General/TheFooter.vue";
import TheNavigation from "@/components/General/TheNavigation.vue";

export default {
	components: { TheNavigation, TheFooter },
};
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	background-color: #030303;
	color: white;
}

#nav {
	padding: 30px;

	a {
		font-weight: bold;
		color: #2c3e50;

		&.router-link-exact-active {
			color: #42b983;
		}
	}
}
</style>
