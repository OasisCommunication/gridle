'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Gridle-eq.js
 *
 * This little file is a bridge to support the element queries
 * @copyright marcj https://github.com/marcj/css-element-queries
 *
 * @author 	Olivier Bossel <olivier.bossel@gmail.com>
 * @created 	20.05.14
 * @updated 	09.10.15
 * @version 	1.0.0
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
  var GridleEq;
  /*
   * Define class
   */
  GridleEq = function () {
    /*
     * Init
     */
    function GridleEq() {
      _classCallCheck(this, GridleEq);

      var eq;
      // element queries
      eq = new ElementQueries();
      eq.init();
    }

    /*
     * Update
     */


    _createClass(GridleEq, [{
      key: 'update',
      value: function update() {
        return ElementQueries.update();
      }
    }]);

    return GridleEq;
  }();
  // Init and set in window
  return window.GridleEq = new GridleEq();
});
//# sourceMappingURL=gridle-eq.js.map
