import tornado
from models import *
from handler_base import *

class HandlerServersEvents(BaseHandler, tornado.web.RequestHandler, DBHandler):
    #@tornado.gen.coroutine
    def get(self):
        user_id = self.get_cookie('user_id')
        if not user_id:
            self.write_error({
                'reason': 'Missing user_id cookie'
            })
            return

        events = self.select_servers_events(user_id)

        self.write_success({
            'events': events
        });

    def select_servers_events(self, user_id):
        servers_events = tables['servers_events']
        query = select([servers_events]).where(servers_events.c.user_id==user_id)
        cursor = self.execute(query)
        result = []
        for id, user_id, server_id, text in cursor:
            result.append({
                'id': id,
                'server_id': server_id,
                'text': text
            })
        return result
