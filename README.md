# questinator-connector

This is a simple client that allow you to join Questionator game and create WebSocket bridge between Questionator server and your local server.
Note: question will be send to you local server in next format: `LOCAL_SERVER_URL?question=QUESTION`,
where:
 LOCAL_SERVER_URL - url that specified on  `questinator-connector` run, 
 QUESTION - actually question from game server 

It may be used both as a global and local npm package. Using it as a global npm package allows joining a local server that uses any programming language.

##Using as global npm package:
1. `npm install questinator-connector -g`
2. `questinator SESSION_URL [LOCAL_SERVER_URL|LOCAL_SERVER_PORT]`
3. Follow instruction in console to authorize

SESSION_URL - Url for game session provided by game administrator(trainer)

##### optional arguments:
You may provide your local server port or full local server url.
If no provided LOCAL_SERVER_URL, http://localhost:LOCAL_SERVER_PORT will be used
If no provided LOCAL_SERVER_PORT, 7070 will be used by default, so that questions will be send to http://localhost:7070

##Using as local npm package:
1. `npm install questinator-connector`
2. add script to package.json: `"your-script-name": "questinator"`.
3. `npm run your-script-name`
4. following instruction in console, specify game session url, local server url and authorization info  
