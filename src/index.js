const prompt = require('prompt');
const args = process.argv.splice(process.execArgv.length + 2);
const axios = require('axios');
const url = require('url');

const sessionURL = args[0];
port = args[1] || 7000;

async function start() {
  console.log('==================== Starting Questinator Connector ==================');
  console.log(`Please, run your local server on port ${port}`);

  let loginObject;
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

    loginObject = await getLogin();

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
      .get(`http://localhost:${port}?question=${data}`)
      .then(({ data: answer }) => {
        console.log(`Sending answer: ${answer}`);
        socket.emit('answer', {
          answer,
          success: true,
          login: loginObject.login
        })
      })
      .catch(() => {
        console.error(`Could not get answer from your local server: http://localhost:${port}?question=${data}`);
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

module.exports = {
  start
};