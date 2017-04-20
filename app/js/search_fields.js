function SearchFields(params) {

var self = this;

/* Public methods */
self.get_search_text = _get_search_text;
self.first_date = null;
self.last_date = null;

/* Initialize */
_setup_search_fields();

function _get_search_text() {
    return $('.search-text').val();
}

function _setup_search_fields() {
    console.log('Setup search fields container...');

    $('.search-button').click(function() {
        if (params.search_fields.hasClass('active')) {
            $('.search-text').val('');
        }
        params.search_fields.toggleClass('active');
        $('.search-button').toggleClass('setted');
    });
    $('.connect-button').click(function() {
        if ($(this).hasClass('connected'))
            params.connect_button_disconnected_callback();
        else
            params.connect_button_connected_callback();
    });
    $('.search-text').keypress(function(e) {
        if (e.which == 13) {
            params.search_text_callback(self.get_search_text(),
                                        self.first_date,
                                        self.last_date);
            e.preventDefault();
        }
    });
    $('#datetimerange-container').dateRangePicker({
        autoClose: false,
        inline: true,
        alwaysOpen: true,
        format: 'YYYY-MM-DD',
        language: 'en',
        startOfWeek: 'monday',
        time: {
            enabled: true
        },
        container: '#datetimerange-container',
        hoveringTooltip: false,
        showTopbar: false,
        startDate: false,
        endDate: false,
        customOpenAnimation: function(cb) {
    		$(this).fadeIn(0, cb);
    	},
    	customCloseAnimation: function(cb) {
    		return;
    	},
        defaultTime: moment().startOf('day').toDate(),
	    defaultEndTime: moment().endOf('day').toDate()
    })
    .bind('datepicker-change', function(e, obj) {
        self.first_date = obj.date1;
        self.last_date = obj.date2;
        $('.calendar-button').addClass('setted');
    });

    $('.calendar-button').click(function() {
        params.calendar_button_clicked_callback();
    });

    $('.container.datetime .discard').click(function() {
        $('.container.datetime').toggleClass('active-container');
        if (self.first_date && self.last_date) {
            $('#datetimerange-container').data('dateRangePicker').resetMonthsView();
            $('#datetimerange-container').data('dateRangePicker').clear();
            self.first_date = null;
            self.last_date = null;
        }
        $('.calendar-button').removeClass('setted');
    });

}

}
