jQuery.entwine("dependentdropdown", function ($) {


	$(":input.dependent-dropdown").entwine({
		onmatch: function () {
			var drop = this;

            this.parents('.field:first').addClass('dropdown');
            var checkInit = function() {
                var depends = ($(":input[name=" + drop.data('depends').replace(/[#;&,.+*~':"!^$[\]()=>|\/]/g, "\\$&") + "]"));
                if(!depends.length) {
                    return window.setTimeout(checkInit,300);
                }
                var query = function () {
                    var value = this.value || this.val();
                    if (!value) {
                        drop.disable(drop.data('unselected'));
                    } else {
                        drop.disable("Loading...");

                        $.get(drop.data('link'), {
                            val: value
                        },
                        function (data) {
                            drop.enable();

                            if (drop.data('empty') || drop.data('empty') === "") {
                                drop.append($("<option />").val("").text(drop.data('empty')));
                            }

                            $.each(data, function () {
                                drop.append($("<option />").val(this.k).text(this.v).prop('selected',!!this.selected));
                            });
                            drop.trigger("liszt:updated").trigger("chosen:updated");
                            if(drop.val() != drop.attr('data-initial')) {
                                drop.trigger("change");
                            }
                        });
                    }
                };
                query.call(depends);
                depends.change(query);

                if (!depends.val()) {
                    drop.disable(drop.data('unselected'));
                }
            }
            drop.disable(drop.data('unselected'));
            checkInit();
		},
		disable: function (text) {
			this.empty().append($("<option />").val("").text(text)).attr("disabled", "disabled").trigger("liszt:updated").trigger("chosen:updated");
		},
		enable: function () {
			this.empty().removeAttr("disabled").next().removeClass('chzn-disabled');
		}
	});

});
