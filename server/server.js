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
  return Tables.find();
})

Meteor.publish("userData", function () {
  return Meteor.users.find();
});
