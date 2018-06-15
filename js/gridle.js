'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * Gridle.js
 *
 * This little js file allow you to detect which or your gridle state is active, when states changes, etc...
 *
 * @author 	Olivier Bossel <olivier.bossel@gmail.com>
 * @created 	20.05.14
 * @updated 	09.10.15
 * @version 	1.0.14
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
    // Node/CommonJS
    factory();
  } else {
    // Browser globals
    factory();
  }
})(function () {
  /*
   * DomLoaded
   */
  /*
  Little smokesignals implementation
  */
  var _domLoaded, domLoaded, smokesignals;
  smokesignals = {
    convert: function convert(obj, handlers) {
      handlers = {};
      obj.on = function (eventName, handler) {
        (handlers[eventName] = handlers[eventName] || []).push(handler);
        return obj;
      };
      obj.emit = function (eventName) {
        var handler, k, len, ref;
        if (!handlers[eventName]) {
          return;
        }
        ref = handlers[eventName];
        for (k = 0, len = ref.length; k < len; k++) {
          handler = ref[k];
          handler.apply(obj, Array.prototype.slice.call(arguments, 1));
          continue;
        }
        return obj;
      };
      return obj;
    }
  };
  /*
  Gridle.js
  */
  window.Gridle = {
    // store if already initialised or not
    _inited: false,
    // save the ready status
    // this will be true when the states are finded or if no states exists in css (if gridle is not used)
    _isReady: false,
    // save the states finded in css
    _statesInCss: null,
    // boolean to save when the states are finded in css
    // this is used to stop search when the states are finded
    _statesFindedInCss: false,
    // settings finded in css (getted by an ajax request)
    _cssSettings: [],
    // store states
    _states: [],
    _activeStates: [],
    _activeStatesNames: [],
    _inactiveStates: [],
    _inactiveStatesNames: [],
    _updatedStates: [],
    _updatedStatesNames: [],
    // resize timeout to not update every ms on resize
    resizeTimeout: null,
    // default settings that can be overrided on init
    _settings: {
      onUpdate: null,
      debug: null,
      ignoredStates: []
    },
    /*
    Init
    */
    init: function init(settings) {
      var _this = this;

      var default_index;
      // update inited status
      this._inited = true;
      // process settings
      if ((settings != null ? settings.ignoredStates : void 0) != null && (default_index = settings.ignoredStates.indexOf('default')) > -1) {
        settings.ignoredStates.splice(default_index, 1);
      }
      if (settings) {
        this._settings = this._extend(this._settings, settings);
      }
      this._debug('waiting for content to be fully loaded');
      return domLoaded(function () {
        return _this._parseCss();
      });
    },
    /*
    Extending object function
    */
    _extend: function _extend(object, properties) {
      var key, val;
      for (key in properties) {
        val = properties[key];
        object[key] = val;
      }
      return object;
    },
    /*
    Load and parse css
    */
    _parseCss: function _parseCss() {
      var e, i, idx, j, rule, rules, settings, settings_found;
      if (this._statesFindedInCss) {
        return void 0;
      }
      // try to find gridle settings
      i = 0;
      j = document.styleSheets.length;
      settings_found = false;
      while (i < j) {
        try {
          rules = document.styleSheets[i].cssText || document.styleSheets[i].cssRules || document.styleSheets[i].rules;
          if (typeof rules === 'string') {
            // try to find settings in css
            settings = rules.match(/#gridle-settings(?:\s*)\{(?:\s*)content(?:\s*):(?:\s*)\"(.+)\"(;\s*|\s*)\}/) && RegExp.$1;
            if (settings) {
              // parse settings to json
              settings = settings.toString().replace(/\\/g, '');
              settings = JSON.parse(settings);
              this._cssSettings = settings;
              settings_found = true;
              this._cssSettings = settings;
              this._statesInCss = settings.states;
            }
          } else {
            for (idx in rules) {
              rule = rules[idx];
              if (/#gridle-settings/.test(rule.cssText)) {
                settings = rule.cssText.toString().match(/:(.*);/) && RegExp.$1;
                settings = settings.toString().replace(/\\/g, '');
                settings = settings.trim();
                settings = settings.substr(1);
                settings = settings.substr(0, settings.length - 1);
                settings = JSON.parse(settings);
                if ((settings != null ? settings.states : void 0) != null) {
                  this._cssSettings = settings;
                  this._statesInCss = settings.states;
                  settings_found = true;
                  continue;
                }
              }
            }
          }
        } catch (error) {
          e = error;
          if (e.name !== 'SecurityError') {
            throw e;
          }
        }
        i++;
      }
      this._statesFindedInCss = settings_found;
      // process states
      if (this._statesInCss) {
        return this._processFindedStates();
      } else {
        return this._debug("no states found...");
      }
    },
    /*
    Process finded states
    */
    _processFindedStates: function _processFindedStates() {
      var name, query, ref;
      this._debug('begin process finded states in css');
      ref = this._statesInCss;
      // loop on each states
      for (name in ref) {
        query = ref[name];
        if (this._settings.ignoredStates.indexOf(name) === -1) {
          // register a state
          this._registerState(name, query);
        }
      }
      // launch the app
      return this._launch();
    },
    /*
    Launch
    */
    _launch: function _launch() {
      var _this2 = this;

      var firstReady;
      firstReady = !this._isReady;
      this._debug('launch');
      // mark app as ready
      this._isReady = true;
      if (firstReady) {
        // emit ready event
        this._crossEmit('ready');
      }
      // listen for window resize
      this._addEvent(window, 'resize', function (e) {
        clearTimeout(_this2.resizeTimeout);
        return _this2.resizeTimeout = setTimeout(function () {
          return _this2._onResize();
        }, 100);
      });
      //trigger first resize
      return this._onResize();
    },
    /*
    On window resize
    */
    _onResize: function _onResize() {
      var updatedStates;
      // track updated states
      updatedStates = [];
      // update states status
      this._updateStatesStatus();
      if (this.getActiveStatesNames().length) {
        // debug
        this._debug('active states', this.getActiveStatesNames().join(','));
      }
      if (this.getInactiveStatesNames().length) {
        this._debug('inactive states', this.getInactiveStatesNames().join(','));
      }
      if (this.getUpdatedStatesNames().length) {
        return this._debug('updated states', this.getUpdatedStatesNames().join(','));
      }
    },
    /*
    Register a state
    */
    _registerState: function _registerState(name, state, updateOnResize) {
      var infos;
      // make info object
      infos = {
        name: name,
        query: state.query,
        settings: state,
        status: null,
        previous_status: null,
        updateOnResize: updateOnResize != null ? updateOnResize : true
      };
      // push new state
      this._states.push(infos);
      return this._debug('|--- register state', name, infos);
    },
    /*
    Update states status
    */
    _updateStatesStatus: function _updateStatesStatus() {
      var defaultState, defaultStateIdx, key, ref, state, wasDefault;
      // check if was default state
      defaultState = this.getDefaultState();
      defaultStateIdx = this._states.indexOf(defaultState);
      wasDefault = defaultState.status;
      // reset trackings arrays
      this._activeStates = [];
      this._activeStatesNames = [];
      this._inactiveStates = [];
      this._inactiveStatesNames = [];
      this._updatedStates = [];
      this._updatedStatesNames = [];
      ref = this._states;
      for (key in ref) {
        state = ref[key];
        if (!state.updateOnResize) {
          // do not take care if not update on resize
          continue;
        }
        // save status
        this._states[key].previous_status = state.status;
        // check is state is active
        if (this._validateState(state)) {
          // check is status has changed
          if (!this._states[key].status) {
            // save this state has changed one
            this._updatedStates.push(state);
            this._updatedStatesNames.push(state.name);
          }
          // update status
          this._states[key].status = true;
          // add in active state
          this._activeStates.push(state);
          this._activeStatesNames.push(state.name);
          // the state is not active
        } else if (state.name !== 'default') {
          // check is status has changed
          if (this._states[key].status) {
            // add state in changed ones
            this._updatedStates.push(state);
            this._updatedStatesNames.push(state.name);
          }
          // update status
          this._states[key].status = false;
          // add state in unactives
          this._inactiveStates.push(state);
          this._inactiveStatesNames.push(state.name);
        }
      }
      // if no states are active, set the default one
      if (!this._activeStates.length) {
        this._states[defaultStateIdx].status = true;
        this._activeStates.push(defaultState);
        this._activeStatesNames.push('default');
        if (!wasDefault) {
          this._updatedStates.push(defaultState);
          this._updatedStatesNames.push('default');
        }
      } else {
        this._states[defaultStateIdx].status = false;
        this._inactiveStates.push(defaultState);
        this._inactiveStatesNames.push('default');
        if (wasDefault) {
          this._updatedStates.push(defaultState);
          this._updatedStatesNames.push('default');
        }
      }
      if (this._updatedStates.length) {
        // trigger events if needed
        this._crossEmit('update', this._updatedStates, this._activeStates, this._inactiveStates);
      }
      if (this._updatedStates.length && this._settings.onUpdate) {
        return this._settings.onUpdate(this._updatedStates, this._activeStates, this._inactiveStates);
      }
    },
    /*
    Validate state
    */
    _validateState: function _validateState(state) {
      // validate state using matchmedia
      return matchMedia(state.query).matches;
    },
    /*
    Add event
    */
    _addEvent: function _addEvent(elm, type, handler) {
      if (!elm) {
        // check params
        return false;
      }
      // if addeventlistener exist
      if (elm.addEventListener) {
        return elm.addEventListener(type, handler, false);
      } else if (elm.attachEvent) {
        return elm.attachEvent('on' + type, handler);
      } else {
        return elm['on' + type] = handler;
      }
    },
    /*
    Cross emit for supporting jquery libs, etc...
    */
    _crossEmit: function _crossEmit(eventName) {
      // jquery
      if (typeof jQuery !== "undefined" && jQuery !== null) {
        // trigger event on Gridle object
        jQuery(this).trigger(eventName, Array.prototype.slice.call(arguments, 1));
        // trigget event trough the body
        jQuery('body').trigger('gridle.' + eventName, Array.prototype.slice.call(arguments, 1));
      }
      // emit from smokesignals
      return this.emit.apply(this, arguments);
    },
    /*
    Ajax proxy
    */
    _ajax: function _ajax(opts) {
      var args, http;
      // process arguments
      args = {
        type: opts.type || 'GET',
        url: opts.url,
        success: opts.success,
        error: opts.error,
        dataType: opts.dataType || 'text',
        context: opts.context
      };
      // create http request object
      http = new XMLHttpRequest();
      if (args.context) {
        http.context = args.context;
      }
      // open connexion
      http.open(args.type, args.url, true);
      // listen state change
      http.onreadystatechange = function () {
        var response;
        if (http.readyState !== 4) {
          // do not care if the state is not success
          return false;
        }
        // check response status
        switch (http.status) {
          // when success
          case 200:
            // switch on dataType to send back correct response
            switch (args.dataType) {
              case 'json':
                response = JSON.parse(http.responseText);
                break;
              default:
                response = http.responseText;
            }
            if (args.success) {
              // call success callback if exist
              return args.success(response, http.status, http);
            }
        }
      };
      // send request
      return http.send();
    },
    /*
    Get default state
    */
    getDefaultState: function getDefaultState() {
      var k, len, ref, state;
      ref = this.getRegisteredStates();
      for (k = 0, len = ref.length; k < len; k++) {
        state = ref[k];
        if (state.name === 'default') {
          return state;
        }
      }
    },
    /*
    Get registered states
    */
    getRegisteredStates: function getRegisteredStates() {
      return this._states;
    },
    /*
    Get changes states
    */
    getUpdatedStates: function getUpdatedStates() {
      return this._updatedStates;
    },
    /*
    Get changes states names
    */
    getUpdatedStatesNames: function getUpdatedStatesNames() {
      return this._updatedStatesNames;
    },
    /*
    Get active states
    */
    getActiveStates: function getActiveStates() {
      return this._activeStates;
    },
    /*
    Get active states names
    */
    getActiveStatesNames: function getActiveStatesNames() {
      return this._activeStatesNames;
    },
    /*
    Get unactive states
    */
    getInactiveStates: function getInactiveStates() {
      return this._inactiveStates;
    },
    /*
    Get unactive states names
    */
    getInactiveStatesNames: function getInactiveStatesNames() {
      return this._inactiveStatesNames;
    },
    /*
    Check is a state is active
    */
    isActive: function isActive(stateName) {
      var index, isActive, name, ref;
      // isActive
      isActive = false;
      ref = this._activeStatesNames;
      for (index in ref) {
        name = ref[index];
        if (stateName === name) {
          isActive = true;
        }
      }
      // return if is active or not
      return isActive;
    },
    /*
    Check if gridle is ready
    */
    isReady: function isReady() {
      return this._isReady;
    },
    /*
    Debug
    */
    _debug: function _debug() {
      if (this._settings.debug) {
        return console.log('GRIDLE', arguments);
      }
    }
  };
  _domLoaded = false;
  domLoaded = function domLoaded(callback) {
    var _loaded;
    _loaded = function _loaded(callback) {
      if (_domLoaded) {
        callback();
        return;
      }
      if (document.readyState === 'complete') {
        _domLoaded = true;
        callback();
        return;
      }
      /* Internet Explorer */
      /*@cc_on
      @if (@_win32 || @_win64)
          document.write('<script id="ieScriptLoad" defer src="//:"><\/script>');
          document.getElementById('ieScriptLoad').onreadystatechange = function() {
              if (this.readyState == 'complete') {
                  _domLoaded = true;
                  callback();
              }
          };
      @end @*/
      /* Mozilla, Chrome, Opera */
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', function () {
          _domLoaded = true;
          callback();
        }, false);
      }
      /* Safari, iCab, Konqueror */
      if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
        var DOMLoadTimer = setInterval(function () {
          if (/loaded|complete/i.test(document.readyState)) {
            _domLoaded = true;
            callback();
            clearInterval(DOMLoadTimer);
          }
        }, 10);
      }
      /* Other web browsers */
      window.onload = function () {
        _domLoaded = true;
        callback();
      };;
    };
    if (window.addEventListener) {
      window.addEventListener('load', function () {
        _domLoaded = true;
        return callback();
      }, false);
    } else {
      window.attachEvent('onload', function () {
        _domLoaded = true;
        return callback();
      });
    }
    return _loaded(function () {
      return callback();
    });
  };
  // make gridle event dipatcher
  smokesignals.convert(window.Gridle);
  // init if not already done :
  domLoaded(function () {
    return setTimeout(function () {
      if (!Gridle._inited) {
        return Gridle.init();
      }
    }, 500);
  });
  // return the gridle object
  return Gridle;
});
//# sourceMappingURL=gridle.js.map
