Meteor.subscribe("cards");
Meteor.subscribe("piles");
Meteor.subscribe("userData");

Session.setDefault("selectedCards", {});
Session.setDefault("showAdjustVisibilityDialog", false);
Session.setDefault("showCreatePileDialog", false);
Session.setDefault("adjustVisibilityDialogPile", null);
Session.setDefault("adjustVisibilityDialogChecklist", []);

Template.table.showAdjustVisibilityDialog = function () {
  return Session.get("showAdjustVisibilityDialog");
}

Template.table.showCreatePileDialog = function () {
  return Session.get("showCreatePileDialog");
}

Template.table.userId = Meteor.userId;

Template.table.piles = function () {
  return Piles.find().map(function (pile) {
    pile.cards = Cards.find({_id: {$in: pile.cards}}).fetch();
    return pile;
  });
}

var openAdjustVisibilityDialog = function (pileId) {
  Session.set("adjustVisibilityDialogPile", pileId);
  Session.set("showAdjustVisibilityDialog", true);
};

var openCreatePileDialog = function (pileId) {
  Session.set("showCreatePileDialog", true);
};

var visible = function (userId, visibleTo) {
  return _.contains(visibleTo, userId) || _.contains(visibleTo, '*');
}

Template.table.visible = visible;

Template.table.inSelected = function (cardId) {
  var selectedCards = Session.get('selectedCards');
  return !(_.isUndefined(selectedCards[this._id]))
}

Template.table.loggedIn = function (userId) {
  return !!userId;
}

Template.table.pileVisibility = function (visibleTo, mode) {
  if (mode == 'all' && _.contains(visibleTo, '*')) {
    return true;
  }
  if (mode == 'none' && visibleTo.length === 0) {
    return true;
  }
  if (mode == 'some' && visibleTo.length > 0 && !_.contains(visibleTo, '*')) {
    return true;
  }
  return false;
}

Template.table.events({
  'click .card': function (evt) {
    var selectedCards = Session.get('selectedCards');
    if (_.isUndefined(selectedCards[this._id])) {
      selectedCards[this._id] = this;
    } else {
      delete selectedCards[this._id];
    }
    Session.set('selectedCards', selectedCards);
  },

  'click .move-to-here': function (evt) {
    var toPileId = this._id;
    var cardIdArray = _.keys(Session.get('selectedCards'));
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
    Piles.remove({_id: this._id});
  },

  'click .create-pile': function (evt) {
    openCreatePileDialog();
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

Template.createPileDialog.deck_types = function () {
  return _.map(_.keys(deck_types), function (e) {
    return {
      name: e,
      value: e
    };
  });
}

Template.createPileDialog.events({
  'click .save': function (evt) {
    var name = $('#name').val();
    var deck = $('#deck').val();
    Meteor.call('createPile', {name: name, deck: deck});
    Session.set("showCreatePileDialog", false);
    return false;
  },

  'click .done': function (evt) {
    Session.set("showCreatePileDialog", false);
    return false
  }
});
