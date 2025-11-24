import { Prisma, prisma } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import { mailSearchableFields } from './Mail.constant';
import {
  MarkMailArgs,
  TAdminMailGetAll,
  TAdminMailSend,
} from './Mail.interface';

/**
 * Mail Services
 */
export const MailServices = {
  /**
   * Admin Send Mail
   */
  async sendMail(payload: TAdminMailSend) {
    return prisma.mail.create({
      data: payload,
    });
  },

  /**
   * Admin Get All Mail
   */
  async getAllMail({ page, limit, search, unread, remarks }: TAdminMailGetAll) {
    const mailWhere: Prisma.MailWhereInput = { unread };

    if (search) {
      mailWhere.OR = mailSearchableFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (remarks) {
      mailWhere.remarks = remarks;
    }

    const mails = await prisma.mail.findMany({
      where: mailWhere,
      skip: (page - 1) * limit,
      take: limit,
      //? Unread mails first, then latest mails
      orderBy: [{ unread: 'desc' }, { timestamp: 'desc' }],
    });

    const total = await prisma.mail.count({ where: mailWhere });

    return {
      mails,
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },

  /**
   * Get Mail By Id
   */
  async getMailById(mail_id: string) {
    return prisma.mail.findUnique({
      where: { id: mail_id },
    });
  },

  /**
   * Mark Mail As Read/Unread
   */
  async markAsRead({ mail_id }: MarkMailArgs) {
    return prisma.mail.update({
      where: { id: mail_id },
      data: { unread: false },
    });
  },

  /**
   * Mark Mail As Unread
   */
  async markAsUnread({ mail_id }: MarkMailArgs) {
    return prisma.mail.update({
      where: { id: mail_id },
      data: { unread: true },
    });
  },

  /**
   * Delete Mail
   */
  async deleteMail({ mail_id }: MarkMailArgs) {
    return prisma.mail.delete({
      where: { id: mail_id },
    });
  },

  /**
   * Delete Read Mails
   */
  async deleteReadMails() {
    return prisma.mail.deleteMany({
      where: { unread: false },
    });
  },

  /**
   * Mark All Mail As Read
   */
  async markAsReadAll() {
    return prisma.mail.updateMany({
      where: { unread: true },
      data: { unread: false },
    });
  },
};
