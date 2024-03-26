class SocketService {
    constructor(serverComponent, options) {
      this.io = require('socket.io')(serverComponent, options)
      this.manageConnection()
    }
    on(event, cb) {
      this.io.on(event, cb);
    }
    emit(event, cb){
        this.io.emit(event, cb)
    }
    manageConnection() {
      this.io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('disconnect', () => {
          console.log('User disconnected');
        });
      });
    }
  }
  
  module.exports = SocketService