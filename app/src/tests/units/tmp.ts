import { buildContent } from "@/savedContent/ItemBuilder/contentBuilder";
import { SavedContentType } from "../../savedContent/ISavedContent";
import comment from "./mockFetchData/soloItem/comment/comment.json";
import gallery from "./mockFetchData/soloItem/gallery/gallery.json";
import image from "./mockFetchData/soloItem/image/image.json";
import link from "./mockFetchData/soloItem/link/link.json";
import text from "./mockFetchData/soloItem/text.json";
import video from "./mockFetchData/soloItem/video/video.json";

export async function getLongItem(): Promise<SavedContentType[]> {
	return [
		await buildContent(comment),
		await buildContent(gallery),
		await buildContent(image),
		await buildContent(link),
		await buildContent(text),
		await buildContent(video),
	];
}

export const longItem = [
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Comment",
		author: "PM_ME_YOUR_SHELLCODE",
		id: "fot3ixm",
		fullname: "t1_fot3ixm",
		subreddit: "interestingasfuck",
		title: "Clear_lemon_pie",
		creationDate: "1970-01-19T09:07:23.834Z",
		redditUrl:
			"https://www.reddit.com/r/interestingasfuck/comments/g9abr7/clear_lemon_pie/fot3ixm/",
		comment: {
			text:
				"Since you say it doesn't exist I'm guessing you didn't find one?\nHere is one from a youtuber who tried to make a bunch of clear foods.\nhttps://barrylewis.net/recipe/clear-lemon-meringue-pie/\nAnd just because I found the videos interesting, a Playlist of clear foods:\nhttps://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp",
			htmlText:
				'<div class="md"><p>Since you say it doesn&#39;t exist I&#39;m guessing you didn&#39;t find one?</p>\n<p>Here is one from a youtuber who tried to make a bunch of clear foods.</p>\n<p><a href="https://barrylewis.net/recipe/clear-lemon-meringue-pie/">https://barrylewis.net/recipe/clear-lemon-meringue-pie/</a></p>\n<p>And just because I found the videos interesting, a Playlist of clear foods:</p>\n<p><a href="https://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp">https://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp</a></p>\n</div>',
			postAuthor: "Unicornglitteryblood",
			postLink: "https://i.redd.it/ck2300n8mfv41.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Text",
		author: "elheber",
		id: "k8e0io",
		fullname: "t3_k8e0io",
		subreddit: "gamedesign",
		title:
			"Counter_Play_Receiving_End_Design_or_Why_Sniper_Rifles_in_Multiplayer_Games_Usually_Suck",
		creationDate: "1970-01-19T14:28:56.018Z",
		redditUrl:
			"https://www.reddit.com/r/gamedesign/comments/k8e0io/counter_play_receivingend_design_or_why_sniper/",
		text: {
			text: " ",
			htmlText: "  ",
		},
		getText: () => "",
		getHtmlText: () => "	",
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Image",
		author: "renderisland",
		id: "jzyih0",
		fullname: "t3_jzyih0",
		subreddit: "Unity3D",
		title: "Ancient_Fantasy_Village",
		creationDate: "1970-01-19T14:09:53.720Z",
		redditUrl:
			"https://www.reddit.com/r/Unity3D/comments/jzyih0/ancient_fantasy_village/",
		gallery: {
			galleryURLs: [
				"https://i.redd.it/ywy9xkuxc4161.jpg",
				"https://i.redd.it/e581qnuxc4161.jpg",
			],
		},
		image: {
			imageLink: "https://i.redd.it/ywy9xkuxc4161.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Image",
		author: "NaomiScrafton",
		id: "kt2slt",
		fullname: "t3_kt2slt",
		subreddit: "graphic_design",
		title: "I_designed_a_support_bubble_Valentine_s_Day_card",
		creationDate: "1970-01-19T15:15:13.861Z",
		redditUrl:
			"https://www.reddit.com/r/graphic_design/comments/kt2slt/i_designed_a_support_bubble_valentines_day_card/",
		image: {
			imageLink: "https://i.redd.it/nxkfpkbm54a61.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Link",
		author: "flaming_bird",
		id: "l98aft",
		fullname: "t3_l98aft",
		subreddit: "lisp",
		title: "Why_I_still_Lisp_and_you_should_too",
		creationDate: "1970-01-19T15:48:02.121Z",
		redditUrl:
			"https://www.reddit.com/r/lisp/comments/l98aft/why_i_still_lisp_and_you_should_too/",
		link: {
			externalUrl:
				"https://mendhekar.medium.com/why-i-still-lisp-and-you-should-too-18a2ae36bd8",
			imageLink:
				"https://external-preview.redd.it/t7QzIsW7WXX5Bd-7oFT3Jz_PysF-noKWekEFaafbbK0.jpg?auto=webp&s=a1466dd73008fba5c8551d46bada1a0ba9db95be",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Video",
		author: "rvizzz",
		id: "juw3ud",
		fullname: "t3_juw3ud",
		subreddit: "compsci",
		title:
			"A_comparison_between_a_few_subdivision_algorithms_Catmull_Clark_Doo_Sabin_and_Midedge_Source_code_in",
		creationDate: "1970-01-19T13:58:03.439Z",
		redditUrl:
			"https://www.reddit.com/r/compsci/comments/juw3ud/a_comparison_between_a_few_subdivision_algorithms/",
		video: {
			externalUrl: "https://v.redd.it/pp2u78wtohz51",
			needYtDl: true,
			imageLink:
				"https://external-preview.redd.it/a4nKpG1GNFA_mFnQXgzsRKyrh4vpHbCvuOZ4X5FCblM.png?format=pjpg&auto=webp&s=d24dd49f78ecdac7103d03d3e4096539f1c34a93",
			embeddedUrl:
				"https://v.redd.it/pp2u78wtohz51/DASH_1080.mp4?source=fallback",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Image",
		author: "renderisland",
		id: "jzyih0",
		fullname: "t3_jzyih0",
		subreddit: "Unity3D",
		title: "Ancient_Fantasy_Village",
		creationDate: "1970-01-19T14:09:53.720Z",
		redditUrl:
			"https://www.reddit.com/r/Unity3D/comments/jzyih0/ancient_fantasy_village/",
		gallery: {
			galleryURLs: [
				"https://i.redd.it/ywy9xkuxc4161.jpg",
				"https://i.redd.it/e581qnuxc4161.jpg",
			],
		},
		image: {
			imageLink: "https://i.redd.it/ywy9xkuxc4161.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Image",
		author: "NaomiScrafton",
		id: "kt2slt",
		fullname: "t3_kt2slt",
		subreddit: "graphic_design",
		title: "I_designed_a_support_bubble_Valentine_s_Day_card",
		creationDate: "1970-01-19T15:15:13.861Z",
		redditUrl:
			"https://www.reddit.com/r/graphic_design/comments/kt2slt/i_designed_a_support_bubble_valentines_day_card/",
		image: {
			imageLink: "https://i.redd.it/nxkfpkbm54a61.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Link",
		author: "flaming_bird",
		id: "l98aft",
		fullname: "t3_l98aft",
		subreddit: "lisp",
		title: "Why_I_still_Lisp_and_you_should_too",
		creationDate: "1970-01-19T15:48:02.121Z",
		redditUrl:
			"https://www.reddit.com/r/lisp/comments/l98aft/why_i_still_lisp_and_you_should_too/",
		link: {
			externalUrl:
				"https://mendhekar.medium.com/why-i-still-lisp-and-you-should-too-18a2ae36bd8",
			imageLink:
				"https://external-preview.redd.it/t7QzIsW7WXX5Bd-7oFT3Jz_PysF-noKWekEFaafbbK0.jpg?auto=webp&s=a1466dd73008fba5c8551d46bada1a0ba9db95be",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Video",
		author: "rvizzz",
		id: "juw3ud",
		fullname: "t3_juw3ud",
		subreddit: "compsci",
		title:
			"A_comparison_between_a_few_subdivision_algorithms_Catmull_Clark_Doo_Sabin_and_Midedge_Source_code_in",
		creationDate: "1970-01-19T13:58:03.439Z",
		redditUrl:
			"https://www.reddit.com/r/compsci/comments/juw3ud/a_comparison_between_a_few_subdivision_algorithms/",
		video: {
			externalUrl: "https://v.redd.it/pp2u78wtohz51",
			needYtDl: true,
			imageLink:
				"https://external-preview.redd.it/a4nKpG1GNFA_mFnQXgzsRKyrh4vpHbCvuOZ4X5FCblM.png?format=pjpg&auto=webp&s=d24dd49f78ecdac7103d03d3e4096539f1c34a93",
			embeddedUrl:
				"https://v.redd.it/pp2u78wtohz51/DASH_1080.mp4?source=fallback",
		},
	},
];

export const shortItem = [
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Comment",
		author: "PM_ME_YOUR_SHELLCODE",
		id: "fot3ixm",
		fullname: "t1_fot3ixm",
		subreddit: "interestingasfuck",
		title: "Clear_lemon_pie",
		creationDate: "1970-01-19T09:07:23.834Z",
		redditUrl:
			"https://www.reddit.com/r/interestingasfuck/comments/g9abr7/clear_lemon_pie/fot3ixm/",
		comment: {
			text:
				"Since you say it doesn't exist I'm guessing you didn't find one?\nHere is one from a youtuber who tried to make a bunch of clear foods.\nhttps://barrylewis.net/recipe/clear-lemon-meringue-pie/\nAnd just because I found the videos interesting, a Playlist of clear foods:\nhttps://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp",
			htmlText:
				'<div class="md"><p>Since you say it doesn&#39;t exist I&#39;m guessing you didn&#39;t find one?</p>\n<p>Here is one from a youtuber who tried to make a bunch of clear foods.</p>\n<p><a href="https://barrylewis.net/recipe/clear-lemon-meringue-pie/">https://barrylewis.net/recipe/clear-lemon-meringue-pie/</a></p>\n<p>And just because I found the videos interesting, a Playlist of clear foods:</p>\n<p><a href="https://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp">https://www.youtube.com/playlist?list=PLfItiEY3o1msEiqMm3FukoGiFFcbAccdp</a></p>\n</div>',
			postAuthor: "Unicornglitteryblood",
			postLink: "https://i.redd.it/ck2300n8mfv41.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Text",
		author: "elheber",
		id: "k8e0io",
		fullname: "t3_k8e0io",
		subreddit: "gamedesign",
		title:
			"Counter_Play_Receiving_End_Design_or_Why_Sniper_Rifles_in_Multiplayer_Games_Usually_Suck",
		creationDate: "1970-01-19T14:28:56.018Z",
		redditUrl:
			"https://www.reddit.com/r/gamedesign/comments/k8e0io/counter_play_receivingend_design_or_why_sniper/",
		text: {
			text: " ",
			htmlText: "  ",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Image",
		author: "renderisland",
		id: "jzyih0",
		fullname: "t3_jzyih0",
		subreddit: "Unity3D",
		title: "Ancient_Fantasy_Village",
		creationDate: "1970-01-19T14:09:53.720Z",
		redditUrl:
			"https://www.reddit.com/r/Unity3D/comments/jzyih0/ancient_fantasy_village/",
		gallery: {
			galleryURLs: [
				"https://i.redd.it/ywy9xkuxc4161.jpg",
				"https://i.redd.it/e581qnuxc4161.jpg",
			],
		},
		image: {
			imageLink: "https://i.redd.it/ywy9xkuxc4161.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Image",
		author: "NaomiScrafton",
		id: "kt2slt",
		fullname: "t3_kt2slt",
		subreddit: "graphic_design",
		title: "I_designed_a_support_bubble_Valentine_s_Day_card",
		creationDate: "1970-01-19T15:15:13.861Z",
		redditUrl:
			"https://www.reddit.com/r/graphic_design/comments/kt2slt/i_designed_a_support_bubble_valentines_day_card/",
		image: {
			imageLink: "https://i.redd.it/nxkfpkbm54a61.jpg",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Link",
		author: "flaming_bird",
		id: "l98aft",
		fullname: "t3_l98aft",
		subreddit: "lisp",
		title: "Why_I_still_Lisp_and_you_should_too",
		creationDate: "1970-01-19T15:48:02.121Z",
		redditUrl:
			"https://www.reddit.com/r/lisp/comments/l98aft/why_i_still_lisp_and_you_should_too/",
		link: {
			externalUrl:
				"https://mendhekar.medium.com/why-i-still-lisp-and-you-should-too-18a2ae36bd8",
			imageLink:
				"https://external-preview.redd.it/t7QzIsW7WXX5Bd-7oFT3Jz_PysF-noKWekEFaafbbK0.jpg?auto=webp&s=a1466dd73008fba5c8551d46bada1a0ba9db95be",
		},
	},
	{
		isDeleted: false,
		isSelected: false,
		category: "",
		type: "Video",
		author: "rvizzz",
		id: "juw3ud",
		fullname: "t3_juw3ud",
		subreddit: "compsci",
		title:
			"A_comparison_between_a_few_subdivision_algorithms_Catmull_Clark_Doo_Sabin_and_Midedge_Source_code_in",
		creationDate: "1970-01-19T13:58:03.439Z",
		redditUrl:
			"https://www.reddit.com/r/compsci/comments/juw3ud/a_comparison_between_a_few_subdivision_algorithms/",
		video: {
			externalUrl: "https://v.redd.it/pp2u78wtohz51",
			needYtDl: true,
			imageLink:
				"https://external-preview.redd.it/a4nKpG1GNFA_mFnQXgzsRKyrh4vpHbCvuOZ4X5FCblM.png?format=pjpg&auto=webp&s=d24dd49f78ecdac7103d03d3e4096539f1c34a93",
			embeddedUrl:
				"https://v.redd.it/pp2u78wtohz51/DASH_1080.mp4?source=fallback",
		},
	},
];
