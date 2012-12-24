from django.shortcuts import render_to_response, get_object_or_404
from cards.models import Table


def root(request):
    return render_to_response('base.html', {
        'tables': Table.objects.all()
    })


def table(request, uuid):
    table = get_object_or_404(Table, uuid=uuid)
    return render_to_response('table.html', {
        'table': table
    })
