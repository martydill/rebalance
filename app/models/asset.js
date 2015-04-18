import DS from 'ember-data';

var Asset = DS.Model.extend({
  name: DS.attr('string'),
  value: DS.attr('number'),
  desired_allocation: DS.attr('number'),
  rebalance: DS.attr('number'),

  desired_value: function(total_value) {
    return (this.get('desired_allocation') / 100.0) * total_value;
  },

  buy: function() {
    return this.get('rebalance') >= 0;
  }.property('rebalance'),

  rebalance_dollar_value: function() {
    var val = Math.abs(this.get('rebalance'));
    return val.toFixed(2);
  }.property('rebalance'),

});

Asset.reopenClass({
  FIXTURES: [
    {
     id: 1,
     name: 'Domestic Equity',
     value: 10000,
     desired_allocation: 30,
    },
    {
      id: 2,
      name: 'International Equity',
      value: 10000,
      desired_allocation: 50
    },
    {
      id: 3,
      name: 'Bonds',
      value: 10000,
      desired_allocation: 20
    }
  ]
});

export default Asset;
