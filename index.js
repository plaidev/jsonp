// unique callback number

var _keys = require('lodash.keys');

var callbackId = 0;

function getCallbackName(callback_header) {
  callback_header = callback_header || '__jspcb__';
  callbackId += 1;
  return callback_header + callbackId;
}

function _map(array, func) {
  var results = [];
  for (var i=0; i<array.length; i++) {
    results.push(func(array[i]))
  }
  return results;
}

function prepareUrl(url, params) {
  return url + '?' + _map(_keys(params), function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

module.exports = function jsonp(url, fn) {
  var self, my = {
    url: url,
    callback_param: 'callback',
    callback_header: '__jspcb__',
    query: {}
  };

  function query(q) {
    var key;
    for (key in q) {
      my.query[key] = q[key];
    }
    return self;
  }

  // change options
  function options(opts) {
    if(opts.callback_param)
      my.callback_param = opts.callback_param;
    if(opts.callback_header)
      my.callback_header = opts.callback_header;
    return self;
  }

  function end(fn) {
    var js, fjs, fnName = getCallbackName(my.callback_header);
    window[fnName] = function(json) {
      // cleanup after the call
      window[fnName] = undefined;
      js.parentNode.removeChild(js);
      // execute provided callback
      fn(json);
    };
    my.query[my.callback_param] = fnName;
    js = document.createElement('script');
    js.src = prepareUrl(my.url, my.query);
    js.async = true;
    fjs = document.getElementsByTagName('script')[0];
    fjs.parentNode.insertBefore(js, fjs);
  }

  if (typeof fn === 'function') {
    return end(fn);
  }

  self = {
    query: query,
    options: options,
    end: end
  };

  return self;
};
