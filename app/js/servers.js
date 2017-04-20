function Servers(params) {
    var self = this;

    /* Public methods */
    self.clean = _clean;
    self.rebuild = _rebuild;
    self.click_active = _click_active;
    self.add_new_server_record = _add_new_server_record;
    self.update_server = __update_server;
    self.highlight_server_events_button = _highlight_server_events_button;

    _setup_servers_container();

    function _highlight_server_events_button(server_id, event_id) {
        var servers = params.servers.find('.servers-records .server');
        servers.each(function() {
            var id = $(this).find('.id').text();
            if (parseInt(id) === parseInt(server_id)) {
                $(this).find('.event').addClass('active');
            }
        });
    }

    function _click_active() {
        var active_server = params.servers.find('.servers-records .server.active');
        if (active_server.html() !== '')
            active_server.find('.name').click();
    }

    function _clean() {
        var servers_records = params.servers.find('.server').not('.hidden');
        servers_records.remove();
    }

    function _rebuild(records) {
        var active_server = get_active_server();
        var active_server_name = null;
        if (active_server)
            active_server_name = active_server.find('.name').text();
        self.clean();

        records.forEach(function(record) {
            _add_new_server_record(record.name,
                                   record.address,
                                   record.port,
                                   record.id,
                                   record.name===active_server_name);
        });
    }

    function _add_new_server_record(name, address, port, id, is_active) {
        var servers_records = params.servers.find('.servers-records');
        var new_server = servers_records.find('.server.hidden').clone();
        new_server.removeClass('hidden');
        new_server.find('.name').text(name);
        new_server.find('.address').text(address);
        new_server.find('.port').text(port);
        new_server.find('.id').text(id);
        if (is_active)
            new_server.addClass('active');
        servers_records.append(new_server);
        _setup_server(new_server);
    }

    function _setup_server(server) {
        server.find('.settings').click(function() {
            params.servers_new.find('#name').val(server.find('.name').text());
            params.servers_new.find('#address').val(server.find('.address').text());
            params.servers_new.find('#port').val(server.find('.port').text());
            params.servers_new.find('#id').val(server.find('.id').text());
            params.servers_new.toggleClass('active-container');
            server.toggleClass('modify');
        });
        server.find('.link').click(function() {
            $(this).find('i')
                .toggleClass('fa-chain-broken')
                .toggleClass('fa-chain');
        });
        server.find('.name').click(function(e) {
            $(this).parent().parent().find('.server').removeClass('active');
            $(this).parent().addClass('active');
            params.server_name_clicked_callback(server);
        });
        server.find('.remove').click(function() {
            server.hide();
            server.remove();
        });
        server.find('.event').click(function() {
            var server_id = $(this).parent().find('.id').text();
            var server_events = get_server_events(parseInt(server_id));
            var events_occured = get_server_events_occured(server_id);
            var events_records = $('.events-records');
            params.events.find('.event').not('.hidden').remove();
            if (server_events) {
                server_events.forEach(function(event) {
                    var new_event = params.events.find('.event.hidden').clone();
                    new_event.removeClass('hidden');
                    new_event.find('.text').val(event.text);
                    new_event.find('.id').val(event.id);
                    new_event.find('.text').click(function() {
                    });
                    new_event.find('.show').click(function() {
                        params.event_clicked_callback(event.id);
                    });
                    events_occured.forEach(function(event_occurred_id) {
                        if (event_occurred_id === event.id) {
                            new_event.find('.show').addClass('active');
                        }
                    });
                    events_records.append(new_event);
                });
            }
            params.events.toggleClass('active-container');
        });
    }

    function _new_server(name, address, port) {
        if (!name || !address || !port) {
            console.log('Missing name, address, port');
            return;
        }

        name = name.slice(0, 19 /*max width*/);
        params.new_server_callback(name, address, port);
    }

    function _update_server(name, address, port, server_id, server) {
        if (!server_id || !name || !address || !port) {
            console.log('Missing server_id | name | address | port');
            return;
        }

        name = name.slice(0, 19 /*max width*/);
        params.update_server_callback(name, address, port, server_id);
    }

    function __update_server(server_id, name, address, port) {
        var server = params.servers.find('.servers-records .server.modify');
        server.toggleClass('modify');
        server.find('.name').text(name);
        server.find('.address').text(address);
        server.find('.port').text(port);
    }

    function _setup_servers_container() {
        console.log('Setup servers container...');
        var name = params.servers_new.find('#name');
        var address = params.servers_new.find('#address');
        var port = params.servers_new.find('#port');
        var id = params.servers_new.find('#id');

        params.servers.find('.new').click(function(e) {
            name.val('');
            address.val('');
            port.val('');
            id.val('');
            params.servers_new.toggleClass('active-container');
        });
        params.servers_new.find('input[type=submit]').click(function(e) {
            e.preventDefault();
            params.servers_new.toggleClass('active-container');
            var server = params.servers.find('.servers-records .server.modify');
            if (server.html() === undefined)
                _new_server(name.val(), address.val(), port.val());
            else
                _update_server(name.val(), address.val(), port.val(), id.val(), server);
        });
        params.servers.find('.server').each(function() {
            _setup_server($(this));
        });
        params.events.find('.new').click(function() {
            var new_event = params.events.find('.event.hidden').clone();
            new_event.removeClass('hidden');
            new_event.find('.text').val('');
            new_event.find('.id').val();
            var events_records = $('.events-records');
            events_records.append(new_event);

            $('.events-records .event').not('.hidden').find('input').filter(function() {
                console.log($(this).val());
                if ($(this).val() === '')
                    console.log('found with no val');
                return $(this).val() === '';
            }).click();
        });
    }
}
