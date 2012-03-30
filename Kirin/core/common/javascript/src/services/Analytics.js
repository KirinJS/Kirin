defineModule("Analytics", function (require, exports) {

    var backend;
    var isStarted = false;
    var settings;

    exports.onLoad = function (nativeObject) {
        backend = nativeObject;
        settings = require("Settings");
    };

    function startTracker (dispatchInterval) {
        var apiKey = settings.get("google.analytics.tracking.code");
        if (apiKey) {
            backend.startTrackerWithKey_andDispatchInterval_(apiKey, dispatchInterval || 0);
            isStarted = true;
        }
    }

    function stopTracker () {
        if (isStarted) {
            backend.stopTracker();
            isStarted = false;
        }
    }

    function isTrackingAllowed () {
        var bool = settings.get("analytics.is.tracking.allowed");
        return (typeof bool !== 'undefined') ? bool : true;
    }
    
    function checkIfTracking () {
        var isAllowed = isTrackingAllowed();
        if (isAllowed && !isStarted) {
            // tracking is allowed, but we haven't started.
            startTracker();
        } else if (isStarted && !isAllowed) {
            // tracking is started, but has since been disallowed.
            stopTracker();
        }
        return isStarted;
    }

    exports.onStart = function () {
        checkIfTracking();
    };

    exports.onPause = function () {
        stopTracker();
    };
    
    exports.onStop = function () {
        stopTracker();
    };
    
    exports.onUnload = function () {
        stopTracker();
        backend = null;
    };

    
    
    exports.isTracking = function () {
        return isStarted && isTrackingAllowed();
    };

    exports.trackPageview = function (pageName) {
        if (!checkIfTracking()) {
            return;
        }
        if (!_.isString(pageName)) {
            throw new Error("Analytics.trackPageView: Page name must be a string");
        }
        backend.trackPageView_(pageName);
    };

    exports.trackEvent = function (category, action, label, value) {
        if (!checkIfTracking()) {
            return;
        }
        var config;
        if (_.isObject(category) && arguments.length == 1) {
            config = category;
        } else {
            config = {
                category : category,
                action : action,
                label : label,
                value : value
            };
        }

        require("api-utils").normalizeAPI({
            string : {
                mandatory : [ "category", "action", "label" ]
            },
            number : {
                defaults : {
                    value : 0
                }
            }
        }, config);

        backend.trackEventWithConfig_(config);
    };

    exports.dispatch = function () {
        if (!checkIfTracking()) {
            return;
        }
        backend.dispatch();
    };

    exports.stopTracker = stopTracker;

});