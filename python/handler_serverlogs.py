import tornado
import json
import math
from models import *
from handler_base import *

class HandlerServerLogs(BaseHandler, tornado.web.RequestHandler, DBHandler):
    #@tornado.gen.coroutine
    def get(self):
        server_id = self.get_argument('server_id', None)
        if not server_id:
            self.write_error({
                'reason': 'Missing server id'
            })
            return

        page = self.get_argument('page', None)
        if page == '':
            page = None
        if page:
            page = int(page)

        page_size = self.get_argument('page_size', None)
        if not page_size:
            page_size = 50
        else:
            page_size = int(page_size)

        logs = self.select_servers_logs(server_id, page, page_size)
        self.write_success(logs)

    #@tornado.gen.coroutine
    def select_servers_logs(self, server_id, page, page_size):
        total_records = self.execute(select([func.count()]).
            select_from(tables['servers_logs']).
            where(tables['servers_logs'].c.server_id == server_id)).scalar()
        total_pages = math.floor(total_records / page_size) - 1

        if page is None or total_pages == -1:
            page = total_pages

        cursor = self.execute(
            select([tables['servers_logs']]).
            where(tables['servers_logs'].c.server_id == server_id).
            limit(page_size).
            offset(page*page_size))

        records = []
        last_record_time = None
        for id, name, time, text in cursor:
            records.append(str(time) + ' ' + text)
            last_record_time = time

        incomplete_page = (page == total_pages and len(records) <= page_size)

        if records == []:
            total_pages = 0
            page = 0

        return {
            'total_pages': total_pages,
            'page': page,
            'page_size': page_size,
            'incomplete_page': incomplete_page,
            'last_record_time': str(last_record_time),
            'server_id': server_id,
            'records': records
        }
