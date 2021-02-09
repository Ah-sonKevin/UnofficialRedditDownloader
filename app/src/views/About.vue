<template>
	<h1>Why this site ?</h1>
	THis site allow you to easily save any reddits post on your computer or pn the
	content manager Pocket. It can also connect ro your reddit account to get your
	saved post.
	<div></div>
	<h2>I can't see some of my saved posts</h2>
	Due to reddit's limitation no more than 1000 saved element can be fetched. If
	you have bugs, please post it on the
	<a href="https://github.com/Ah-sonKevin/UnofficialRedditDownloader"
		>Github page</a
	>
	<h1 id="security">Is this safe ?</h1>
	<div>
		The connection i handled by reddit, when conection you will be redirected to
		the reddit site when you will be asked to conencted and authorize this site
		to access your saved posts, thsi site will <strong>never</strong> have
		access to your credential and can. This app will ask access to:
		<ul>
			<li>
				Your identity: so it can check if you're reddit premium and then give
				you access to your saved's categories
			</li>
			>
			<li>
				Your History : so it can have access to your saved posts and unsave them
				if asked to
			</li>

			At all time you can revoke this site access to your account. To do so, on
			reddit go to User Settings => Safety \& Privact => Manage third-party app
			authorization => RedditManager => Revoke Access
		</ul>
	</div>
</template>

<script lang="ts"></script>
