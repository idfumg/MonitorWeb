import tornado
import json
from models import *
from handler_base import *

class HandlerServerUpdate(BaseHandler, tornado.web.RequestHandler, DBHandler):
    def initialize(self, wsUsers):
        self.wsUsers = wsUsers

    #@tornado.gen.coroutine
    def post(self):
        server_id = self.get_argument('server_id', None)
        name = self.get_argument('name')
        address = self.get_argument('address')
        port = self.get_argument('port')

        if not server_id:
            self.write_error({
                'reason': 'Missing server id'
            })
            return

        servers = tables['servers']
        query = select([servers.c.name]).where(servers.c.id==server_id)
        old_name = self.execute(query).scalar()
        self.update_server(server_id, name, address, port)
        self.wsUsers.logs_update_user(name, old_name)

        self.write_success({})

    #@tornado.gen.coroutine
    def update_server(self, server_id, name, address, port):
        servers = tables['servers']
        self.execute(update(servers)
            .where(servers.c.id == int(server_id))
            .values(name=name, address=address, port=port))
