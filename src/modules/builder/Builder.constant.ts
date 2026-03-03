/**
 *
 * Author: @shaishab316
 * Last modify: 03/03/2026
 *
 */

import path from "node:path";

export const BUILDER_FILE_CONFIG = {
  route: {
    folder: "routes",
    extension: "ts",
    checked: true,
    template: (m: string) => /* ts */ `import { Router } from 'express';

const router = Router();

export const ${m}Routes = router;`,
  },

  interface: {
    folder: "interfaces",
    extension: "ts",
    checked: true,
    template: () => ``,
  },

  model: {
    folder: "models",
    extension: "prisma",
    checked: true,
    template: (m: string) => /* prisma */ `model ${m} {
  id         String   @id @default(uuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("${m[0].toLowerCase()}${m.slice(1)}s")
}`,
  },

  controller: {
    folder: "controllers",
    extension: "ts",
    checked: true,
    template: (m: string) => /* ts */ `export const ${m}Controllers = {};`,
  },

  service: {
    folder: "services",
    extension: "ts",
    checked: true,
    template: (m: string) => /* ts */ `export const ${m}Services = {};`,
  },

  validation: {
    folder: "validations",
    extension: "ts",
    checked: true,
    template: (m: string) => /* ts */ `export const ${m}Validations = {};`,
  },

  middleware: {
    folder: "middlewares",
    extension: "ts",
    checked: false,
    template: (m: string) => /* ts */ `export const ${m}Middlewares = {};`,
  },

  utils: {
    folder: "utils",
    extension: "ts",
    checked: false,
    template: () => ``,
  },

  lib: {
    folder: "lib",
    extension: "ts",
    checked: false,
    template: () => ``,
  },

  template: {
    folder: "templates",
    extension: "ts",
    checked: false,
    template: (m: string) => /* ts */ `export const ${m}Templates = {};`,
  },

  enum: {
    folder: "enums",
    extension: "ts",
    checked: false,
    template: (m: string) => /* ts */ `export enum E${m} {}`,
  },
} as const;

export type TBuilderFile = keyof typeof BUILDER_FILE_CONFIG;

export const MODULE_DIR = path.resolve(process.cwd(), "src", "modules");
