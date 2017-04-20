from sqlalchemy import (
    create_engine as create_engine,
    MetaData, Table,
    Column, Integer, Sequence,
    String, ForeignKey, DateTime,
    select, delete, insert, update, func
)
from sqlalchemy.sql import and_
from tornado import concurrent, ioloop
import datetime
import tornado
import sqlite3
#from concurrent.futures import ThreadPoolExecutor

metadata = MetaData()

tables = {
    'servers': Table('servers', metadata,
        Column('id', Integer(), Sequence('servers_id_seq'), primary_key=True, index=True),
        Column('name', String(20), nullable=False, unique=True, index=True),
        Column('address', String(16), nullable=False),
        Column('port', String(10), nullable=False)),
    'servers_logs': Table('servers_logs', metadata,
        Column('id', Integer(), Sequence('servers_logs_id_seq'), primary_key=True, index=True),
        Column('server_id', Integer(), nullable=False, index=True),
        Column('time', DateTime, nullable=False),
        Column('text', String(1024), nullable=False)),
    'users': Table('users', metadata,
        Column('id', Integer(), Sequence('users_id_seq'), primary_key=True, index=True)),
    'servers_events': Table('servers_events', metadata,
        Column('id', Integer(), Sequence('servers_events_seq'), primary_key=True, index=True),
        Column('user_id', Integer(), nullable=False, index=True),
        Column('server_id', Integer(), nullable=False, index=True),
        Column('text', String(1024), nullable=False)),
    'events_occured': Table('events_occured', metadata,
        Column('event_id', Integer(), index=True),
        Column('log_id', Integer(), index=True))
}

class DBHandler():
    #executor = ThreadPoolExecutor(max_workers=4)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.io_loop = ioloop.IOLoop.current()
        self.engine = create_engine('sqlite:///database.db')
        self.conn = self.engine.connect()

    def shutdb(self):
        self.conn.close();
        self.io_loop = None
        self.engine = None
        self.conn = None

    #sqlite object cant be used in different threads, so i disabled this feature
    #temporarily.

    #@concurrent.run_on_executor
    def execute(self, query, *args):
        return self.conn.execute(query)

def init_db():
    '''
    Fill db with initial environment.
    '''
    #engine = create_engine('postgresql://idfumg:qwerty@localhost/logmonitor_db')
    engine = create_engine('sqlite:///database.db')
    metadata.create_all(engine)
    conn = engine.connect()
    transaction = conn.begin()

    conn.execute(delete(tables['servers_logs']))
    conn.execute(delete(tables['servers']))
    conn.execute(delete(tables['servers_events']))
    conn.execute(delete(tables['users']))
    conn.execute(delete(tables['events_occured']))
    now = datetime.datetime.now()
    servers = [
        {'name': 'ГРТ', 'address': '192.168.1.1', 'port': '67890'},
        {'name': 'ГРС', 'address': '192.168.1.2', 'port': '54321'},
        {'name': 'TST', 'address': '192.168.1.3', 'port': '12345'}
    ]
    conn.execute(insert(tables['servers']), servers)

    servers_logs = []
    for i in range(1000):
        servers_logs.append({'server_id': 1, 'time': now, 'text': 'HTTPSRV МОВАПУ Warning! Unexpected behaviour! ' + str(i)})
    for i in range(500):
        servers_logs.append({'server_id': 1, 'time': now, 'text': 'search test ' + str(i)})
    # for i in range(500):
    #     servers_logs.append({'name': 'ГРТ', 'time': now - datetime.timedelta(days=i), 'text': 'search test ' + str(i)})

    grs_servers_logs = []
    for i in range(10):
        grs_servers_logs.append({'server_id': 2, 'time': now + datetime.timedelta(days=1), 'text': 'HTTPSRV МОВАПУ Warning! my own unexpected error! ' + str(i)})

    events = [
        {'user_id': 1, 'text': 'unexpected', 'server_id': 1},
        {'user_id': 1, 'text': 'httpsrv', 'server_id': 1},
        {'user_id': 1, 'text': 'error', 'server_id': 2},
    ]

    conn.execute(insert(tables['servers_logs']), servers_logs)
    conn.execute(insert(tables['servers_logs']), grs_servers_logs)
    conn.execute(insert(tables['servers_events']), events)

    print('database filled')

    cursor = conn.execute(select([tables['servers']]))
    servers = [server[1] for server in cursor]

    transaction.commit()
    conn.close()
    return servers
