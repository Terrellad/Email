document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#reply-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Submitting & storing emails
  document.querySelector('form').onsubmit = function() {

    // Temporarily store value
    const recipient = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // save compose data to email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: `${recipient}`,
        subject: `${subject}`,
        body: `${body}`
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      document.querySelector('#compose-view').append(result);
    })
    // Return to sent
    load_mailbox('sent');
    return false;
  };
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#reply-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // List emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // ul for emails
    const ul = document.createElement('ul');

    // Run loop
    emails.forEach(emails => {

      // Add to List
      const li = document.createElement('li');

      // If read background color changes
      if(`${emails.read}` !== 'false'){
        li.className = "border-true";
      }else{
        li.className = "border-false";
      }

      // Display email to inbox
      const sender = document.createElement('div');
      sender.innerHTML = `<strong>${emails.sender}</strong>`;
      sender.className = 'col-3';
      const subject = document.createElement('div');
      subject.innerHTML = `${emails.subject}`;
      subject.className = 'col-6';
      const timestamp = document.createElement('div');
      timestamp.innerHTML = `${emails.timestamp}`;
      timestamp.className = 'col-3';
      li.append(sender, subject, timestamp);

      ul.appendChild(li);
      ul.setAttribute("id", 'email');
      li.setAttribute("id", `${emails.id}`);

      // Click to open email
      li.addEventListener( 'click', () => {
        li.className = "border-false";
        fetch(`/emails/${emails.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        console.log('pass read to true');
        load_email(`${emails.id}`);
      });

      // Display emails
      document.querySelector('#emails-view').append(ul);

    });
  });
}

function load_email(email_id) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'block';
  document.querySelector('#reply-email').style.display = 'none';

  // Returns email information
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Variables for email data
    let view_details = document.createElement('div');
    let view_body = document.createElement('div');

    // Clear list
    view_details.length = 0;
    view_body.length = 0;

    const sender = document.createElement('div');
    sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
    const subject = document.createElement('div');
    subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
    const recipient = document.createElement('div');
    recipient.innerHTML = `<strong>To:</strong> ${email.recipients}`;
    const timestamp = document.createElement('div');
    timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
    const body = document.createElement('div');
    body.className = 'border_top';
    body.innerHTML = email.body;

    // Place all data into single variable
    view_details.append(sender, recipient, subject, timestamp);
    view_body.append(body);

    // Display email
    if(`${email.archived}` !== 'true'){
      document.querySelector('#email-details').innerHTML = '<button id="archive" class=" btn btn-sm btn-outline-primary">Archive</button> <button id="unread" class=" btn btn-sm btn-outline-primary">Un-Read</button> <br><br> <button id="replyto-email" class=" btn btn-sm btn-outline-primary">Reply</button>';
      document.querySelector('#email-details').append(view_details, view_body);
    }
    else{
      document.querySelector('#email-details').innerHTML = '<button id="unarchive" class=" btn btn-sm btn-outline-primary">Un-Archive</button> <button id="unread" class=" btn btn-sm btn-outline-primary">Un-Read</button> <br><br> <button id="replyto-email" class=" btn btn-sm btn-outline-primary">Reply</button>';
      document.querySelector('#email-details').append(view_details, view_body);
      console.log('waiting');
    }

    // Reply to email
    document.querySelector('#replyto-email').addEventListener('click', () => reply_email(`${email_id}`));

    // Mark as un-read
    document.querySelector('#unread').addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: false
        })
      })
      // Load inbox
      load_mailbox('inbox');
    })

    if(`${email.archived}` !== 'true'){
         // Archive email
       document.querySelector('#archive').addEventListener('click', () => {
         fetch(`/emails/${email_id}`, {
           method: 'PUT',
           body: JSON.stringify({
             archived: true
           })
         })
         // Load inbox
         load_mailbox('inbox');
       })
     }
     else{
       // Un-archive email
       document.querySelector('#unarchive').addEventListener('click', () => {
         fetch(`/emails/${email_id}`, {
           method: 'PUT',
           body: JSON.stringify({
             archived: false
           })
         })
         // Load inbox
         load_mailbox('inbox');
       })
     }
  });
}

function reply_email(reply) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#reply-email').style.display = 'block';

  // Display when function is called
  console.log('function reply called');

  // Returns email information
  fetch(`/emails/${reply}`)
  .then(response => response.json())
  .then(emailReply => {

      // Pre-fill reply fields
      document.querySelector('#compose-recipients').value = emailReply.sender;
      if(`${document.querySelector('#compose-subject').value.startsWith('Re:')}` !== 'true'){
        console.log('Re not found');
        document.querySelector('#compose-subject').value = 'Re: ' + emailReply.subject;
      }
      else{
        console.log('Re found');
        document.querySelector('#compose-subject').value = emailReply.subject;
      }
      document.querySelector('#compose-body').value = 'On ' + emailReply.timestamp + " " + emailReply.sender + ' wrote: ' + emailReply.body;
      document.querySelector('#reply-email').innerHTML = `<h3>Reply Email</h3>
      <form id="reply-form">
          <div class="form-group">
              From: <input disabled id="reply-sender" class="form-control" value="${emailReply.recipients}">
          </div>
          <div class="form-group">
              To: <input disabled id="reply-recipients" class="form-control" value="${emailReply.sender}">
          </div>
          <div class="form-group">
              <input class="form-control" id="reply-subject" value="${document.querySelector('#compose-subject').value}">
          </div>
          <textarea class="form-control" id="reply-body">${document.querySelector('#compose-body').value}</textarea>
          <input type="submit" class="btn btn-primary"/>
      </form>`;

      // Submitting & storing emails
      document.querySelector('#reply-form').onsubmit = function() {

        // Temporarily store value
        const recipient = document.querySelector('#reply-recipients').value;
        const subject = document.querySelector('#reply-subject').value;
        const body = document.querySelector('#reply-body').value;

        // save compose data to email
        fetch('/emails', {
          method: 'POST',
          body: JSON.stringify({
            recipients: `${recipient}`,
            subject: `${subject}`,
            body: `${body}`
          })
        })
        .then(response => response.json())
        .then(resultReply => {
          console.log(resultReply);
        })
        // Return to sent
        load_mailbox('sent');
        return false;
      };
   });
}
