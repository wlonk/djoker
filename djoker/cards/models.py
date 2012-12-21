from django.db import models


class EphemeralUser(models.Model):
    uuid = models.CharField(max_length=36, primary_key=True)
    name = models.CharField(max_length=36)


class Table(models.Model):
    uuid = models.CharField(max_length=36, primary_key=True)


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
