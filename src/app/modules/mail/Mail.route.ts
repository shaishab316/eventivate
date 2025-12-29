import { Router } from 'express';
import { MailControllers } from './Mail.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { MailValidations } from './Mail.validation';

const free = Router();
{
  /**
   * Send Mail to Admin
   */
  free.post(
    '/',
    purifyRequest(MailValidations.sendMail),
    MailControllers.sendMail,
  );
}

const admin = Router();
{
  /**
   * Admin Get All Mail
   */
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, MailValidations.getAllMail),
    MailControllers.getAllMail,
  );

  /**
   * Admin Get Mail By Id
   */
  admin.get(
    '/:mail_id',
    purifyRequest(QueryValidations.exists('mail_id', 'mail')),
    MailControllers.getMailById,
  );

  /**
   * Admin Mark Mail as Read
   */
  admin.post(
    '/mark-as-read',
    purifyRequest(MailValidations.markMail),
    MailControllers.markAsRead,
  );

  /**
   * Admin Mark Mail as Unread
   */
  admin.post(
    '/mark-as-unread',
    purifyRequest(MailValidations.markMail),
    MailControllers.markAsUnread,
  );

  /**
   * Admin Mark All Mail as Read
   */
  admin.post('/mark-as-read-all', MailControllers.markAsReadAll);

  /**
   * Admin Delete Mail
   */
  admin.delete('/', MailControllers.deleteReadMails);

  /**
   * Admin Delete Single Mail
   */
  admin.delete(
    '/delete-single-mail',
    purifyRequest(MailValidations.markMail),
    MailControllers.deleteMail,
  );
}

export const MailRoutes = {
  /**
   * Everyone can access
   *
   * @url : (base_url)/mails/
   */
  free,

  /**
   * Only admins can access
   *
   * @url : (base_url)/admin/mails/
   */
  admin,
};
