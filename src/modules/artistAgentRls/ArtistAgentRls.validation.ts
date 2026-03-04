import z from "zod";

/**
 * Shared validation rules for ArtistAgentRls module
 */
const validator = {
  to_user_id: z
    .string()
    .regex(/^u_\d+$/, "to_user_id must be in the format u_{number}")
    .max(255, "to_user_id must be at most 255 characters long"),

  request_message: z
    .string()
    .max(1000, "request_message must be at most 1000 characters long"),

  page: z.number().int().positive(),

  limit: z.number().int().positive().max(100),

  search: z.string().max(255, "search must be at most 255 characters long"),

  sort_order: z.enum(["asc", "desc"]),
};

const sendRequestToArtistAgentSchema = z.object({
  body: z.object({
    to_user_id: validator.to_user_id,
    request_message: validator.request_message.optional(),
  }),
});

const getPendingRequestsSchema = z.object({
  query: z.object({
    page: validator.page.default(1),
    limit: validator.limit.default(20),
    search: validator.search.optional(),
    sort_order: validator.sort_order.default("desc"),
  }),
});

export const ArtistAgentRlsValidations = {
  sendRequestToArtistAgentSchema,
  getPendingRequestsSchema,
};
