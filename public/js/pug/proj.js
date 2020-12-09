async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      //'Content-Type': 'application/json'
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: new URLSearchParams(data)
  });
  return response.json();
}

async function patchData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'PATCH',
      mode: 'same-origin',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        //'Content-Type': 'application/json'
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: new URLSearchParams(data)
    });
    return response.json();
  }
  

  async function deleteData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'same-origin',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        //'Content-Type': 'application/json'
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: new URLSearchParams(data)
    });
    return response.json();
  }

document.addEventListener('DOMContentLoaded', function (event) {


/**
 * UPDATE URL
 */
    document.querySelectorAll('.urlupdate').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.previousElementSibling.name,
          oldUrl: event.target.previousElementSibling.getAttribute('url'),
          newUrl: event.target.previousElementSibling.value,
      };

      patchData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );


  /**
 * CRAWL URL
 */
document.querySelectorAll('.urlcrawl').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.parentElement.getAttribute('name'),
          url: event.target.previousElementSibling.previousElementSibling.previousElementSibling.value,
      };

      postData('/api/track/log', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );



/**
 * REMOVE URL FROM PRJECT
 */
  document.querySelectorAll('.urldelete').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.previousElementSibling.previousElementSibling.name,
          oldUrl: event.target.previousElementSibling.previousElementSibling.getAttribute('url'),
      };

      deleteData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );


  /**
 * ADD URL TO PRJECT
 */
document.querySelectorAll('.urladd').forEach(e =>
    e.addEventListener('click', function (event) {
        let data = {
            name: event.target.previousElementSibling.name,
              newUrl: event.target.previousElementSibling.value,
          };
    

      patchData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );


  /**
   * UPDATE USERS
   */

  document.querySelectorAll('.userupdate').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        email: event.target.name,
          uptUserName: event.target.previousElementSibling.previousElementSibling.value,
          uptUserEmail: event.target.previousElementSibling.value,
      };

      patchData('/api/track/user', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );


    /**
   * REMOVE USERS
   */

  document.querySelectorAll('.userremove').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.parentElement.getAttribute('name'),
          oldUser: event.target.name,
      };

      deleteData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );

    /**
   * ADD USERS
   */

  document.querySelectorAll('.adduser').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.parentElement.getAttribute('name'),
          newUserName: event.target.previousElementSibling.previousElementSibling.value,
          newUserEmail: event.target.previousElementSibling.value,
      };

      patchData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );



    /**
   * ADD PROJECT
   */

  document.querySelectorAll('.projadd').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.previousElementSibling.value,
      };

      postData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );

      /**
   * UPDATE PROJECT
   */

  document.querySelectorAll('.proupdate').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.previousElementSibling.name,
        newName:event.target.previousElementSibling.value,
      };

      patchData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );


    /**
   * REMOVE PROJECT
   */

  document.querySelectorAll('.projremove').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {
        name: event.target.previousElementSibling.previousElementSibling.value,
        oldName:event.target.previousElementSibling.previousElementSibling.name,
      };

      deleteData('/api/track/project', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );

    /**
   * SAVE CRON
   */

  document.querySelectorAll('.savecron').forEach(e =>
    e.addEventListener('click', function (event) {
      let data = {timing :Array.from(document.querySelectorAll('.selector select')).map(e=>e.value.replace(/^0$/,'*')).join(',')}

      postData('/api/track/cron', data).then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        location.reload()
      });
    }),
  );

});
