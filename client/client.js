Meteor.subscribe("cards");
Meteor.subscribe("piles");
Meteor.subscribe("tables");
Meteor.subscribe("userData");

Session.setDefault("selectedCards", {});
Session.setDefault("showAdjustVisibilityDialog", false);
Session.setDefault("showCreatePileDialog", false);
Session.setDefault("showCreateTableDialog", false);
Session.setDefault("showEditTableDialog", false);
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

var openCreatePileDialog = function () {
  Session.set("showCreatePileDialog", true);
};

var openCreateTableDialog = function () {
  Session.set("showCreateTableDialog", true);
};

var openEditTableDialog = function () {
  Session.set("showEditTableDialog", true);
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

Template.table.showEditTableDialog = function () {
  return Session.get("showEditTableDialog");
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

Template.table.participants = function () {
  var tableId = Session.get("tableId");
  var table = Tables.findOne({_id: tableId});
  if (table.public) {
    // return Meteor.users.find();
    return [{
      profile: {
        name: "public"
      }
    }];
  } else {
    return Meteor.users.find({_id: {$in: table.participants}});
  }
}

Template.table.displayName = function ()  {
  return displayName(this);
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
  'click .card': function () {
    var selectedCards = Session.get('selectedCards');
    if (_.isUndefined(selectedCards[this._id])) {
      selectedCards[this._id] = this;
    } else {
      selectedCards = _.omit(selectedCards, this._id);
    }
    Session.set('selectedCards', selectedCards);
  },

  'click .move-to-here': function () {
    var toPileId = this._id;
    var cardIdArray = _.keys(Session.get('selectedCards'));
    Meteor.call('moveCards', toPileId, cardIdArray);
    Session.set('selectedCards', {});
  },

  'click .shuffle': function () {
    Meteor.call('shufflePile', this._id);
  },

  'click .sort': function () {
    Meteor.call('sortPile', this._id);
  },

  'click .reveal-this-pile': function () {
    Meteor.call('setPileVisibility', this._id, ['*']);
  },

  'click .facedown-this-pile': function () {
    Meteor.call('setPileVisibility', this._id, []);
  },

  'click .adjust-visibility-on-this-pile': function () {
    openAdjustVisibilityDialog(this._id);
  },

  'click .trash-this-pile': function () {
    Piles.remove({_id: this._id});
  },

  'click .create-pile': function () {
    openCreatePileDialog();
  },

  'click .edit-table': function () {
    openEditTableDialog();
  },

  'click .delete-table': function () {
    Tables.remove({_id: Session.get("tableId")});
    Router.navigate('/', true);
  }
});

/****************************************************************************
 * ADJUST VISIBILITY DIALOG
 */

Template.adjustVisibilityDialog.users = function () {
  var tableId = Session.get("tableId");
  var table = Tables.findOne({_id: tableId});
  if (table.public) {
    return Meteor.users.find();
  } else {
    return Meteor.users.find({_id: {$in: table.participants}});
  }
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
  'click .save': function () {
    var userIdArray = $('.viewers .active').toArray().map(function (x) {
      return $(x).data('userid');
    });
    Meteor.call('setPileVisibility', Session.get("adjustVisibilityDialogPile"), userIdArray);
    Session.set("showAdjustVisibilityDialog", false);
    return false;
  },

  'click .done': function () {
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
  'click .save': function () {
    var options = {
      name: $('#name').val(),
      deck: $('#deck').val(),
      table: Session.get("tableId")
    };
    Meteor.call('createPile', options);
    Session.set("showCreatePileDialog", false);
    return false;
  },

  'click .done': function () {
    Session.set("showCreatePileDialog", false);
    return false;
  }
});


/****************************************************************************
 * CREATE TABLE DIALOG
 */

Template.createTableDialog.users = function () {
  return Meteor.users.find({_id: {$not: Meteor.userId()}});
}

Template.createTableDialog.displayName = function () {
  return displayName(this);
};

Template.createTableDialog.events({
  'click .save': function () {
    var options = {
      name: $('#name').val(),
      // @todo: is there a better way to turn a checkbox into a boolean?
      public: !! $('#public').attr("checked"),
      participants: $('.participants .active').toArray().map(function (x) {
        return $(x).data('userid');
      })
    };
    Meteor.call('createTable', options);
    // Router.setTable(newTableId);
    Session.set("showCreateTableDialog", false);
    return false;
  },

  'click .done': function () {
    Session.set("showCreateTableDialog", false);
    return false;
  }
});

/****************************************************************************
 * EDIT TABLE DIALOG
 */

Template.editTableDialog.table = function () {
  return Tables.findOne({_id: Session.get("tableId")});
}

Template.editTableDialog.users = function () {
  return Meteor.users.find({_id: {$not: Meteor.userId()}});
}

Template.editTableDialog.displayName = function () {
  return displayName(this);
};

Template.editTableDialog.userInParticipants = function (userId, table) {
  return _.contains(table.participants, userId);
}

Template.editTableDialog.events({
  'click .save': function () {
    var options = {
      tableId: Session.get("tableId"),
      name: $('#name').val(),
      public: !! $('#public').attr("checked"),
      participants: $('.participants .active').toArray().map(function (x) {
        return $(x).data('userid');
      })
    };
    Meteor.call('editTable', options);
    Session.set("showEditTableDialog", false);
    return false;
  },

  'click .done': function () {
    Session.set("showEditTableDialog", false);
    return false;
  }
});

/****************************************************************************
 * ROUTING AND URLS AND HISTORY, OH MY
 */

var DjokerRouter = Backbone.Router.extend({
  routes: {
    "": "home",
    ":tableId": "viewTable"
  },
  home: function () {
    Session.set("tableId", null);
  },
  viewTable: function (tableId) {
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
