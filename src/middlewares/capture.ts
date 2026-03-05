import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import catchAsync from "./catchAsync";
import type { Request } from "express";
import { ServerError } from "@/errors";
import { statusCodes } from "@/lib/status_codes";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const FILE_TYPES = {
  images: /^image\//,
  videos: /^video\//,
  audios: /^audio\//,
  documents: /(pdf|word|excel|text)/,
  any: /.*/,
} as const;

type FileType = keyof typeof FILE_TYPES;

// Ensure all type subdir exist
Object.keys(FILE_TYPES).forEach((type) =>
  fs.mkdirSync(path.join(UPLOAD_DIR, type), { recursive: true }),
);

interface Fields {
  [field: string]: { fileType: FileType; maxCount?: number; maxSize?: number };
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = (req as any).uploadFields?.[file.fieldname]?.fileType ?? "any";
    cb(null, path.join(UPLOAD_DIR, type));
  },
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter =
  (fields: Fields) =>
  (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const mime = file.mimetype.toLowerCase();
    const type = fields[file.fieldname]?.fileType ?? "any";
    const valid =
      mime === "application/octet-stream" || FILE_TYPES[type].test(mime);
    valid
      ? cb(null, true)
      : cb(
          new ServerError(
            statusCodes.BAD_REQUEST,
            `Invalid ${type} (got ${mime})`,
          ),
        );
  };

const capture = (fields: Fields) =>
  catchAsync(async (req, res, next) => {
    const maxSize = Math.max(
      ...Object.values(fields).map((f) => (f.maxSize ?? 5) * 1024 * 1024),
    );

    await new Promise<void>((resolve, reject) => {
      (req as any).uploadFields = fields;
      multer({
        storage,
        fileFilter: fileFilter(fields),
        limits: { fileSize: maxSize },
      }).fields(
        Object.entries(fields).map(([name, c]) => ({
          name,
          maxCount: c.maxCount ?? 1,
        })),
      )(req, res, (err) => (err ? reject(err) : resolve()));
    }).catch(() => {});

    const files = req.files as { [f: string]: Express.Multer.File[] };

    for (const field of Object.keys(fields)) {
      const { fileType, maxCount } = fields[field];
      const list = files?.[field]?.map(
        (f) => `/uploads/${fileType}/${f.filename}`,
      );
      req.body[field] = list?.length
        ? (maxCount ?? 1) > 1
          ? list
          : list[0]
        : null;
    }

    if (req.body?.data) {
      try {
        Object.assign(req.body, JSON.parse(req.body.data));
        delete req.body.data;
      } catch {}
    }

    next();
  });

export default capture;

export const deleteFile = (fileUrl: string) => {
  const filePath = path.join(process.cwd(), fileUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
