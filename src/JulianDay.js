var JulianDay = (function() {

	var floor = Math.floor;

	function JulianDay(day) {
		if (typeof day == 'string' && day.substring(0, 2) == "JD") day = Number(day.substring(2));
		this.day = day;
	}

	JulianDay.prototype.century = function() {
		return (this.day - 2451545.0) / 36525.0;
	};

	JulianDay.prototype.ephemerisDay = function(delta_t) {
		return this.day + delta_t / 86400.0;
	};

	JulianDay.prototype.ephemerisCentury = function(delta_t) {
		return (this.ephemerisDay(delta_t) - 2451545) / 36525;
	};

	JulianDay.prototype.ephemerisMillennium = function(delta_t) {
		return this.ephemerisCentury(delta_t) / 10;
	};

	JulianDay.prototype.valueOf = function() {
		return this.day;
	};

	JulianDay.prototype.getTime = function() {
		return new Time(this.day);
	};

	JulianDay.prototype.toString = function() {
		return "JD"+this.day;
	};

	JulianDay.prototype.setTime = function(time) {
		return new JulianDay(floor(this.day - 0.5) + 0.5 + time.valueOf());
	};

	JulianDay.prototype.add = function(days) {
		return new JulianDay(this.day + days);
	};

	JulianDay.prototype.toDate = function() {
		var tmp = this.day + 0.5;
		var z = floor(tmp);
		var f = tmp - z;
		var A;
		if (z < 2299161) {
			A = z;
		} else {
			var B = floor((z - 1867216.25) / 36524.25);
			A = z + 1 + B - floor(B / 4);
		}
		var C = A + 1524;
		var D = floor((C - 122.1) / 365.25);
		var G = floor(D * 365.25);
		var I = floor((C - G) / 30.6001);
		var d = C - G - floor(30.6001 * I ) + f;
		var m = (I < 14) ? I - 1 : I - 13;
		var y = (m > 2) ? D - 4716 : D - 4715;

		var dayInMillis = d * 24 * 60 * 60 * 1000;

		return new Date(Date.UTC(y, m - 1, 0, 0, 0, 0, dayInMillis));
	};

	JulianDay.fromDate = function(date) {
		date = date || new Date();
		return JulianDay.fromValues(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(), date.getTimezoneOffset() / -60);
	};

	JulianDay.fromValues = function(year, month, day, hour, minute, second, millisecond, tz) {
		tz = tz || 0;
		millisecond = millisecond || 0;

		var day_decimal = day + (hour - tz + (minute + (second + millisecond / 1000) / 60) / 60) / 24;
		if (month < 3) {
			month += 12;
			year--;
		}
		var julian_day = floor(365.25 * (year + 4716.0)) + floor(30.6001 * (month+1)) + day_decimal - 1524.5;
		if (julian_day > 2299160.0) {
			var a = floor(year/100);
			julian_day += (2 - a + floor(a/4));
		}
		return new JulianDay(julian_day);
	};

	return JulianDay;
})();