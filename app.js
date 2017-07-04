function EventHandler() {
    if(!(this instanceof EventHandler)) {
        throw new Error('EventHandler : bad instance');
    }

    this.scrollCallStack   = {};
    this.rotationCallStack = {};
    this.orientation       = void(0);
    this.getOrientation    = function() {
        return this.orientation;
    };
}

EventHandler.prototype.execByFnName = function(functionName, context) {
    var args       = Array.prototype.slice.call(arguments, 2),
        namespaces = functionName.split("."),
        func       = namespaces.pop();

    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }

    return context[func].apply(context, args);
};

EventHandler.prototype.debouncer = function(func , timeout) {
    var timeoutID ,
        timeout = timeout || 200;

    return function () {
        var scope = this , args = arguments;
        clearTimeout( timeoutID );
        timeoutID = setTimeout( function () {
            func.apply( scope , Array.prototype.slice.call( args ) );
        }, timeout );
    }
};

EventHandler.prototype.scroll = function() {
    var scrollStatus = false,
        self         = this;

    function scrollState() {
        scrollStatus = true;
    }

    function scrollEvent() {
        var scrollAction;

        window.onscroll = scrollState;

        scrollAction = setInterval(function() {
            if (scrollStatus === true) {
                scrollStatus = false;

                for (var prop in self.scrollCallStack) {
                    if(self.scrollCallStack.hasOwnProperty(prop)) {
                        self.execByFnName(prop, self.scrollCallStack);
                    }
                }

            }
        }, 150);
    }

    scrollEvent();

    return this;
};

EventHandler.prototype.rotationDevice = function() {
    var $window           = window,
        self              = this,
        screenOrientation = 'portrait',
        currentOrientation,
        windowWidth,
        windowHeight;

    //__Init screenOrientation value
    if ($window.outerWidth > $window.outerHeight) {
        screenOrientation = 'landscape';
    }

    $window.onresize = self.debouncer(function() {
        windowWidth = $window.outerWidth;
        windowHeight = $window.outerHeight;
        currentOrientation = 'portrait';

        if (windowWidth > windowHeight) {
            currentOrientation = 'landscape';
        }

        //__If device rotation has changed => execute callback
        if (screenOrientation !== currentOrientation
        ) {
            this.orientation = currentOrientation;

            for (var prop in self.rotationCallStack) {
                if (self.rotationCallStack.hasOwnProperty(prop)) {
                    self.execByFnName(prop, self.rotationCallStack, currentOrientation);
                }
            }
        }

        screenOrientation = this.orientation = currentOrientation;
    }).bind(self);

    return this;
};

$(function() {
    //__Instance eventHandler function
    var eventHandler = new EventHandler();

    //__Push event callbacks for execution in call stack
    eventHandler.scrollCallStack['stickyMenu'] = function() {
        console.log('event scroll stickyMenu');
    };
    eventHandler.scrollCallStack['stickyRangeDate'] = function() {
        console.log('event scroll stickyRangeDate');
    };

    eventHandler.rotationCallStack['RotationOne'] = function() {
        //__Access to orientation device value
        console.log(eventHandler.getOrientation());

        console.log('event rotation One');
    };
    eventHandler.rotationCallStack['RotationTwo'] = function() {
        console.log('event rotation Two');
    };

    //__Execute Event
    eventHandler
        .scroll()
        .rotationDevice();
});
