import Ember from 'ember';

// http://stackoverflow.com/a/20410557/184630
export default Ember.TextField.extend({
  type: 'number',
  numericValue : function (key,v) {
    if (arguments.length === 1) {
      return parseFloat(this.get('value'));
    }
    else {
      this.set('value', v !== undefined ? v+'' : '');
    }
  }.property('value'),

  didInsertElement: function() {
    this.$().keypress(function(key) {
      if((key.charCode!==46) &&
        (key.charCode!==45) &&
        (key.keyCode !== 9) &&
        (key.keyCode !== 8) &&
        (key.keyCode !== 37) &&
        (key.keyCode !== 39) &&
        (key.keyCode !== 46) &&
        (key.charCode < 48 || key.charCode > 57)) {
        return false;
      }
    });
  }
});
