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
	<svg class="interface" id="visual" viewBox="0 0 960 540" width="960" height="540" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><rect x="0" y="0" width="960" height="540" fill="#00000000"></rect><path d="M0 504L120 497L240 501L360 498L480 497L600 491L720 510L840 488L960 495L960 541L840 541L720 541L600 541L480 541L360 541L240 541L120 541L0 541Z" fill="#747473"></path><path d="M0 507L120 502L240 509L360 518L480 520L600 508L720 519L840 515L960 518L960 541L840 541L720 541L600 541L480 541L360 541L240 541L120 541L0 541Z" fill="#444444"></path><path d="M0 514L120 524L240 518L360 517L480 520L600 526L720 530L840 533L960 521L960 541L840 541L720 541L600 541L480 541L360 541L240 541L120 541L0 541Z" fill="#1a1a1a"></path></svg>
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
		bottom: 0;
		height: auto;
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
