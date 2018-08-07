import {FormData} from 'form-data';

export class MailSender{

  static send(mailgunUrl, sendto, sendfrom, message, subject){
    let fetch = require('isomorphic-fetch');
    let FormData = require('form-data');
    let form = new FormData();
    form.append('to', sendto);
    form.append('from', sendfrom);
    form.append('subject', subject);
    form.append('text', message);

    return fetch(mailgunUrl, {method: 'POST', body: form})
        .then(response => {
          return response.json();
        });
  }

  // static sendHtml(sendto, sendfrom = 'info@codetrailer.com', message, subject, displayname){
  //   let FormData = require('form-data');
  //   let form = new FormData();
  //   form.append('to', sendto);
  //   form.append('from', sendfrom);
  //   form.append('subject', subject);
  //   form.append('html', message);
  //
  //   return fetch(`https://api:${apiKey}@api.mailgun.net/v3/codetrailer.com/messages`, {method: 'POST', body: form})
  //       .then(response => {
  //         return response.json();
  //       });
  // }
}
