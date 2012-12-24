import json

from django.shortcuts import render_to_response, get_object_or_404
from cards.models import Table


def root(request):
    return render_to_response('base.html', {
        'tables': Table.objects.all()
    })


def table(request, uuid):
    table = get_object_or_404(Table, uuid=uuid)
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
            hand.kind: map(unicode, hand.card_set.all())
        })
    return render_to_response('table.html', {
        'table': table,
        'users': json.dumps(users.values())
    })
