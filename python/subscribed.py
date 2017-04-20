class WsRawUsers:
    def __init__(self):
        super(WsRawUsers, self).__init__()
        self.raw_users = {}

    def add_user(self, user, **kwargs):
        if user not in self.raw_users:
            self.raw_users[user] = {}
        self.raw_users[user].update(**kwargs)

    def del_user(self, user=None, user_id=None):
        assert user or user_id
        if user and user in self.raw_users:
            return self.raw_users.pop(user)
        elif user_id:
            for dict_user, params in self.raw_users.items():
                if 'user_id' in params and params['user_id'] == int(user_id):
                    return self.raw_users.pop(dict_user)
        return None

    def get_user(self, user_id):
        for dict_user, params in self.raw_users.items():
            if 'user_id' in params and params['user_id'] == int(user_id):
                return dict_user
        return None

class WsEventUsers:
    def __init__(self):
        super(WsEventUsers, self).__init__()
        self.event_users = {}

    def events_dispatch(self, user, event_id):
        if user not in self.event_users:
            self.event_users[user] = set()
        self.event_users[user].add(event_id)

    def events_is_dispatched(self, user, event_id):
        return user in self.event_users and event_id in self.event_users[user]

    def events_del_user(self, user):
        if user in self.event_users:
            return self.event_users.pop(user)

class WsLogsUsers:
    def __init__(self):
        super(WsLogsUsers, self).__init__()
        self.logs_users = {}

    def logs_get_users(self, server_name):
        return self.logs_users.get(server_name, [])

    def logs_add_user(self, user, server_name):
        if server_name not in self.logs_users:
            self.logs_users[server_name] = set()
        self.logs_users[server_name].add(user)

    def logs_del_user(self, user):
        for logs_users in self.logs_users.values():
            logs_users.discard(user)

    def logs_update_user(self, user, server_name):
        self.logs_del_user(user)
        self.logs_add_user(user, server_name)

class WsUsers(WsRawUsers, WsEventUsers, WsLogsUsers):
    def __init__(self):
        super(WsUsers, self).__init__()

    def remove_user(self, user):
        self.del_user(user)
        self.logs_del_user(user)
        self.events_del_user(user)
