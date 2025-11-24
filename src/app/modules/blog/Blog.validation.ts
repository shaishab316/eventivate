import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { EBannerType, Blog as TBlog } from '../../../utils/db';
import sanitizeHtml from 'sanitize-html';
import { exists } from '../../../utils/db/exists';

/**
 * Blog Validations
 */
export const BlogValidations = {
  /**
   * Validation schema for creating a new blog post.
   */
  createBlog: z.object({
    body: z.object({
      title: z
        .string({ error: 'Title is required' })
        .nonempty({ error: 'Title cannot be empty' })
        .trim(),
      description: z
        .string({ error: 'Description is required' })
        .trim()
        .nonempty({ error: 'Description cannot be empty' }),
      content: z
        .string({ error: 'Content is required' })
        .trim()
        .nonempty({ error: 'Content cannot be empty' })
        .transform(val => sanitizeHtml(val)),
      banner_url: z.url({ error: 'Banner URL must be a valid URL' }),
      banner_type: z.enum(EBannerType),
    } satisfies TModelZod<TBlog>),
  }),

  /**
   * Validation schema for updating an existing blog post.
   */
  updateBlog: z.object({
    body: z.object({
      blog_id: z.string().refine(exists('blog'), {
        error: ({ input }) => `Blog with id '${input}' does not exist`,
      }),
      title: z
        .string({ error: 'Title is required' })
        .nonempty({ error: 'Title cannot be empty' })
        .trim()
        .min(5)
        .max(255)
        .optional(),
      description: z
        .string({ error: 'Description is required' })
        .trim()
        .nonempty({ error: 'Description cannot be empty' })
        .min(10)
        .max(500)
        .optional(),
      content: z
        .string({ error: 'Content is required' })
        .trim()
        .nonempty({ error: 'Content cannot be empty' })
        .transform(val => sanitizeHtml(val))
        .optional(),
      banner_url: z.url({ error: 'Banner URL must be a valid URL' }).optional(),
      banner_type: z.enum(EBannerType).optional(),
    } satisfies TModelZod<TBlog, 'blog_id'>),
  }),

  /**
   * Validation schema for deleting a blog post.
   */
  deleteBlog: z.object({
    body: z.object({
      blog_id: z.string().refine(exists('blog'), {
        error: ({ input }) => `Blog with id '${input}' does not exist`,
      }),
    }),
  }),
};
