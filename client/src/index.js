function initializeCarousel(name, itemClass) {
  var slides;
  var slideCount;
  var slideWidth;
  var tracker;
  var container;
  var currentPostion = 0;
  var currentSlide = 0;

  var wrapper = document.querySelector(name);
  if (wrapper) {
      container = document.querySelector('.js-container');
      if (container) {
          tracker = document.querySelector('.js-tracker', container);
          var prev = document.querySelector('.js-arrow-left', container);
          var next = document.querySelector('.js-arrow-right', container);
          var customClearfix = document.querySelector('.custom-clearfix', container);
          var isEditMode = customClearfix ? !!$(customClearfix).data('hide') : false;

          slides = document.querySelectorAll(itemClass, container.children);
          slideCount = slides.length;

          if (slideCount && slides[0].children.length && !isEditMode) {
              attachTrackerItems();

              slideWidth = slides[0].children[0].clientWidth;
              container.style.width = parseInt(slideWidth * slideCount) + 'px';

              if (prev) {
                  prev.onclick = onClickPrev.bind(this);
              }
              if (next) {
                  next.onclick = onClickNext.bind(this);
              }
          } else {
              container.style.width = container.parentNode.clientWidth + 'px';
          }
      }
  }

  $(window).resize(function () {
      var customClearfix = document.querySelector('.custom-clearfix', container);
      var isEditMode = customClearfix ? !!$(customClearfix).data('hide') : false;

      if (slides && slides.length && slides[0].children && slides[0].children.length && !isEditMode) {
          slideWidth = slides[0].children[0].clientWidth;
          container.style.width = parseInt(slideWidth * slideCount) + 'px';
      } else {
          container.style.width = container.parentNode.clientWidth + 'px';
      }

      slideTo(currentSlide);
  });

  function animate (options) {
      var start = Date.now();
      var id = setInterval(function () {
          var timePassed = Date.now() - start;
          var progress = timePassed / options.duration;
          if (progress > 1) {
              progress = 1;
          }
          var delta = options.delta(progress);
          options.step(delta);
          if (progress == 1) {
              clearInterval(id);
              options.callback();
          }
      }, options.delay || 17);
  }

  function slideTo(number) {
      if (tracker && tracker.children && tracker.children.length) {
          $(tracker.children).removeClass('active');
          $(tracker.children[number]).addClass('active');
          currentSlide = number;
      }

      var slideNumber = Math.abs(number - currentSlide);
      var direction = currentSlide > number ? 1 : -1;

      currentPostion = -1 * currentSlide * slideWidth;

      $(container).animate({
          left: parseInt(currentPostion + direction * slideWidth * slideNumber) + 'px'
      }, {
          easing: 'swing',
          duration: 400,
          complete: function() {
              currentSlide = number;
          }
      });
  }

  function onClickPrev() {
      if (currentSlide == 0){
          slideTo(slideCount - 1);
      } else {
          slideTo(currentSlide - 1);
      }
  }

  function onClickNext() {
      if (currentSlide == slideCount - 1) {
          slideTo(0);
      } else {
          slideTo(currentSlide + 1);
      }
  }

  function attachTrackerItems() {
      if (slideCount && tracker) {
          var jTracker = $(tracker);
          for (i = 1; i < slideCount; i++) {
              var clone = jTracker
                  .children()
                  .first()
                  .clone()
                  .removeClass('active')
                  .attr('data-item', i);
              jTracker.append(clone);
          }

          $('.js-tracker-item', jTracker).click(function () {
              slideTo(Number($(this).attr('data-item')));
          });
      }
  }
}