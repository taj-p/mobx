'use strict';

function _iterableToArrayLimit(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s,
      _e,
      _x,
      _r,
      _arr = [],
      _n = !0,
      _d = !1;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i) return;
        _n = !1;
      } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
    } catch (err) {
      _d = !0, _e = err;
    } finally {
      try {
        if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var mobxDecorators = new Set(['observable', 'computed', 'action', 'flow', 'override']);
function isMobxDecorator$2(decorator) {
  var _decorator$expression, _decorator$expression2;
  return mobxDecorators.has(decorator.expression.name) // @foo
  || mobxDecorators.has((_decorator$expression = decorator.expression.callee) === null || _decorator$expression === void 0 ? void 0 : _decorator$expression.name) // @foo()
  || mobxDecorators.has((_decorator$expression2 = decorator.expression.object) === null || _decorator$expression2 === void 0 ? void 0 : _decorator$expression2.name); // @foo.bar
}

function findAncestor$3(node, match) {
  var parent = node.parent;
  if (!parent) return;
  if (match(parent)) return parent;
  return findAncestor$3(parent, match);
}
var utils = {
  findAncestor: findAncestor$3,
  isMobxDecorator: isMobxDecorator$2
};

var findAncestor$2 = utils.findAncestor,
  isMobxDecorator$1 = utils.isMobxDecorator;

// TODO support this.foo = 5; in constructor
// TODO? report on field as well
function create$4(context) {
  var _context$options$0$au, _context$options$;
  var sourceCode = context.getSourceCode();
  var autofixAnnotation = (_context$options$0$au = (_context$options$ = context.options[0]) === null || _context$options$ === void 0 ? void 0 : _context$options$.autofixAnnotation) !== null && _context$options$0$au !== void 0 ? _context$options$0$au : true;
  function fieldToKey(field) {
    // TODO cache on field?
    var key = sourceCode.getText(field.key);
    return field.computed ? "[".concat(key, "]") : key;
  }
  return {
    'CallExpression[callee.name="makeObservable"]': function CallExpressionCalleeNameMakeObservable(makeObservable) {
      // Only interested about makeObservable(this, ...) in constructor or makeObservable({}, ...)
      // ClassDeclaration
      //   ClassBody
      //     MethodDefinition[kind="constructor"]
      //       FunctionExpression
      //         BlockStatement
      //           ExpressionStatement
      //             CallExpression[callee.name="makeObservable"]
      var _makeObservable$argum = _slicedToArray(makeObservable.arguments, 2),
        firstArg = _makeObservable$argum[0],
        secondArg = _makeObservable$argum[1];
      if (!firstArg) return;
      var members;
      if (firstArg.type === "ThisExpression") {
        var _closestFunction$pare;
        var closestFunction = findAncestor$2(makeObservable, function (node) {
          return node.type === "FunctionExpression" || node.type === "FunctionDeclaration";
        });
        if ((closestFunction === null || closestFunction === void 0 ? void 0 : (_closestFunction$pare = closestFunction.parent) === null || _closestFunction$pare === void 0 ? void 0 : _closestFunction$pare.kind) !== "constructor") return;
        members = closestFunction.parent.parent.parent.body.body;
      } else if (firstArg.type === "ObjectExpression") {
        members = firstArg.properties;
      } else {
        return;
      }
      var annotationProps = (secondArg === null || secondArg === void 0 ? void 0 : secondArg.properties) || [];
      var nonAnnotatedMembers = [];
      var hasAnyDecorator = false;
      members.forEach(function (member) {
        var _member$decorators;
        if (member["static"]) return;
        if (member.kind === "constructor") return;
        //if (member.type !== 'MethodDefinition' && member.type !== 'ClassProperty') return;
        hasAnyDecorator = hasAnyDecorator || ((_member$decorators = member.decorators) === null || _member$decorators === void 0 ? void 0 : _member$decorators.some(isMobxDecorator$1)) || false;
        if (!annotationProps.some(function (prop) {
          return fieldToKey(prop) === fieldToKey(member);
        })) {
          // TODO optimize?
          nonAnnotatedMembers.push(member);
        }
      });
      /*
      // With decorators, second arg must be null/undefined or not provided
      if (hasAnyDecorator && secondArg && secondArg.name !== "undefined" && secondArg.value !== null) {
      context.report({
      node: makeObservable,
      message: 'When using decorators, second arg must be `null`, `undefined` or not provided.',
      })
      }
      // Without decorators, in constructor, second arg must be object literal
      if (!hasAnyDecorator && firstArg.type === 'ThisExpression' && (!secondArg || secondArg.type !== 'ObjectExpression')) {
      context.report({
      node: makeObservable,
      message: 'Second argument must be object in form of `{ key: annotation }`.',
      })
      }
      */

      if (!hasAnyDecorator && nonAnnotatedMembers.length) {
        // Set avoids reporting twice for setter+getter pair or actual duplicates
        var keys = _toConsumableArray(new Set(nonAnnotatedMembers.map(fieldToKey)));
        var keyList = keys.map(function (key) {
          return "`".concat(key, "`");
        }).join(", ");
        var fix = function fix(fixer) {
          var annotationList = keys.map(function (key) {
            return "".concat(key, ": ").concat(autofixAnnotation);
          }).join(", ") + ",";
          if (!secondArg) {
            return fixer.insertTextAfter(firstArg, ", { ".concat(annotationList, " }"));
          } else if (secondArg.type !== "ObjectExpression") {
            return fixer.replaceText(secondArg, "{ ".concat(annotationList, " }"));
          } else {
            var openingBracket = sourceCode.getFirstToken(secondArg);
            return fixer.insertTextAfter(openingBracket, " ".concat(annotationList, " "));
          }
        };
        context.report({
          node: makeObservable,
          messageId: "missingAnnotation",
          data: {
            keyList: keyList
          },
          fix: fix
        });
      }
    }
  };
}
var exhaustiveMakeObservable$1 = {
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [{
      type: "object",
      properties: {
        autofixAnnotation: {
          type: "boolean"
        }
      },
      additionalProperties: false
    }],
    docs: {
      description: "enforce all fields being listen in `makeObservable`",
      recommended: true,
      suggestion: false
    },
    messages: {
      missingAnnotation: "Missing annotation for {{ keyList }}. To exclude a field, use `false` as annotation."
    }
  },
  create: create$4
};

var findAncestor$1 = utils.findAncestor;
function create$3(context) {
  return {
    'CallExpression[callee.name=/(makeObservable|makeAutoObservable)/]': function CallExpressionCalleeNameMakeObservableMakeAutoObservable(makeObservable) {
      var _closestFunction$pare;
      // Only iterested about makeObservable(this, ...) inside constructor and not inside nested bindable function
      var _makeObservable$argum = _slicedToArray(makeObservable.arguments, 1),
        firstArg = _makeObservable$argum[0];
      if (!firstArg) return;
      if (firstArg.type !== 'ThisExpression') return;
      //     MethodDefinition[key.name="constructor"][kind="constructor"]
      //       FunctionExpression
      //         BlockStatement
      //           ExpressionStatement
      //             CallExpression[callee.name="makeObservable"]
      var closestFunction = findAncestor$1(makeObservable, function (node) {
        return node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration';
      });
      if ((closestFunction === null || closestFunction === void 0 ? void 0 : (_closestFunction$pare = closestFunction.parent) === null || _closestFunction$pare === void 0 ? void 0 : _closestFunction$pare.kind) !== 'constructor') return;
      if (makeObservable.parent.parent.parent !== closestFunction) {
        context.report({
          node: makeObservable,
          messageId: 'mustCallUnconditionally',
          data: {
            name: makeObservable.callee.name
          }
        });
      }
    }
  };
}
var unconditionalMakeObservable$1 = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallows calling `makeObservable(this)` conditionally inside constructors',
      recommended: true
    },
    messages: {
      mustCallUnconditionally: '`{{ name }}` must be called unconditionally inside constructor.'
    }
  },
  create: create$3
};

var findAncestor = utils.findAncestor,
  isMobxDecorator = utils.isMobxDecorator;
function create$2(context) {
  var sourceCode = context.getSourceCode();
  return {
    'Decorator': function Decorator(decorator) {
      var _clazz$body$body$find, _constructor$value$bo, _constructor$value$bo2;
      if (!isMobxDecorator(decorator)) return;
      var clazz = findAncestor(decorator, function (node) {
        return node.type === 'ClassDeclaration' || node.type === 'ClassExpression';
      });
      if (!clazz) return;
      // ClassDeclaration > ClassBody > []
      var constructor = (_clazz$body$body$find = clazz.body.body.find(function (node) {
        return node.kind === 'constructor' && node.value.type === 'FunctionExpression';
      })) !== null && _clazz$body$body$find !== void 0 ? _clazz$body$body$find : clazz.body.body.find(function (node) {
        return node.kind === 'constructor';
      });
      // MethodDefinition > FunctionExpression > BlockStatement > []
      var isMakeObservable = function isMakeObservable(node) {
        var _node$expression, _node$expression$call, _node$expression2, _node$expression2$arg;
        return ((_node$expression = node.expression) === null || _node$expression === void 0 ? void 0 : (_node$expression$call = _node$expression.callee) === null || _node$expression$call === void 0 ? void 0 : _node$expression$call.name) === 'makeObservable' && ((_node$expression2 = node.expression) === null || _node$expression2 === void 0 ? void 0 : (_node$expression2$arg = _node$expression2.arguments[0]) === null || _node$expression2$arg === void 0 ? void 0 : _node$expression2$arg.type) === 'ThisExpression';
      };
      var makeObservable = constructor === null || constructor === void 0 ? void 0 : (_constructor$value$bo = constructor.value.body) === null || _constructor$value$bo === void 0 ? void 0 : (_constructor$value$bo2 = _constructor$value$bo.body.find(isMakeObservable)) === null || _constructor$value$bo2 === void 0 ? void 0 : _constructor$value$bo2.expression;
      if (makeObservable) {
        // make sure second arg is nullish
        var secondArg = makeObservable.arguments[1];
        if (secondArg && secondArg.value !== null && secondArg.name !== 'undefined') {
          context.report({
            node: makeObservable,
            messageId: 'secondArgMustBeNullish'
          });
        }
      } else {
        var fix = function fix(fixer) {
          if ((constructor === null || constructor === void 0 ? void 0 : constructor.value.type) === 'TSEmptyBodyFunctionExpression') {
            // constructor() - yes this a thing
            var closingBracket = sourceCode.getLastToken(constructor.value);
            return fixer.insertTextAfter(closingBracket, ' { makeObservable(this); }');
          } else if (constructor) {
            // constructor() {}
            var _closingBracket = sourceCode.getLastToken(constructor.value.body);
            return fixer.insertTextBefore(_closingBracket, ';makeObservable(this);');
          } else {
            // class C {}
            var openingBracket = sourceCode.getFirstToken(clazz.body);
            return fixer.insertTextAfter(openingBracket, '\nconstructor() { makeObservable(this); }');
          }
        };
        context.report({
          node: clazz,
          messageId: 'missingMakeObservable',
          fix: fix
        });
      }
    }
  };
}
var missingMakeObservable$1 = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'prevents missing `makeObservable(this)` when using decorators',
      recommended: true,
      suggestion: false
    },
    messages: {
      missingMakeObservable: "Constructor is missing `makeObservable(this)`.",
      secondArgMustBeNullish: "`makeObservable`'s second argument must be nullish or not provided when using decorators."
    }
  },
  create: create$2
};

function create$1(context) {
  var sourceCode = context.getSourceCode();
  return {
    'FunctionDeclaration,FunctionExpression,ArrowFunctionExpression,ClassDeclaration,ClassExpression': function FunctionDeclarationFunctionExpressionArrowFunctionExpressionClassDeclarationClassExpression(cmp) {
      var _cmp$id, _cmp$parent;
      // Already has observer
      if (cmp.parent && cmp.parent.type === 'CallExpression' && cmp.parent.callee.name === 'observer') return;
      var name = (_cmp$id = cmp.id) === null || _cmp$id === void 0 ? void 0 : _cmp$id.name;
      // If anonymous try to infer name from variable declaration      
      if (!name && ((_cmp$parent = cmp.parent) === null || _cmp$parent === void 0 ? void 0 : _cmp$parent.type) === 'VariableDeclarator') {
        name = cmp.parent.id.name;
      }
      if (cmp.type.startsWith('Class')) {
        // Must extend Component or React.Component
        var superClass = cmp.superClass;
        if (!superClass) return;
        var superClassText = sourceCode.getText(superClass);
        if (superClassText !== 'Component' && superClassText !== 'React.Component') return;
      } else {
        var _name;
        // Name must start with uppercase letter
        if (!((_name = name) !== null && _name !== void 0 && _name.charAt(0).match(/^[A-Z]$/))) return;
      }
      var fix = function fix(fixer) {
        return [fixer.insertTextBefore(sourceCode.getFirstToken(cmp), (name && cmp.type.endsWith('Declaration') ? "const ".concat(name, " = ") : '') + 'observer('), fixer.insertTextAfter(sourceCode.getLastToken(cmp), ')')];
      };
      context.report({
        node: cmp,
        messageId: 'missingObserver',
        data: {
          name: name || '<anonymous>'
        },
        fix: fix
      });
    }
  };
}
var missingObserver$1 = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'prevents missing `observer` on react component',
      recommended: true
    },
    messages: {
      missingObserver: "Component `{{ name }}` is missing `observer`."
    }
  },
  create: create$1
};

function create(context) {
  var sourceCode = context.getSourceCode();
  return {
    'CallExpression[callee.name="observer"]': function CallExpressionCalleeNameObserver(observer) {
      var _cmp$id;
      var cmp = observer.arguments[0];
      if (!cmp) return;
      if (cmp !== null && cmp !== void 0 && (_cmp$id = cmp.id) !== null && _cmp$id !== void 0 && _cmp$id.name) return;
      var fix = function fix(fixer) {
        var _observer$parent;
        // Use name from variable for autofix
        var name = ((_observer$parent = observer.parent) === null || _observer$parent === void 0 ? void 0 : _observer$parent.type) === "VariableDeclarator" ? observer.parent.id.name : undefined;
        if (!name) return;
        if (cmp.type === "ArrowFunctionExpression") {
          var arrowToken = sourceCode.getTokenBefore(cmp.body);
          var fixes = [fixer.replaceText(arrowToken, ""), fixer.insertTextBefore(cmp, "function ".concat(name))];
          if (cmp.body.type !== "BlockStatement") {
            fixes.push(fixer.insertTextBefore(cmp.body, "{ return "), fixer.insertTextAfter(cmp.body, " }"));
          }
          return fixes;
        }
        if (cmp.type === "FunctionExpression") {
          var functionToken = sourceCode.getFirstToken(cmp);
          return fixer.replaceText(functionToken, "function ".concat(name));
        }
        if (cmp.type === "ClassExpression") {
          var classToken = sourceCode.getFirstToken(cmp);
          return fixer.replaceText(classToken, "class ".concat(name));
        }
      };
      context.report({
        node: cmp,
        messageId: "observerComponentMustHaveName",
        fix: fix
      });
    }
  };
}
var noAnonymousObserver$1 = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "forbids anonymous functions or classes as `observer` components",
      recommended: true
    },
    messages: {
      observerComponentMustHaveName: "`observer` component must have a name."
    }
  },
  create: create
};

var exhaustiveMakeObservable = exhaustiveMakeObservable$1;
var unconditionalMakeObservable = unconditionalMakeObservable$1;
var missingMakeObservable = missingMakeObservable$1;
var missingObserver = missingObserver$1;
var noAnonymousObserver = noAnonymousObserver$1;
var src = {
  configs: {
    recommended: {
      plugins: ["mobx"],
      rules: {
        "mobx/exhaustive-make-observable": "warn",
        "mobx/unconditional-make-observable": "error",
        "mobx/missing-make-observable": "error",
        "mobx/missing-observer": "warn"
      }
    }
  },
  rules: {
    "exhaustive-make-observable": exhaustiveMakeObservable,
    "unconditional-make-observable": unconditionalMakeObservable,
    "missing-make-observable": missingMakeObservable,
    "missing-observer": missingObserver,
    "no-anonymous-observer": noAnonymousObserver
  }
};

module.exports = src;
