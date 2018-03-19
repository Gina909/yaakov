/**
 * Generic function for validating AJAX errors.
 *
 * @param {Object} jsonResponse
 */
var handleAjaxError = function(jsonResponse) {

    var notyText;

    // Check for a 403 response from AJAX
    if (typeof jsonResponse === 'object' &&
            jsonResponse.hasOwnProperty('error') &&
            jsonResponse.error === "403") {

        // Was error cause because user is no longer logged in?
        if(jsonResponse.identity === null) {
            notyText = 'Unable to process action as you are not logged in. ' +
                    '<strong><a href="javascript:window.location.reload();">' +
                    'Reauthenticate</a></strong>';
        } else {
            notyText = "You are not authorized to perform that action.";
        }
    } else {
        notyText  = "An unknown AJAX error has occurred.";
    }

    // Show error
    noty({
        text: '<i class=icon-exclamation-sign></i> ' + notyText,
        type: "error",
        theme: "noty_theme_twitter",
        layout: "top",
        closeButton: true,
        timeout: false
    });
};

// Fix to allow the removal of chosen rendered select boxes
$.fn.chosenDestroy = function () {
    $(this).show().removeClass('chzn-done')
    $(this).next().remove()
      return $(this);
}

/**
 * On Document Ready
 */
$(document).ready(function() {
    // disabling some functions for Internet Explorer
    if ($.browser.msie) {
        $('#toggle-fullscreen').hide();
        $('.login-box').find('.input-large').removeClass('span10');
    }

    // highlight current / active link
    $('ul.main-menu li a').each(function(){
        if ($($(this))[0].href === String(window.location)) {
            $(this).parent().addClass('active');
        }
    });

    //animating menus on hover
    $('ul.main-menu li:not(.nav-header)').hover(function() {
            $(this).animate({'margin-left':'+=5'}, 300);
        },
        function() {
            $(this).animate({'margin-left':'-=5'}, 300);
        }
    );

    // Initial tabs and show first one
    $.each($('.dashboardWidget'), function (i, e) {
        $(e).find('a:first').tab('show');
    });
    // Enable click on tabs
    $('.dashboardWidget a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    // other things to do on document ready, separated for ajax calls
    docReady();
});

var docReady = function() {
    // prevent # links from moving to top
    $('a[href="#"][data-top!=true]').click(function(e) {
        e.preventDefault();
    });

    // rich text editor
    if ($('.cleditor').length) {
        $('.cleditor').cleditor();
    }

    // datepicker
    if ($('.datepicker').length) {
        $('.datepicker').datepicker();
    }

    // notifications
    $('.noty').click(function(e) {
        e.preventDefault();
        var options = $.parseJSON($(this).attr('data-noty-options'));
        noty(options);
    });


    // If there are messages to display via noty, loop thorugh them
    if($('#flashMessageContainer .noty').length) {

        $.each($('#flashMessageContainer .noty'), function (i, e){
            var options = $.parseJSON($(e).attr('data-noty-options'));
            options.layout = "top";
            options.theme = "noty_theme_twitter";
            options.closeButton = true;
            options.timeout = false;
            noty(options);
        });
    }

    // uniform - styler for checkbox, radio and file input
    $("input:checkbox, input:radio, input:file").not('[data-no-uniform="true"],#uniform-is-ajax').uniform();

    // chosen - improves select
    $('[data-rel="chosen"],[rel="chosen"]').chosen({
        search_contains: true
    });

    // makes elements soratble, elements that sort need to have id attribute to save the result
    $('.sortable').sortable({
        revert: true,
        cancel: '.btn,.box-content,.nav-header',
        update: function(event, ui) {
                //line below gives the ids of elements, you can make ajax call here to save it to the database
                //console.log($(this).sortable('toArray'));
        }
    });

    // slider
    $('.slider').slider({
        range:true,
        values:[10,65]
    });

    // tooltip
    $('[rel="tooltip"],[data-rel="tooltip"]').tooltip({
        "placement": "bottom",
        delay: {
            show: 400,
            hide: 200
        }
    });

    // auto grow textarea
    if ($('textarea.autogrow').length) {
        $('textarea.autogrow').autogrow();
    }

    // popover
    $('[rel="popover"],[data-rel="popover"]').popover();


    //star rating
    if ($('.raty').length) {
        $('.raty').raty({
            score : 4 //default stars
        });
    }

    // Close buttons
    $('.btn-close').click(function(e) {
        e.preventDefault();
        $(this).parent().parent().parent().fadeOut();
    });

    // Minimize buttons
    $('.btn-minimize').click(function(e) {
        e.preventDefault();
        var $target = $(this).parent().parent().next('.box-content');
        if ($target.is(':visible')) {
            $('i', $(this)).removeClass('icon-chevron-up').addClass('icon-chevron-down');

        } else {
            $('i', $(this)).removeClass('icon-chevron-down').addClass('icon-chevron-up');
        }
        $target.slideToggle();
    });
    $('.btn-setting').click(function(e){
        e.preventDefault();
        $('#myModal').modal('show');
    });

    // Global AJAX error handler
    $(document).ajaxError(function(event, jqXHR, settings, exception) {
        // Don't handle aborted AJAX requests as errors
        if(exception === 'abort') {
            return;
        }

        // Response to pass to error handler
        var response = jqXHR.responseText;

        // If a string was returned and the datatype is JSON,
        // try to parse it as JSON
        if(typeof jqXHR.responseText === "string" && settings.dataType === 'json') {
             // try to parse string as JSON
            try {
                response = $.parseJSON(jqXHR.responseText);
            } catch (e) {
                // Response isn't a JSON string. Swallow the exception
            }
        }

        // Pass formatted response to handler
        handleAjaxError(response);
    });

    //additional functions for data table
    $.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
        return {
            "iStart": oSettings._iDisplayStart,
            "iEnd": oSettings.fnDisplayEnd(),
            "iLength": oSettings._iDisplayLength,
            "iTotal": oSettings.fnRecordsTotal(),
            "iFilteredTotal": oSettings.fnRecordsDisplay(),
            "iPage": Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
            "iTotalPages": Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
        };
    };

    $.extend( $.fn.dataTableExt.oPagination, {
	"bootstrap": {
            "fnInit": function(oSettings, nPaging, fnDraw) {
                var oLang = oSettings.oLanguage.oPaginate;
                var fnClickHandler = function (e) {
                    e.preventDefault();
                    if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
                        fnDraw(oSettings);
                    }
                };

                $(nPaging).addClass('pagination').append(
                    '<ul>' +
                        '<li class="prev disabled"><a href="#">&larr; ' + oLang.sPrevious + '</a></li>' +
                        '<li class="next disabled"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' +
                    '</ul>'
                );
                var els = $('a', nPaging);
                $(els[0]).bind('click.DT', { action: "previous" }, fnClickHandler);
                $(els[1]).bind('click.DT', { action: "next" }, fnClickHandler);
            },

            "fnUpdate": function (oSettings, fnDraw) {
                var iListLength = 5;
                var oPaging = oSettings.oInstance.fnPagingInfo();
                var an = oSettings.aanFeatures.p;
                var i, j, sClass, iStart, iEnd, iHalf = Math.floor(iListLength / 2);

                if (oPaging.iTotalPages < iListLength) {
                    iStart = 1;
                    iEnd = oPaging.iTotalPages;

                } else if (oPaging.iPage <= iHalf) {
                    iStart = 1;
                    iEnd = iListLength;

                } else if (oPaging.iPage >= (oPaging.iTotalPages-iHalf)) {
                    iStart = oPaging.iTotalPages - iListLength + 1;
                    iEnd = oPaging.iTotalPages;

                } else {
                    iStart = oPaging.iPage - iHalf + 1;
                    iEnd = iStart + iListLength - 1;
                }

                for (i = 0, iLen = an.length; i < iLen; i++) {
                    // remove the middle elements
                    $('li:gt(0)', an[i]).filter(':not(:last)').remove();

                    // add the new list items and their event handlers
                    for (j = iStart; j <= iEnd; j++) {
                        sClass = (j === oPaging.iPage + 1) ? 'class="active"' : '';
                        $('<li ' + sClass + '><a href="#">' + j + '</a></li>')
                            .insertBefore($('li:last', an[i])[0])
                            .bind('click', function (e) {
                                e.preventDefault();
                                oSettings._iDisplayStart = (parseInt($('a', this).text(), 10) - 1) * oPaging.iLength;
                                fnDraw(oSettings);
                            });
                    }

                    // add / remove disabled classes from the static elements
                    if (oPaging.iPage === 0) {
                        $('li:first', an[i]).addClass('disabled');

                    } else {
                        $('li:first', an[i]).removeClass('disabled');
                    }

                    if (oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0) {
                        $('li:last', an[i]).addClass('disabled');

                    } else {
                        $('li:last', an[i]).removeClass('disabled');
                    }
                }
            }
	}
    });

    // Add functionality to Reset Button
    if($("input[type='reset']").length){

        //create init value attribute on iPhone toggle switch
        if ($('.iphone-toggle').length) {
            $('.iphone-toggle').each(function (){
               $(this).attr('init_value', $(this).is(':checked'));
            });
        }

        //create init value attribute on modern selects
        if($('select[data-rel="chosen"]').length){
           $('select[data-rel="chosen"]').each(function (){
                $(this).attr('init_value', $(this).val());
           });
        }

        $("input[type='reset']").click(function (){

            //reset iPhone toggle switch
            if ($('.iphone-toggle').length) {
                $('.iphone-toggle').each(function (){
                   var init_value = ($(this).attr('init_value') === "true") ? true : false;
                   if($(this).is(':checked') !== init_value){
                      $(this).trigger('click');
                   }
                });
            }

            //reset modern select
            if($('select[data-rel="chosen"]').length){
               $('select[data-rel="chosen"]').each(function (){
                   if($(this).val() !== $(this).attr('init_value')){
                       $(this).val($(this).attr('init_value'));
                       $(this).trigger("liszt:updated");
                   }
               });
            }
        });
    }

};