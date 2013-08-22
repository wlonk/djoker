// Djoker -- data model
// Loaded on both the client and the server

///////////////////////////////////////////////////////////////////////////////
// Utilities
var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});


///////////////////////////////////////////////////////////////////////////////
// Piles
var spades = '\u2660',
    hearts = '\u2665',
     clubs = '\u2663',
     diams = '\u2666';

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

// @todo: everything is permitted for testing.
Piles.allow({
  insert: function (userId, pile) {
    return true; // no cowboy inserts -- use createParty method
  },
  update: function (userId, pile, fields, modifier) {
    return true; // no cowboy updates -- use specific update methods
  },
  remove: function (userId, pile) {
    return true;
    // You can only remove piles that you created and that have no cards
    return pile.owner === userId && pile.cards.length === 0;
  }
});

Meteor.methods({
  createPile: function (options) {
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in");

    var initial_cards = [
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
    ];

    var ids = [];
    for (var i = 0; i < initial_cards.length; i++) {
      ids.push(Cards.insert(initial_cards[i]));
    }

    check(options, {
      name: NonEmptyString,
      public: Match.Optional(Boolean)
    });

    return Piles.insert({
      owner: this.userId,
      name: options.name,
      public: !! options.public,
      cards: ids,
      visibleTo: []
    });
  },

  shufflePile: function (pileId) {
    //pass
  },

  moveCard: function (fromPileId, toPileId, cardId) {
    Piles.update({_id: fromPileId}, {$pull: {'cards._id': cardId}});
    Piles.update({_id: toPileId}, {$push: {cards: {_id: cardId, value: cardValue}}});
  },

  setPileVisibility: function (pileId, visibilityList) {
    // @todo: add input checks
    Piles.update({_id: pileId}, {visibleTo: visibilityList});
  }
});