jQuery.entwine("dependentdropdown", function ($) {

    var loaderParentID = 'dependent_dropdown_loading';
    var getLoaderParent = function(){
        return document.getElementById(loaderParentID);
    }
    var mkLoaderPlate = function() {
        if(getLoaderParent()) return;
        var formCandidate = $('#Form_ItemEditForm');
        if(!formCandidate.length) {
            formCandidate = $('form.cms-edit-form');
        }
        $(formCandidate).append(
            $('<div id="'+loaderParentID+'"></div>')
        )
    };
    var loadingFor = 0;
    var loaderDisplay = null;
    var addLoading = function(){
        var loaderParent = getLoaderParent();
        if(!loaderParent) {
            console.warn("Cannot find a parent for a loader. Counting dependent dropdown requests and using overlay is disabled.");
            return;
        }
        loadingFor++;
        if(loadingFor===1) {
            loaderDisplay = ReactDom.render(
                React.createElement(Loading.default, {}, null),
                getLoaderParent()
            );
        }
    };
    var removeLoading = function(){
        loadingFor--;
        if(loadingFor < 1) {
            ReactDom.unmountComponentAtNode(getLoaderParent());
            loadingFor = 0;
        }
    };

	$(":input.dependent-dropdown").entwine({
		onmatch: function () {
            mkLoaderPlate();
			var drop = this;
			var initialDependsVal = drop.attr('data-depends-initial');

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

                        addLoading();
                        $.get(drop.data('link'), {
                            val: value
                        },
                        function (data) {
                            removeLoading();
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
                if(depends.val() != initialDependsVal) {
                    query.call(depends);
                }
                depends.change(query);

                if (!depends.val()) {
                    drop.disable(drop.data('unselected'));
                }
            }
            if(!initialDependsVal) {
                drop.disable(drop.data('unselected'));
            }
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
