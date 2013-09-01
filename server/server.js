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
    $or: [
      {public: true},
      {participants: this.userId}
    ]
  });
});

Meteor.publish("logEvents", function () {
  return LogEvents.find({}, {sort: {timestamp: -1}});
})

Meteor.publish("userData", function () {
  return Meteor.users.find();
});
