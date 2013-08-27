Meteor.subscribe("cards");
Meteor.subscribe("piles");
Meteor.subscribe("tables");
Meteor.subscribe("userData");

Session.setDefault("selectedCards", {});
Session.setDefault("showAdjustVisibilityDialog", false);
Session.setDefault("showCreatePileDialog", false);
Session.setDefault("showCreateTableDialog", false);
Session.setDefault("adjustVisibilityDialogPile", null);
Session.setDefault("adjustVisibilityDialogChecklist", []);
Session.setDefault("tableId", null);

/****************************************************************************
 * UTILITIES
 */

var pilesHandle = null;
// Always be subscribed to the piles for the selected table.
Deps.autorun(function () {
  var tableId = Session.get('tableId');
  if (tableId) {
    pilesHandle = Meteor.subscribe('piles', tableId);
  } else {
    pilesHandle = null;
  }
});

var openCreatePileDialog = function (pileId) {
  Session.set("showCreatePileDialog", true);
};

var openCreateTableDialog = function (pileId) {
  Session.set("showCreateTableDialog", true);
};

var openAdjustVisibilityDialog = function (pileId) {
  Session.set("adjustVisibilityDialogPile", pileId);
  Session.set("showAdjustVisibilityDialog", true);
};

var visible = function (userId, visibleTo) {
  return _.contains(visibleTo, userId) || _.contains(visibleTo, '*');
}

/****************************************************************************
 * DISPLAY CONTROLLER
 */

Template.displayController.tableId = function () {
  return Session.get("tableId");
}

Template.displayController.showCreateTableDialog = function () {
  return Session.get("showCreateTableDialog");
}

Template.displayController.loading = function () {
  return pilesHandle && !pilesHandle.ready();
}

/****************************************************************************
 * TABLE LIST
 */

Template.tableList.tables = function () {
  return Tables.find();
}

Template.tableList.events({
  'click a': function (evt) {
    evt.preventDefault();
    Router.setTable(this._id);
  },
  'click .create-table': function () {
    openCreateTableDialog();
  }
});

/****************************************************************************
 * TABLE
 */

Template.table.visible = visible;

Template.table.userId = Meteor.userId;

Template.table.showAdjustVisibilityDialog = function () {
  return Session.get("showAdjustVisibilityDialog");
}

Template.table.showCreatePileDialog = function () {
  return Session.get("showCreatePileDialog");
}

Template.table.tableName = function () {
  var table = Tables.findOne({_id: Session.get("tableId")});
  return _.isUndefined(table) ? "No such table" : table.name;
}

Template.table.piles = function () {
  return Piles.find().map(function (pile) {
    // We use a map to preserve the order of the cards in the pile.
    pile.cards = pile.cards.map(function (id) {
      return Cards.findOne({_id: id});
    });
    return pile;
  });
}

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

  'click .shuffle': function (evt) {
    Meteor.call('shufflePile', this._id);
  },

  'click .sort': function (evt) {
    Meteor.call('sortPile', this._id);
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

/****************************************************************************
 * ADJUST VISIBILITY DIALOG
 */

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

/****************************************************************************
 * CREATE PILE DIALOG
 */

Template.createPileDialog.deck_types = function () {
  return _.map(_.keys(deck_types), function (e) {
    return {name: e, value: e};
  });
}

Template.createPileDialog.events({
  'click .save': function (evt) {
    var name = $('#name').val();
    var deck = $('#deck').val();
    var table = Session.get("tableId");
    Meteor.call('createPile', {table: table, name: name, deck: deck});
    Session.set("showCreatePileDialog", false);
    return false;
  },

  'click .done': function (evt) {
    Session.set("showCreatePileDialog", false);
    return false;
  }
});


/****************************************************************************
 * CREATE TABLE DIALOG
 */

Template.createTableDialog.events({
  'click .save': function (evt) {
    var name = $('#name').val();
    Meteor.call('createTable', {name: name});
    // Router.navigate(newTableId, true);
    Session.set("showCreateTableDialog", false);
    return false;
  },

  'click .done': function (evt) {
    Session.set("showCreateTableDialog", false);
    return false;
  }
});

/****************************************************************************
 * ROUTING AND URLS AND HISTORY, OH MY
 */

var DjokerRouter = Backbone.Router.extend({
  routes: {
    "": "home",
    ":tableId": "main"
  },
  home: function () {
    Session.set("tableId", null);
  },
  main: function (tableId) {
    var oldTable = Session.get("tableId");
    if (oldTable !== tableId) {
      Session.set("tableId", tableId);
    }
  },
  setTable: function (tableId) {
    this.navigate(tableId, true);
  }
});

Router = new DjokerRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
