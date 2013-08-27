Meteor.publish("cards", function () {
  return Cards.find();
});

Meteor.publish("piles", function (tableId) {
  check(tableId, String);
  return Piles.find({
    table: tableId
  });
});

Meteor.publish("tables", function () {
  return Tables.find({
    // $or: {
      public: true
      // user is member
    // }
  });
})

Meteor.publish("userData", function () {
  return Meteor.users.find();
});
