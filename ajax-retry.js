$(function(){

    var oldAjax = $.ajax;

    $.ajax = function (settings) {
        var defaults = {
            maxTries: 0,
            interval: 0,
            onRetry: function(){}
        }
        settings = $.extend({}, defaults, settings);
        return new AjaxRetry(settings);
    }

    // Constructor for our retry-able ajax calls
    function AjaxRetry(settings) {
        var completedTries = 0;
        var maxTries = typeof settings.maxTries === "number" ? settings.maxTries : 0;
        var interval = typeof settings.interval === "number" ? settings.interval : 0;
        var onRetry = settings.onRetry;

        return tryAjax().promise();

        function tryAjax(deferred) {
            var d = deferred || $.Deferred();
            oldAjax(settings)
                .done(function(data) {
                    completedTries++;
                    d.resolve(data);
                })
                .fail(function(error) {
                    completedTries++;
                    if (completedTries < maxTries) {
                        onRetry();
                        setTimeout(function(){
                            tryAjax(d);
                        }, interval);
                    } else {
                        d.reject(error);
                    }
                });
            return d;
        }
    }
});
