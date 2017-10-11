(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ViewEngine = factory());
}(this, (function () { 'use strict';

/**
 * Legacy methods and private methods are prefixed with _(underscore).
 */
var is = function is(type) {
  return function (target) {
    return Object(target) instanceof type;
  };
};











var isNull = function isNull(target) {
  return toString.call(target) === '[object Null]';
};

var isUndefined = function isUndefined(target) {
  return toString.call(target) === '[object Undefined]';
};

var isArray = function isArray(target) {
  return is(Array)(target);
};





var isNumber = function isNumber(target) {
  return is(Number)(target);
};



var isString = function isString(target) {
  return is(String)(target);
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

function Binder(Component) {
    /**
     * view engine which tries to implement the same sytax
     * of mustache.js
     * @module Binder
     * @since v0.0.1
     * @author Vigneshwaran Sivasamy
     */

    /**
    * Useful support variables declaration goes here
    */
    var pObject = Object.prototype,
        pArray = Array.prototype,
        pString = String.prototype,
        pBoolean = Boolean.prototype,
        toString = pObject.toString,


    // Support function to create the new object for the property
    _defineProperty = function _defineProperty(obj, key, value) {
        
    },


    // It checks the variable type
    _isOfType = function _isOfType(variable, type) {
        
    },
        _buildLoopingTemplate = function _buildLoopingTemplate(tagTemplate, data, tagName) {
        var finalHTML = "";

        var unitDataHandler = function unitDataHandler(unitData) {
            var _unitData = {};
            if (isString(unitData)) {
                // Array of String Handling
                _unitData["."] = unitData;
            } else {
                // Array of Object Handling
                _unitData = unitData;
            }
            finalHTML += _binder(tagTemplate, _unitData);
        };

        data.forEach(unitDataHandler);
        return finalHTML;
    },
        _expandloopingContext = function _expandloopingContext(html, data) {
        var tagRegex = /<#(:?.+?)>(.+?)<\/#\1>/g;
        var tagMatchHandler = function tagMatchHandler(tagMatch, tagName, tagTemplate) {
            if (!data[tagName]) {
                return "";
            } else {
                var _data = _getValue(tagName, data);
                if (isArray(_data)) {
                    return _buildLoopingTemplate(tagTemplate, _data, tagName);
                } else {
                    throw Error("#<Array> type should be used for tags");
                }
            }
        };
        return html.replace(tagRegex, tagMatchHandler);
    },
        _getValue = function _getValue(keyMatch, data) {

        var name = keyMatch.trim();
        if (name.length == 1 && name == ".") {
            return data["."];
        }
        var split = name.split(".");
        var hierarchyOne = split.shift();

        if (split.length > 0) {
            return _getValue(split.join("."), data[hierarchyOne]);
        } else {
            return data[name];
        }
    },
        _doFilter = function _doFilter(value) {
        if (isString(value) || isNumber(value)) return !isUndefined(value) && !isNull(value) ? value : "";
        return "";
    },
        _binder = function _binder(html, data) {
        var finalValue = html.replace(/{{[^}}]{1,}}}/g, function (keyMatch) {
            var _finalValue = _getValue(keyMatch.slice(2, -2), data);
            return _doFilter(_finalValue);
        });

        return finalValue;
    };

    Component.binder = function (html, data) {
        // var html,
        //     templateRegex = /<template>([\s\S]+)<\/template>/g;
        // widget.replace(templateRegex, function(keyMatch, templateMatch){
        //     html = templateMatch;
        // });
        // var style = widget.replace(templateRegex,"");
        // html = _expandloopingContext(html, data);
        // html = _binder(_expandloopingContext(html, data),data);
        // return style+html;

        return _binder(_expandloopingContext(html, data), data);
    };
    return Component;
}

var index = Binder({});

/**
 * Test Cases: 
 * 
 * <#user><div>Name:{{firstName}}</div><div>lastName: {{lastName}}</div></#user>
 * 
 * Case 1:
 * 
 *  ViewEngine.binder(
 *      "<div>Name:{{firstName}}</div><div>lastName: {{lastName}}</div>", 
 *      {   
 *          firstName: "Vignesh", 
 *          lastName:"Siva"
 *      }
 * );
 * 
 * Case 2:
 * 
 * ViewEngine.binder(
 *      "<div>Name:{{user.firstName}}</div><div>lastName: {{user.lastName}}</div>", 
 *      {
 *          user:{
 *                  firstName: "Vignesh", 
 *                  lastName:"Siva"
 *          }
 *      }
 * );
 * 
 * @return <div>Name:Vignesh</div><div>lastName: Siva</div>
 * 
 * Case 3:
 * 
 * ViewEngine.binder(
 *      "<#user><div>Name:{{firstName}}</div><div>lastName: {{lastName}}</div></#user>", 
 *      {   
 *          user:[
 *              {
 *                  firstName: "Vignesh", 
 *                  lastName:"Siva"
 *              },
 *              {
 *                  firstName: "Dhanjayan", 
 *                  lastName:"Vijayan"
 *              }
 *          ]
 *      }                                                                           
 * );
 * 
 * @return <div>Name:Vignesh</div><div>lastName: Siva</div><div>Name:Dhanjayan</div><div>lastName: Vijayan</div>
 * 
 *
 * case 4: 
 *
 *  ViewEngine.binder(
 *      '<#user><div class="test">{{.}}</div></#user>',{"user": ["Hello World!","Hi"]}
 *  );
 *
 * @return  <div class="test">Hello World!</div><div class="test">Hi</div>
 */

return index;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1lbmdpbmUubWluLmpzIiwic291cmNlcyI6WyIuLi9jb3JlL3R5cGVDaGVja2VyLmpzIiwiLi4vdmlldy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIExlZ2FjeSBtZXRob2RzIGFuZCBwcml2YXRlIG1ldGhvZHMgYXJlIHByZWZpeGVkIHdpdGggXyh1bmRlcnNjb3JlKS5cbiAqL1xudmFyIHBTdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5leHBvcnQgY29uc3QgaXMgPSB0eXBlID0+IHRhcmdldCA9PiBPYmplY3QodGFyZ2V0KSBpbnN0YW5jZW9mIHR5cGU7XG5cbmV4cG9ydCBjb25zdCBpc09iamVjdCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5leHBvcnQgY29uc3QgaXNEYXRlID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xuXG5leHBvcnQgY29uc3QgaXNQcm9taXNlID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nO1xuXG5leHBvcnQgY29uc3QgaXNTeW1ib2wgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBTeW1ib2xdJztcblxuZXhwb3J0IGNvbnN0IGlzTmFOID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgTmFOXSc7XG5cbmV4cG9ydCBjb25zdCBpc051bGwgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBOdWxsXSc7XG5cbmV4cG9ydCBjb25zdCBpc1VuZGVmaW5lZCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG5leHBvcnQgY29uc3QgaXNBcnJheSA9IHRhcmdldCA9PiBpcyhBcnJheSkodGFyZ2V0KTtcblxuZXhwb3J0IGNvbnN0IGlzQm9vbGVhbiA9IHRhcmdldCA9PiBpcyhCb29sZWFuKSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgaXNGdW5jdGlvbiA9IHRhcmdldCA9PiBpcyhGdW5jdGlvbikodGFyZ2V0KTtcblxuZXhwb3J0IGNvbnN0IGlzTnVtYmVyID0gdGFyZ2V0ID0+IGlzKE51bWJlcikodGFyZ2V0KTtcblxuZXhwb3J0IGNvbnN0IGlzUmVnZXggPSB0YXJnZXQgPT4gaXMoUmVnRXhwKSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgaXNTdHJpbmcgPSB0YXJnZXQgPT4gaXMoU3RyaW5nKSh0YXJnZXQpOyIsImltcG9ydCB7aXNBcnJheSwgaXNTdHJpbmcsIGlzTnVsbCwgaXNOdW1iZXIsIGlzVW5kZWZpbmVkfSBmcm9tICcuLi9jb3JlL3R5cGVDaGVja2VyJztcblxuZnVuY3Rpb24gQmluZGVyKENvbXBvbmVudCkge1xuICAgIC8qKlxuICAgICAqIHZpZXcgZW5naW5lIHdoaWNoIHRyaWVzIHRvIGltcGxlbWVudCB0aGUgc2FtZSBzeXRheFxuICAgICAqIG9mIG11c3RhY2hlLmpzXG4gICAgICogQG1vZHVsZSBCaW5kZXJcbiAgICAgKiBAc2luY2UgdjAuMC4xXG4gICAgICogQGF1dGhvciBWaWduZXNod2FyYW4gU2l2YXNhbXlcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICogVXNlZnVsIHN1cHBvcnQgdmFyaWFibGVzIGRlY2xhcmF0aW9uIGdvZXMgaGVyZVxuICAgICovXG4gICAgdmFyIHBPYmplY3QgPSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICBwQXJyYXkgPSBBcnJheS5wcm90b3R5cGUsXG4gICAgICAgIHBTdHJpbmcgPSBTdHJpbmcucHJvdG90eXBlLFxuICAgICAgICBwQm9vbGVhbiA9IEJvb2xlYW4ucHJvdG90eXBlLFxuICAgICAgICB0b1N0cmluZyA9IHBPYmplY3QudG9TdHJpbmcsXG5cbiAgICAgICAgLy8gU3VwcG9ydCBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIG5ldyBvYmplY3QgZm9yIHRoZSBwcm9wZXJ0eVxuICAgICAgICBfZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoa2V5IGluIG9iaikge1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvLyBJdCBjaGVja3MgdGhlIHZhcmlhYmxlIHR5cGVcbiAgICAgICAgX2lzT2ZUeXBlID0gZnVuY3Rpb24gKHZhcmlhYmxlLCB0eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gKHR5cGVvZiB2YXJpYWJsZSA9PT0gdHlwZSkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkTG9vcGluZ1RlbXBsYXRlID0gZnVuY3Rpb24gKHRhZ1RlbXBsYXRlLCBkYXRhLCB0YWdOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZmluYWxIVE1MID0gXCJcIjtcblxuICAgICAgICAgICAgdmFyIHVuaXREYXRhSGFuZGxlciA9IGZ1bmN0aW9uICh1bml0RGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBfdW5pdERhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoaXNTdHJpbmcodW5pdERhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFycmF5IG9mIFN0cmluZyBIYW5kbGluZ1xuICAgICAgICAgICAgICAgICAgICBfdW5pdERhdGFbXCIuXCJdID0gdW5pdERhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXJyYXkgb2YgT2JqZWN0IEhhbmRsaW5nXG4gICAgICAgICAgICAgICAgICAgIF91bml0RGF0YSA9IHVuaXREYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbEhUTUwgKz0gX2JpbmRlcih0YWdUZW1wbGF0ZSwgX3VuaXREYXRhKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCh1bml0RGF0YUhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZpbmFsSFRNTDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZXhwYW5kbG9vcGluZ0NvbnRleHQgPSBmdW5jdGlvbiAoaHRtbCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRhZ1JlZ2V4ID0gLzwjKDo/Lis/KT4oLis/KTxcXC8jXFwxPi9nO1xuICAgICAgICAgICAgdmFyIHRhZ01hdGNoSGFuZGxlciA9IGZ1bmN0aW9uICh0YWdNYXRjaCwgdGFnTmFtZSwgdGFnVGVtcGxhdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGFbdGFnTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9kYXRhID0gX2dldFZhbHVlKHRhZ05hbWUsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBcnJheShfZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfYnVpbGRMb29waW5nVGVtcGxhdGUodGFnVGVtcGxhdGUsIF9kYXRhLCB0YWdOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiIzxBcnJheT4gdHlwZSBzaG91bGQgYmUgdXNlZCBmb3IgdGFnc1wiKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UodGFnUmVnZXgsIHRhZ01hdGNoSGFuZGxlcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFZhbHVlID0gZnVuY3Rpb24gKGtleU1hdGNoLCBkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciBuYW1lID0ga2V5TWF0Y2gudHJpbSgpO1xuICAgICAgICAgICAgaWYgKG5hbWUubGVuZ3RoID09IDEgJiYgbmFtZSA9PSBcIi5cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW1wiLlwiXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzcGxpdCA9IG5hbWUuc3BsaXQoXCIuXCIpO1xuICAgICAgICAgICAgdmFyIGhpZXJhcmNoeU9uZSA9IHNwbGl0LnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9nZXRWYWx1ZShzcGxpdC5qb2luKFwiLlwiKSwgZGF0YVtoaWVyYXJjaHlPbmVdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgX2RvRmlsdGVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoaXNTdHJpbmcodmFsdWUpIHx8IGlzTnVtYmVyKHZhbHVlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gIWlzVW5kZWZpbmVkKHZhbHVlKSAmJiAhaXNOdWxsKHZhbHVlKSA/IHZhbHVlIDogXCJcIjtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9LFxuICAgICAgICBfYmluZGVyID0gZnVuY3Rpb24gKGh0bWwsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBmaW5hbFZhbHVlID0gaHRtbC5yZXBsYWNlKC97e1tefX1dezEsfX19L2csIGZ1bmN0aW9uIChrZXlNYXRjaCkge1xuICAgICAgICAgICAgICAgIHZhciBfZmluYWxWYWx1ZSA9IF9nZXRWYWx1ZShrZXlNYXRjaC5zbGljZSgyLCAtMiksIGRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfZG9GaWx0ZXIoX2ZpbmFsVmFsdWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmaW5hbFZhbHVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFRlbXBsYXRlVGFnID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZVJlZ2V4ID0gLzx0ZW1wbGF0ZT4oW1xcc1xcU10rKTxcXC90ZW1wbGF0ZT4vZztcbiAgICAgICAgICAgIHZhciBmaW5hbFZhbHVlID0gdGVtcGxhdGUucmVwbGFjZSh0ZW1wbGF0ZVJlZ2V4LCBmdW5jdGlvbiAoa2V5TWF0Y2gsIHRlbXBsYXRlTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVNYXRjaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZpbmFsVmFsdWU7XG4gICAgICAgIH07XG5cblxuXG4gICAgQ29tcG9uZW50LmJpbmRlciA9IGZ1bmN0aW9uIChodG1sLCBkYXRhKSB7XG4gICAgICAgIC8vIHZhciBodG1sLFxuICAgICAgICAvLyAgICAgdGVtcGxhdGVSZWdleCA9IC88dGVtcGxhdGU+KFtcXHNcXFNdKyk8XFwvdGVtcGxhdGU+L2c7XG4gICAgICAgIC8vIHdpZGdldC5yZXBsYWNlKHRlbXBsYXRlUmVnZXgsIGZ1bmN0aW9uKGtleU1hdGNoLCB0ZW1wbGF0ZU1hdGNoKXtcbiAgICAgICAgLy8gICAgIGh0bWwgPSB0ZW1wbGF0ZU1hdGNoO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gdmFyIHN0eWxlID0gd2lkZ2V0LnJlcGxhY2UodGVtcGxhdGVSZWdleCxcIlwiKTtcbiAgICAgICAgLy8gaHRtbCA9IF9leHBhbmRsb29waW5nQ29udGV4dChodG1sLCBkYXRhKTtcbiAgICAgICAgLy8gaHRtbCA9IF9iaW5kZXIoX2V4cGFuZGxvb3BpbmdDb250ZXh0KGh0bWwsIGRhdGEpLGRhdGEpO1xuICAgICAgICAvLyByZXR1cm4gc3R5bGUraHRtbDtcblxuICAgICAgICByZXR1cm4gX2JpbmRlcihcbiAgICAgICAgICAgIF9leHBhbmRsb29waW5nQ29udGV4dChodG1sLCBkYXRhKSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIENvbXBvbmVudDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJpbmRlcih7fSk7XG5cbiAgICAvKipcbiAgICAgKiBUZXN0IENhc2VzOiBcbiAgICAgKiBcbiAgICAgKiA8I3VzZXI+PGRpdj5OYW1lOnt7Zmlyc3ROYW1lfX08L2Rpdj48ZGl2Pmxhc3ROYW1lOiB7e2xhc3ROYW1lfX08L2Rpdj48LyN1c2VyPlxuICAgICAqIFxuICAgICAqIENhc2UgMTpcbiAgICAgKiBcbiAgICAgKiAgVmlld0VuZ2luZS5iaW5kZXIoXG4gICAgICogICAgICBcIjxkaXY+TmFtZTp7e2ZpcnN0TmFtZX19PC9kaXY+PGRpdj5sYXN0TmFtZToge3tsYXN0TmFtZX19PC9kaXY+XCIsIFxuICAgICAqICAgICAgeyAgIFxuICAgICAqICAgICAgICAgIGZpcnN0TmFtZTogXCJWaWduZXNoXCIsIFxuICAgICAqICAgICAgICAgIGxhc3ROYW1lOlwiU2l2YVwiXG4gICAgICogICAgICB9XG4gICAgICogKTtcbiAgICAgKiBcbiAgICAgKiBDYXNlIDI6XG4gICAgICogXG4gICAgICogVmlld0VuZ2luZS5iaW5kZXIoXG4gICAgICogICAgICBcIjxkaXY+TmFtZTp7e3VzZXIuZmlyc3ROYW1lfX08L2Rpdj48ZGl2Pmxhc3ROYW1lOiB7e3VzZXIubGFzdE5hbWV9fTwvZGl2PlwiLCBcbiAgICAgKiAgICAgIHtcbiAgICAgKiAgICAgICAgICB1c2VyOntcbiAgICAgKiAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogXCJWaWduZXNoXCIsIFxuICAgICAqICAgICAgICAgICAgICAgICAgbGFzdE5hbWU6XCJTaXZhXCJcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogKTtcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIDxkaXY+TmFtZTpWaWduZXNoPC9kaXY+PGRpdj5sYXN0TmFtZTogU2l2YTwvZGl2PlxuICAgICAqIFxuICAgICAqIENhc2UgMzpcbiAgICAgKiBcbiAgICAgKiBWaWV3RW5naW5lLmJpbmRlcihcbiAgICAgKiAgICAgIFwiPCN1c2VyPjxkaXY+TmFtZTp7e2ZpcnN0TmFtZX19PC9kaXY+PGRpdj5sYXN0TmFtZToge3tsYXN0TmFtZX19PC9kaXY+PC8jdXNlcj5cIiwgXG4gICAgICogICAgICB7ICAgXG4gICAgICogICAgICAgICAgdXNlcjpbXG4gICAgICogICAgICAgICAgICAgIHtcbiAgICAgKiAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogXCJWaWduZXNoXCIsIFxuICAgICAqICAgICAgICAgICAgICAgICAgbGFzdE5hbWU6XCJTaXZhXCJcbiAgICAgKiAgICAgICAgICAgICAgfSxcbiAgICAgKiAgICAgICAgICAgICAge1xuICAgICAqICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBcIkRoYW5qYXlhblwiLCBcbiAgICAgKiAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOlwiVmlqYXlhblwiXG4gICAgICogICAgICAgICAgICAgIH1cbiAgICAgKiAgICAgICAgICBdXG4gICAgICogICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICogKTtcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJuIDxkaXY+TmFtZTpWaWduZXNoPC9kaXY+PGRpdj5sYXN0TmFtZTogU2l2YTwvZGl2PjxkaXY+TmFtZTpEaGFuamF5YW48L2Rpdj48ZGl2Pmxhc3ROYW1lOiBWaWpheWFuPC9kaXY+XG4gICAgICogXG4gICAgICpcbiAgICAgKiBjYXNlIDQ6IFxuICAgICAqXG4gICAgICogIFZpZXdFbmdpbmUuYmluZGVyKFxuICAgICAqICAgICAgJzwjdXNlcj48ZGl2IGNsYXNzPVwidGVzdFwiPnt7Ln19PC9kaXY+PC8jdXNlcj4nLHtcInVzZXJcIjogW1wiSGVsbG8gV29ybGQhXCIsXCJIaVwiXX1cbiAgICAgKiAgKTtcbiAgICAgKlxuICAgICAqIEByZXR1cm4gIDxkaXYgY2xhc3M9XCJ0ZXN0XCI+SGVsbG8gV29ybGQhPC9kaXY+PGRpdiBjbGFzcz1cInRlc3RcIj5IaTwvZGl2PlxuICAgICAqLyJdLCJuYW1lcyI6WyJpcyIsIk9iamVjdCIsInRhcmdldCIsInR5cGUiLCJpc051bGwiLCJ0b1N0cmluZyIsImNhbGwiLCJpc1VuZGVmaW5lZCIsImlzQXJyYXkiLCJBcnJheSIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNTdHJpbmciLCJTdHJpbmciLCJCaW5kZXIiLCJDb21wb25lbnQiLCJwT2JqZWN0IiwicHJvdG90eXBlIiwicEFycmF5IiwicFN0cmluZyIsInBCb29sZWFuIiwiQm9vbGVhbiIsIl9kZWZpbmVQcm9wZXJ0eSIsIm9iaiIsImtleSIsInZhbHVlIiwiX2lzT2ZUeXBlIiwidmFyaWFibGUiLCJfYnVpbGRMb29waW5nVGVtcGxhdGUiLCJ0YWdUZW1wbGF0ZSIsImRhdGEiLCJ0YWdOYW1lIiwiZmluYWxIVE1MIiwidW5pdERhdGFIYW5kbGVyIiwidW5pdERhdGEiLCJfdW5pdERhdGEiLCJfYmluZGVyIiwiZm9yRWFjaCIsIl9leHBhbmRsb29waW5nQ29udGV4dCIsImh0bWwiLCJ0YWdSZWdleCIsInRhZ01hdGNoSGFuZGxlciIsInRhZ01hdGNoIiwiX2RhdGEiLCJfZ2V0VmFsdWUiLCJFcnJvciIsInJlcGxhY2UiLCJrZXlNYXRjaCIsIm5hbWUiLCJ0cmltIiwibGVuZ3RoIiwic3BsaXQiLCJoaWVyYXJjaHlPbmUiLCJzaGlmdCIsImpvaW4iLCJfZG9GaWx0ZXIiLCJmaW5hbFZhbHVlIiwiX2ZpbmFsVmFsdWUiLCJzbGljZSIsImJpbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztBQUdBLEFBRU8sSUFBTUEsS0FBSyxTQUFMQSxFQUFLO1NBQVE7V0FBVUMsT0FBT0MsTUFBUCxhQUEwQkMsSUFBcEM7R0FBUjtDQUFYOztBQUVQOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEFBQU8sSUFBTUMsU0FBUyxTQUFUQSxNQUFTO1NBQVVDLFNBQVNDLElBQVQsQ0FBY0osTUFBZCxNQUEwQixlQUFwQztDQUFmOztBQUVQLEFBQU8sSUFBTUssY0FBYyxTQUFkQSxXQUFjO1NBQVVGLFNBQVNDLElBQVQsQ0FBY0osTUFBZCxNQUEwQixvQkFBcEM7Q0FBcEI7O0FBRVAsQUFBTyxJQUFNTSxVQUFVLFNBQVZBLE9BQVU7U0FBVVIsR0FBR1MsS0FBSCxFQUFVUCxNQUFWLENBQVY7Q0FBaEI7O0FBRVA7O0FBRUE7O0FBRUEsQUFBTyxJQUFNUSxXQUFXLFNBQVhBLFFBQVc7U0FBVVYsR0FBR1csTUFBSCxFQUFXVCxNQUFYLENBQVY7Q0FBakI7O0FBRVA7O0FBRUEsQUFBTyxJQUFNVSxXQUFXLFNBQVhBLFFBQVc7U0FBVVosR0FBR2EsTUFBSCxFQUFXWCxNQUFYLENBQVY7Q0FBakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3QlAsU0FBU1ksTUFBVCxDQUFnQkMsU0FBaEIsRUFBMkI7Ozs7Ozs7Ozs7OztRQVluQkMsVUFBVWYsT0FBT2dCLFNBQXJCO1FBQ0lDLFNBQVNULE1BQU1RLFNB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
