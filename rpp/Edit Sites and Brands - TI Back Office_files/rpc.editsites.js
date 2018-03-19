$(document).ready(function () {
    // Initial Brand count used for creating new Brand element indexes
    var initialBrandCount = parseInt($('#brandCount').text(), 10),
        brandIndex = (initialBrandCount) ? initialBrandCount : -1,
        // Get the initial site count used for creating new site element indexes
        lastSiteRow = $('#siteMappingSortable tbody tr:last span.siteMappingValue'),
        siteIndex = (lastSiteRow.length) ? lastSiteRow.text() : -1;

    // Styles checkbox(es) as iOS style toggle
    var setIphoneToggle = function (selector, checked, unchecked) {
        if ($(selector).length) {
            $(selector).iphoneStyle({
                checkedLabel : checked,
                uncheckedLabel : unchecked,
                width: 200
            });
        }
    };

    // For each row, update the retail price mapping value
    // in span and hidden input
    var rebuildDatasourceMapping = function () {
        $.each($('#siteMappingSortable tbody tr'), function (i, e) {
            // Update span text
            $(e).find('span.siteMappingValue').text(i + 1);

            // Update hidden element value
            $(e).find('input[name*="retailPriceMapping"]').val(i + 1);
        });
    };

    // Resets the brand count based on number of divs in container
    var updateBrandCount = function () {
        $('#brandCount').text($("div.selectedBrands div").length);
    };

    // Resets the typeahead, disables the add button and resets the data attr
    var resetSearchBox = function () {
        $('#datasourceLookup').val('');
        $('.addSiteBtn').addClass('disabled').data('selected-ds', '');
    };

    // Returns boolean indicating the presence of one or more sites in the UI
    var sitesHaveBeenSelected = function () {
        return ($('#siteMappingSortable tbody tr').length);
    };

    // Returns boolean indicating the presence of one or more brands in the UI
    var brandsHaveBeenSelected = function () {
        return ($("div.selectedBrands").has('div').length) ? true : false;
    };

    // Toggles visibility of table and no sites div based on existence of
    // rows in table
    var toggleNoSitesAlert = function () {

        var tableElement = $('#siteMappingSortable'),
            alertElement = $('div.noSitesDiv');

        if (sitesHaveBeenSelected()) {
            // Make sure that the table is visible and the alert is hidden
            if (tableElement.is(':hidden')) {
                tableElement.show();
            }
            if (alertElement.is(':visible')) {
                alertElement.hide();
            }
        } else {
            // Make sure that the table is hidden and the alert is visible
            if (alertElement.is(':hidden')) {
                alertElement.show();
            }
            if (tableElement.is(':visible')) {
                tableElement.hide();
            }
        }
    };

    // Toggles visibility of no brands div based on existence of brand divs
    var toggleNoBrandsAlert = function () {

        var alertElement = $('div.noBrandsDiv');

        if (brandsHaveBeenSelected()) {
            // Make sure that the alert is hidden
            if (alertElement.is(':visible')) {
                alertElement.hide();
            }
        } else {
            // Make sure that the alert is visible
            if (alertElement.is(':hidden')) {
                alertElement.show();
            }
        }
    };

    // Remove site row by datasource id
    var removeSiteBtnRow = function (datasourceId) {
        $('tr[data-datasource-id="' + datasourceId + '"]').remove();
        // Toggle table/alert
        toggleNoSitesAlert();
    };

    // Method that adds a new site row using template and
    // datasource object that is passed as an argument
    var addSiteRow = function (datasource) {
        // Get index to use for new form elements
        var nextInputIndex = ++siteIndex;

        // Get template content, replace __index__ with new index
        // and delimit inputs by comma
        var zf2Template = $('#zf2SiteTemplate span[data-template]').data('template');
        zf2Template = zf2Template.replace(/__index__/g, nextInputIndex);
        zf2Template = zf2Template.replace('<fieldset>', '');
        zf2Template = zf2Template.replace('</fieldset>', '');
        zf2Template = zf2Template.replace(/></g, '>,<');

        var pieces = zf2Template.split(','),
            newInputs = [],
        // Reg ex to extract input name without collection prefixes
            regExMatch = new RegExp(/name="([a-zA-Z]*\[[a-zA-Z]*\]\[\d+\])\[([a-zA-Z]*)\]"/),
            matchesArray = [],
            inputPrepend = '';
        // For each item in the template, create a jQuery Object
        // and add it to the newInputs array with the input name as the key
        $.each(pieces, function (i, v) {
            matchesArray = regExMatch.exec(v);
            newInputs[matchesArray[2]] = $(v);
            // On the last loop, set additional variables
            if (i === pieces.length - 1) {
                inputPrepend = matchesArray[1];
            }
        });

        // Clone actual html template row
        var newRow = $('.template_table tbody tr').clone();

        // Set zf2 form elements
        newInputs.datasourceId.val(datasource.id);
        newInputs.userId.val($('input[name="primary_user_id"]').val());
        newRow.find('td input[name="datasourceId"]')
                .replaceWith(newInputs.datasourceId);
        newRow.find('td input[name="retailPriceMapping"]')
                .replaceWith(newInputs.retailPriceMapping);
        newRow.find('td input[name="premium"]').replaceWith(newInputs.premium);
        newRow.find('td input[name="userId"]').replaceWith(newInputs.userId);

        // Set non-ZF2 form elements
        newRow.data('datasource-id', datasource.id);
        newRow.attr('data-datasource-id', datasource.id);
        newRow.find('td input[name="datasourceName"]').val(datasource.name)
                .attr('name', inputPrepend + '[datasourceName]');
        newRow.find('td input[name="datasourceLocation"]').val(datasource.location)
                .attr('name', inputPrepend + '[datasourceLocation]');
        newRow.find('td input[name="datasourceSiteCode"]').val(datasource.siteCode)
                .attr('name', inputPrepend + '[datasourceSiteCode]');
        newRow.find('td input[name="datasourceTyreBaseStatus"]').val(datasource.tyreBaseStatus)
                .attr('name', inputPrepend + '[datasourceTyreBaseStatus]');

        newRow.appendTo('#siteMappingSortable tbody');

        // Toggle table/alert
        toggleNoSitesAlert();

        // Enable iPhone toggle in new row (refreshes all toggles on page)
        setIphoneToggle('#siteMappingSortable .iphone-toggle', 'YES', 'NO');

        // Make sure numbering is still correct
        rebuildDatasourceMapping();

    };

    // Method that adds a new brand using template and
    // brand object that is passed as an argument
    var addBrandDiv = function (brand) {
        // Get index to use for new form elements
        var nextInputIndex = ++brandIndex;

        // Get template content, replace __index__ with new index
        // and delimit inputs by comma
        var zf2Template = $('#zf2BrandTemplate span[data-template]').data('template');
        zf2Template = zf2Template.replace(/__index__/g, nextInputIndex);
        zf2Template = zf2Template.replace('<fieldset>', '');
        zf2Template = zf2Template.replace('</fieldset>', '');
        zf2Template = zf2Template.replace(/></g, '>,<');

        var pieces = zf2Template.split(','),
            newInputs = [],
        // Reg ex to extract input name without collection prefixes
            regExMatch = new RegExp(/name="([a-zA-Z]*\[[a-zA-Z]*\]\[\d+\])\[([a-zA-Z]*)\]"/),
            matchesArray = [];
        // For each item in the template, create a jQuery Object
        // and add it to the newInputs array with the input name as the key
        $.each(pieces, function (i, v) {
            matchesArray = regExMatch.exec(v);
            newInputs[matchesArray[2]] = $(v);
        });

        // Clone actual html template div
        var newDiv = $('.brand_template_div div').clone();

        // Set zf2 form element values
        newInputs.brandId.val(brand.id);
        newInputs.userId.val($('input[name="primary_user_id"]').val());

        // Add newInputs to the new div
        newDiv.append(newInputs.brandId);
        newDiv.append(newInputs.userId);

        // Add data to div
        newDiv.data('brand-id', brand.id);
        newDiv.attr('data-brand-id', brand.id);

        // Update Button Text for Brand
        newDiv.find('.dummyBrandBtn').text(' ' + brand.name + ' (' + brand.id + ')');

        // Append new div to selected brands
        $('div.selectedBrands').append(newDiv);
    };

    // Remove site row by datasource id
    var removeBrandDiv = function (brandElement) {
        brandElement.remove();
        updateBrandCount();
        toggleNoBrandsAlert();
    };

    // Enable remove site button
    $('#siteMappingSortable').on('click', '.removeSiteBtn', function (e) {
        e.preventDefault();
        removeSiteBtnRow($(this).parent().parent('tr').data('datasource-id'));
        rebuildDatasourceMapping();
    });

    // Enable add site button
    $('.addSiteBtn').on('click', function (e) {
        e.preventDefault();
        // Make sure button is enabled before continuing
        if ($(this).hasClass('disabled')) {
            return false;
        }

        // Get datasource info from data attribute on button
        var datasourceInfo = $(this).data('selected-ds');

        // Make sure datasource doesn't already exist
        if ($('tr[data-datasource-id="' + datasourceInfo.id + '"]').length) {
            alert('This datasource has already been added.');
            return false;
        }

        // Get the number of sites for user
        var siteCount = $('tr[data-datasource-id]').length;

        // Check if number of sites is over the current threshold of 40
        if (siteCount >= 41) {
            alert('This user has reached the max number of sites allowed (40)');
            return false;
        }

        // Set location node
        datasourceInfo.location = '';
        if (datasourceInfo.national) {
            datasourceInfo.location = 'National';
        } else {
            if (datasourceInfo.city !== '') {
                datasourceInfo.location = datasourceInfo.city;
            }
            if (datasourceInfo.zipCode !== '') {
                if (datasourceInfo.city !== '') {
                    datasourceInfo.location += ' ';
                }
                datasourceInfo.location += datasourceInfo.zipCode;
            }
        }

        // Generate a new UI row with selected datasource
        addSiteRow(datasourceInfo);

        // Reset search
        resetSearchBox();

    });

    // Enable select all brands button
    $('button[name="selectAllBrands"]').on('click', function (e) {
        e.preventDefault();

        // Clear brand list
        $('div.selectedBrands').html('');

        // Create brand object for All Brands
        var brand = {
            id: '0',
            name: 'All Brands'
        };

        // Add new brand to list
        addBrandDiv(brand);

        // Update brand Count
        updateBrandCount();

        // Remove noBrandsAlert, if present
        toggleNoBrandsAlert();
    });

    // Capture change of select event to toggle add button
    $('select[name="allBrands"]').chosen().change(function (e, params) {
        // Toggle Add Button
        var addBrandBtn = $('button[name="addBrandBtn"]');
        if (params.selected !== '') {
            if (addBrandBtn.is(':hidden')) {
                addBrandBtn.show();
            }
        } else {
            if (addBrandBtn.is(':visible')) {
                addBrandBtn.hide();
            }
        }
    });

    // Enable add brand button
    $('button[name="addBrandBtn"]').on('click', function (e) {
        e.preventDefault();
        var brand = {
            id: $('select[name="allBrands"]').val(),
            name: $('select[name="allBrands"] option:selected').text()
        };

        // Make sure brand doesn't already exist in list
        if ($('div[data-brand-id="' + brand.id + '"]').length) {
            alert('This brand has already been added.');
            return false;
        }

        // Add new brand to list
        addBrandDiv(brand);

        // Update brand Count
        updateBrandCount();

        // Remove noBrandsAlert, if present
        toggleNoBrandsAlert();
    });

    // Enable clear all brands button
    $('button[name="clearAllBrands"]').on('click', function (e) {
        e.preventDefault();
        // Remove all selected brands from div container
        $('div.selectedBrands').html('');
        updateBrandCount();
        toggleNoBrandsAlert();
    });

    // Enable clear typeahead button
    $('.clearTypeaheadBtn').on('click', function (e) {
        e.preventDefault();
        resetSearchBox();
    });

    // Ignore clicks on brand buttons
    $('.selectedBrands').on('click', '.dummyBrandBtn', function (e) {
        e.preventDefault();
    });

    // Enable click on removing a brand
    $('.selectedBrands').on('click', '.removeBrandBtn', function (e) {
        e.preventDefault();
        removeBrandDiv($(this).parent('div'));
    });

    // Enable drag and drop reordering of sites
    $('#siteMappingSortable tbody').sortable({
        revert: true,
        items: "> tr",
        update: function () {
            // Update ds mapping on each drag and drop
            rebuildDatasourceMapping();
        }
    }).disableSelection();

    // Convert any checkboxes to iphone toggles
    setIphoneToggle('#siteMappingSortable .iphone-toggle', 'YES', 'NO');

    // Placeholders for returned data
    var datasources = {},
        datasourceLabels = [];

    $.typeahead({
        input: '#datasourceLookup',
        template: "{{label}}",
        minLength: 2,
        maxItem: 0,
        searchOnFocus: false,
        dynamic: true,
        highlight: true,
        source: {
            datasource: {
                display: 'label',
                ajax: function() {
                    return {
                        type: 'post',
                        dataType: 'json',
                        url: '/rpc/ajax/datasourceAutocomplete',
                        data: {
                            query: "{{query}}",
                        },
                        success: function(result) {
                            // Reset variables
                            datasources = {};
                            datasourceLabels = [];

                            $.each(result, function (index, item) {
                                // Add the label to the display array
                                datasourceLabels.push(item.label);

                                // Also store a mapping to get from label back to object
                                datasources[item.label] = item;
                            });
                        }
                    };
                }
            }
        },
        callback: {
            onNavigateAfter: function (node, lis, a, item, query, event) {
                if ([38,40].indexOf(event.keyCode) >= 0) {
                    var resultList = node.closest("form").find("ul.typeahead__list"),
                        activeLi = lis.filter("li.active"),
                        offsetTop = activeLi[0] &&
                            activeLi[0].offsetTop - (resultList.height() / 2) ||
                            0;

                    resultList.scrollTop(offsetTop);
                }

            },
            onClickAfter: function(node) {
                // Check for empty Search box
                var item = $(node).val();
                if (item === '') {
                    $('.addSiteBtn').addClass('disabled').data('selected-ds', '');
                } else {
                    // Remove disabled class from add button and save datsource info
                    // as a data property on the button
                    $('.addSiteBtn').removeClass('disabled')
                            .data('selected-ds', datasources[item]);
                }
            }
        }
    });

    var disableSubmit = function () {
        var submitBtn = $('input[type="submit"]');
        submitBtn.addClass('disabled').attr('disabled', 'disabled');
    };

    var enableSubmit = function () {
        var submitBtn = $('input[type="submit"]');
        submitBtn.removeClass('disabled').removeAttr('disabled', 'disabled');
    };

    // Capture submit event
    $('form[name="siteAndBrandForm"]').submit(function () {
        disableSubmit();
        // Have brands been selected?
        if (!brandsHaveBeenSelected()) {
            alert('You must select at least one brand.');
            enableSubmit();
            return false;
        }
        // Have sites been selected?
        if (!sitesHaveBeenSelected()) {
            alert('You must add at least one site.');
            enableSubmit();
            return false;
        }

        // No errors found, allow form to submit
        return true;
    });

});