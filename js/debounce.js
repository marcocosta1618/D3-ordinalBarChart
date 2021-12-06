// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.

export default function debounce(func, wait) {
	let timeout;
	return function() {
		const later = function() {
			timeout = null;
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};
