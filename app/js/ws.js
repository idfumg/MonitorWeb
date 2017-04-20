function WSApi(params) {

var self = this;

self.connect = _connect;
self.disconnect = _disconnect;
self.subscribe_server_logs = _subscribe_server_logs;

self.socket = null;
self.timeout = null;

function _connect() {
    self.url = params.url;
    self.connected_callback = params.connected_callback;
    self.disconnected_callback = params.disconnected_callback;

    //var socket = new WebSocket('ws://'+window.location.host+':8888/ws');
    self.socket = new WebSocket(self.url);

    self.socket.onopen = function() {
        console.log('WebSocket connection established...');
        if (self.timeout) {
            clearTimeout(self.timeout);
            self.timeout = null;
        }
        self.connected_callback();
    };

    self.socket.onclose = function(event) {
        self.socket = null;

        if (self.timeout !== null)
            return;

        if (event.wasClean) {
            console.log('WebSocket connection lost...');
        }
        else {
            console.log('WebSocket connection interrupted...');
            if (self.timeout === null) {
                self.timeout = setInterval(function() {
                    _connect(self.url);
                }, 1000);
            }
        }

        self.disconnected_callback();
    };

    self.socket.onmessage = function(event) {
        var parsed = $.parseJSON(event.data);
        _consume_ws_data(parsed);
    };

    self.socket.onerror = function(error) {
        if (error.message)
            console.log('WebSocket error: ' + error.message);

        if (self.timeout === null) {
            self.timeout = setInterval(function() {
                _connect(self.url);
            }, 1000);
        }
    };
}

function _disconnect() {
    if (self.socket) {
        self.socket.close();
        self.socket = null;
    }
}

function _consume_ws_data(parsed) {
    msg_type = parsed.msg_type;
    if (msg_type === 'servers_logs_append') {
        var records = parsed.records;
        var text = '';
        records.forEach(function(record) {
            text += '<p>' + record + '</p>';
        });
        params.server_logs_append_callback(text);
    }
    else if (msg_type === 'subscribe_server_logs') {
        console.log('WebSocket server logs event subscribed...');
    }
    else if (msg_type === 'event_notify') {
        params.event_notify_callback(parsed);
    }
}

function _subscribe_server_logs(server_name) {
    msg = {
        msg_type: 'subscribe_server_logs',
        server: server_name
    };
    self.socket.send(JSON.stringify(msg));
}

}
