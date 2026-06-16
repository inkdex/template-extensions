/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2025 Inkdex */

import type { Tag } from "@paperback/types";

export const MODE_OPTIONS: Tag[] = [
  { id: "include", title: "Include" },
  { id: "exclude", title: "Exclude" },
];

export type ContentTemplateSearchMetadata = {
  mode?: "include" | "exclude";
};
