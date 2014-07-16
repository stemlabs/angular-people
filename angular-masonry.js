/*!
* angular-masonry <%= pkg.version %>
* Pascal Hartig, weluse GmbH, http://weluse.de/
* License: MIT
*/
(function () {
  'use strict';

  angular.module('wu.masonry', [])
    .controller('MasonryCtrl', function controller($scope, $element, $timeout) 
    {
      var bricks = {};
      var schedule = [];
      var destroyed = false;
      var self = this;
      var timeout = null;
      var secondtimeout = null;

      this.preserveOrder = false;
      this.loadImages = true;

      this.scheduleMasonryOnce = function scheduleMasonryOnce() {
        var args = arguments;
        var found = schedule.filter(function filterFn(item) {
          return item[0] === args[0];
        }).length > 0;

        if (!found) {
          this.scheduleMasonry.apply(null, arguments);
        }
      };

      // Make sure it's only executed once within a reasonable time-frame in
      // case multiple elements are removed or added at once.
      this.scheduleMasonry = function scheduleMasonry() 
      {
        //cancel the timeouts if it is called before it
        if (timeout) 
        {
          $timeout.cancel(timeout);
        }

        if (secondtimeout) 
        {
          $timeout.cancel(secondtimeout);
        }

        schedule.push([].slice.call(arguments));

        timeout = $timeout(function runMasonry() 
        {
          console.log("Running Masonry");
          if (destroyed) 
          {
            return;
          }
          schedule.forEach(function scheduleForEach(args) 
          {
            $element.masonry.apply($element, args);
          });
          schedule = [];
        }, 20);

        secondtimeout = $timeout(function runMasonry() 
        {
          console.log("Second Masonry Running");
          if (destroyed) 
          {
            return;
          }
          schedule.forEach(function scheduleForEach(args) 
          {
            $element.masonry.apply($element, args);
          });
          schedule = [];
        }, 1000);
      };

      function defaultLoaded($element) 
      {
        $element.addClass('loaded');
      }

      this.appendBrick = function appendBrick(element, id) 
      {
        if (destroyed) 
        {
          return;
        }

        function _append() {
          if (Object.keys(bricks).length === 0) {
            $element.masonry('resize');
          }
          if (bricks[id] === undefined) {
            // Keep track of added elements.
            bricks[id] = true;
            defaultLoaded(element);
            $element.masonry('appended', element, true);
          }
        }

        function _layout() {
          // I wanted to make this dynamic but ran into huuuge memory leaks
          // that I couldn't fix. If you know how to dynamically add a
          // callback so one could say <masonry loaded="callback($element)">
          // please submit a pull request!
          self.scheduleMasonryOnce('layout');
        }

        if (!self.loadImages){
          _append();
          _layout();
        } else if (self.preserveOrder) {
          _append();
          element.imagesLoaded(_layout);
        } else {
          element.imagesLoaded(function imagesLoaded() 
          {
            _append();
            _layout();
          });
        }
      };

      this.removeBrick = function removeBrick(id, element) {
        if (destroyed) {
          return;
        }

        delete bricks[id];
        $element.masonry('remove', element);
        this.scheduleMasonryOnce('layout');
      };

      this.destroy = function destroy() {
        destroyed = true;

        if ($element.data('masonry')) {
          // Gently uninitialize if still present
          $element.masonry('destroy');

        }
        $scope.$emit('masonry.destroyed');

        bricks = [];
      };

      this.reload = function reload() {
        $element.masonry();
        $scope.$emit('masonry.reloaded');
      };


    }).directive('masonry', function masonryDirective() {
      return {
        restrict: 'AE',
        controller: 'MasonryCtrl',
        link: {
          pre: function preLink(scope, element, attrs, ctrl) {
            var attrOptions = scope.$eval(attrs.masonry || attrs.masonryOptions);
            var options = angular.extend({
              itemSelector: attrs.itemSelector || '.masonry-brick',
              columnWidth: parseInt(attrs.columnWidth, 10) || attrs.columnWidth
            }, attrOptions || {});
            element.masonry(options);
            var loadImages = scope.$eval(attrs.loadImages);
            ctrl.loadImages = loadImages !== false;
            var preserveOrder = scope.$eval(attrs.preserveOrder);
            ctrl.preserveOrder = (preserveOrder !== false && attrs.preserveOrder !== undefined);

            scope.$emit('masonry.created', element);
            scope.$on('$destroy', ctrl.destroy);
            scope.$watch(function() {
              var childrenText = element.html();
              return childrenText;
            }, function()
            { 
              ctrl.scheduleMasonryOnce('reloadItems');
              ctrl.scheduleMasonryOnce('layout');
            });
          }
        }
      };
    }).directive('masonryBrick', function masonryBrickDirective() {
      return {
        restrict: 'AC',
        require: '^masonry',
        scope: true,
        link: {
          pre: function preLink(scope, element, attrs, ctrl) {
            var id = scope.$id, index;
            ctrl.appendBrick(element, id);
            element.on('$destroy', function () 
            {
              ctrl.removeBrick(id, element);
            });

            scope.$on('masonry.reload', function () {
              ctrl.scheduleMasonryOnce('reloadItems');
              ctrl.scheduleMasonryOnce('layout');
            });
            
          }
        }
      };
    });
}());
$(document).on('click', '.panel-heading span.clickable', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    }
})