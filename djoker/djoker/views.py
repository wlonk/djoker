import json
from uuid import uuid4
from datetime import datetime, timedelta

from django.conf import settings
from django.shortcuts import render_to_response, get_object_or_404, redirect
from cards.models import (Table, EphemeralUser, Hand, Card,
    SUITS, VALUES, CARD_FORMAT)


def root(request):
    return render_to_response('base.html', {
        'tables': Table.objects.all()
    })


def table(request, uuid):
    try:
        user_uuid = request.COOKIES['current_user']
        set_cookie = False
    except KeyError:
        user_uuid = str(uuid4())
        set_cookie = True
    viewing_user, created = EphemeralUser.objects.get_or_create(uuid=user_uuid)

    table = get_object_or_404(Table, uuid=uuid)
    for kind in (Hand.BLIND, Hand.HAND, Hand.OPEN):
        Hand.objects.get_or_create(kind=kind, table=table, user=viewing_user)
    users = {}
    for hand in table.hand_set.all():
        try:
            current_user = users[hand.user.uuid]
        except KeyError:
            current_user = {
                'uuid': hand.user.uuid,
                'nickname': hand.user.name
            }
            users[hand.user.uuid] = current_user
        current_user.update({
            hand.kind: hand.to_string_by_user(viewing_user)
        })
    resp = render_to_response('table.html', {
        'table': table,
        'users': json.dumps(users.values())
    })
    if set_cookie:
        resp.set_cookie('current_user', user_uuid,
            expires=datetime.now() + timedelta(days=365))
    return resp


def create_table(request):
    table = Table.objects.create(uuid=str(uuid4()))
    # The Deck and Discard special users are known-to-exist
    deck = EphemeralUser.objects.get(
        uuid=settings.DECK
    )
    discard = EphemeralUser.objects.get(
        uuid=settings.DISCARD
    )
    deck_hand = Hand.objects.create(
        kind=Hand.BLIND,
        user=deck,
        table=table
    )
    Hand.objects.create(
        kind=Hand.OPEN,
        user=discard,
        table=table
    )
    # Populate DECK with 52 cards.
    for suit in SUITS:
        for value in VALUES:
            Card.objects.create(
                hand=deck_hand,
                name=CARD_FORMAT.format(
                    value,
                    suit
                )
            )
    return redirect(table)
