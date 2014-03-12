(function($) {
	var fbSearchURL = "https://rpm.fogbugz.com/default.asp?search=2";

	function buildSearchString(form) {
		var searchStr =
			fbSearchURL +
			"&searchFor=" + $('input.search').val() +
			buildSearchFromInputs(
				'Status',
				$(form).find('.input.status input:checked')
			) +
			buildSearchFromInputs(
				'Project',
				$(form).find('.input.project input:checked')
			) +
			"&OrderBy=Case"
			"";
			

		return searchStr;
	}

	function buildSearchFromInputs(term, inputs) {
		var c = $.merge([],
			inputs.map(function() {
				return term + ':"' + this.value + '"';
			})
		);
		return " (" + c.join(' OR ') + ")";
	}

	$.fn.fbSearch = function() {
		var form = this;
		if (this.prop("nodeName") != "FORM") {
			form = this.parents('form');
		};
		
		
		form.submit(function(event) {
			event.preventDefault();
			
			console.debug( buildSearchString(this) );
			window.open( buildSearchString(this) );
		});
	}
})(jQuery);


(function($) {
	$(function() {

		var form = $('#fb');
		var search = $('#search');
		search.fbSearch();
	});
})(jQuery);