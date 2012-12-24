import logging

from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.sdjango import namespace

@namespace('')
class ChatNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    nicknames = []

    def initialize(self):
        self.logger = logging.getLogger("socketio.chat")
        self.log("Socketio session started")

    def log(self, message):
        self.logger.info("[{0}] {1}".format(self.socket.sessid, message))

    def emit_to_all_in_room(self, room, event, *args):
        """This is sent to all in the room (in this particular Namespace)"""
        pkt = dict(type="event",
                   name=event,
                   args=args,
                   endpoint=self.ns_name)
        room_name = self._get_room_name(room)
        for sessid, socket in self.socket.server.sockets.iteritems():
            if 'rooms' not in socket.session:
                continue
            if room_name in socket.session['rooms']:
                socket.send_packet(pkt)

    def on_join(self, msg):
        self.room = msg['room']
        self.join(msg['room'])
        self.emit_to_all_in_room(msg['room'], 'nickname', msg)
        return True

    def on_nickname(self, msg):
        room = msg['room']
        self.emit_to_all_in_room(room, 'nickname', msg)
        return True

    def on_draw(self, msg):
        room = msg['room']
        self.emit_to_all_in_room(room, 'draw', msg)
        return True
