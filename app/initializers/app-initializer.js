export function initialize(/* container, application */) {
  // application.inject('route', 'foo', 'service:foo');
    $("#rebalance-app").show();
   $("#loading").hide();
}

export default {
  name: 'app-initializer',
  initialize: initialize
};
