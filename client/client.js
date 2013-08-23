Meteor.subscribe("cards");
Meteor.subscribe("piles");
Meteor.subscribe("userData");

Session.setDefault("selectedCards", {});
Session.setDefault("showAdjustVisibilityDialog", false);
Session.setDefault("adjustVisibilityDialogPile", null);
Session.setDefault("adjustVisibilityDialogChecklist", []);

var openAdjustVisibilityDialog = function (pileId) {
  Session.set("adjustVisibilityDialogPile", pileId);
  Session.set("showAdjustVisibilityDialog", true);
};

var visible = function (userId, visibleTo) {
  return _.contains(visibleTo, userId) || _.contains(visibleTo, '*');
}

Template.table.userId = Meteor.userId;

Template.table.showAdjustVisibilityDialog = function () {
  return Session.get("showAdjustVisibilityDialog");
}

Template.table.piles = function () {
  return Piles.find().map(function (pile) {
    pile.cards = Cards.find({_id: {$in: pile.cards}}).fetch();
    return pile;
  });
}

Template.table.visible = visible;

Template.table.inSelected = function (cardId) {
  var selectedCards = Session.get('selectedCards');
  return !(typeof selectedCards[this._id] === 'undefined')
}

Template.table.events({
  'click .card': function (evt) {
    var selectedCards = Session.get('selectedCards');
    if (typeof selectedCards[this._id] === 'undefined') {
      selectedCards[this._id] = this;
    } else {
      delete selectedCards[this._id];
    }
    Session.set('selectedCards', selectedCards);
  },

  'click .move-to-here': function (evt) {
    var toPileId = this._id;
    var cardIdArray = Object.keys(Session.get('selectedCards'));
    Meteor.call('moveCards', toPileId, cardIdArray);
    Session.set('selectedCards', {});
  },

  'click .reveal-this-pile': function (evt) {
    Meteor.call('setPileVisibility', this._id, ['*']);
  },

  'click .facedown-this-pile': function (evt) {
    Meteor.call('setPileVisibility', this._id, []);
  },

  'click .adjust-visibility-on-this-pile': function (evt) {
    openAdjustVisibilityDialog(this._id);
  },

  'click .trash-this-pile': function (evt) {
    console.log('trash this');
  }
});

Template.adjustVisibilityDialog.users = function () {
  return Meteor.users.find();
}

Template.adjustVisibilityDialog.pileId = function () {
  return Session.get("adjustVisibilityDialogPile");
}

Template.adjustVisibilityDialog.displayName = function () {
  return displayName(this);
};

Template.adjustVisibilityDialog.isViewer = function (userId, pileId) {
  var pile = Piles.findOne({_id: pileId});
  return visible(userId, pile.visibleTo);
}

Template.adjustVisibilityDialog.events({
  'click .save': function (evt) {
    var userIdArray = $(':checked').toArray().map(function (e) {
      return $(e).data('id');
    });
    Meteor.call('setPileVisibility', Session.get("adjustVisibilityDialogPile"), userIdArray);
    Session.set("showAdjustVisibilityDialog", false);
    return false;
  },

  'click .done': function (evt) {
    Session.set("showAdjustVisibilityDialog", false);
    return false;
  }
});
