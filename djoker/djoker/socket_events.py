import logging

from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.sdjango import namespace

from cards.models import Table, Hand, Card, EphemeralUser

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
        # Add to room
        table, created = Table.objects.get_or_create(uuid=msg['room'])
        user, created = EphemeralUser.objects.get_or_create(uuid=msg['user']['uuid'])
        Hand.objects.get_or_create(kind=Hand.BLIND, table=table, user=user)
        Hand.objects.get_or_create(kind=Hand.HAND, table=table, user=user)
        Hand.objects.get_or_create(kind=Hand.OPEN, table=table, user=user)
        self.emit_to_all_in_room(msg['room'], 'nickname', msg)
        return True

    def on_nickname(self, msg):
        room = msg['room']
        self.emit_to_all_in_room(room, 'nickname', msg)
        return True

    def on_draw(self, msg):
        # Draw from deck, persist to DB
        table, created = Table.objects.get_or_create(uuid=msg['room'])
        user, created = EphemeralUser.objects.get_or_create(uuid=msg['user'])
        hand, created = Hand.objects.get_or_create(
            table=table,
            user=user,
            kind=msg['kind']
        )
        Card.objects.create(name='Ace of Spades', hand=hand)
        # Mung message as called for, per user
        users_in_room = set(h.user
            for h in table.hand_set.select_related('user'))
        to_emit = {}
        for u in users_in_room:
            hand_to_display = hand.to_string_by_user(u)
            # Emit hand to display to given user.
            to_emit[user] = {
                'user': user.uuid,
                'kind': msg['kind'],
                'hand': hand_to_display
            }
        # room = msg['room']
        # room_name = self._get_room_name(room)
        # for user, event in to_emit.items():
        #     pkt = dict(
        #         type="event",
        #         name="draw",
        #         args=data,
        #         endpoint=self.ns_name
        #     )
        #     user.sockets[room_name].send_packet(pkt)
        return True
