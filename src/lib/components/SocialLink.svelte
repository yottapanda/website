<script>
	/**
	 * @type {string}
	 */
	export let title;
	/**
	 * @type {string}
	 */
	export let faClass;
	/**
	 * @type {string}
	 */
	export let href;
</script>

<a {href}>
	<div class="icon_wrapper">
		<i class={faClass} />
	</div>
	<span>{title}</span>
</a>

<style>
	a {
		display: grid;
		grid-template-columns: auto auto;
		justify-content: center;
		column-gap: 5%;
		font-size: 1.1rem;
		text-decoration: none;
		padding: 0 0.5rem;
	}

	.icon_wrapper {
		display: inline-block;
		vertical-align: middle;
	}
</style>
