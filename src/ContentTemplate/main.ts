/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2025 Inkdex */

// TODO:
// - Fix exclude search
// - Add the English name to the title view
// - Add additional info to the title view
// - Make getChapterDetails only return new chapters
// - Add content settings support to search
// - Remove the content.json file and switch to cheerio

import {
  BasicRateLimiter,
  ContentRating,
  DiscoverSectionType,
  Form,
  type Chapter,
  type ChapterDetails,
  type ChapterProviding,
  type DiscoverSection,
  type DiscoverSectionItem,
  type DiscoverSectionProviding,
  type Extension,
  type MangaProviding,
  type PagedResults,
  type SearchFilter,
  type SearchQuery,
  type SearchResultItem,
  type SearchResultsProviding,
  type SettingsFormProviding,
  type SourceManga,
  type Tag,
  type TagSection,
} from "@paperback/types";
// Template content file
import content from "./content.json";
// Extension forms file
import { SettingsForm } from "./forms";
// Extension network file
import { MainInterceptor } from "./network";

// Should match the capabilities which you defined in pbconfig.ts
type ContentTemplateImplementation = SettingsFormProviding &
  Extension &
  DiscoverSectionProviding &
  SearchResultsProviding &
  MangaProviding &
  ChapterProviding;

// Main extension class
export class ContentTemplateExtension implements ContentTemplateImplementation {
  // Implementation of the main rate limiter
  mainRateLimiter = new BasicRateLimiter("main", {
    numberOfRequests: 15,
    bufferInterval: 10,
    ignoreImages: true,
  });

  // Implementation of the main interceptor
  mainInterceptor = new MainInterceptor("main");

  // Method from the Extension interface which we implement, initializes the rate limiter, interceptor, discover sections and search filters
  async initialise(): Promise<void> {
    this.mainRateLimiter.registerInterceptor();
    this.mainInterceptor.registerInterceptor();
  }

  // Implements the settings form, check SettingsForm.ts for more info
  async getSettingsForm(): Promise<Form> {
    return new SettingsForm();
  }

  async getDiscoverSections(): Promise<DiscoverSection[]> {
    // First template discover section, gets populated by the getDiscoverSectionItems method
    const discover_section_template1: DiscoverSection = {
      id: "discover-section-template1",
      title: "Discover Section Template 1",
      subtitle: "This is a template",
      type: DiscoverSectionType.featured,
    };

    // Second template discover section, gets populated by the getDiscoverSectionItems method
    const discover_section_template2: DiscoverSection = {
      id: "discover-section-template2",
      title: "Discover Section Template 2",
      subtitle: "This is another template",
      type: DiscoverSectionType.prominentCarousel,
    };

    // Second template discover section, gets populated by the getDiscoverSectionItems method
    const discover_section_template3: DiscoverSection = {
      id: "discover-section-template3",
      title: "Discover Section Template 3",
      subtitle: "This is yet another template",
      type: DiscoverSectionType.simpleCarousel,
    };

    return [discover_section_template1, discover_section_template2, discover_section_template3];
  }

  // Populates both the discover sections
  async getDiscoverSectionItems(
    section: DiscoverSection,
    metadata: number | undefined,
  ): Promise<PagedResults<DiscoverSectionItem>> {
    void metadata;

    let i: number = 0;
    let j: number = 1;
    let type:
      | "featuredCarouselItem"
      | "simpleCarouselItem"
      | "prominentCarouselItem"
      | "chapterUpdatesCarouselItem"
      | "genresCarouselItem";
    switch (section.id) {
      case "discover-section-template1":
        j = 2;
        type = "featuredCarouselItem";
        break;
      case "discover-section-template2":
        i = content.length / 2;
        j = 2;
        type = "prominentCarouselItem";
        break;
      case "discover-section-template3":
        type = "simpleCarouselItem";
        break;
    }

    return {
      items: Array.from(Array(content.length / j)).map(() => {
        const result = {
          mangaId: content[i]?.titleId,
          title: content[i]?.primaryTitle ? content[i]?.primaryTitle : "Unknown Title",
          subtitle: content[i]?.secondaryTitles[0],
          imageUrl: content[i]?.thumbnailUrl ? content[i]?.thumbnailUrl : "",
          type: type,
        } as DiscoverSectionItem;
        ++i;
        return result;
      }),
    };
  }

  // Populate search filters
  async getSearchFilters(): Promise<SearchFilter[]> {
    return [
      {
        id: "search-filter-template",
        type: "dropdown",
        options: [
          { id: "include", value: "include" },
          { id: "exclude", value: "exclude" },
        ],
        value: "Exclude",
        title: "Search Filter Template",
      },
    ];
  }

  // Populates search
  async getSearchResults(
    query: SearchQuery,
    metadata?: number,
  ): Promise<PagedResults<SearchResultItem>> {
    void metadata;

    const results: PagedResults<SearchResultItem> = { items: [] };

    for (let i = 0; i < content.length; i++) {
      const manga = content[i];
      if (!manga) continue;
      if (
        (manga.primaryTitle.toLowerCase().indexOf(query.title.toLowerCase()) != -1 &&
          query.filters[0]?.value == "include") ||
        (manga.primaryTitle.toLowerCase().indexOf(query.title.toLowerCase()) == -1 &&
          query.filters[0]?.value == "exclude")
      ) {
        if (manga.titleId) {
          const result: SearchResultItem = {
            mangaId: manga.titleId,
            title: manga.primaryTitle ? manga.primaryTitle : "Unknown Title",
            subtitle: manga.secondaryTitles[0] ?? "",
            imageUrl: manga.thumbnailUrl ? manga.thumbnailUrl : "",
          };
          results.items.push(result);
        }
      } else {
        for (let j = 0; j < manga.secondaryTitles.length; j++) {
          const secondaryTitles = manga.secondaryTitles[j];
          if (!secondaryTitles) continue;
          if (
            (secondaryTitles.toLowerCase().indexOf(query.title.toLowerCase()) != -1 &&
              query.filters[0]?.value == "include") ||
            (secondaryTitles.toLowerCase().indexOf(query.title.toLowerCase()) == -1 &&
              query.filters[0]?.value == "exclude")
          ) {
            if (manga.titleId) {
              const result: SearchResultItem = {
                mangaId: manga.titleId,
                title: manga.primaryTitle ? manga.primaryTitle : "Unknown Title",
                subtitle: manga.secondaryTitles[0] ?? "",
                imageUrl: manga.thumbnailUrl ? manga.thumbnailUrl : "",
              };
              results.items.push(result);
            }
            break;
          }
        }
      }
    }
    return results;
  }

  // Populates the title details
  async getMangaDetails(mangaId: string): Promise<SourceManga> {
    for (let i = 0; i < content.length; i++) {
      const manga = content[i];
      if (!manga) continue;
      if (mangaId == manga.titleId) {
        let contentRating: ContentRating;
        switch (manga.contentRating) {
          case "ADULT":
            contentRating = ContentRating.ADULT;
            break;
          case "MATURE":
            contentRating = ContentRating.MATURE;
            break;
          default:
            contentRating = ContentRating.EVERYONE;
            break;
        }

        const genres: TagSection = {
          id: "genres",
          title: "Genres",
          tags: [],
        };
        for (let j = 0; j < manga.genres.length; j++) {
          const genre = manga.genres[j];
          if (!genre) continue;
          const tagItem: Tag = {
            id: genre.toLowerCase().replace(" ", "-"),
            title: genre,
          };
          genres.tags.push(tagItem);
        }

        const tags: TagSection = {
          id: "tags",
          title: "Tags",
          tags: [],
        };
        for (let j = 0; j < manga.tags.length; j++) {
          const tag = manga.tags[j];
          if (!tag) continue;
          const tagItem: Tag = {
            id: tag.toLowerCase().replace(" ", "-"),
            title: tag,
          };
          tags.tags.push(tagItem);
        }

        return {
          mangaId,
          mangaInfo: {
            thumbnailUrl: manga.thumbnailUrl ? manga.thumbnailUrl : "",
            synopsis: manga.synopsis ? manga.synopsis : "No synopsis.",
            primaryTitle: manga.primaryTitle ? manga.primaryTitle : "Unknown Title",
            secondaryTitles: manga.secondaryTitles ? manga.secondaryTitles : [],
            contentRating,
            status: manga.status,
            author: manga.author,
            rating: manga.rating,
            tagGroups: [genres, tags],
            artworkUrls: [manga.thumbnailUrl],
            shareUrl: manga.url,
          },
        };
      }
    }
    throw new Error("No title with this id exists");
  }

  // Populates the chapter list
  async getChapters(sourceManga: SourceManga, sinceDate?: Date): Promise<Chapter[]> {
    // Can be used to only return new chapters. Not used here, instead the whole chapter list gets returned
    void sinceDate;

    for (let i = 0; i < content.length; i++) {
      const manga = content[i];
      if (!manga) continue;
      if (sourceManga.mangaId == manga.titleId) {
        const chapters: Chapter[] = [];

        for (let j = 0; j < manga.chapters.length; j++) {
          const chaptersData = manga.chapters[j];
          if (!chaptersData) continue;
          if (chaptersData.chapterId) {
            const chapter: Chapter = {
              chapterId: chaptersData.chapterId,
              sourceManga,
              langCode: chaptersData.languageCode ? chaptersData.languageCode : "EN",
              chapNum: chaptersData.chapterNumber ? chaptersData.chapterNumber : j + 1,
              title: manga.primaryTitle,
              volume: chaptersData.volumeNumber,
            };
            chapters.push(chapter);
          }
        }
        return chapters;
      }
    }
    throw new Error("No title with this id exists");
  }

  // Populates a chapter with images
  async getChapterDetails(chapter: Chapter): Promise<ChapterDetails> {
    for (let i = 0; i < content.length; i++) {
      const manga = content[i];
      if (!manga) continue;
      if (chapter.sourceManga.mangaId == manga.titleId) {
        for (let j = 0; j < manga.chapters.length; j++) {
          const chapterData = manga.chapters[j];
          if (!chapterData) continue;
          if (chapter.chapterId == chapterData.chapterId) {
            const chapterDetails: ChapterDetails = {
              id: chapter.chapterId,
              mangaId: chapter.sourceManga.mangaId,
              pages: chapterData.pages,
            };
            return chapterDetails;
          }
        }
        throw new Error("No chapter with this id exists");
      }
    }
    throw new Error("No title with this id exists");
  }
}

export const ContentTemplate = new ContentTemplateExtension();
