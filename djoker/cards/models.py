from django.db import models


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


class Hand(models.Model):
    KINDS = (
        ('none', 'Blind'),
        ('one', 'Hand'),
        ('all', 'Open'),
    )

    table = models.ForeignKey(Table)
    user = models.ForeignKey(EphemeralUser)
    kind = models.CharField(max_length=4, choices=KINDS)


class Card(models.Model):
    name = models.CharField(max_length=36)
    hand = models.ForeignKey(Hand)

    def __unicode__(self):
        return self.name
