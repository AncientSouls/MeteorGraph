Package.describe({
  name: 'ancient:graph',
  version: '0.0.10',
  summary: 'Graph class adapted for Meteor Minimongo database.',
  git: 'https://github.com/AncientSouls/MeteorGraph',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  
  api.use('mongo');
  api.use('ecmascript');
  
  api.use('matb33:collection-hooks@0.8.4');
  
  api.mainModule('graph.js');
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('mongo');
  
  api.use('ancient:graph');
  api.use('practicalmeteor:mocha@2.4.5');
  
  api.addFiles('graph.test.js');
});