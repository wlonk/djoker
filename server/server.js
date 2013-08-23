Meteor.publish("cards", function () {
  return Cards.find();
});

Meteor.publish("piles", function () {
  return Piles.find();
});

Meteor.publish("userData", function () {
  return Meteor.users.find();
});
