import Ember from 'ember';

export default Ember.Route.extend({
   model: function() {
    var x = this.store.find('asset');
    return x;
  }
});
