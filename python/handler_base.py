import tornado
import json

class BaseHandler():
    def set_default_headers(self):
        '''
        To allow cross domain requests.
        '''
        self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header('Access-Control-Allow-Credentials', 'true')

    def get_compression_options(self):
        return {} # compression on

    def check_origin(self, origin):
        return True

    def write_success(self, data):
        result = data
        result.update({
            'result': True
        })
        self.write(json.dumps(result))

    def write_error(self, data):
        result = data
        result.update({
            'result': False
        })
        self.write(json.dumps(result))
