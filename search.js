(function($) {
	var searchBar;
	var fbSearchURL = "https://rpm.fogbugz.com/default.asp?search=2";
	var acDD = null;
	var acOptions = [];
	var acPrevLastWord = "";

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
			buildSearchFromInputs(
				'AssignedTo',
				$(form).find('.input.assignments option:selected')
			) +
			' OrderBy:"-Case"'
			"";
			

		return searchStr;
	}

	function buildSearchFromInputs(term, inputs) {
		var c = $.merge([],
			inputs.map(function() {
				return term + ':"' + this.value + '"';
			})
		);
		var search = "";
		if (c.length > 0) {
			search = " (" + c.join(' OR ') + ")"
		};
		return search;
	}

	function autoComplete(searchBar) {
		var lastWord = lw(searchBar.value)
		if (lastWord == "") {
			hideAutoComplete();
		};
		showAutoComplete(lastWord);
	}

	function hideAutoComplete(selectValue) {
		acDD.hide();
		acPrevLastWord = "";
		selectValue = selectValue === true;
		if (selectValue) {
			var selected = acDD.children('.selected').text();
			var matches = inputsWithWord(selected);
			if (matches.length == 0) {
				return;
			};
			var element = $(matches[0]);
			if (element.is('input')) {
				matches.attr('checked', !matches.attr('checked'));;
			}
			if (element.is('option')) {
				matches.attr('selected', !matches.attr('selected'));;
			};

			removeLastWord();
			searchBar.focus();
		};
	}

	function removeLastWord() {
		var str = searchBar.val();
		var words = str.split(/\s+/);
		words.pop();
		searchBar.val(words.join());

	}

	function lw(str) {
		return str.split(/\s+/).pop().trim();
	}

	function inputsWithWord(word) {
		word = word.trim().toUpperCase();
		return acOptions.filter(function(i, item) {
			if (word.trim().length == 0) {
				return false;
			};
			var val = item.value.toUpperCase();
			return val.indexOf(word) >= 0;
		});
	}

	function showAutoComplete(lastWord) {
		lastWord = lastWord.toUpperCase();
		if (acPrevLastWord == lastWord) {
			return;
		};
		acPrevLastWord = lastWord;
		var matches = inputsWithWord(lastWord);

		if (matches.length == 0) {
			hideAutoComplete();
			return;
		};
		acDD.empty();
		matches.each(function(i, item) {
			var container = $('<div class="ac" />');
			container.html(item.value);
			acDD.append(container);
		});
		acDD.show();
		autoCompleteSelectOption();
	}

	function loadAutoCompleteOptions() {
		acOptions = $('.r1 input, .r1 option');
	}

	function autoCompleteSelectOption(direction) {
		var current = acDD.children('.selected');
		if (current.length == 0) {
			current = acDD.children().first();
		} else {
			current.removeClass('selected');
			if (direction === -1) {
				current = current.prev();
				if (current.length == 0) {
					current = acDD.children().last();
				};
			} else {
				current = current.next();
				if (current.length == 0) {
					current = acDD.children().first();
				};
			}
		}

		current.addClass('selected');
	}

	$.fn.fbSearch = function() {
		searchBar = this;

		var form = this.parents('form');
		form.submit(function(event) {
			event.preventDefault();
			if (acDD.is(':visible')) {
				return
			};
			
			console.debug( buildSearchString(this) );
			window.open( buildSearchString(this) );
		});
		acDD = $('<div class="dd"></div>');
		searchBar
			.before(acDD)
			.keyup(function(event) {
				autoComplete(this);

				if (!acDD.is(':visible')) {
					return;
				};

				var keyCode = event.which;

				var isDown = keyCode == 40;
				var isUp = keyCode == 38;
				if (isUp || isDown) {
					autoCompleteSelectOption(isUp? -1 : 1);
				}
				var isEsc = keyCode == 27;
				if (isEsc) {
					hideAutoComplete();
				};
				var isEnter = keyCode == 13;
				if (isEnter) {
					event.preventDefault();
					this.blur();
				};
			})
			.blur(function() {
				hideAutoComplete(true);
			});
		hideAutoComplete();
		loadAutoCompleteOptions();
	}
})(jQuery);


(function($) {
	$(function() {
		 $('#search').fbSearch();
	});
})(jQuery);