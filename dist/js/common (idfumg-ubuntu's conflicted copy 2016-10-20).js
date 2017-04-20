$(function() {

$('#scrollbar1').perfectScrollbar({
  wheelSpeed: 2,
  wheelPropagation: true,
  minScrollbarLength: 30
});
$('#scrollbar1').perfectScrollbar('update');
$('#scrollbar1').on('ps-scroll-y', function(e) {
    if ($(this)[0].scrollHeight - $(this).scrollTop() <= 2 * $(this).height()) {
        console.log('need update logs');
    }
});

var menu_buttons = {
    settings: $('.menu .main-menu .settings'),
    logs: $('.menu .main-menu .logs'),
    servers: $('.menu .main-menu .servers'),
    events: $('.menu .main-menu .events')
};

var containers = {
    settings: $('.containers .settings'),
    logs: $('.containers .logs'),
    servers: $('.containers .servers'),
    events: $('.containers .events'),
    main_window: $('.main-window')
};

var misc_containers = {
    servers_new: $('.containers .servers-new')
};

var search_fields = $('.search-fields');

setup_main_menu_events();
setup_back_buttons();
setup_servers_container();
setup_search_fields();

var ajaxApi = new AjaxApi();
var wsApi = new WSApi({
    url: 'ws://localhost:8888/ws',
    connected_callback: function() {
        ajaxApi.get_servers(consume_servers);
        handle_connected();
    },
    disconnected_callback: function() {
        handle_disconnected();
    },
    server_logs_append_callback: function(data) {
        containers['main_window'].append(data);
        $('#scrollbar1').perfectScrollbar('update');
    }
});

wsApi.connect();

function consume_servers(servs) {
    servers = servs;
    servers_records = containers['servers'].find('.server').not('.hidden');

    active_name = null;
    servers_records.each(function() {
        if ($(this).hasClass('active'))
            active_name = $(this).find('.name').text();
    });
    servers_records.remove();

    for (name in servers)
        add_new_server_record(name,
                              servers[name]['address'],
                              servers[name]['port'],
                              servers[name]['id'],
                              name===active_name);
}

function handle_connected() {
    $('.connect-button').addClass('connected');
    var active_server = containers['servers'].find('.servers-records .server.active');
    if (active_server.html() !== '')
        active_server.find('.name').click();
}

function handle_disconnected() {
    $('.connect-button').removeClass('connected');
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
    for (name in menu_buttons) {
        menu_buttons[name].click(function(name) {
            return function() {
                toggle_class('.main-menu .button', name, 'active');
                toggle_class('.containers .container', name, 'active-container');
            }
        }(name));
    }
}

function setup_back_buttons() {
    for (name in containers) {
        containers[name].find('.back').click(function(name) {
            return function() {
                menu_buttons[name].click();
            }
        }(name));
    }

    for (name in misc_containers) {
        misc_containers[name].find('.back').click(function(name) {
            return function() {
                misc_containers[name].toggleClass('active-container');
            }
        }(name));
    }
}

function setup_server(server) {
    server.find('.settings').click(function() {
        misc_containers['servers_new'].find('#name').val(server.find('.name').text());
        misc_containers['servers_new'].find('#address').val(server.find('.address').text());
        misc_containers['servers_new'].find('#port').val(server.find('.port').text());
        misc_containers['servers_new'].find('#id').val(server.find('.id').text());
        misc_containers['servers_new'].toggleClass('active-container');
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
        var server_name = $(this).text();
        ajaxApi.get_servers_logs(server_name, function(data) {
            wsApi.subscribe_server_logs(server_name);
            containers['main_window'].append(data);
            $('#scrollbar1').perfectScrollbar('update');
        });
        containers['main_window'].html("");
    });
    server.find('.remove').click(function() {
        server.hide();
        server.remove();
    });
}

function add_new_server_record(name, address, port, id, is_active) {
    var servers_records = containers['servers'].find('.servers-records');
    var new_server = servers_records.find('.server.hidden').clone();
    new_server.removeClass('hidden');
    new_server.find('.name').text(name);
    new_server.find('.address').text(address);
    new_server.find('.port').text(port);
    new_server.find('.id').text(id);
    if (is_active)
        new_server.addClass('active');
    servers_records.append(new_server);
    setup_server(new_server);
}

function add_or_modify_server(name, address, port, id) {
    if (!name || !address || !port)
        return;
    name = name.slice(0, 19 /*max width*/);

    var modify = containers['servers'].find('.servers-records .server.modify');
    if (modify.html() === undefined) {
        ajaxApi.update_server(name, address, port, null, function(data) {
            add_new_server_record(name, address, port, id, false);
        });
    }
    else {
        ajaxApi.update_server(name, address, port, id, function(data) {
            modify.toggleClass('modify');
            modify.find('.name').text(name);
            modify.find('.address').text(address);
            modify.find('.port').text(port);
        });
    }
}

function setup_servers_container() {
    var servers_new = misc_containers['servers_new'];
    var name = servers_new.find('#name');
    var address = servers_new.find('#address');
    var port = servers_new.find('#port');
    var id = servers_new.find('#id');

    containers['servers'].find('.new').click(function(e) {
        name.val('');
        address.val('');
        port.val('');
        id.val('');
        servers_new.toggleClass('active-container');
    });
    misc_containers['servers_new'].find('input[type=submit]').click(function(e) {
        add_or_modify_server(name.val(), address.val(), port.val(), id.val());
        misc_containers['servers_new'].toggleClass('active-container');
    });
    containers['servers'].find('.server').each(function() {
        setup_server($(this));
    });
}

function setup_search_fields() {
    $('.search-button').click(function() {
        if (search_fields.hasClass('active')) {
            $('.search-text').val('');
            restore_log(server_name);
        }
        search_fields.toggleClass('active');
    });
    $('.connect-button').click(function() {
        if ($(this).hasClass('connected'))
            wsApi.disconnect();
        else
            wsApi.connect();
    });
    $('.search-text').keypress(function(e) {
        if (e.which == 13)
            return;

    });
}

});
