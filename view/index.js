import {isArray, isString, isNull, isNumber, isUndefined} from '../core/typeChecker';

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
        _defineProperty = function (obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, {
                    value: value,
                    enumerable: true,
                    configurable: true,
                    writable: true
                });
            } else {
                obj[key] = value;
            }
            return obj;
        },


        // It checks the variable type
        _isOfType = function (variable, type) {
            return (typeof variable === type) ? true : false;
        },

        _buildLoopingTemplate = function (tagTemplate, data, tagName) {
            var finalHTML = "";

            var unitDataHandler = function (unitData) {
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

        _expandloopingContext = function (html, data) {
            var tagRegex = /<#(:?.+?)>(.+?)<\/#\1>/g;
            var tagMatchHandler = function (tagMatch, tagName, tagTemplate) {
                if (!data[tagName]) {
                    return "";
                } else {
                    var _data = _getValue(tagName, data);
                    if (isArray(_data)) {
                        return _buildLoopingTemplate(tagTemplate, _data, tagName);
                    } else {
                        throw Error("#<Array> type should be used for tags")
                    }
                }
            };
            return html.replace(tagRegex, tagMatchHandler);
        },

        _getValue = function (keyMatch, data) {

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
        _doFilter = function (value) {
            if (isString(value) || isNumber(value))
                return !isUndefined(value) && !isNull(value) ? value : "";
            return "";
        },
        _binder = function (html, data) {
            var finalValue = html.replace(/{{[^}}]{1,}}}/g, function (keyMatch) {
                var _finalValue = _getValue(keyMatch.slice(2, -2), data);
                return _doFilter(_finalValue);
            });

            return finalValue
        },

        _getTemplateTag = function (html) {
            var templateRegex = /<template>([\s\S]+)<\/template>/g;
            var finalValue = template.replace(templateRegex, function (keyMatch, templateMatch) {
                return templateMatch;
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

        return _binder(
            _expandloopingContext(html, data),
            data
        );
    }
    return Component;
};

export default Binder({});

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