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
			exports.startTracker(apiKey);
			backend.startTrackerWithKey_andDispatchInterval_(apiKey, dispatchInterval || 0);
			isStarted = true;
		}
	}
	
	function stopTracker () {
		if (isStarted) {
			backend.stopTracker();
		}
	}
	
	function checkIfTracking () {
		var isAllowed = settings.get("analytics.is.tracking.allowed");
		if (isAllowed && !isStarted) {
			// tracking is allowed, but we haven't started.
			startTracker();
		} else if (isStarted && !isAllowed) {
			stopTracker();
		}
		return isStarted;
	}
	
	exports.onStart = function () {
		checkIfTracking();
	};
	
	exports.onStop = function () {
		stopTracker();
	};
	
	exports.isTracking = function () {
		return isStarted && settings.get("analytics.is.tracking");
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
				category: category, 
				action: action, 
				label: label,
				value: value
			};
		}
		
		require("api-utils").normalizeAPI({
			string: {
				mandatory: ["category", "action", "label"]
			},
			number: {
				defaults: {
					value: 0
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