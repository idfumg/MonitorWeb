$(function() {

'use strict';

window.get_active_server = function() {
    var servers_records = containers.servers.find('.server').not('.hidden');
    var server = null;
    servers_records.each(function() {
        if ($(this).hasClass('active'))
            server = $(this);
    });
    return server;
};

window.get_server_events = function(server_id) {
    var result = [];
    servers_events.forEach(function(server_events) {
        if (server_events.server_id === server_id)
            result.push(server_events);
    });
    return result;
};

window.get_server_events_occured = function(server_id) {
    if (events_occured[server_id] === undefined)
        return [];

    return events_occured[server_id];
};

var menu_buttons = {
    servers: $('.menu .main-menu .servers')//,
};

var containers = {
    servers: $('.containers .servers'),
    main_window: $('#scrollbar1')
};

var misc_containers = {
    servers_new: $('.containers .servers-new'),
    datetime: $('.containers .datetime'),
    events: $('.containers .events'),
};

var servers_events = {};
var events_occured = {};

setup_main_menu_events();
setup_back_buttons();

var ajaxApi = new AjaxApi();

var wsApi = new WSApi({
    url: 'ws://localhost:8888/ws',
    connected_callback: function() {
        ajaxApi.get_servers(function(records) {
            servers.rebuild(records);
            ajaxApi.get_servers_events(function(data) {
                servers_events = data.events;
            });
        });
        $('.connect-button').addClass('connected');
        servers.click_active();
    },
    disconnected_callback: function() {
        $('.connect-button').removeClass('connected');
    },
    server_logs_append_callback: function(data, logs) {
        main_window.append_ws(data, logs);
    },
    event_notify_callback: function(parsed) {
        servers.highlight_server_events_button(parsed.server_id, parsed.event_id);
        if (events_occured[parsed.server_id] === undefined)
            events_occured[parsed.server_id] = [];
        events_occured[parsed.server_id].push(parsed.event_id);
    }
});

wsApi.connect();

var main_window = new MainWindow({
    'main_window': containers.main_window,
    'scrollbar': containers.main_window,
    scroll_up_callback: function(next_page) {
        if (main_window.is_search) {
            ajaxApi.server_search_logs(get_active_server(),
                                       $('.search-text').val(),
                                       next_page,
                                       search_fields.first_date,
                                       search_fields.last_date,
                                       function(data, logs) {
                main_window.prepend(data, logs);
            });
        }
        else if (main_window.is_events) {
            console.log('Must be scrolling here');
        }
        else {
            ajaxApi.get_servers_logs(get_active_server(),
                                     next_page,
                                     function(data, logs) {
                main_window.prepend(data, logs);
            });
        }
    },
    main_window_click_callback: function(e) {
        hide_all_elements();
    }
});

var servers = new Servers({
    'servers': containers.servers,
    'servers_new': misc_containers.servers_new,
    'events': misc_containers.events,
    new_server_callback: function(name, address, port) {
        ajaxApi.new_server(name,
                           address,
                           port,
                           function(data) {
            servers.add_new_server_record(name, address, port, data.id, false);
        });
    },
    server_name_clicked_callback: function(server) {
        main_window.clean();
        ajaxApi.get_servers_logs(server, null, function(data, logs) {
            main_window.append(data, logs);
            main_window.autoscroll = true;
            main_window.is_search = false;
            wsApi.subscribe_server_logs(server.find('.name').text());
        });
    },
    update_server_callback: function(name, address, port, server_id) {
        ajaxApi.update_server(name, address, port, server_id, function(data) {
            servers.update_server(server_id, name, address, port);
        });
    },
    event_clicked_callback: function(event_id) {
        main_window.clean();
        ajaxApi.get_event_logs(event_id, function(data, logs) {
            main_window.append(data, logs);
            main_window.is_events = true;
        });
    }
});

var search_fields = new SearchFields({
    'search_fields': $('.search-fields'),
    search_text_callback: function(search_text, date1, date2) {
        if (search_text !== '') {
            ajaxApi.server_search_logs(get_active_server(),
                                       search_text,
                                       null,
                                       date1,
                                       date2,
                                       function(data, logs) {
                main_window.clean();
                main_window.is_search = true;
                main_window.append(data, logs);
            });
        }
        else {
            ajaxApi.get_servers_logs(get_active_server(),
                                     null,
                                     function(data, logs) {
                main_window.autoscroll = true;
                main_window.is_search = false;
                main_window.append(data, logs);
                wsApi.subscribe_server_logs(get_active_server());
            });
        }
    },
    connect_button_connected_callback: function() {
        wsApi.connect();
    },
    connect_button_disconnected_callback: function() {
        wsApi.disconnect();
    },
    calendar_button_clicked_callback: function() {
        toggle_class('.containers .container', 'datetime', 'active-container');
    }
});

function hide_all_elements() {
    for (var button_name in menu_buttons)
        menu_buttons[button_name].removeClass('active');

    for (var container_name in containers)
        containers[container_name].removeClass('active-container');

    for (var misc_container_name in misc_containers)
        misc_containers[misc_container_name].removeClass('active-container');
}

function toggle_class(selector, name, new_class) {
    $(selector).each(function() {
        var self = $(this);
        if (!self.hasClass(name))
            self.removeClass(new_class);
        else
            self.toggleClass(new_class);
    });
}

function setup_main_menu_events() {
    console.log('Setup main menu...');
    for (var name in menu_buttons) {
        menu_buttons[name].click(function(name) {
            return function() {
                toggle_class('.main-menu .button', name, 'active');
                toggle_class('.containers .container', name, 'active-container');
            };
        }(name));
    }
}

function setup_back_buttons() {
    console.log('Setup back buttons...');
    for (var name in containers) {
        containers[name].find('.back').click(function(name) {
            return function() {
                menu_buttons[name].click();
            };
        }(name));
    }

    for (var misc_name in misc_containers) {
        misc_containers[misc_name].find('.back').click(function(misc_name) {
            return function() {
                misc_containers[misc_name].toggleClass('active-container');
            };
        }(misc_name));
    }
}

});
