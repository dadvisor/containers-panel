define(function() { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./module.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./container_ctrl.ts":
/*!***************************!*\
  !*** ./container_ctrl.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module build failed (from ../node_modules/babel-loader/lib/index.js):\nSyntaxError: /Users/patrickvogel/git/dAdvisor/containers-panel/src/container_ctrl.ts: Unexpected token (192:12)\n\n\u001b[0m \u001b[90m 190 | \u001b[39m            edges\u001b[33m.\u001b[39mpush({\u001b[0m\n\u001b[0m \u001b[90m 191 | \u001b[39m                src\u001b[33m:\u001b[39m \u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 192 | \u001b[39m            })\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m     | \u001b[39m            \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 193 | \u001b[39m        })\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 194 | \u001b[39m        \u001b[36mreturn\u001b[39m edges\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 195 | \u001b[39m    }\u001b[33m;\u001b[39m\u001b[0m\n    at Parser.raise (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:4028:15)\n    at Parser.unexpected (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5343:16)\n    at Parser.parseExprAtom (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6432:20)\n    at Parser.parseExprSubscripts (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6019:21)\n    at Parser.parseMaybeUnary (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5998:21)\n    at Parser.parseExprOps (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5907:21)\n    at Parser.parseMaybeConditional (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5879:21)\n    at Parser.parseMaybeAssign (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5826:21)\n    at Parser.parseObjectProperty (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6897:101)\n    at Parser.parseObjPropValue (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6922:99)\n    at Parser.parseObj (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6833:12)\n    at Parser.parseExprAtom (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6398:21)\n    at Parser.parseExprSubscripts (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6019:21)\n    at Parser.parseMaybeUnary (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5998:21)\n    at Parser.parseExprOps (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5907:21)\n    at Parser.parseMaybeConditional (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5879:21)\n    at Parser.parseMaybeAssign (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5826:21)\n    at Parser.parseExprListItem (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7111:18)\n    at Parser.parseCallExpressionArguments (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6227:22)\n    at Parser.parseSubscript (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6129:32)\n    at Parser.parseSubscripts (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6039:19)\n    at Parser.parseExprSubscripts (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6029:17)\n    at Parser.parseMaybeUnary (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5998:21)\n    at Parser.parseExprOps (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5907:21)\n    at Parser.parseMaybeConditional (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5879:21)\n    at Parser.parseMaybeAssign (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5826:21)\n    at Parser.parseExpression (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:5779:21)\n    at Parser.parseStatementContent (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7391:21)\n    at Parser.parseStatement (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7277:17)\n    at Parser.parseBlockOrModuleBlockBody (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7829:23)\n    at Parser.parseBlockBody (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7816:10)\n    at Parser.parseBlock (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7805:10)\n    at Parser.parseFunctionBody (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7042:24)\n    at Parser.parseFunctionBodyAndFinish (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7024:10)\n    at Parser.parseFunction (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:7958:10)\n    at Parser.parseFunctionExpression (/Users/patrickvogel/git/dAdvisor/containers-panel/node_modules/@babel/parser/lib/index.js:6477:17)");

/***/ }),

/***/ "./module.ts":
/*!*******************!*\
  !*** ./module.ts ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelCtrl = undefined;

var _container_ctrl = __webpack_require__(/*! ./container_ctrl */ "./container_ctrl.ts");

exports.PanelCtrl = _container_ctrl.ContainerCtrl;

/***/ })

/******/ })});;
//# sourceMappingURL=module.js.map