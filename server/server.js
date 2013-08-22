Meteor.publish("cards", function () {
  return Cards.find();
});

Meteor.publish("piles", function () {
  return Piles.find();
});
