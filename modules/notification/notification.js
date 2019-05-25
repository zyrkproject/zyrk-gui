const rxIpc = require('rx-ipc-electron/lib/main').default;
const log = require('electron-log');
const Notification = require('electron').Notification;

const path = require('path');

const Observable = require('rxjs/Observable').Observable;

exports.init = function () {
    rxIpc.registerListener('notification', function (title, desc, params) {
        let notification = new Notification({
            'title': title,
            'body': desc,
            'icon': path.join(__dirname, 'src/assets/icons/notification.png')
        })
        notification.show()
        return Observable.create(observer => {
            observer.complete(true);
        });
    });
}

exports.destroy = function() {
    rxIpc.removeListeners('notification');
}