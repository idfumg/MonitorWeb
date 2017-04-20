onmessage = function(e) {
    var logs = e.data;
    var text = '';

    for (name in logs)
        logs[name].forEach(function(record) {
            text += '<p>' + record['time'] + ' ' + record['text'] + '</p>';
        });
    postMessage({logs_dom: text, logs: e.data});
}
