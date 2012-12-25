import logging

from random import randint

from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.sdjango import namespace

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from cards.models import Table, Hand, EphemeralUser

@namespace('/table')
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
        self.socket.session['user'] = user
        self.emit_to_all_in_room(msg['room'], 'nickname', msg)
        return True

    def on_nickname(self, msg):
        room = msg['room']
        try:
            user = EphemeralUser.objects.get(uuid=msg['user']['uuid'])
            user.name = msg['user']['nickname']
            user.save()
        except EphemeralUser.DoesNotExist:
            pass
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
        # Get card from Deck.
        deck = table.hand_set.get(kind=Hand.BLIND, user__uuid=settings.DECK)
        deck_count = deck.card_set.count()
        if not deck_count:
            return
        card = deck.card_set.all()[randint(0, deck_count - 1)]
        card.hand = hand
        card.save()
        # Mung message as called for, per user
        room = msg['room']
        room_name = self._get_room_name(room)
        users_in_room = set(h.user
            for h in table.hand_set.select_related('user'))
        for u in users_in_room:
            hand_to_display = hand.to_string_by_user(u)
            # Emit hand to display to given user.
            pkt = dict(
                type="event",
                name="draw",
                args={
                    'user': user.uuid,
                    'kind': msg['kind'],
                    'hand': hand_to_display
                },
                endpoint=self.ns_name
            )
            deck_to_display = deck.to_string_by_user(u)
            pkt2 = dict(
                type="event",
                name="draw",
                args={
                    'user': deck.user.uuid,
                    'kind': Hand.BLIND,
                    'hand': deck_to_display
                },
                endpoint=self.ns_name
            )
            for sessid, socket in self.socket.server.sockets.iteritems():
                if 'rooms' not in socket.session:
                    continue
                if 'user' not in socket.session:
                    continue
                if (room_name in socket.session['rooms']
                    and u == socket.session['user']):
                    socket.send_packet(pkt)
                    socket.send_packet(pkt2)
        return True

    def on_move(self, msg):
        try:
            user = EphemeralUser.objects.get(uuid=msg['user'])
            table = Table.objects.get(uuid=msg['room'])
            origin = Hand.objects.get(
                user=user,
                table=table,
                kind=msg['origin']
            )
            if msg['destination'] == 'discard':
                destination = Hand.objects.get(
                    user__uuid=settings.DISCARD,
                    table=table,
                    kind=Hand.OPEN
                )
            else:
                destination = Hand.objects.get(
                    user=user,
                    table=table,
                    kind=msg['destination']
                )
        except ObjectDoesNotExist:
            print "PANICKING"
            return True
        # Get card, move from origin to destination
        if msg['origin'] == 'blind':
            # grab the first
            card = origin.card_set.all()[0]
        else:
            # grab the named card
            card = origin.card_set.get(name=msg['card'])
        card.hand = destination
        card.save()
        # Mung message as called for, per user
        room = msg['room']
        room_name = self._get_room_name(room)
        users_in_room = set(h.user
            for h in table.hand_set.select_related('user'))
        for u in users_in_room:
            hand_to_display = origin.to_string_by_user(u)
            # Emit hand to display to given user.
            pkt = dict(
                type="event",
                name="draw",
                args={
                    'user': origin.user.uuid,
                    'kind': origin.kind,
                    'hand': hand_to_display
                },
                endpoint=self.ns_name
            )
            destination_to_display = destination.to_string_by_user(u)
            pkt2 = dict(
                type="event",
                name="draw",
                args={
                    'user': destination.user.uuid,
                    'kind': destination.kind,
                    'hand': destination_to_display
                },
                endpoint=self.ns_name
            )
            for sessid, socket in self.socket.server.sockets.iteritems():
                if 'rooms' not in socket.session:
                    continue
                if 'user' not in socket.session:
                    continue
                if (room_name in socket.session['rooms']
                    and u == socket.session['user']):
                    socket.send_packet(pkt)
                    socket.send_packet(pkt2)
        return True
