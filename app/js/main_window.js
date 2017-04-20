function MainWindow(params) {
    var self = this;

    /* Public methods */
    self.append = _append;
    self.append_ws = _append_ws;
    self.prepend = _prepend;
    self.clean = _clean;

    /* Public attributes */
    self.page = null;
    self.total_pages = null;
    self.autoscroll = true;
    self.is_search = false;
    self.is_events = false;

    /* Initialize */
    _setup();

    function _append_ws(data, logs) {
        if (!self.is_search) {
            params.main_window.append(data);
            params.scrollbar.perfectScrollbar('update');
            if (self.autoscroll)
                params.scrollbar.scrollTop(params.scrollbar[0].scrollHeight*2);
        }
    }

    function _append(data, logs) {
        self.page = logs.page;
        self.total_pages = logs.total_pages;
        params.main_window.append(data);
        params.scrollbar.perfectScrollbar('update');
        params.scrollbar.scrollTop(params.scrollbar[0].scrollHeight*2);
    }

    function _prepend(data, logs) {
        self.page = logs.page;
        self.total_pages = logs.total_pages;
        params.scrollbar.prepend(data);
        params.scrollbar.perfectScrollbar('update');
        if (data.length !== 0)
            params.scrollbar.scrollTop(params.scrollbar.height());
    }

    function _setup() {
        console.log('Setup main-window container...');
        params.scrollbar.perfectScrollbar({
            wheelSpeed: 2,
            wheelPropagation: true,
            minScrollbarLength: 30
        });
        params.scrollbar.perfectScrollbar('update');
        params.scrollbar.on('ps-scroll-up', function(e) {
            if ($(this).scrollTop() < $(this).height() && self.page !== 0)
                params.scroll_up_callback(self.page - 1);
            self.autoscroll = false;
        });

        params.scrollbar.on('ps-scroll-down', function(e) {
            var scrollTop = params.scrollbar.scrollTop();
            var scrollHeight = params.scrollbar[0].scrollHeight;
            var element_height = params.scrollbar.height();

            if (Math.ceil(scrollTop + element_height) >= scrollHeight)
                self.autoscroll = true;
        });

        params.main_window.click(function(e) {
            params.main_window_click_callback(e);
        });
    }

    function _clean() {
        params.main_window.html("");
    }
}
