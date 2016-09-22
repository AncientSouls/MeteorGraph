import { Graph as AncientGraph } from 'ancient-graph';

/**
 * This method allows you to use MeteorGraph class to its inheritance chain.
 *
 * @param {Class} ParentClassGraph
 * @return {Class} MeteorGraph
 */
function factoryMeteorGraph(ParentClassGraph) {
  
  /**
   * Class to inherit. Class with methods for control links in graph.
   * Adapted for Meteor Minimongo.
   * 
   * @class
   * @description `import { Graph } from 'meteor/ancient-graph';`
   */
  class MeteorGraph extends ParentClassGraph {
    
    /**
     * Construct new graph and checks for required adaptation methods.
     * @param {Mongo.Collection} collection
     * @param {Object.<string, string>} fields - matching of fields in the link with fields in document
     * @throws {Error} if the adapter methods is not complete
     */
    constructor(collection, fields, config) {
      super(...arguments);
    }
    
    /**
     * Should insert new link into graph.
     * Return a synchronous result. This can be useful in your application. But for writing generic code, it is recommended to only use the callback result.
     * 
     * @param {Link} link
     * @param {Graph~insertCallback} [callback]
     * @return {string} [id]
     */
    insert(link, callback) {
      var _modifier = {};
      for (var f in link) {
        if (this.fields[f]) {
          _modifier[this.fields[f]] = link[f];
        }
      }
      return this.collection.insert(_modifier, callback);
    }
    
    /**
     * Optional callback. If present, called with an error object as the first argument and, if no error, the unique id of inserted link as the second.
     *
     * @callback Graph~insertCallback
     * @param {Error} [error]
     * @param {string} [id]
     */
    
    /**
     * Should update to new state of modifier object link by unique id or by link query object.
     * If the database allows, it is recommended to return a synchronous result. This can be useful in your application. But for writing generic code, it is recommended to only use the callback result.
     * 
     * @param {string|LinkSelector} selector
     * @param {LinkModifier} modifier
     * @param {Graph~updateCallback} [callback]
     * @return {number} [count]
     */
    update(selector, modifier, callback) {
      var _selector = this.query(selector);
      var _modifier = {};
      for (var m in modifier) {
        if (this.fields[m]) {
          if (typeof(modifier[m]) == 'undefined') {
            if (!_modifier.$unset) _modifier.$unset = {};
            _modifier.$unset[this.fields[m]] = '';
          } else {
            if (typeof(modifier[m]) == 'object') {
              if (Object.prototype.toString.call(modifier[m]) === '[object Array]') {
                if (!_modifier.$set) _modifier.$set = {};
                _modifier.$set[this.fields[m]] = modifier[m];
              } else {
                for (var key in modifier[m]) {
                  if (key == 'add') {
                    if (!_modifier.$addToSet) _modifier.$addToSet = {};
                    if (typeof(modifier[m][key]) == 'object') {
                      _modifier.$addToSet[this.fields[m]] = { $each: modifier[m][key] };
                    } else {
                      _modifier.$addToSet[this.fields[m]] = { $each: [modifier[m][key]] };
                    }
                  }
                  if (key == 'push') {
                    if (!_modifier.$push) _modifier.$push = {};
                    if (typeof(modifier[m][key]) == 'object') {
                      _modifier.$push[this.fields[m]] = { $each: modifier[m][key] };
                    } else {
                      _modifier.$push[this.fields[m]] = { $each: [modifier[m][key]] };
                    }
                  }
                  if (key == 'remove') {
                    if (!_modifier.$pull) _modifier.$pull = {};
                    if (typeof(modifier[m][key]) == 'object') {
                      _modifier.$pull[this.fields[m]] = { $in: modifier[m][key] };
                    } else {
                      _modifier.$pull[this.fields[m]] = { $in: [modifier[m][key]] };
                    }
                  }
                }
              }
            } else {
              if (!_modifier.$set) _modifier.$set = {};
              _modifier.$set[this.fields[m]] = modifier[m];
            }
          }
        }
      }
      this.collection.update(_selector, _modifier, callback);
    }
    
    /**
     * Optional callback. If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
     *
     * @callback Graph~updateCallback
     * @param {Error} [error]
     * @param {number} [count]
     */
    
    /**
     * Should remove link by unique id or by link query object.
     * 
     * @param {string|LinkSelector} selector
     * @param {Graph~removeCallback} [callback]
     */
    remove(selector, callback) {
      var _selector = this.query(selector);
      this.collection.remove(_selector, callback);
    }
    
    /**
     * Optional callback. If present, called with an error object as the first argument.
     *
     * @callback Graph~removeCallback
     * @param {Error} [error]
     * @param {number} [count]
     */
    
    /**
     * Generate adapter for database query for links search by unique id or by link query object.
     * 
     * @param {string|LinkSelector} selector
     * @return {*} query
     */
    query(selector) {
      var type = typeof(selector);
      if (type == 'string' || type == 'number') {
        return { [this.fields['id']]: selector };
      } else if (type == 'object') {
        var _selector = {};
        for (var m in selector) {
          if (this.fields[m]) {
            if (typeof(selector[m]) == 'undefined') {
              _selector[this.fields[m]] = { $exists: false };
            } else {
              if (Object.prototype.toString.call(selector[m]) === '[object Array]') {
                _selector[this.fields[m]] = { $in: selector[m] };
              } else {
                _selector[this.fields[m]] = selector[m];
              }
            }
          }
        }
        return _selector;
      }
    }
    
    /**
     * Generate adapted for database options object.
     * 
     * @param {Object} [options]
     * @return {*} options - a options suitable for the database
     */
    options(options) {
      var _options = {};
      if (options) {
        if (options.sort) {
          _options.sort = options.sort;
          for (var s in _options.sort) {
            if (this.fields[s]) {
              _options.sort[this.fields[s]] = options.sort[s]?1:-1;
            }
          }
        }
        if (typeof(options.skip) == 'number') {
          _options.skip = options.skip;
        }
        if (typeof(options.limit) == 'number') {
          _options.limit = options.limit;
        }
      }
      return _options;
    }
    
    /**
     * Generate Link from document by fields.
     * 
     * @param {Object} document
     * @return {Link} link
     */
    _generateLink(document) {
      var link = {};
      for (var f in this.fields) {
        if (document.hasOwnProperty(this.fields[f])) {
          link[f] = document[this.fields[f]];
        }
      }
      return link;
    }
    
    /**
     * Get one first matching link.
     * 
     * @param {string|LinkSelector} selector
     * @param {SelectOptions} [options]
     * @param {Graph~getCallback} [callback]
     * @return {Link} link - result link object
     */
    get(selector, options, callback) {
      var _selector = this.query(selector);
      var _options = this.options(options);
      var result = this.collection.findOne(_selector, _options);
      if (callback) callback(undefined, this._generateLink(result));
      return result;
    }
    
    /**
     * Optional callback. If present, called with an error object as the first argument and, if no error, the result link object.
     *
     * @callback Graph~getCallback
     * @param {Error} [error]
     * @param {Link} [link]
     */
    
    /**
     * Fetch native database documents.
     * 
     * @param {string|linkSelector} selector
     * @param {SelectOptions} [options]
     * @return {Object[]} documents - result documents
     */
    _find(selector, options) {
      var _selector = this.query(selector);
      var _options = this.options(options);
      return this.collection.find(_selector);
    }
    
    /**
     * Find and all matching links as an Array.
     * 
     * @param {string|LinkSelector} selector
     * @param {SelectOptions} [options]
     * @param {Graph~fetchCallback} [callback]
     * @return {Link[]} links - result links objects in array
     */
    fetch(selector, options, callback) {
      var documents = this._find(selector, options).fetch();
      var links = [];
      for (var d in documents) {
        links.push(this._generateLink(documents[d]));
      }
      if (callback) callback(undefined, links);
      return links;
    }
    
    /**
     * Optional callback. If present, called with an error object as the first argument and, if no error, the result links objects in array.
     *
     * @callback Graph~fetchCallback
     * @param {Error} [error]
     * @param {Link[]} [links]
     */
    
    /**
     * Should call callback once for each matching document, sequentially and synchronously.
     * 
     * @param {string|LinkSelector} selector
     * @param {SelectOptions} [options]
     * @param {Graph~eachCallback} [callback]
     */
    each(selector, options, callback) {
      this._find(selector, options).each(function(document) {
        callback(this._generateLink(document));
      });
    }
    
    /**
     * @callback Graph~eachCallback
     * @param {Link} [link]
     */
    
    /**
     * Should map callback over all matching documents. Returns an Array.
     * 
     * @param {string|LinkSelector} selector
     * @param {SelectOptions} [options]
     * @param {Graph~mapCallback} [callback]
     * @return {Array} results
     */
    map(selector, options, callback) {
      return this._find(selector, options).map(function(document) {
        return callback(this._generateLink(document));
      });
    }
    
    /**
     * @callback Graph~mapCallback
     * @param {Link} [link]
     * @return {*} result
     */
    
    /**
     * Count all matching documents.
     * 
     * @param {string|LinkSelector} selector
     * @param {SelectOptions} [options]
     * @param {Graph~countCallback} [callback]
     * @return {number} [count]
     */
    count(selector, options, callback) {
      var count = this._find(selector, options).count();
      if (callback) callback(undefined, count);
      return count;
    }
    
    /**
     * @callback Graph~countCallback
     * @param {Error} [error]
     * @param {number} [count]
     */
    
    /**
     * Should subscribe to the events: link, unlink, insert, update, remove.
     * 
     * @param {string} event - name
     * @param {Graph-onCallback} callback
     */
    on(event, callback) {
      var graph = this;
      
      if (event == 'insert') {
        this.collection.after.insert(function(userId, document) {
          callback(undefined, graph._generateLink(document), { userId: userId });
        });
      }
      if (event == 'update') {
        this.collection.after.update(function(userId, doc, fieldNames, modifier, options) {
          callback(graph._generateLink(this.previous), graph._generateLink(doc), { userId: userId });
        });
      }
      if (event == 'remove') {
        this.collection.after.remove(function(userId, document) {
          callback(graph._generateLink(document), undefined, { userId: userId });
        });
      }
      if (event == 'link') {
        this.collection.after.insert(function(userId, document) {
          callback(undefined, graph._generateLink(document), { userId: userId });
        });
        this.collection.after.update(function(userId, doc, fieldNames, modifier, options) {
          callback(graph._generateLink(this.previous), graph._generateLink(doc), { userId: userId });
        });
      }
      if (event == 'unlink') {
        this.collection.after.update(function(userId, doc, fieldNames, modifier, options) {
          callback(graph._generateLink(this.previous), graph._generateLink(doc), { userId: userId });
        });
        this.collection.after.remove(function(userId, document) {
          callback(graph._generateLink(document), undefined, { userId: userId });
        });
      }
    }
    
    /**
     * @callback Graph~onCallback
     * @param {Link} [oldLink] - can be undefined on link and insert events
     * @param {Link} [newLink] - can be undefined on unlink and remove events
     * @param {Object} [context] - additional app information, such as context.userId
     */
  };
  
  return MeteorGraph;
}

var MeteorGraph = factoryMeteorGraph(AncientGraph);

export { factoryMeteorGraph, MeteorGraph as Graph };
