import { ContentRating, SourceInfo, SourceIntents } from "@paperback/types";

export default {
    name: "Content Template",
    description:
        "Template that shows the functionality of content providing extensions.",
    version: "1.0.0-alpha.2",
    icon: "icon.png",
    language: "en",
    contentRating: ContentRating.EVERYONE,
    capabilities: [
        SourceIntents.SETTINGS_UI,
        SourceIntents.DISCOVER_SECIONS,
        SourceIntents.MANGA_SEARCH,
        SourceIntents.MANGA_CHAPTERS,
    ],
    badges: [],
    developers: [
        {
            name: "Celarye",
            website: "https://celarye.dev",
            github: "https://github.com/Celarye",
        },
    ],
} satisfies SourceInfo;
