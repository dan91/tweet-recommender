class Maths {
	static getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	static generateNum(v) {
		return Math.pow(10, v.toString().length - 1);
	}
}