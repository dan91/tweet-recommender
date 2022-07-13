class DOM {
	static createElementFromHTML(htmlString) {
	  const div = document.createElement('div');
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

	static waitForElm(selector, element = document.body) {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver(mutations => {

				if (document.querySelector(selector)) {
					resolve(document.querySelector(selector));
					observer.disconnect();
				}
			});
			observer.observe(element, {
				childList: true,
				subtree: true
			});
		});
	}
}