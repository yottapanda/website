<script>
	import SocialLink from '../components/SocialLink.svelte';

	let panda_mode = true;
</script>

<div class="title">
	<h1>Keval Kapdee</h1>
	<h4>thechubbypanda</h4>
</div>
<div class="socials">
	<script>
		if (window.location.href.includes('keval.kapdee.uk')) {
			panda_mode = false;
		}
	</script>
	<SocialLink
		title={'Email'}
		href={panda_mode ? 'mailto:keval@thechubbypanda.net' : 'mailto:keval@kapdee.uk'}
		faClass={'fas fa-envelope'}
	/>
	<SocialLink
		title={'GitHub'}
		href={'https://github.com/thechubbypanda'}
		faClass={'fab fa-github'}
	/>
	<SocialLink
		title={'LinkedIn'}
		href={'https://www.linkedin.com/in/keval-kapdee'}
		faClass={'fab fa-linkedin'}
	/>
	<SocialLink
		title={'StackOverflow'}
		href={'https://stackoverflow.com/users/4896472/thechubbypanda'}
		faClass={'fab fa-stack-overflow'}
	/>
	<SocialLink
		title={'Itch.io'}
		href={'https://thechubbypanda.itch.io'}
		faClass={'fa-brands fa-itch-io'}
	/>
</div>

<style>
	.title {
		font-size: 1.5rem;
		text-align: center;
	}

	.title > * {
		margin: 0.5rem;
	}

	.socials {
		padding: 1rem;
		display: flex;
		flex-flow: row;
		flex-wrap: wrap;
		row-gap: 0.5rem;
		column-gap: 1rem;
		justify-content: space-evenly;
	}
</style>
