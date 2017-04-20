#!/usr/bin/env python3
# -*- coding: utf8 -*-

import tornado
import datetime

from handler_ws import HandlerWS
from handler_server_update import HandlerServerUpdate
from handler_server_new import HandlerServerNew
from handler_servers import HandlerServers
from handler_serverlogs import HandlerServerLogs
from handler_server_search_logs import HandlerServerSearchLogs
from handler_servers_events import HandlerServersEvents
from handler_server_events import HandlerServerEvents
from models import *

from subscribed import WsUsers

wsUsers = WsUsers()

def events_callback():
    now = datetime.datetime.now()
    msg = {
        'msg_type': 'event_occured'
    }

    records = [
        'HTTPSRV МОВАПУ Warning! Some error occured!'
    ]

    servers_events = tables['servers_events']
    events_occured = tables['events_occured']
    servers_logs = tables['servers_logs']

    db = DBHandler()

    log_id = None
    for record in records:
        result = db.execute(insert(servers_logs).values(time=now, text=record, server_id=1))
        log_id = result.inserted_primary_key[0]

    msg = {
        'msg_type': 'servers_logs_append',
        'records': [str(now) + ' HTTPSRV МОВАПУ Warning! Unexpected behaviour! error (GRT)']
    }
    for user in wsUsers.logs_get_users('ГРТ'):
        user.write_json(msg)

    cursor = db.execute(select([servers_events]))
    for event_id, user_id, server_id, text in cursor:
        for record in records:
            if text not in record:
                continue

            user = wsUsers.get_user(user_id)
            if user and not wsUsers.events_is_dispatched(user, event_id):
                del msg['records']
                msg['msg_type'] = 'event_notify'
                msg['event_id'] = event_id
                msg['server_id'] = server_id
                msg['text'] = text
                user.write_json(msg)
                wsUsers.events_dispatch(user, event_id)

            db.execute(insert(events_occured).values(event_id=event_id, log_id=log_id))

    tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=3), events_callback)

if __name__ == '__main__':
    servers = init_db()

    app = tornado.web.Application([
        (r'/ws', HandlerWS, dict(wsUsers=wsUsers))
    ])
    app.listen(8888)

    app2 = tornado.web.Application([
        (r'/servers', HandlerServers),
        (r'/server_update', HandlerServerUpdate, dict(wsUsers=wsUsers)),
        (r'/server_new', HandlerServerNew),
        (r'/server_logs', HandlerServerLogs),
        (r'/server_search_logs', HandlerServerSearchLogs),
        (r'/servers_events', HandlerServersEvents),
        (r'/server_events', HandlerServerEvents)
    ], cookie_secret = "my_mega_random_value_no_one_guess")
    app2.listen(8080)

    tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=3), events_callback)
    tornado.ioloop.IOLoop.instance().start()
