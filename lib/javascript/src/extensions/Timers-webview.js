if (_.isUndefined(window)) {
	throw new Error("Timer: Cannot find any window object.");
}

function bind (methodName) {
	exports[methodName] = function (arg1, arg2) {
		var fn = typeof arg1 === 'function' ? function () {
			try {
				arg1();
			} catch (e) {
				console.error(e);
			}
		} : arg1;
		return window[methodName](fn, arg2);
	};
}

bind("setInterval");
bind("clearInterval");
bind("setTimeout");
bind("clearTimeout");
	
