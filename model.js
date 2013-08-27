// Djoker -- data model
// Loaded on both the client and the server

///////////////////////////////////////////////////////////////////////////////
// Utilities
var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

var ValidTable = Match.Where(function (x) {
  check(x, String);
  return Tables.find({_id: x}).count() === 1;
});

var ValidDeck = Match.Where(function (x) {
  check(x, String);
  return _.contains(_.keys(deck_types), x);
});

var ValidUserArray = Match.Where(function (x) {
  check(x, Array);
  for (var i; i < x.length; i++) {
    var arrayElement = x[i];
    check(arrayElement, String);
    if (!Meteor.users.find({_id: arrayElement}).count()) {
      return false;
    }
  }
  return true;
});

displayName = function (user) {
  if (user.profile && user.profile.name)
    return user.profile.name;
  return user.emails[0].address;
};

///////////////////////////////////////////////////////////////////////////////
// Piles
var spades = '\u2660',
    hearts = '\u2665',
     clubs = '\u2663',
     diams = '\u2666',
     joker = 'Jo';

deck_types = {
  'empty': [],
  '52': [
    {value:  "A" + clubs,   suit: "clubs"},
    {value:  "2" + clubs,   suit: "clubs"},
    {value:  "3" + clubs,   suit: "clubs"},
    {value:  "4" + clubs,   suit: "clubs"},
    {value:  "5" + clubs,   suit: "clubs"},
    {value:  "6" + clubs,   suit: "clubs"},
    {value:  "7" + clubs,   suit: "clubs"},
    {value:  "8" + clubs,   suit: "clubs"},
    {value:  "9" + clubs,   suit: "clubs"},
    {value: "10" + clubs,   suit: "clubs"},
    {value:  "J" + clubs,   suit: "clubs"},
    {value:  "Q" + clubs,   suit: "clubs"},
    {value:  "K" + clubs,   suit: "clubs"},
    {value:  "A" + diams,   suit: "diams"},
    {value:  "2" + diams,   suit: "diams"},
    {value:  "3" + diams,   suit: "diams"},
    {value:  "4" + diams,   suit: "diams"},
    {value:  "5" + diams,   suit: "diams"},
    {value:  "6" + diams,   suit: "diams"},
    {value:  "7" + diams,   suit: "diams"},
    {value:  "8" + diams,   suit: "diams"},
    {value:  "9" + diams,   suit: "diams"},
    {value: "10" + diams,   suit: "diams"},
    {value:  "J" + diams,   suit: "diams"},
    {value:  "Q" + diams,   suit: "diams"},
    {value:  "K" + diams,   suit: "diams"},
    {value:  "A" + hearts,  suit: "hearts"},
    {value:  "2" + hearts,  suit: "hearts"},
    {value:  "3" + hearts,  suit: "hearts"},
    {value:  "4" + hearts,  suit: "hearts"},
    {value:  "5" + hearts,  suit: "hearts"},
    {value:  "6" + hearts,  suit: "hearts"},
    {value:  "7" + hearts,  suit: "hearts"},
    {value:  "8" + hearts,  suit: "hearts"},
    {value:  "9" + hearts,  suit: "hearts"},
    {value: "10" + hearts,  suit: "hearts"},
    {value:  "J" + hearts,  suit: "hearts"},
    {value:  "Q" + hearts,  suit: "hearts"},
    {value:  "K" + hearts,  suit: "hearts"},
    {value:  "A" + spades,  suit: "spades"},
    {value:  "2" + spades,  suit: "spades"},
    {value:  "3" + spades,  suit: "spades"},
    {value:  "4" + spades,  suit: "spades"},
    {value:  "5" + spades,  suit: "spades"},
    {value:  "6" + spades,  suit: "spades"},
    {value:  "7" + spades,  suit: "spades"},
    {value:  "8" + spades,  suit: "spades"},
    {value:  "9" + spades,  suit: "spades"},
    {value: "10" + spades,  suit: "spades"},
    {value:  "J" + spades,  suit: "spades"},
    {value:  "Q" + spades,  suit: "spades"},
    {value:  "K" + spades,  suit: "spades"},
  ],
  '54': [
    {value:  "A" + clubs,   suit: "clubs"},
    {value:  "2" + clubs,   suit: "clubs"},
    {value:  "3" + clubs,   suit: "clubs"},
    {value:  "4" + clubs,   suit: "clubs"},
    {value:  "5" + clubs,   suit: "clubs"},
    {value:  "6" + clubs,   suit: "clubs"},
    {value:  "7" + clubs,   suit: "clubs"},
    {value:  "8" + clubs,   suit: "clubs"},
    {value:  "9" + clubs,   suit: "clubs"},
    {value: "10" + clubs,   suit: "clubs"},
    {value:  "J" + clubs,   suit: "clubs"},
    {value:  "Q" + clubs,   suit: "clubs"},
    {value:  "K" + clubs,   suit: "clubs"},
    {value:  "A" + diams,   suit: "diams"},
    {value:  "2" + diams,   suit: "diams"},
    {value:  "3" + diams,   suit: "diams"},
    {value:  "4" + diams,   suit: "diams"},
    {value:  "5" + diams,   suit: "diams"},
    {value:  "6" + diams,   suit: "diams"},
    {value:  "7" + diams,   suit: "diams"},
    {value:  "8" + diams,   suit: "diams"},
    {value:  "9" + diams,   suit: "diams"},
    {value: "10" + diams,   suit: "diams"},
    {value:  "J" + diams,   suit: "diams"},
    {value:  "Q" + diams,   suit: "diams"},
    {value:  "K" + diams,   suit: "diams"},
    {value:  "A" + hearts,  suit: "hearts"},
    {value:  "2" + hearts,  suit: "hearts"},
    {value:  "3" + hearts,  suit: "hearts"},
    {value:  "4" + hearts,  suit: "hearts"},
    {value:  "5" + hearts,  suit: "hearts"},
    {value:  "6" + hearts,  suit: "hearts"},
    {value:  "7" + hearts,  suit: "hearts"},
    {value:  "8" + hearts,  suit: "hearts"},
    {value:  "9" + hearts,  suit: "hearts"},
    {value: "10" + hearts,  suit: "hearts"},
    {value:  "J" + hearts,  suit: "hearts"},
    {value:  "Q" + hearts,  suit: "hearts"},
    {value:  "K" + hearts,  suit: "hearts"},
    {value:  "A" + spades,  suit: "spades"},
    {value:  "2" + spades,  suit: "spades"},
    {value:  "3" + spades,  suit: "spades"},
    {value:  "4" + spades,  suit: "spades"},
    {value:  "5" + spades,  suit: "spades"},
    {value:  "6" + spades,  suit: "spades"},
    {value:  "7" + spades,  suit: "spades"},
    {value:  "8" + spades,  suit: "spades"},
    {value:  "9" + spades,  suit: "spades"},
    {value: "10" + spades,  suit: "spades"},
    {value:  "J" + spades,  suit: "spades"},
    {value:  "Q" + spades,  suit: "spades"},
    {value:  "K" + spades,  suit: "spades"},
    {value:  joker,  suit: "joker"},
    {value:  joker,  suit: "joker"},
  ]
}

Cards = new Meteor.Collection("cards");

Cards.allow({
  insert: function (userId, card) {
    return true;
  },
  update: function (userId, card, fields, modifier) {
    return true;
  },
  remove: function (userId, card) {
    return true;
  }
});

Piles = new Meteor.Collection("piles");

Piles.allow({
  insert: function (userId, pile) {
    return false; // no cowboy inserts -- use createParty method
  },
  update: function (userId, pile, fields, modifier) {
    return false; // no cowboy updates -- use specific update methods
  },
  remove: function (userId, pile) {
    // You can only remove piles that you created and that have no cards
    return pile.owner === userId && pile.cards.length === 0;
  }
});

Tables = new Meteor.Collection("tables");

// @todo: allow all right now.
Tables.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
})

Meteor.methods({
  createPile: function (options) {
    if (! this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      table: ValidTable,
      name: NonEmptyString,
      deck: ValidDeck
    });

    var initial_cards = deck_types[options.deck];

    var ids = [];
    for (var i = 0; i < initial_cards.length; i++) {
      ids.push(Cards.insert(initial_cards[i]));
    }

    return Piles.insert({
      table: options.table,
      owner: this.userId,
      name: options.name,
      cards: ids,
      visibleTo: [this.userId]
    });
  },

  shufflePile: function (pileId) {
    var pile = Piles.findOne({_id: pileId});
    var shuffled_cards = _.shuffle(pile.cards);
    Piles.update({_id: pileId}, {$set: {cards: shuffled_cards}});
  },

  sortPile: function (pileId) {
    var pile = Piles.findOne({_id: pileId});
    pile_cards = pile.cards.map(function (id) {
      return Cards.findOne({_id: id});
    });
    sorted_cards = _.pluck(_.sortBy(pile_cards, function (card) {
      return card.suit + card.value;
    }), '_id');
    Piles.update({_id: pileId}, {$set: {cards: sorted_cards}});
  },

  moveCards: function (toPileId, cardIdArray) {
    for (var i = 0; i < cardIdArray.length; i++) {
      var cardId = cardIdArray[i];
      fromPileId = Piles.findOne({cards: cardId})._id;
      Piles.update({_id: fromPileId}, {$pull: {cards: cardId}});
      Piles.update({_id: toPileId}, {$push: {cards: cardId}});
    }
  },

  setPileVisibility: function (pileId, visibilityList) {
    // @todo: add input checks
    if (_.contains(visibilityList, '*')) {
      visibilityList = ['*'];
    }
    Piles.update({_id: pileId}, {$set: {visibleTo: visibilityList}});
  },

  createTable: function (options) {
    if (! this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      name: NonEmptyString,
      public: Boolean
    });

    return Tables.insert({
      owner: this.userId,
      name: options.name,
      public: options.public
    });
  },

  editTable: function (options) {
    if (! this.userId) {
      throw new Meteor.Error(403, "You must be logged in");
    }
    check(options, {
      tableId: ValidTable,
      name: NonEmptyString,
      public: Boolean,
      participants: ValidUserArray
    });
    var updateOptions = _.omit(options, 'tableId');
    Tables.update({_id: options.tableId}, {$set: updateOptions});
  }
});
