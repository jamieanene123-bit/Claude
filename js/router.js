/*
 * router.js — minimaler Hash-Router.
 *
 * Hash-Routing (#/admin) wurde gewählt, weil die App damit ohne Server
 * direkt per Doppelklick auf index.html lauffähig ist. Die gewünschten
 * Pfade entsprechen:
 *   /          -> #/
 *   /form      -> #/form
 *   /admin     -> #/admin
 *   /report/ID -> #/report/ID
 *
 * Bei späterem Backend kann auf History-API-Routing umgestellt werden,
 * ohne die Views zu ändern.
 */
(function (global) {
  'use strict';

  var routes = [];

  function register(pattern, handler) {
    // pattern z.B. "/report/:id" -> Regex mit benannten Parametern
    var keys = [];
    var regexStr = pattern.replace(/:[^/]+/g, function (m) {
      keys.push(m.slice(1));
      return '([^/]+)';
    });
    routes.push({
      regex: new RegExp('^' + regexStr + '$'),
      keys: keys,
      handler: handler
    });
  }

  function currentPath() {
    var h = global.location.hash || '#/';
    return h.replace(/^#/, '') || '/';
  }

  function resolve() {
    var path = currentPath();
    for (var i = 0; i < routes.length; i++) {
      var m = path.match(routes[i].regex);
      if (m) {
        var params = {};
        routes[i].keys.forEach(function (key, idx) {
          params[key] = decodeURIComponent(m[idx + 1]);
        });
        global.scrollTo(0, 0);
        routes[i].handler(params);
        return;
      }
    }
    // Fallback -> Landing
    global.location.hash = '#/';
  }

  function navigate(path) {
    global.location.hash = '#' + path;
  }

  global.TDS = global.TDS || {};
  global.TDS.router = {
    register: register,
    navigate: navigate,
    start: function () {
      global.addEventListener('hashchange', resolve);
      resolve();
    }
  };
})(window);
