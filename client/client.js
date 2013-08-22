Meteor.subscribe("cards");
Meteor.subscribe("piles");

Template.table.piles = function () {
  return Piles.find().map(function (pile) {
    pile.cards = Cards.find({_id: {$in: pile.cards}}).fetch();
    return pile;
  });
}

Template.table.userId = Meteor.userId;
Template.table.selected = {};

Template.table.visible = function (userId, owner, visibleTo) {
  return owner === userId || visibleTo.indexOf(userId) >= 0 || visibleTo.indexOf('*') >= 0;
}

Template.table.events({
  'click .card': function (evt) {
    $(evt.target).toggleClass('selected');
    if (typeof Template.table.selected[this._id] === 'undefined') {
      Template.table.selected[this._id] = this;
    } else {
      delete Template.table.selected[this._id];
    }
  },
  'click .move-to-here': function (evt) {
    console.log("Move", Template.table.selected, "to", this);
  }
});
