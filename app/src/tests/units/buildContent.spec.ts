/**
 * @jest-environment jsdom
 */
import { buildContent } from "@/savedContent/contentBuilder";
import SavedContent from "@/savedContent/savedContent";
import comment from "./mockFetchData/soloItem/comment/comment.json";
import gallery from "./mockFetchData/soloItem/gallery/gallery.json";
import image from "./mockFetchData/soloItem/image/image.json";
import link from "./mockFetchData/soloItem/link/link.json";
import text from "./mockFetchData/soloItem/text.json";
import video from "./mockFetchData/soloItem/video/video.json";

describe("BuildContent function", () => {
	describe("Text", () => {
		test("Text", async () => {
			const content = await buildContent(text);
			expect(content).toEqual({
				author: "elheber",
				id: "k8e0io",
				fullname: "t3_k8e0io",
				subreddit: "gamedesign",
				text: `[Extra Credits made a video on this back in 2012.](https://youtu.be/BRBcjsOt0_g) In it, Dan explained a multiplayer design concept by Riot Game's Tom Cadwell called \"counter play.\"

&gt;On a basic level, it's the idea that in a multiplayer game, when designing an ability or mechanic, you can't only be thinking of about how to make that ability or mechanic interesting for the player who gets to use it. You also have to think about how it's interesting for the players who it gets used on. On a more rigorous level, it's the idea that a mechanic or ability in a multiplayer game should increase the number of meaningful choices available both to the player using it and a player it's being used on.

Even back then I noticed a lot of people didn't fully understand the concept [which you can see from my from my cringeworthy post](https://i.imgur.com/nhHj52y.png) at the time [on Penny Arcade's comment section](https://www.penny-arcade.com/patv/episode/counter-play) (I'm so sorry at how iamverysmart I sounded back then). The design philosophy is sometimes still being misunderstood —probably because the design theory has the word \"counter\" in its name— so I'd like to explain counter play in another way:

####The core concept of counter play is that you design an opponent so that they are fun for the player to fight against.

You may have realized that I didn't even say \"multiplayer.\" This is because game designers already understand counter play on a fundamental level when it comes to single-player games. We design enemies and bosses to be fun not for the CPU, but for the player to fight against.

So I'm taking the definition a little further than James and Dan of Extra Credits did. Counter play is to design an opponent's attacks so that *it's fun to be on the receiving end.* Boss encounters are usually great examples of counter play, as a lot of the battle is dealing with their onslaught. A multiplayer example of this is the 1v3 minigames in Mario Party, in which one lucky player gets to be like a boss enemy with all the power... and yet it's somehow *still* fun to be one of the three players on the receiving end of the onslaught. Those minigames have great counter play or \"receiving-end\" design. It's as much fun to deal with the attacks as it is to make the attacks.

I don't want to divorce \"counter play\" from its links to single-player design because in the end it's the same design philosophy. Counter play in multiplayer is an extension of a design philosophy that game developers already have when designing enemies and bosses. \"How will this enemy attack be fun for the player,\" is something we don't need to ask ourselves because we were always considering the player from the start. We only need to apply that logic to the opponent in our multiplayer games. \"How will this attack be fun for the opponent?\" After all, we don't want every weapon to be a one-shot sniper rifle.

And so we arrive at the dreaded sniper rifle.

For a long time the notorious sniper rifle was the prime example of bad counter play. You could be playing mindfully, when without warning —BLAM!— respawn next round. It's fun to snipe but not so much to get snipped. Single-player games deal with this by giving enemy snipers a [bright laser](https://static.wikia.nocookie.net/uncharted/images/5/5b/Race_to_the_Rescue_gameplay_1.png/revision/latest?cb=20200619082629) which gives the player something tangible to play against, and they wouldn't one-shot you at full health. In multiplayer games however, you could drop dead at random.

It's not always bad of course. Knowing there's a sniper on you, trying to juke him, zig zagging to cover and risking a counterattack are all super thrilling. Simply knowing where the sniper is adds counter play. Modern games have gotten a lot better at giving counter play to the sniper role. Scope glare (a mechanic that lets you spot where a sniper is if they are aiming in your direction) has been a game-changing addition: Before, you were getting snipped; now, you're *dealing with* a sniper. It's a subtle but important difference.

****

Counter play is a broad, important design philosophy. It's not just about hitscan weapons. It's not just about strategic counters and expanding \"meaningful options\" either. It *can* include challenge of execution like you'd find in action games or multiplayer fighting games. It's not even just about multiplayer. If you've ever fought an unfair enemy with attacks that stun lock you or don't telegraph, or a boring damage-sponge boss that doesn't challenge you with tricky attacks... that's bad counter play in single player.

At it's most basic definition, counter play is to design offense to be fun for the defense.

By framing the design philosophy to include single-player, where everyone already understands it on a \"no duh\" level, it's easier to see how it applies equally to multiplayer. Being stuck on the 3-person team in a 1v3 Mario Party minigame would not be fun without wonderful, delicious counter play.`,

				htmlText: `<!-- SC_OFF --><div class=\"md\"><p><a href=\"https://youtu.be/BRBcjsOt0_g\">Extra Credits made a video on this back in 2012.</a> In it, Dan explained a multiplayer design concept by Riot Game&#39;s Tom Cadwell called &quot;counter play.&quot;</p>

<blockquote>
<p>On a basic level, it&#39;s the idea that in a multiplayer game, when designing an ability or mechanic, you can&#39;t only be thinking of about how to make that ability or mechanic interesting for the player who gets to use it. You also have to think about how it&#39;s interesting for the players who it gets used on. On a more rigorous level, it&#39;s the idea that a mechanic or ability in a multiplayer game should increase the number of meaningful choices available both to the player using it and a player it&#39;s being used on.</p>
</blockquote>

<p>Even back then I noticed a lot of people didn&#39;t fully understand the concept <a href=\"https://i.imgur.com/nhHj52y.png\">which you can see from my from my cringeworthy post</a> at the time <a href=\"https://www.penny-arcade.com/patv/episode/counter-play\">on Penny Arcade&#39;s comment section</a> (I&#39;m so sorry at how iamverysmart I sounded back then). The design philosophy is sometimes still being misunderstood —probably because the design theory has the word &quot;counter&quot; in its name— so I&#39;d like to explain counter play in another way:</p>

<h4>The core concept of counter play is that you design an opponent so that they are fun for the player to fight against.</h4>

<p>You may have realized that I didn&#39;t even say &quot;multiplayer.&quot; This is because game designers already understand counter play on a fundamental level when it comes to single-player games. We design enemies and bosses to be fun not for the CPU, but for the player to fight against.</p>

<p>So I&#39;m taking the definition a little further than James and Dan of Extra Credits did. Counter play is to design an opponent&#39;s attacks so that <em>it&#39;s fun to be on the receiving end.</em> Boss encounters are usually great examples of counter play, as a lot of the battle is dealing with their onslaught. A multiplayer example of this is the 1v3 minigames in Mario Party, in which one lucky player gets to be like a boss enemy with all the power... and yet it&#39;s somehow <em>still</em> fun to be one of the three players on the receiving end of the onslaught. Those minigames have great counter play or &quot;receiving-end&quot; design. It&#39;s as much fun to deal with the attacks as it is to make the attacks.</p>

<p>I don&#39;t want to divorce &quot;counter play&quot; from its links to single-player design because in the end it&#39;s the same design philosophy. Counter play in multiplayer is an extension of a design philosophy that game developers already have when designing enemies and bosses. &quot;How will this enemy attack be fun for the player,&quot; is something we don&#39;t need to ask ourselves because we were always considering the player from the start. We only need to apply that logic to the opponent in our multiplayer games. &quot;How will this attack be fun for the opponent?&quot; After all, we don&#39;t want every weapon to be a one-shot sniper rifle.</p>

<p>And so we arrive at the dreaded sniper rifle.</p>

<p>For a long time the notorious sniper rifle was the prime example of bad counter play. You could be playing mindfully, when without warning —BLAM!— respawn next round. It&#39;s fun to snipe but not so much to get snipped. Single-player games deal with this by giving enemy snipers a <a href=\"https://static.wikia.nocookie.net/uncharted/images/5/5b/Race_to_the_Rescue_gameplay_1.png/revision/latest?cb=20200619082629\">bright laser</a> which gives the player something tangible to play against, and they wouldn&#39;t one-shot you at full health. In multiplayer games however, you could drop dead at random.</p>

<p>It&#39;s not always bad of course. Knowing there&#39;s a sniper on you, trying to juke him, zig zagging to cover and risking a counterattack are all super thrilling. Simply knowing where the sniper is adds counter play. Modern games have gotten a lot better at giving counter play to the sniper role. Scope glare (a mechanic that lets you spot where a sniper is if they are aiming in your direction) has been a game-changing addition: Before, you were getting snipped; now, you&#39;re <em>dealing with</em> a sniper. It&#39;s a subtle but important difference.</p>

<hr/>

<p>Counter play is a broad, important design philosophy. It&#39;s not just about hitscan weapons. It&#39;s not just about strategic counters and expanding &quot;meaningful options&quot; either. It <em>can</em> include challenge of execution like you&#39;d find in action games or multiplayer fighting games. It&#39;s not even just about multiplayer. If you&#39;ve ever fought an unfair enemy with attacks that stun lock you or don&#39;t telegraph, or a boring damage-sponge boss that doesn&#39;t challenge you with tricky attacks... that&#39;s bad counter play in single player.</p>

<p>At it&#39;s most basic definition, counter play is to design offense to be fun for the defense.</p>

<p>By framing the design philosophy to include single-player, where everyone already understands it on a &quot;no duh&quot; level, it&#39;s easier to see how it applies equally to multiplayer. Being stuck on the 3-person team in a 1v3 Mario Party minigame would not be fun without wonderful, delicious counter play.</p>
</div><!-- SC_ON -->`,
				title:
					'Counter Play, "Receiving-End Design" —or— Why Sniper Rifles in Multiplayer Games Usually Suck',
				isVideo: false,
				type: "Text",
				isLink: false,
				isSelected: false,
				kind: "t3",
				needYtDl: false,
				redditUrl:
					"https://www.reddit.com/r/gamedesign/comments/k8e0io/counter_play_receivingend_design_or_why_sniper/",
				imageLink: "",
				isDeleted: false,
				isGallery: false,
				isText: true,
				galleryURLs: [],
				hasImage: false,
				category: "",
				creationDate: new Date(content.creationDate), // todo use date constructor
				embeddedUrl: "",
				externalUrl: "",
			} as SavedContent);
		});
	});

	describe("Comment", () => {
		test("Comment", async () => {
			const content = await buildContent(comment);
			expect(content).toEqual({
				author: "PM_ME_YOUR_SHELLCODE",
				id: "fot3ixm",
				fullname: "t1_fot3ixm",
				subreddit: "interestingasfuck",
				type: "Comment",
				isLink: false,
				isSelected: false,
				title: "Clear lemon pie",
				isVideo: false,
				kind: "t1",
				needYtDl: false,
				redditUrl:
					"https://www.reddit.com/r/interestingasfuck/comments/g9abr7/clear_lemon_pie/fot3ixm/",
				imageLink: "",
				isDeleted: false,
				isGallery: false,
				isText: true,
				galleryURLs: [],
				hasImage: false,
				category: "",
				postAuthor: "Unicornglitteryblood",
				postLink: "https://i.redd.it/ck2300n8mfv41.jpg",
				creationDate: new Date(content.creationDate), // todo use date constructor
				embeddedUrl: "",
				externalUrl: "",
				text: `Since you say it doesn't exist I'm guessing you didn't find one?

Here is one from a youtuber who tried to make a bunch of clear foods.

https://barrylewis.net/recipe/clear-lemon-meringue-pie/

And just because I found the videos interesting, a Playlist of clear foods:

https://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp`,
				htmlText: `<div class=\"md\"><p>Since you say it doesn&#39;t exist I&#39;m guessing you didn&#39;t find one?</p>

<p>Here is one from a youtuber who tried to make a bunch of clear foods.</p>

<p><a href=\"https://barrylewis.net/recipe/clear-lemon-meringue-pie/\">https://barrylewis.net/recipe/clear-lemon-meringue-pie/</a></p>

<p>And just because I found the videos interesting, a Playlist of clear foods:</p>

<p><a href=\"https://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp\">https://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp</a></p>
</div>`,
			} as SavedContent);
		});
	});

	describe("Link", () => {
		test("Link", async () => {
			const content = await buildContent(link); // todo
			expect(content).toEqual({
				author: "flaming_bird",
				category: "",
				creationDate: new Date(content.creationDate),
				embeddedUrl: "",
				externalUrl:
					"https://mendhekar.medium.com/why-i-still-lisp-and-you-should-too-18a2ae36bd8",
				fullname: "t3_l98aft",
				galleryURLs: [],
				hasImage: true,
				id: "l98aft",
				imageLink:
					"https://external-preview.redd.it/t7QzIsW7WXX5Bd-7oFT3Jz_PysF-noKWekEFaafbbK0.jpg?auto=webp&s=a1466dd73008fba5c8551d46bada1a0ba9db95be",
				isDeleted: false,
				isGallery: false,
				isLink: true,
				isSelected: false,
				isText: false,
				isVideo: false,
				kind: "t3",
				needYtDl: false,
				redditUrl:
					"https://www.reddit.com/r/lisp/comments/l98aft/why_i_still_lisp_and_you_should_too/",
				subreddit: "lisp",
				title: "Why I still Lisp (and you should too!)",
				type: "Link",
			});
		});
	});

	describe("Image", () => {
		test("Image", async () => {
			const content = await buildContent(image);
			expect(content).toEqual({
				author: "NaomiScrafton",
				id: "kt2slt",
				fullname: "t3_kt2slt",
				subreddit: "graphic_design",

				title: "I designed a support bubble Valentine’s Day card",
				isVideo: false,

				type: "Image",

				kind: "t3",
				needYtDl: false,

				redditUrl:
					"https://www.reddit.com/r/graphic_design/comments/kt2slt/i_designed_a_support_bubble_valentines_day_card/",
				imageLink: "https://i.redd.it/nxkfpkbm54a61.jpg",
				isDeleted: false,
				isGallery: false,
				isLink: false,
				isSelected: false,
				isText: false,
				galleryURLs: [],
				hasImage: true,
				category: "",
				creationDate: new Date(content.creationDate), // todo use date constructor
				embeddedUrl: "",
				externalUrl: "https://i.redd.it/nxkfpkbm54a61.jpg",
			} as SavedContent);
		});
	});

	describe("Gallery", () => {
		test("Gallery", async () => {
			const content = await buildContent(gallery);
			expect(content).toEqual({
				author: "renderisland",
				id: "jzyih0",
				fullname: "t3_jzyih0",
				subreddit: "Unity3D",
				title: "Ancient Fantasy Village",
				isVideo: false,
				isGallery: true,
				type: "Image", // change type to enum
				kind: "t3",
				needYtDl: false,
				redditUrl:
					"https://www.reddit.com/r/Unity3D/comments/jzyih0/ancient_fantasy_village/",
				imageLink: "https://i.redd.it/ywy9xkuxc4161.jpg",
				isDeleted: false,
				isLink: false,
				isSelected: false,
				isText: false,
				galleryURLs: [
					"https://i.redd.it/ywy9xkuxc4161.jpg",
					"https://i.redd.it/e581qnuxc4161.jpg",
				],
				hasImage: true,
				category: "",
				creationDate: new Date(content.creationDate), // todo use date constructor
				embeddedUrl: "",
				externalUrl: "",
			} as SavedContent);
		});
	});

	describe("Video", () => {
		test("Video", async () => {
			const content = await buildContent(video);
			expect(content).toEqual({
				author: "rvizzz",
				id: "juw3ud",
				fullname: "t3_juw3ud",
				subreddit: "compsci",
				title:
					"A comparison between a few subdivision algorithms (Catmull-Clark, Doo-Sabin, and Midedge). Source code in comments",
				isVideo: true,
				type: "Video",
				category: "",
				creationDate: new Date(content.creationDate),
				embeddedUrl:
					"https://v.redd.it/pp2u78wtohz51/DASH_1080.mp4?source=fallback",
				externalUrl: "https://v.redd.it/pp2u78wtohz51",
				galleryURLs: [],
				hasImage: true,
				imageLink:
					"https://external-preview.redd.it/a4nKpG1GNFA_mFnQXgzsRKyrh4vpHbCvuOZ4X5FCblM.png?format=pjpg&auto=webp&s=d24dd49f78ecdac7103d03d3e4096539f1c34a93",
				isDeleted: false,
				isGallery: false,
				isLink: false,
				isSelected: false,
				isText: false,
				kind: "t3",
				needYtDl: true,
				redditUrl:
					"https://www.reddit.com/r/compsci/comments/juw3ud/a_comparison_between_a_few_subdivision_algorithms/",
			} as SavedContent);
		});
	});
});
