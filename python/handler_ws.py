from tornado import websocket, gen
import json

from models import DBHandler

class HandlerWS(websocket.WebSocketHandler, DBHandler):
    def initialize(self, wsUsers):
        self.wsUsers = wsUsers

    def __init__(self, *args, **kwargs):
        super(HandlerWS, self).__init__(*args, **kwargs)

    def get_compression_options(self):
        return {} # compression on

    def check_origin(self, origin):
        return True

    def open(self):
        self.wsUsers.add_user(self, user_id=int(self.get_cookie('user_id')))

    def on_close(self):
        self.shutdb()
        self.wsUsers.remove_user(self)

    def on_message(self, message):
        command = json.loads(message)
        # websocket on_message method can't asynchronous job
        self.io_loop.spawn_callback(self.write_response, command)

    @gen.coroutine
    def write_response(self, command):
        response = self._compose_response(command)
        self.write_json(response)

    @gen.coroutine
    def write_json(self, msg):
        self.write_message(json.dumps(msg))

    def _compose_response(self, command):
        msg_type = command['msg_type']
        msg = {
            'msg_type': msg_type
        }

        if msg_type == 'subscribe_server_logs':
            self.wsUsers.logs_del_user(self)
            self.wsUsers.logs_add_user(self, command['server'])

        return msg
