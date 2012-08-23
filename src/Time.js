var Time = (function() {

	function Time(dayFraction) {
		this.dayFraction = dayFraction - Math.floor(dayFraction);
	}

	function pad(str, len) {
		return ("000".substring(3 - (len - str.toString().length))) + str;
	}

	Time.prototype.toHours = function() {
		return this.dayFraction * 24;
	};

	Time.prototype.addHours = function(hrs) {
		return new Time(this.dayFraction + (hrs / 24));
	};

	Time.prototype.toString = function() {
		return this.toHMS().toString();
	};

	Time.prototype.toHMS = function() {
		var floor = Math.floor;
		var remainingDayFrac = this.dayFraction;

		remainingDayFrac = remainingDayFrac * 24;
		var hour = floor(remainingDayFrac);
		remainingDayFrac -= hour;

		remainingDayFrac *= 60;
		var minute = floor(remainingDayFrac);
		remainingDayFrac -= minute;

		remainingDayFrac *= 60;
		var second = floor(remainingDayFrac);
		remainingDayFrac -= second;

		var millisecond = floor(remainingDayFrac * 1000);

		return {
			hour:hour, minute:minute, second:second, millisecond: millisecond,
			toString: function() {return pad(hour, 2)+":"+pad(minute, 2)+":"+pad(second, 2)+"."+pad(millisecond, 3)}
		};
	};

	Time.prototype.changeTimeZone = function(fromTzHr, toTzHr) {
		return this.addHours(toTzHr - fromTzHr);
	};

	Time.prototype.valueOf = function() {
		return this.dayFraction;
	};

	Time.fromValues = function(hour, minute, second, millisecond) {
		return new Time(((hour || 0) + ((minute || 0) + ((second || 0)+ (millisecond || 0) / 1000) / 60) / 60) / 24);
	};

	Time.fromHMS = function(hms) {
		return Time.fromValues(hms.hour, hms.minute, hms.second, hms.millisecond);
	};

	Time.fromDate = function(date) {
		date = date || new Date();
		return Time.fromValues(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	};

	return Time;

})();