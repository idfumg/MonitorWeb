import tornado
import json
from models import *
from handler_base import *

class HandlerServerNew(BaseHandler, tornado.web.RequestHandler, DBHandler):
    #@tornado.gen.coroutine
    def post(self):
        name = self.get_argument('name')
        address = self.get_argument('address')
        port = self.get_argument('port')

        if not name and not address and not port:
            self.write_error({
                'reason': 'Missing name | address | port'
            })

        id = self.new_server(name, address, port)
        self.write_success({'id': id})

    #@tornado.gen.coroutine
    def new_server(self, name, address, port):
        servers = tables['servers']
        result = self.execute(insert(servers).values(name=name,
                                                     address=address,
                                                     port=port))
        server_id = result.inserted_primary_key[0]
        return server_id
