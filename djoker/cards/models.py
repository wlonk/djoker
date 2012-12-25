from django.db import models
from django.core.urlresolvers import reverse


SUITS = (
    # '\xE2\x99\xA0',  # Spades
    # '\xE2\x99\xA3',  # Clubs
    # '\xE2\x99\xA5',  # Hearts
    # '\xE2\x99\xA6',  # Diamonds
    'Spades',
    'Clubs',
    'Hearts',
    'Diamonds',
)

VALUES = (
    'Ace',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'Jack',
    'Queen',
    'King',
)

CARD_FORMAT = "{0} of {1}"


class EphemeralUser(models.Model):
    uuid = models.CharField(max_length=36, primary_key=True)
    name = models.CharField(max_length=36)

    def __unicode__(self):
        if self.name:
            return "{0} ({1})".format(
                self.name,
                self.clipped_uuid
            )
        else:
            return self.clipped_uuid

    @property
    def clipped_uuid(self):
        return self.uuid.split('-')[0]


class Table(models.Model):
    uuid = models.CharField(max_length=36, primary_key=True)

    def __unicode__(self):
        return 'Table {0}'.format(self.uuid)

    def get_absolute_url(self):
        return reverse('table', args=(self.uuid,))


class Hand(models.Model):
    BLIND = 'blind'
    HAND = 'hand'
    OPEN = 'open'

    KINDS = (
        (BLIND, 'Blind'),
        (HAND, 'Hand'),
        (OPEN, 'Open'),
    )

    table = models.ForeignKey(Table)
    user = models.ForeignKey(EphemeralUser)
    kind = models.CharField(max_length=8, choices=KINDS)

    def to_string_by_user(self, user):
        if self.kind == self.BLIND \
        or (self.kind == self.HAND and self.user != user):
            count = self.card_set.count()
            return '{0} card{1}'.format(
                count,
                '' if count == 1 else 's'
            )
        if self.kind == self.OPEN \
        or (self.kind == self.HAND and self.user == user):
            return map(unicode, self.card_set.all()) or '0 cards'


class Card(models.Model):
    name = models.CharField(max_length=36)
    hand = models.ForeignKey(Hand)

    def __unicode__(self):
        return self.name
