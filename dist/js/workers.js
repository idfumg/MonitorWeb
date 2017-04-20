function Workers() {

/**************************************************************
* Web Workers.
**************************************************************/

var self = this;

self.logs = null;

_initialize();

function _initialize() {
    if (window.Worker) {
        self.logs = new Worker('js/worker_create_logs.js');
    }
    else {
        console.log('Error! Web Workers not allowed!');
    }
};

}
