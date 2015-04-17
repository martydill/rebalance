import Ember from 'ember';

export default Ember.Controller.extend({
  only_purchases: undefined,
  available_amount: 0,

  watchBuyAmount: function(){
    this.send('rebalance');
  }.observes('buy_amount'),

  watchPurchases: function() {
    if (this.get('buy_amount') == null) {
      this.set('buy_amount', 1000);
      $("#buy_amount").focus();
    }
    else {
      this.send('rebalance');
    }
  }.observes('only_purchases'),

  calculate_rebalance: function () {
    var only_purchases = this.get('only_purchases');

    var remainingAmount = parseFloat(this.get('buy_amount'));
    if(isNaN(remainingAmount)) {
      remainingAmount = 0;
    }

    var total_value = this.get('total_value') + remainingAmount;

    if(only_purchases && this.get('buy_amount')) {
      this.get('model').forEach(function(asset) {
        var desired_value = asset.desired_value(total_value);
        var diff = desired_value - asset.get('value');
        if(diff > 0) {
          if(diff < remainingAmount) {
            remainingAmount -= diff;
            asset.set('rebalance', diff.toFixed(2));
          }
          else {
            asset.set('rebalance', remainingAmount);
            remainingAmount = 0;
          }
        }
        else {
          asset.set('rebalance', 0);
        }
      });
    }
    else {
      this.get('model').forEach(function(asset) {
        var desired_value = asset.desired_value(total_value);
        var diff = desired_value - asset.get('value');
        asset.set('rebalance', diff.toFixed(2));
      });
    }
  },

  before_array: function() {
    var data = [];
    this.get('model').forEach(function(asset) {
      var row = {label: asset.get('name'), value: asset.get('value')};
      row.caption = asset.get('name') + ': $' + asset.get('value').toFixed(2);
      if(data.length === 0) {
        row.color = "#000077";
      }
      data.push(row);
    });
    return data;
  },

  after_array: function() {
    var data = [];
    this.get('model').forEach(function(asset) {
      var newValue = parseFloat(asset.get('rebalance')) + asset.get('value');
      var row = {label: asset.get('name'), value: newValue};
      row.caption = asset.get('name') + ': $' + newValue.toFixed(2);
      if(data.length === 0) {
        row.color = "#000077";
      }
      data.push(row);
    });
    return data;
  },

  base_chart: function() {
    var browserWidth = $(window).width();
    var width = 550;
    var height = 500;
    var radius = "70%";
    var labelFontSize = 14;
    var percentFontSize = 20;

    if(browserWidth <= 400) {
      radius="60%";
      width = 350;
      height = 350;
    }
    else if(browserWidth <= 600) {
      radius = "60%";
      width = 400;
      labelFontSize = 12;
      percentFontSize = 14;
      height = 400;
    }
    else if(browserWidth <= 740) {
      radius = "60%";
      width = 600;
    }
    else if(browserWidth <= 991) {
      radius = "80%";
      width = 700;
    }
    else {
      radius = "80%";
      width = (browserWidth - 70) / 2;
    }
    var data =  {
      header: {
        title: {
          text: "Before Rebalancing",
          color: "#ffffff",
          fontSize: 24,
          font: "verdana"
        }
      },
      size: {
        canvasWidth: width,
        canvasHeight: height,
        pieOuterRadius: radius,
      },
      data: {
        content: this.before_array()
      },
      labels: {
        truncation: {
          enabled: true,
          length: 16,
        },
        mainLabel: {
          color: "#fff",
          font: "verdana",
          fontSize: labelFontSize,
        },
        percentage: {
          color: "#e1e1e1",
          font: "verdana",
          fontSize: percentFontSize,
          decimalPlaces: 0
        },
        inner: {
          hideWhenLessThanPercentage: 7,
        }
      },
      tooltips: {
        enabled: true,
        type: "caption",
      },
    };
    return data;
  },

  before: null,

  after: null,

  draw_charts: function() {
    if(this.get('before')) {
      this.get('before').destroy();
    }
    var beforeData = this.base_chart();
    beforeData.header.title.text = "Before Rebalancing";
    beforeData.data.content = this.before_array();
    this.set('before', new d3pie("before-chart", beforeData));

    if(this.get('after')) {
      this.get('after').destroy();
    }
    var afterData = this.base_chart();
    afterData.header.title.text = "After Rebalancing";
    afterData.data.content = this.after_array();
    this.set('after', new d3pie("after-chart", afterData));
  },

  cant_rebalance: function() {
    return this.get('total_allocation') !== 100;
  }.property('model.@each.desired_allocation'),

  show_asset_allocation_warning: function() {
    return this.get('cant_rebalance') && this.get('model.length') > 0;
  }.property('model.length', 'cant_rebalance'),

  can_create: function() {
    return this.get('newAssetName') && this.get('newAssetAllocation') && this.get('newAssetValue');
  }.property('newAssetName', 'newAssetAllocation', 'newAssetValue'),

  total_value: function() {
    var sum = 0;
    this.get('model').forEach(function(x) {
      sum += parseFloat(x.get('value'));
    });
    return isNaN(sum) ? 0 : sum;
  }.property('model.@each.value'),

  total_allocation: function(){
    var sum = 0;
    this.get('model').forEach(function(x) {
      sum += parseFloat(x.get('desired_allocation'));
    });
    return isNaN(sum) ? 0 : sum;
   }.property('model.@each.desired_allocation'),

  assets_to_rebalance: function() {
    var assets = this.get('model').filter(function(item) {
      return parseFloat(item.get('rebalance')) !== 0;
    });
    return assets;
  }.property('model.@each.rebalance'),

  actions: {
    edit: function() {
      this.set('show_rebalancing', false);
    },

    rebalance: function() {
      this.set('show_rebalancing', true);
      this.calculate_rebalance();
      Ember.run.scheduleOnce('afterRender', this, 'draw_charts');
    },

    removeAsset: function(asset) {
      asset.destroyRecord();
    },

    createAsset: function() {
      var name = this.get('newAssetName');
      if (!name || !name.trim()) { return false; }

      var value = this.get('newAssetValue');
      if (!value) { return false; }

      var allocation = this.get('newAssetAllocation');
      if(!allocation) { return false; }

      var asset = this.store.createRecord('asset', {
        name: name,
        value: parseFloat(value),
        desired_allocation: parseFloat(allocation)
      });

      asset.save();

      this.set('newAssetName', null);
      this.set('newAssetValue', null);
      this.set('newAssetAllocation', null);
      $("#new-asset").focus();
    }
  }
});
