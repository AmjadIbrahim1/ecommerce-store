/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../demo1/src/js/custom/landing.js":
/*!*****************************************!*\
  !*** ../demo1/src/js/custom/landing.js ***!
  \*****************************************/
/***/ ((module) => {



// Class definition
var KTLandingPage = function () {
    // Private methods
    var initPortfolio = function(product) {
        
    }

    // Public methods
    return {
        init: function () {
            
        }   
    }
}();

// Webpack support
if (true) {
    module.exports = KTLandingPage;
}

// On document ready
KTUtil.onDOMContentLoaded(function() {
    KTLandingPage.init();
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("../demo1/src/js/custom/landing.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=landing.js.map