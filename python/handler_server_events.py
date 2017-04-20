import tornado
from models import *
from handler_base import *

class HandlerServerEvents(BaseHandler, tornado.web.RequestHandler, DBHandler):
    #@tornado.gen.coroutine
    def get(self):
        event_id = self.get_argument('event_id')
        if not event_id:
            self.write_error({
                'reason': 'Missing event_id'
            })
            return

        events = self.select_server_events(event_id)

        self.write_success({
            'events': events
        });

    def select_server_events(self, event_id):
        events_occured = tables['events_occured']
        servers_logs = tables['servers_logs']
        query = select([servers_logs]).where(
            and_(events_occured.c.event_id==event_id,
                 events_occured.c.log_id==servers_logs.c.id))
        cursor = self.execute(query)
        records = []
        for log_id, server_id, time, text in cursor:
            records.append(str(time) + ' ' + text)
        return records
