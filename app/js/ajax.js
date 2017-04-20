function AjaxApi() {

/**************************************************************
* Public api.
**************************************************************/

var self = this;

self.get_servers_logs = _get_servers_logs;
self.get_servers = _get_servers;
self.update_server = _update_server;
self.new_server = _new_server;
self.server_search_logs = _server_search_logs;
self.get_servers_events = _get_servers_events;
self.get_event_logs = _get_event_logs;

self.inprogress = false;

/**************************************************************
* Ajax Api.
**************************************************************/

function toggle_loader() {
    $('.loader').toggleClass('active');
}

function request_started() {
    if (self.inprogress === true) {
        console.log('Suppress sending request due to pending another request!');
        return true;
    }

    self.inprogress = true;
    return false;
}

function request_stopped() {
    self.inprogress = false;
}

function _get_servers_logs(server, page, callback) {
    if (request_started())
        return;

    toggle_loader();
    $.get('http://localhost:8080/server_logs', {
        'server_id': server.find('.id').text(),
        'page': page
    })
    .done(function(data) {
        request_stopped();
        toggle_loader();
        parsed = $.parseJSON(data);
        var text = '';
        parsed.records.forEach(function(record) {
            text += '<p>' + record + '</p>';
        });
        callback(text, parsed);
    });
}

function _get_servers(callback) {
    if (request_started())
        return;

    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/servers',
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        }
    })
    .done(function(data) {
        request_stopped();
        callback(data.servers);
    });
}

function _update_server(name, address, port, server_id, callback) {
    if (request_started())
        return;

    $.post('http://localhost:8080/server_update', {
        'name': name,
        'address': address,
        'port': port,
        'server_id': server_id
    })
    .done(function(data) {
        request_stopped();
        parsed = $.parseJSON(data);
        callback(parsed);
    });
}

function _new_server(name, address, port, callback) {
    if (request_started())
        return;

    $.post('http://localhost:8080/server_new', {
        'name': name,
        'address': address,
        'port': port
    })
    .done(function(data) {
        request_stopped();
        parsed = $.parseJSON(data);
        callback(parsed);
    });
}

function _server_search_logs(server, text, page, date1, date2, callback) {
    if (request_started())
        return;

    var date_string1 = null;
    if (date1)
        date_string1 = date1.toUTCString();

    var date_string2 = null;
    if (date2)
        date_string2 = date2.toUTCString();

    toggle_loader();
    $.get('http://localhost:8080/server_search_logs', {
        'text': text,
        'page': page,
        'server_id': server.find('.id').text(),
        'date1': date_string1,
        'date2': date_string2
    })
    .done(function(data) {
        request_stopped();
        toggle_loader();
        parsed = $.parseJSON(data);
        var text = '';
        parsed.records.forEach(function(record) {
            text += '<p>' + record + '</p>';
        });
        callback(text, parsed);
    });
}

function _get_servers_events(callback) {
    if (request_started())
        return;

    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/servers_events',
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        }
    })
    .done(function(data) {
        request_stopped();
        callback(data);
    });
}

function _get_event_logs(event_id, callback) {
    if (request_started())
        return;

    toggle_loader();
    $.get('http://localhost:8080/server_events', {
        'event_id': event_id
    })
    .done(function(data) {
        request_stopped();
        toggle_loader();
        parsed = $.parseJSON(data);
        var text = '';
        parsed.events.forEach(function(record) {
            text += '<p>' + record + '</p>';
        });
        callback(text, parsed);
    });
}

}
