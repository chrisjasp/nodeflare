import 'babel-polyfill'
import assert from 'assert';
import {MailSender} from '../../src/support/mail-sender';

describe('Mail Sender', function() {

  before(() => {

  });

  it('Send email Success', () => {
    let HOSTNAME = 'https://localhost';
    let token = 'woiunnoi425kn2onglkn24oihglklkjg';
    let message = `A password reset request has been submitted for this account. Ignore this request if you did not submit it, otherwise follow the link to reset your password.`;
    message += `"\r\n\r\n${HOSTNAME}/auth/passwordresetform/${token}`;
    return MailSender.send('chrisjasp@gmail.com', 'info@codetrailer.com', message, 'Password Reset Request','Big Star Lights')
        .then(r => {
          return assert(r.message.startsWith('Queued.'));
        });
  });
});
