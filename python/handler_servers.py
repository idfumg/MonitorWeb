import tornado
import json
from models import *
from handler_base import *

class HandlerServers(BaseHandler, tornado.web.RequestHandler, DBHandler):
    #@tornado.gen.coroutine
    def get(self):
        if not self.get_cookie('user_id'):
            users = tables['users']
            result = self.execute(users.insert())
            self.set_cookie('user_id', str(result.inserted_primary_key[0]))

        servers = self.select_servers()
        self.write_success({
            'servers': servers
        })

    #@tornado.gen.coroutine
    def select_servers(self):
        cursor = self.execute(select([tables['servers']]))
        result = []
        for id, name, address, port in cursor:
            result.append({
                'id': id,
                'name': name,
                'address': address,
                'port': port
            })
        return result
