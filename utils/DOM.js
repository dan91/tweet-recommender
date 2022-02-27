class DOM {
	static createElementFromHTML(htmlString) {
	  var div = document.createElement('div');
	  div.innerHTML = htmlString.trim();

	  // Change this to div.childNodes to support multiple top-level nodes.
	  return div.firstChild;
	}

	static isElementInViewport(el) {
		const rect = el.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}
}