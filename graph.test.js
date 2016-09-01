import { Graph } from './graph.js';
import { CompleteTest } from 'ancient-graph/tests/complete.js';
import { IncompleteTest } from 'ancient-graph/tests/incomplete.js';
import { EmptyTest } from 'ancient-graph/tests/empty.js';
import { SubscriptionTest } from 'ancient-graph/tests/subscription.js';

describe('AncientSouls/MeteorGraph', function() {
  var generateGraph = function() {
    var collection = new Meteor.Collection(null);
    var graph = new Graph(collection, { id: '_id', source: 'source', target: 'target' });
    return graph;
  };
  
  CompleteTest(generateGraph, [1, 2, 3]);
  IncompleteTest(generateGraph, [1, 2, 3]);
  EmptyTest(generateGraph, [1, 2]);
  SubscriptionTest(generateGraph, [1, 2, 3]);
});