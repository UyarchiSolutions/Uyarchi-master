const webSocket = require('websocket');

const ws = new webSocket.server();
const web = async () => {
  // ws.on('connection', ws=>{
  //     ws.on('message', message=>{
  //         //console.log(`Received Message => ${message}`)
  //     })
  //     ws.send('hello! message from server')
  // })
  return 'hello';
};

module.exports = {
  web,
};
