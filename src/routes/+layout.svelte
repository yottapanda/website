<script>
	import Header from '../lib/components/Header.svelte';
	import 'lazysizes';
</script>

<svelte:head>
	<title>Keval Kapdee</title>
</svelte:head>

<div class="background-container">
	<img
		class="background lazyload blur"
		alt="background"
		data-sizes="auto"
		src="background-low.jpg"
		data-srcset="background-low.jpg 1008w,
    background-med.jpg 2016w,
    background-high.jpg 4032w"
	/>
	<div class="gradient" />
	<div class="interface" />
</div>
<div class="header">
	<Header />
</div>
<div class="content">
	<slot />
</div>

<style>
	.background-container {
		position: relative;
		height: 100vh;
		width: 100%;
	}

	.background,
	.gradient,
	.interface {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.blur.lazyload {
		filter: blur(3px);
	}

	.blur {
		filter: blur(0);
		transition: filter 500ms;
	}

	.gradient {
		background: linear-gradient(#2a2a2a2f, 16%, #2a2a2aea);
	}

	.interface {
		object-fit: unset;
		background-image: url('interface.svg');
		background-size: 100% auto;
		background-repeat: no-repeat;
		background-position: center bottom;
	}

	.content {
		margin: auto;
		padding: 1rem;
		max-width: 900px;
	}

	.header {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 95%;
		max-width: 900px;
	}
</style>
