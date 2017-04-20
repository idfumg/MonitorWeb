import tornado
import json
import math
from models import *
from handler_base import *
from datetime import datetime

class HandlerServerSearchLogs(BaseHandler, tornado.web.RequestHandler, DBHandler):
    #@tornado.gen.coroutine
    def get(self):
        text = self.get_argument('text', None)
        server_id = self.get_argument('server_id', None)

        if not text or not server_id:
            self.write_error({
                'reason': 'Missing text or server id'
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

        date1 = self.get_argument('date1', None)
        date2 = self.get_argument('date2', None)

        if date1:
            date1 = datetime.strptime(date1, "%a, %d %b %Y %H:%M:%S %Z")

        if date2:
            date2 = datetime.strptime(date2, "%a, %d %b %Y %H:%M:%S %Z")

        logs = self.select_server_logs_search(server_id,
                                              page,
                                              page_size,
                                              text,
                                              date1,
                                              date2)
        self.write_success(logs)

    def select_server_logs_search(self,
                                  server_id,
                                  page,
                                  page_size,
                                  search_text,
                                  date1=None,
                                  date2=None):
        servers_logs = tables['servers_logs']

        conditions = [
            servers_logs.c.server_id == server_id,
            servers_logs.c.text.like('%{}%'.format(search_text))
        ]

        if date1:
            conditions.append(servers_logs.c.time >= date1)

        if date2:
            conditions.append(servers_logs.c.time <= date2)

        total_records_query = select([func.count()]).\
            select_from(servers_logs).\
            where(and_(*conditions))
        total_records = self.execute(total_records_query).scalar()
        total_pages = math.floor(total_records / page_size) - 1

        if page is None or total_pages == -1:
            page = total_pages

        query = select([servers_logs]).\
            where(and_(*conditions)).\
            limit(page_size).\
            offset(page*page_size)
        cursor = self.execute(query)

        records = []
        for id, name, time, text in cursor:
            records.append(str(time) + ' ' + text)

        if records == []:
            total_pages = 0
            page = 0

        return {
            'total_pages': total_pages,
            'page': page,
            'page_size': page_size,
            'server_id': server_id,
            'records': records
        }
