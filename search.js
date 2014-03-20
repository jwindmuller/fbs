(function($) {
	var searchBar;
	var fbSearchURL = "https://rpm.fogbugz.com/default.asp?search=2";
	var acDD = null;
	var acOptions = [];
	var acPrevLastWord = "";

	function buildSearchString(form, paramsOnly) {
		var base = fbSearchURL + "&searchFor="
		var params =
			$('input.search').val() +
			buildSearchFromInputs(
				'Status',
				$(form).find('.input.status input:checked')
			) +
			buildSearchFromInputs(
				'Project',
				$(form).find('.input.project input:checked')
			) +
			buildSearchFromInputs(
				'EditedBy',
				$(form).find('.input.editors option:selected')
			) +
			buildSearchFromInputs(
				'AssignedTo',
				$(form).find('.input.assignments option:selected')
			) +
			buildSearchFromInputs(
				'OrderBy',
				$(form).find('.sorting input:checked'),
				' '
			) +
			"";

		if (paramsOnly) {
			base = "";
		} else {
			params = encodeURIComponent(params);
		}

		return base + params;
	}

	function buildSearchFromInputs(term, inputs, joinBy) {
		if (!joinBy) {
			joinBy = ' OR ';
		};
		var c = $.merge([],
			inputs.map(function() {
				if (this.value === '') {
					return '';
				}
				return term + ':"' + this.value + '"';
			})
		);
		var search = "";
		if (c.length > 0) {
			search = " (" + c.join(joinBy) + ")"
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
			var selectedText = acDD.children('.selected').text();
			var title    = selectedText.replace(/([^:]+):(.*)/, '$1').trim();
			var selected = selectedText.replace(/([^:]+):(.*)/, '$2').trim();
			var matches = inputsWithWord(selected, true, title);
			if (matches.length == 0) {
				return;
			};
			var element = $(matches[0]);
			if (element.is('input')) {
				element.prop('checked', !element.prop('checked'));;
			}
			if (element.is('option')) {
				element.prop('selected', !element.prop('selected'));;
			};

			removeLastWord();
			searchBar
				.delay(100)
				.queue(function(nxt) {
					$(this).focus();
					nxt();
				});
		};
		acDD.empty();
		updateSearchPreview();
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

	function inputsWithWord(word, exact, title) {
		word = word.trim().toUpperCase();
		return acOptions.filter(function(i, item) {
			if (word.trim().length == 0) {
				return false;
			};
			if (title) {
				var titleForItem = titleForInput( $(item) );//.parents('.input').prev().text().trim();
				if (titleForItem !== title) {
					return false;
				}
			}
			var val = item.value.toUpperCase();
			if (exact === true) {
				return val === word;
			};
			return val.indexOf(word) >= 0;
		});
	}

	function titleForInput(input) {
		var wrapper = input.parents('.input');
		var title   = wrapper.prevAll('h3');
		if (!title.length) {
			title = wrapper.prevAll('h4');
		}
		if (!title.length) {
			title = wrapper.parents('h3');
		}
		return title.text().trim();
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
			var title = titleForInput($(item));
			var container = $('<div class="ac" />');
			container
				.html(title + ": " + item.value)
				.mouseover(function(event) {
					$(this).siblings().removeClass('selected');
					$(this).addClass('selected');
				});
			acDD.append(container);
		});
		acDD.show();
		autoCompleteSelectOption(1);
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
		var currentTop = current.position().top;
		if (currentTop + current.height() > acDD.height() || currentTop < 0) {
			if (currentTop > 0) {
				var diff = acDD.height() - currentTop;
				acDD.scrollTop(
					acDD.scrollTop() + current.height() - diff
				);
			} else {
				acDD.scrollTop(
					acDD.scrollTop() + currentTop
				);
			}
			
		};
		current.addClass('selected');
	}

	function updateSearchPreview() {
		var preview = $('#preview');
		preview.text(buildSearchString(preview.parents('form'), true));
	}

	function setupKeyboard(searchBar) {
		$(window).keydown(function(event) {
			var isForwardSlash = event.keyCode === 191;
			var isCtrlF = event.keyCode == 17 && event.ctrlKey;
			var isSearch = isForwardSlash || isCtrlF ;
			if (isSearch) {
				searchBar.focus();
			};
		});
		console.debug(searchBar);
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
				updateSearchPreview();
			})
			.blur(function() {
				hideAutoComplete(true);
			});
		hideAutoComplete();
		loadAutoCompleteOptions();
		acOptions.click(function() {
			updateSearchPreview();
		});
		acOptions.filter(function(i, item) {
			return item.nodeName == 'OPTION';
		}).parent().change(function() {
			updateSearchPreview();
		});

		setupKeyboard(searchBar);
	}
})(jQuery);


(function($) {
	$(function() {
		 $('#search').fbSearch();
	});
})(jQuery);