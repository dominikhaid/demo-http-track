# Http-Traxk

---


## Description

---
We used our base Express[https://github.com/dominikhaid/node-base-server.git] server and our MongoDB[https://github.com/dominikhaid/node-module-mongodb.git] plugin to build a Node.js program to track Websites. U can use it to track the response status, the http version, the server used by the website, the type of the content and even the body. Http-Track has a Frontend wich u can use the create and manage projects(Websites) to track. You can add projects here, assign urls to the project, assign users to the project, see the last status for each tracked url and even a quick diff between last and the pervious crawl. You can also setup a timing for the cronjob wich http-track uses to crawl your projects or just crawl them manulay.For the cronjob if http-track detects a change for any url of any of ur project it will send an e-mail for the assigned group of users to notify them.

** please not that the program at the current state is quite ruff
** you need docker installed to get the mongodb that is included to work
** or u can change the mongoose config to use an existing mongodb instance
</br></br>

## Usage

---

1.  git clone https://github.com/dominikhaid/demo-http-track.git http-track
2.  cd my-app
3.  npm i
4.  npm run docker-mongo-up //starts the db and equals to cd ./docker/mongodb && docker-compose up  -d && cd ../../
5.  npm run dev //starts the express server in dev mode
6.  http://localhost  //shows the Frontend
7.  http://localhost:8081 //shows mongoExpress if u use our docker image

</br></br>

## Configuration

---

### MongoDB

The conf file is localted @ ./config/mongo-config.json just change it to ur needs. The Docker-Compose for the MongoDB is located @ ./docker.
The schemas and querys are located in ./src/mongoose/

### Express Server

The configuration is located @ ./config/server-conf.js to change the port please see .env.development and .env.production

### HTTP-Track
The Programm it self is located @ ./src/includes/httpTrack. The api routes we use for the Frontend are located @ ./src/routes.
The View are located @ ./src/views they are writen in pug[https://pugjs.org].

### SendGrid
To setup sendgrid use the sendgrid.env its used to for the email notification within the cronjob. 


</br></br>