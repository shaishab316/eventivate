import catchAsync from '../../middlewares/catchAsync';
import { MailServices } from './Mail.service';

/**
 * Mail Controllers
 */
export const MailControllers = {
  /**
   * Admin Send Mail
   */
  sendMail: catchAsync(async ({ body }) => {
    return {
      message: 'Mail sent successfully',
      data: await MailServices.sendMail(body),
    };
  }),

  /**
   * Admin Get All Mail
   */
  getAllMail: catchAsync(async ({ query }) => {
    const { mails, meta } = await MailServices.getAllMail(query);

    return {
      message: 'Mails fetched successfully',
      meta,
      data: mails,
    };
  }),

  /**
   * Mark Mail as Read
   */
  markAsRead: catchAsync(async ({ body }) => {
    await MailServices.markAsRead(body);

    return {
      message: 'Mails marked as read successfully',
    };
  }),

  /**
   * Mark Mail as Unread
   */
  markAsUnread: catchAsync(async ({ body }) => {
    await MailServices.markAsUnread(body);

    return {
      message: 'Mails marked as unread successfully',
    };
  }),

  /**
   * Mark All Mail as Read
   */
  markAsReadAll: catchAsync(async () => {
    const data = await MailServices.markAsReadAll();

    return {
      message: 'All mails marked as read successfully',
      data,
    };
  }),

  /**
   *  Delete Mail
   */
  deleteMail: catchAsync(async ({ body }) => {
    await MailServices.deleteMail(body);

    return {
      message: 'Mail deleted successfully',
    };
  }),

  /**
   * Delete Read Mails
   */
  deleteReadMails: catchAsync(async () => {
    const data = await MailServices.deleteReadMails();

    return {
      message: 'Read mails deleted successfully',
      data,
    };
  }),

  /**
   * Get Mail By Id
   */
  getMailById: catchAsync(async ({ params }) => {
    const data = await MailServices.getMailById(params.mail_id);

    return {
      message: 'Mail fetched successfully',
      data,
    };
  }),
};
