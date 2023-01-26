<script>
	import Header from '../lib/components/Header.svelte';

	function display() {

	}
</script>

<svelte:head>
	<title>Keval Kapdee</title>
</svelte:head>

<div class="background-low">
	<div class="background-high">
		<div class="image_cover">
			<div class="interface">
				<div class="header">
					<Header />
				</div>
				<div class="content">
					<div class="spacer" />
					<slot />
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.background-low,
	.background-high,
	.interface,
	.image_cover {
		position: relative;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center center;
		height: 100vh;
	}

	.background-low {
		background-image: url('background-low.jpg');
	}

	.background-high {
		background-image: url('background-high.jpg');
		visibility: none;
	}

	.interface {
		background-image: url('interface.svg');
		background-size: 100% auto;
		background-position: center bottom;
	}

	.image_cover {
		background: linear-gradient(#2a2a2a2f, 16%, #2a2a2aea);
		height: 100vh;
	}

	.content {
		margin: auto;
		padding: 1rem;
		max-width: 900px;
	}

	.spacer {
		height: 100vh;
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
