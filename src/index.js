const prompt = require('prompt');
const args = process.argv.splice(process.execArgv.length + 2);
const axios = require('axios');
const url = require('url');
const DEFAULT_PORT = 7000;
let sessionURL = args[0];
let answerServerUrl = getAnswerServerUrl();

function getAnswerServerUrl() {
  let test = new RegExp('^[0-9]*$');
  console.log(args);
  if(args[1] && test.test(args[1])) {
    return `http://localhost:${args[1]}`;
  }

  if(args[1]) {
      return args[1];
  }

  return `http://localhost:${DEFAULT_PORT}`
}

async function start() {
  console.log('==================== Starting Questinator Connector ==================');

  let loginObject;

  if (!sessionURL) {
    let result = await getSessionUrlAndPort();
    sessionURL = result.sessionURL;
    answerServerUrl = result.answerServerUrl || answerServerUrl;
  }

  console.log(`Please, run your local server on: ${answerServerUrl}`);
  const requestInfo = url.parse(sessionURL, true);
  const WSUrl = `${requestInfo.protocol}//${requestInfo.host}`;

  let connectionTimeout = setTimeout(() => {
    console.log(`Remote server is unavailable: ${sessionURL}`);
  }, 15000);

  const socket = require('socket.io-client')(WSUrl);

  socket.on('connect', connectToGame);
  socket.on('join', onJoin);
  socket.on('question', onQuestion);

  socket.on('disconnect', function () {
    console.log(`Disconnected from remote server: ${sessionURL}`);
    console.log(`Reconnecting...`);
  });

  async function connectToGame() {
    clearTimeout(connectionTimeout);
    console.info(`Connecting to remote server: ${sessionURL}`);

    if(!loginObject) {
        loginObject = await getLogin();
    }

    socket.emit('join', {
      login: loginObject.login,
      sessionURL
    });
  }

  function onJoin(data) {
    if (data.success) {
      return console.log('You are in the game!'); //tslint:disable-line
    }

    console.error(`Connection error: ${data.message}`);
    connectToGame();
  }

  function onQuestion(data) {
    console.log(`Question: ${data}`);

    axios
      .get(`${answerServerUrl}?question=${data}`)
      .then(({ data: answer }) => {
        console.log(`Sending answer: ${answer}`);
        socket.emit('answer', {
          answer,
          success: true,
          login: loginObject.login
        })
      })
      .catch(() => {
        console.error(`Could not get answer from your local server: ${answerServerUrl}?question=${data}`);
        socket.emit('answer', {
          success: false,
          login: loginObject.login
        })
      });
  }
}

async function getLogin() {
  let resolve, reject;

  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const prompt_attributes = [
    {
      name: 'Login',
      validator: /\S+@\S+\.\S+/,
      warning: 'Login is not valid, it should be valid Email address'
    }
  ];

  prompt.start();

  prompt.get(prompt_attributes, function (err, result) {
    if (err) {
      console.log(err);
      return 1;
    }
    resolve({ login: result.Login });

  });

  return promise;
}

async function getSessionUrlAndPort() {
  let resolve, reject;

  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const prompt_attributes = [
    {
      name: 'SessionURL',
      warning: 'URL is not valid'
    },
    {
      name: 'AnswerServerUrl',
      warning: 'URL is not valid'
    }
  ];

  console.log('Please, specify session url and local server url');
  console.log(`Default answer server URL: ${answerServerUrl}`);


  prompt.start();

  prompt.get(prompt_attributes, function (err, result) {
    if (err) {
      console.log(err);
      return 1;
    }
    resolve({
        sessionURL : result.SessionURL,
      answerServerUrl: result.AnswerServerUrl
    });

  });

  return promise;
}

module.exports = {
  start
};
