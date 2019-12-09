'use strict';
!function($) {
  var defaults = {
    mode : "fade",
    slideSelector : "",
    infiniteLoop : true,
    hideControlOnEnd : false,
    speed : 500,
    easing : null,
    slideMargin : 0,
    startSlide : 0,
    randomStart : false,
    captions : false,
    ticker : false,
    tickerHover : false,
    adaptiveHeight : false,
    adaptiveHeightSpeed : 500,
    video : false,
    useCSS : true,
    preloadImages : "visible",
    responsive : true,
    slideZIndex : 50,
    wrapperClass : "bx-wrapper",
    touchEnabled : true,
    swipeThreshold : 50,
    oneToOneTouch : true,
    preventDefaultSwipeX : true,
    preventDefaultSwipeY : false,
    ariaLive : true,
    ariaHidden : true,
    keyboardEnabled : false,
    pager : true,
    pagerType : "full",
    pagerShortSeparator : " / ",
    pagerSelector : null,
    buildPager : null,
    pagerCustom : null,
    controls : true,
    nextText : "Next",
    prevText : "Prev",
    nextSelector : null,
    prevSelector : null,
    autoControls : false,
    startText : "Start",
    stopText : "Stop",
    autoControlsCombine : false,
    autoControlsSelector : null,
    auto : false,
    pause : 4e3,
    autoStart : true,
    autoDirection : "next",
    stopAutoOnClick : false,
    autoHover : false,
    autoDelay : 0,
    autoSlideForOnePage : false,
    minSlides : 1,
    maxSlides : 1,
    moveSlides : 0,
    slideWidth : 0,
    shrinkItems : false,
    onSliderLoad : function() {
      return true;
    },
    onSlideBefore : function() {
      return true;
    },
    onSlideAfter : function() {
      return true;
    },
    onSlideNext : function() {
      return true;
    },
    onSlidePrev : function() {
      return true;
    },
    onSliderResize : function() {
      return true;
    }
  };
  /**
   * @param {!Array} options
   * @return {?}
   */
  $.fn.bxSlider = function(options) {
    if (0 === this.length) {
      return this;
    }
    if (this.length > 1) {
      return this.each(function() {
        $(this).bxSlider(options);
      }), this;
    }
    var slider = {};
    var el = this;
    var mode = $(window).width();
    var protocol = $(window).height();
    if (!$(el).data("bxSlider")) {
      /**
       * @return {undefined}
       */
      var init = function() {
        if (!$(el).data("bxSlider")) {
          slider.settings = $.extend({}, defaults, options);
          /** @type {number} */
          slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
          slider.children = el.children(slider.settings.slideSelector);
          if (slider.children.length < slider.settings.minSlides) {
            slider.settings.minSlides = slider.children.length;
          }
          if (slider.children.length < slider.settings.maxSlides) {
            slider.settings.maxSlides = slider.children.length;
          }
          if (slider.settings.randomStart) {
            /** @type {number} */
            slider.settings.startSlide = Math.floor(Math.random() * slider.children.length);
          }
          slider.active = {
            index : slider.settings.startSlide
          };
          /** @type {boolean} */
          slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1;
          if (slider.carousel) {
            /** @type {string} */
            slider.settings.preloadImages = "all";
          }
          /** @type {number} */
          slider.minThreshold = slider.settings.minSlides * slider.settings.slideWidth + (slider.settings.minSlides - 1) * slider.settings.slideMargin;
          /** @type {number} */
          slider.maxThreshold = slider.settings.maxSlides * slider.settings.slideWidth + (slider.settings.maxSlides - 1) * slider.settings.slideMargin;
          /** @type {boolean} */
          slider.working = false;
          slider.controls = {};
          /** @type {null} */
          slider.interval = null;
          /** @type {string} */
          slider.animProp = "vertical" === slider.settings.mode ? "top" : "left";
          slider.usingCSS = slider.settings.useCSS && "fade" !== slider.settings.mode && function() {
            /** @type {!Element} */
            var div = document.createElement("div");
            /** @type {!Array} */
            var props = ["WebkitPerspective", "MozPerspective", "OPerspective", "msPerspective"];
            /** @type {number} */
            var i = 0;
            for (; i < props.length; i++) {
              if (void 0 !== div.style[props[i]]) {
                return slider.cssPrefix = props[i].replace("Perspective", "").toLowerCase(), slider.animProp = "-" + slider.cssPrefix + "-transform", true;
              }
            }
            return false;
          }();
          if ("vertical" === slider.settings.mode) {
            slider.settings.maxSlides = slider.settings.minSlides;
          }
          el.data("origStyle", el.attr("style"));
          el.children(slider.settings.slideSelector).each(function() {
            $(this).data("origStyle", $(this).attr("style"));
          });
          setup();
        }
      };
      /**
       * @return {undefined}
       */
      var setup = function() {
        var preloadSelector = slider.children.eq(slider.settings.startSlide);
        el.wrap('<div class="' + slider.settings.wrapperClass + '"><div class="bx-viewport"></div></div>');
        slider.viewport = el.parent();
        if (slider.settings.ariaLive && !slider.settings.ticker) {
          slider.viewport.attr("aria-live", "polite");
        }
        slider.loader = $('<div class="bx-loading" />');
        slider.viewport.prepend(slider.loader);
        el.css({
          width : "horizontal" === slider.settings.mode ? 1e3 * slider.children.length + 215 + "%" : "auto",
          position : "relative"
        });
        if (slider.usingCSS && slider.settings.easing) {
          el.css("-" + slider.cssPrefix + "-transition-timing-function", slider.settings.easing);
        } else {
          if (!slider.settings.easing) {
            /** @type {string} */
            slider.settings.easing = "swing";
          }
        }
        slider.viewport.css({
          width : "100%",
          overflow : "hidden",
          position : "relative"
        });
        slider.viewport.parent().css({
          maxWidth : getViewportMaxWidth()
        });
        slider.children.css({
          float : "horizontal" === slider.settings.mode ? "left" : "none",
          listStyle : "none",
          position : "relative"
        });
        slider.children.css("width", getSlideWidth());
        if ("horizontal" === slider.settings.mode && slider.settings.slideMargin > 0) {
          slider.children.css("marginRight", slider.settings.slideMargin);
        }
        if ("vertical" === slider.settings.mode && slider.settings.slideMargin > 0) {
          slider.children.css("marginBottom", slider.settings.slideMargin);
        }
        if ("fade" === slider.settings.mode) {
          slider.children.css({
            position : "absolute",
            zIndex : 0,
            display : "none"
          });
          slider.children.eq(slider.settings.startSlide).css({
            zIndex : slider.settings.slideZIndex,
            display : "block"
          });
        }
        slider.controls.el = $('<div class="bx-controls" />');
        if (slider.settings.captions) {
          appendCaptions();
        }
        /** @type {boolean} */
        slider.active.last = slider.settings.startSlide === getPagerQty() - 1;
        if (slider.settings.video) {
          el.fitVids();
        }
        if ("all" === slider.settings.preloadImages || slider.settings.ticker) {
          preloadSelector = slider.children;
        }
        if (slider.settings.ticker) {
          /** @type {boolean} */
          slider.settings.pager = false;
        } else {
          if (slider.settings.controls) {
            appendControls();
          }
          if (slider.settings.auto && slider.settings.autoControls) {
            appendControlsAuto();
          }
          if (slider.settings.pager) {
            appendPager();
          }
          if (slider.settings.controls || slider.settings.autoControls || slider.settings.pager) {
            slider.viewport.after(slider.controls.el);
          }
        }
        loadElements(preloadSelector, start);
      };
      /**
       * @param {!Object} selector
       * @param {!Function} callback
       * @return {?}
       */
      var loadElements = function(selector, callback) {
        var includesLength = selector.find('img:not([src=""]), iframe').length;
        /** @type {number} */
        var includesLoaded = 0;
        return 0 === includesLength ? void callback() : void selector.find('img:not([src=""]), iframe').each(function() {
          $(this).one("load error", function() {
            if (++includesLoaded === includesLength) {
              callback();
            }
          }).each(function() {
            if (this.complete) {
              $(this).trigger("load");
            }
          });
        });
      };
      /**
       * @return {undefined}
       */
      var start = function() {
        if (slider.settings.infiniteLoop && "fade" !== slider.settings.mode && !slider.settings.ticker) {
          var i = "vertical" === slider.settings.mode ? slider.settings.minSlides : slider.settings.maxSlides;
          var sliceAppend = slider.children.slice(0, i).clone(true).addClass("bx-clone");
          var slicePrepend = slider.children.slice(-i).clone(true).addClass("bx-clone");
          if (slider.settings.ariaHidden) {
            sliceAppend.attr("aria-hidden", true);
            slicePrepend.attr("aria-hidden", true);
          }
          el.append(sliceAppend).prepend(slicePrepend);
        }
        slider.loader.remove();
        setSlidePosition();
        if ("vertical" === slider.settings.mode) {
          /** @type {boolean} */
          slider.settings.adaptiveHeight = true;
        }
        slider.viewport.height(getViewportHeight());
        el.redrawSlider();
        slider.settings.onSliderLoad.call(el, slider.active.index);
        /** @type {boolean} */
        slider.initialized = true;
        if (slider.settings.responsive) {
          $(window).bind("resize", resizeWindow);
        }
        if (slider.settings.auto && slider.settings.autoStart && (getPagerQty() > 1 || slider.settings.autoSlideForOnePage)) {
          initAuto();
        }
        if (slider.settings.ticker) {
          initTicker();
        }
        if (slider.settings.pager) {
          updatePagerActive(slider.settings.startSlide);
        }
        if (slider.settings.controls) {
          updateDirectionControls();
        }
        if (slider.settings.touchEnabled && !slider.settings.ticker) {
          initTouch();
        }
        if (slider.settings.keyboardEnabled && !slider.settings.ticker) {
          $(document).keydown(keyPress);
        }
      };
      /**
       * @return {?}
       */
      var getViewportHeight = function() {
        /** @type {number} */
        var height = 0;
        var children = $();
        if ("vertical" === slider.settings.mode || slider.settings.adaptiveHeight) {
          if (slider.carousel) {
            var currentIndex = 1 === slider.settings.moveSlides ? slider.active.index : slider.active.index * getMoveBy();
            children = slider.children.eq(currentIndex);
            /** @type {number} */
            i = 1;
            for (; i <= slider.settings.maxSlides - 1; i++) {
              children = currentIndex + i >= slider.children.length ? children.add(slider.children.eq(i - 1)) : children.add(slider.children.eq(currentIndex + i));
            }
          } else {
            children = slider.children.eq(slider.active.index);
          }
        } else {
          children = slider.children;
        }
        return "vertical" === slider.settings.mode ? (children.each(function(i) {
          height = height + $(this).outerHeight();
        }), slider.settings.slideMargin > 0 && (height = height + slider.settings.slideMargin * (slider.settings.minSlides - 1))) : height = Math.max.apply(Math, children.map(function() {
          return $(this).outerHeight(false);
        }).get()), "border-box" === slider.viewport.css("box-sizing") ? height = height + (parseFloat(slider.viewport.css("padding-top")) + parseFloat(slider.viewport.css("padding-bottom")) + parseFloat(slider.viewport.css("border-top-width")) + parseFloat(slider.viewport.css("border-bottom-width"))) : "padding-box" === slider.viewport.css("box-sizing") && (height = height + (parseFloat(slider.viewport.css("padding-top")) + parseFloat(slider.viewport.css("padding-bottom")))), height;
      };
      /**
       * @return {?}
       */
      var getViewportMaxWidth = function() {
        /** @type {string} */
        var t = "100%";
        return slider.settings.slideWidth > 0 && (t = "horizontal" === slider.settings.mode ? slider.settings.maxSlides * slider.settings.slideWidth + (slider.settings.maxSlides - 1) * slider.settings.slideMargin : slider.settings.slideWidth), t;
      };
      /**
       * @return {?}
       */
      var getSlideWidth = function() {
        var newElWidth = slider.settings.slideWidth;
        var wrapWidth = slider.viewport.width();
        if (0 === slider.settings.slideWidth || slider.settings.slideWidth > wrapWidth && !slider.carousel || "vertical" === slider.settings.mode) {
          newElWidth = wrapWidth;
        } else {
          if (slider.settings.maxSlides > 1 && "horizontal" === slider.settings.mode) {
            if (wrapWidth > slider.maxThreshold) {
              return newElWidth;
            }
            if (wrapWidth < slider.minThreshold) {
              /** @type {number} */
              newElWidth = (wrapWidth - slider.settings.slideMargin * (slider.settings.minSlides - 1)) / slider.settings.minSlides;
            } else {
              if (slider.settings.shrinkItems) {
                /** @type {number} */
                newElWidth = Math.floor((wrapWidth + slider.settings.slideMargin) / Math.ceil((wrapWidth + slider.settings.slideMargin) / (newElWidth + slider.settings.slideMargin)) - slider.settings.slideMargin);
              }
            }
          }
        }
        return newElWidth;
      };
      /**
       * @return {?}
       */
      var getNumberSlidesShowing = function() {
        /** @type {number} */
        var slidesShowing = 1;
        /** @type {null} */
        var DyMilli = null;
        return "horizontal" === slider.settings.mode && slider.settings.slideWidth > 0 ? slider.viewport.width() < slider.minThreshold ? slidesShowing = slider.settings.minSlides : slider.viewport.width() > slider.maxThreshold ? slidesShowing = slider.settings.maxSlides : (DyMilli = slider.children.first().width() + slider.settings.slideMargin, slidesShowing = Math.floor((slider.viewport.width() + slider.settings.slideMargin) / DyMilli)) : "vertical" === slider.settings.mode && (slidesShowing = slider.settings.minSlides), 
        slidesShowing;
      };
      /**
       * @return {?}
       */
      var getPagerQty = function() {
        /** @type {number} */
        var pagerQty = 0;
        /** @type {number} */
        var breakPoint = 0;
        /** @type {number} */
        var counter = 0;
        if (slider.settings.moveSlides > 0) {
          if (slider.settings.infiniteLoop) {
            /** @type {number} */
            pagerQty = Math.ceil(slider.children.length / getMoveBy());
          } else {
            for (; breakPoint < slider.children.length;) {
              ++pagerQty;
              breakPoint = counter + getNumberSlidesShowing();
              counter = counter + (slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing());
            }
          }
        } else {
          /** @type {number} */
          pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
        }
        return pagerQty;
      };
      /**
       * @return {?}
       */
      var getMoveBy = function() {
        return slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
      };
      /**
       * @return {undefined}
       */
      var setSlidePosition = function() {
        var anchorBoundingBoxViewport;
        var $overlayContent;
        var i;
        if (slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop) {
          if ("horizontal" === slider.settings.mode) {
            $overlayContent = slider.children.last();
            anchorBoundingBoxViewport = $overlayContent.position();
            setPositionProperty(-(anchorBoundingBoxViewport.left - (slider.viewport.width() - $overlayContent.outerWidth())), "reset", 0);
          } else {
            if ("vertical" === slider.settings.mode) {
              /** @type {number} */
              i = slider.children.length - slider.settings.minSlides;
              anchorBoundingBoxViewport = slider.children.eq(i).position();
              setPositionProperty(-anchorBoundingBoxViewport.top, "reset", 0);
            }
          }
        } else {
          anchorBoundingBoxViewport = slider.children.eq(slider.active.index * getMoveBy()).position();
          if (slider.active.index === getPagerQty() - 1) {
            /** @type {boolean} */
            slider.active.last = true;
          }
          if (void 0 !== anchorBoundingBoxViewport) {
            if ("horizontal" === slider.settings.mode) {
              setPositionProperty(-anchorBoundingBoxViewport.left, "reset", 0);
            } else {
              if ("vertical" === slider.settings.mode) {
                setPositionProperty(-anchorBoundingBoxViewport.top, "reset", 0);
              }
            }
          }
        }
      };
      /**
       * @param {number} value
       * @param {string} type
       * @param {number} duration
       * @param {!Object} params
       * @return {undefined}
       */
      var setPositionProperty = function(value, type, duration, params) {
        var animateObj;
        var old_pos;
        if (slider.usingCSS) {
          /** @type {string} */
          old_pos = "vertical" === slider.settings.mode ? "translate3d(0, " + value + "px, 0)" : "translate3d(" + value + "px, 0, 0)";
          el.css("-" + slider.cssPrefix + "-transition-duration", duration / 1E3 + "s");
          if ("slide" === type) {
            el.css(slider.animProp, old_pos);
            if (0 !== duration) {
              el.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(jEvent) {
                if ($(jEvent.target).is(el)) {
                  el.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                  updateAfterSlideTransition();
                }
              });
            } else {
              updateAfterSlideTransition();
            }
          } else {
            if ("reset" === type) {
              el.css(slider.animProp, old_pos);
            } else {
              if ("ticker" === type) {
                el.css("-" + slider.cssPrefix + "-transition-timing-function", "linear");
                el.css(slider.animProp, old_pos);
                if (0 !== duration) {
                  el.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(jEvent) {
                    if ($(jEvent.target).is(el)) {
                      el.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                      setPositionProperty(params.resetValue, "reset", 0);
                      tickerLoop();
                    }
                  });
                } else {
                  setPositionProperty(params.resetValue, "reset", 0);
                  tickerLoop();
                }
              }
            }
          }
        } else {
          animateObj = {};
          /** @type {number} */
          animateObj[slider.animProp] = value;
          if ("slide" === type) {
            el.animate(animateObj, duration, slider.settings.easing, function() {
              updateAfterSlideTransition();
            });
          } else {
            if ("reset" === type) {
              el.css(slider.animProp, value);
            } else {
              if ("ticker" === type) {
                el.animate(animateObj, duration, "linear", function() {
                  setPositionProperty(params.resetValue, "reset", 0);
                  tickerLoop();
                });
              }
            }
          }
        }
      };
      /**
       * @return {undefined}
       */
      var populatePager = function() {
        /** @type {string} */
        var scrolltable = "";
        /** @type {string} */
        var current_tag_name = "";
        var pagerQty = getPagerQty();
        /** @type {number} */
        var i = 0;
        for (; i < pagerQty; i++) {
          /** @type {string} */
          current_tag_name = "";
          if (slider.settings.buildPager && $.isFunction(slider.settings.buildPager) || slider.settings.pagerCustom) {
            current_tag_name = slider.settings.buildPager(i);
            slider.pagerEl.addClass("bx-custom-pager");
          } else {
            /** @type {number} */
            current_tag_name = i + 1;
            slider.pagerEl.addClass("bx-default-pager");
          }
          /** @type {string} */
          scrolltable = scrolltable + ('<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + current_tag_name + "</a></div>");
        }
        slider.pagerEl.html(scrolltable);
      };
      /**
       * @return {undefined}
       */
      var appendPager = function() {
        if (slider.settings.pagerCustom) {
          slider.pagerEl = $(slider.settings.pagerCustom);
        } else {
          slider.pagerEl = $('<div class="bx-pager" />');
          if (slider.settings.pagerSelector) {
            $(slider.settings.pagerSelector).html(slider.pagerEl);
          } else {
            slider.controls.el.addClass("bx-has-pager").append(slider.pagerEl);
          }
          populatePager();
        }
        slider.pagerEl.on("click touchend", "a", clickPagerBind);
      };
      /**
       * @return {undefined}
       */
      var appendControls = function() {
        slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + "</a>");
        slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + "</a>");
        slider.controls.next.bind("click touchend", clickNextBind);
        slider.controls.prev.bind("click touchend", clickPrevBind);
        if (slider.settings.nextSelector) {
          $(slider.settings.nextSelector).append(slider.controls.next);
        }
        if (slider.settings.prevSelector) {
          $(slider.settings.prevSelector).append(slider.controls.prev);
        }
        if (!(slider.settings.nextSelector || slider.settings.prevSelector)) {
          slider.controls.directionEl = $('<div class="bx-controls-direction" />');
          slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
          slider.controls.el.addClass("bx-has-controls-direction").append(slider.controls.directionEl);
        }
      };
      /**
       * @return {undefined}
       */
      var appendControlsAuto = function() {
        slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + "</a></div>");
        slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + "</a></div>");
        slider.controls.autoEl = $('<div class="bx-controls-auto" />');
        slider.controls.autoEl.on("click", ".bx-start", clickStartBind);
        slider.controls.autoEl.on("click", ".bx-stop", clickStopBind);
        if (slider.settings.autoControlsCombine) {
          slider.controls.autoEl.append(slider.controls.start);
        } else {
          slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
        }
        if (slider.settings.autoControlsSelector) {
          $(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
        } else {
          slider.controls.el.addClass("bx-has-controls-auto").append(slider.controls.autoEl);
        }
        updateAutoControls(slider.settings.autoStart ? "stop" : "start");
      };
      /**
       * @return {undefined}
       */
      var appendCaptions = function() {
        slider.children.each(function(canCreateDiscussions) {
          var value = $(this).find("img:first").attr("title");
          if (void 0 !== value && ("" + value).length) {
            $(this).append('<div class="bx-caption"><span>' + value + "</span></div>");
          }
        });
      };
      /**
       * @param {!Event} e
       * @return {undefined}
       */
      var clickNextBind = function(e) {
        e.preventDefault();
        if (!slider.controls.el.hasClass("disabled")) {
          if (slider.settings.auto && slider.settings.stopAutoOnClick) {
            el.stopAuto();
          }
          el.goToNextSlide();
        }
      };
      /**
       * @param {!Event} e
       * @return {undefined}
       */
      var clickPrevBind = function(e) {
        e.preventDefault();
        if (!slider.controls.el.hasClass("disabled")) {
          if (slider.settings.auto && slider.settings.stopAutoOnClick) {
            el.stopAuto();
          }
          el.goToPrevSlide();
        }
      };
      /**
       * @param {!Event} e
       * @return {undefined}
       */
      var clickStartBind = function(e) {
        el.startAuto();
        e.preventDefault();
      };
      /**
       * @param {!Event} e
       * @return {undefined}
       */
      var clickStopBind = function(e) {
        el.stopAuto();
        e.preventDefault();
      };
      /**
       * @param {!Event} e
       * @return {undefined}
       */
      var clickPagerBind = function(e) {
        var pagerLink;
        var pagerIndex;
        e.preventDefault();
        if (!slider.controls.el.hasClass("disabled")) {
          if (slider.settings.auto && slider.settings.stopAutoOnClick) {
            el.stopAuto();
          }
          pagerLink = $(e.currentTarget);
          if (void 0 !== pagerLink.attr("data-slide-index")) {
            /** @type {number} */
            pagerIndex = parseInt(pagerLink.attr("data-slide-index"));
            if (pagerIndex !== slider.active.index) {
              el.goToSlide(pagerIndex);
            }
          }
        }
      };
      /**
       * @param {?} slideIndex
       * @return {?}
       */
      var updatePagerActive = function(slideIndex) {
        var totalimages = slider.children.length;
        return "short" === slider.settings.pagerType ? (slider.settings.maxSlides > 1 && (totalimages = Math.ceil(slider.children.length / slider.settings.maxSlides)), void slider.pagerEl.html(slideIndex + 1 + slider.settings.pagerShortSeparator + totalimages)) : (slider.pagerEl.find("a").removeClass("active"), void slider.pagerEl.each(function(i, mei) {
          $(mei).find("a").eq(slideIndex).addClass("active");
        }));
      };
      /**
       * @return {undefined}
       */
      var updateAfterSlideTransition = function() {
        if (slider.settings.infiniteLoop) {
          /** @type {string} */
          var t = "";
          if (0 === slider.active.index) {
            t = slider.children.eq(0).position();
          } else {
            if (slider.active.index === getPagerQty() - 1 && slider.carousel) {
              t = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
            } else {
              if (slider.active.index === slider.children.length - 1) {
                t = slider.children.eq(slider.children.length - 1).position();
              }
            }
          }
          if (t) {
            if ("horizontal" === slider.settings.mode) {
              setPositionProperty(-t.left, "reset", 0);
            } else {
              if ("vertical" === slider.settings.mode) {
                setPositionProperty(-t.top, "reset", 0);
              }
            }
          }
        }
        /** @type {boolean} */
        slider.working = false;
        slider.settings.onSlideAfter.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
      };
      /**
       * @param {string} state
       * @return {undefined}
       */
      var updateAutoControls = function(state) {
        if (slider.settings.autoControlsCombine) {
          slider.controls.autoEl.html(slider.controls[state]);
        } else {
          slider.controls.autoEl.find("a").removeClass("active");
          slider.controls.autoEl.find("a:not(.bx-" + state + ")").addClass("active");
        }
      };
      /**
       * @return {undefined}
       */
      var updateDirectionControls = function() {
        if (1 === getPagerQty()) {
          slider.controls.prev.addClass("disabled");
          slider.controls.next.addClass("disabled");
        } else {
          if (!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd) {
            if (0 === slider.active.index) {
              slider.controls.prev.addClass("disabled");
              slider.controls.next.removeClass("disabled");
            } else {
              if (slider.active.index === getPagerQty() - 1) {
                slider.controls.next.addClass("disabled");
                slider.controls.prev.removeClass("disabled");
              } else {
                slider.controls.prev.removeClass("disabled");
                slider.controls.next.removeClass("disabled");
              }
            }
          }
        }
      };
      /**
       * @return {undefined}
       */
      var initAuto = function() {
        if (slider.settings.autoDelay > 0) {
          setTimeout(el.startAuto, slider.settings.autoDelay);
        } else {
          el.startAuto();
          $(window).focus(function() {
            el.startAuto();
          }).blur(function() {
            el.stopAuto();
          });
        }
        if (slider.settings.autoHover) {
          el.hover(function() {
            if (slider.interval) {
              el.stopAuto(true);
              /** @type {boolean} */
              slider.autoPaused = true;
            }
          }, function() {
            if (slider.autoPaused) {
              el.startAuto(true);
              /** @type {null} */
              slider.autoPaused = null;
            }
          });
        }
      };
      /**
       * @return {undefined}
       */
      var initTicker = function() {
        var anchorBoundingBoxViewport;
        var componentsStr;
        var value;
        var dmgKey;
        var ratio;
        var property;
        var newSpeed;
        var totalDimens;
        /** @type {number} */
        var animateProperty = 0;
        if ("next" === slider.settings.autoDirection) {
          el.append(slider.children.clone().addClass("bx-clone"));
        } else {
          el.prepend(slider.children.clone().addClass("bx-clone"));
          anchorBoundingBoxViewport = slider.children.first().position();
          /** @type {number} */
          animateProperty = "horizontal" === slider.settings.mode ? -anchorBoundingBoxViewport.left : -anchorBoundingBoxViewport.top;
        }
        setPositionProperty(animateProperty, "reset", 0);
        /** @type {boolean} */
        slider.settings.pager = false;
        /** @type {boolean} */
        slider.settings.controls = false;
        /** @type {boolean} */
        slider.settings.autoControls = false;
        if (slider.settings.tickerHover) {
          if (slider.usingCSS) {
            /** @type {number} */
            dmgKey = "horizontal" === slider.settings.mode ? 4 : 5;
            slider.viewport.hover(function() {
              componentsStr = el.css("-" + slider.cssPrefix + "-transform");
              /** @type {number} */
              value = parseFloat(componentsStr.split(",")[dmgKey]);
              setPositionProperty(value, "reset", 0);
            }, function() {
              /** @type {number} */
              totalDimens = 0;
              slider.children.each(function(canCreateDiscussions) {
                totalDimens = totalDimens + ("horizontal" === slider.settings.mode ? $(this).outerWidth(true) : $(this).outerHeight(true));
              });
              /** @type {number} */
              ratio = slider.settings.speed / totalDimens;
              /** @type {string} */
              property = "horizontal" === slider.settings.mode ? "left" : "top";
              /** @type {number} */
              newSpeed = ratio * (totalDimens - Math.abs(parseInt(value)));
              tickerLoop(newSpeed);
            });
          } else {
            slider.viewport.hover(function() {
              el.stop();
            }, function() {
              /** @type {number} */
              totalDimens = 0;
              slider.children.each(function(canCreateDiscussions) {
                totalDimens = totalDimens + ("horizontal" === slider.settings.mode ? $(this).outerWidth(true) : $(this).outerHeight(true));
              });
              /** @type {number} */
              ratio = slider.settings.speed / totalDimens;
              /** @type {string} */
              property = "horizontal" === slider.settings.mode ? "left" : "top";
              /** @type {number} */
              newSpeed = ratio * (totalDimens - Math.abs(parseInt(el.css(property))));
              tickerLoop(newSpeed);
            });
          }
        }
        tickerLoop();
      };
      /**
       * @param {number} resumeSpeed
       * @return {undefined}
       */
      var tickerLoop = function(resumeSpeed) {
        var value;
        var resetValue;
        var params;
        var speed = resumeSpeed ? resumeSpeed : slider.settings.speed;
        var boundOffset = {
          left : 0,
          top : 0
        };
        var docScrolls = {
          left : 0,
          top : 0
        };
        if ("next" === slider.settings.autoDirection) {
          boundOffset = el.find(".bx-clone").first().position();
        } else {
          docScrolls = slider.children.first().position();
        }
        /** @type {number} */
        value = "horizontal" === slider.settings.mode ? -boundOffset.left : -boundOffset.top;
        /** @type {number} */
        resetValue = "horizontal" === slider.settings.mode ? -docScrolls.left : -docScrolls.top;
        params = {
          resetValue : resetValue
        };
        setPositionProperty(value, "ticker", speed, params);
      };
      /**
       * @param {!Object} el
       * @return {?}
       */
      var isOnScreen = function(el) {
        var $WINDOW = $(window);
        var itsGeom = {
          top : $WINDOW.scrollTop(),
          left : $WINDOW.scrollLeft()
        };
        var pgdGeom = el.offset();
        return itsGeom.right = itsGeom.left + $WINDOW.width(), itsGeom.bottom = itsGeom.top + $WINDOW.height(), pgdGeom.right = pgdGeom.left + el.outerWidth(), pgdGeom.bottom = pgdGeom.top + el.outerHeight(), !(itsGeom.right < pgdGeom.left || itsGeom.left > pgdGeom.right || itsGeom.bottom < pgdGeom.top || itsGeom.top > pgdGeom.bottom);
      };
      /**
       * @param {!Event} e
       * @return {?}
       */
      var keyPress = function(e) {
        var source = document.activeElement.tagName.toLowerCase();
        /** @type {string} */
        var input = "input|textarea";
        /** @type {!RegExp} */
        var lookup = new RegExp(source, ["i"]);
        /** @type {(Array<string>|null)} */
        var name = lookup.exec(input);
        if (null == name && isOnScreen(el)) {
          if (39 === e.keyCode) {
            return clickNextBind(e), false;
          }
          if (37 === e.keyCode) {
            return clickPrevBind(e), false;
          }
        }
      };
      /**
       * @return {undefined}
       */
      var initTouch = function() {
        slider.touch = {
          start : {
            x : 0,
            y : 0
          },
          end : {
            x : 0,
            y : 0
          }
        };
        slider.viewport.bind("touchstart MSPointerDown pointerdown", onTouchStart);
        slider.viewport.on("click", ".bxslider a", function(event) {
          if (slider.viewport.hasClass("click-disabled")) {
            event.preventDefault();
            slider.viewport.removeClass("click-disabled");
          }
        });
      };
      /**
       * @param {!Event} event
       * @return {undefined}
       */
      var onTouchStart = function(event) {
        if (slider.controls.el.addClass("disabled"), slider.working) {
          event.preventDefault();
          slider.controls.el.removeClass("disabled");
        } else {
          slider.touch.originalPos = el.position();
          var orig = event.originalEvent;
          var touches = "undefined" != typeof orig.changedTouches ? orig.changedTouches : [orig];
          slider.touch.start.x = touches[0].pageX;
          slider.touch.start.y = touches[0].pageY;
          if (slider.viewport.get(0).setPointerCapture) {
            slider.pointerId = orig.pointerId;
            slider.viewport.get(0).setPointerCapture(slider.pointerId);
          }
          slider.viewport.bind("touchmove MSPointerMove pointermove", onTouchMove);
          slider.viewport.bind("touchend MSPointerUp pointerup", onTouchEnd);
          slider.viewport.bind("MSPointerCancel pointercancel", onPointerCancel);
        }
      };
      /**
       * @param {?} event
       * @return {undefined}
       */
      var onPointerCancel = function(event) {
        setPositionProperty(slider.touch.originalPos.left, "reset", 0);
        slider.controls.el.removeClass("disabled");
        slider.viewport.unbind("MSPointerCancel pointercancel", onPointerCancel);
        slider.viewport.unbind("touchmove MSPointerMove pointermove", onTouchMove);
        slider.viewport.unbind("touchend MSPointerUp pointerup", onTouchEnd);
        if (slider.viewport.get(0).releasePointerCapture) {
          slider.viewport.get(0).releasePointerCapture(slider.pointerId);
        }
      };
      /**
       * @param {!Event} e
       * @return {undefined}
       */
      var onTouchMove = function(e) {
        var a = e.originalEvent;
        var touches = "undefined" != typeof a.changedTouches ? a.changedTouches : [a];
        /** @type {number} */
        var xMovement = Math.abs(touches[0].pageX - slider.touch.start.x);
        /** @type {number} */
        var yMovement = Math.abs(touches[0].pageY - slider.touch.start.y);
        /** @type {number} */
        var value = 0;
        /** @type {number} */
        var change = 0;
        if (3 * xMovement > yMovement && slider.settings.preventDefaultSwipeX) {
          e.preventDefault();
        } else {
          if (3 * yMovement > xMovement && slider.settings.preventDefaultSwipeY) {
            e.preventDefault();
          }
        }
        if ("fade" !== slider.settings.mode && slider.settings.oneToOneTouch) {
          if ("horizontal" === slider.settings.mode) {
            /** @type {number} */
            change = touches[0].pageX - slider.touch.start.x;
            value = slider.touch.originalPos.left + change;
          } else {
            /** @type {number} */
            change = touches[0].pageY - slider.touch.start.y;
            value = slider.touch.originalPos.top + change;
          }
          setPositionProperty(value, "reset", 0);
        }
      };
      /**
       * @param {!KeyboardEvent} e
       * @return {undefined}
       */
      var onTouchEnd = function(e) {
        slider.viewport.unbind("touchmove MSPointerMove pointermove", onTouchMove);
        slider.controls.el.removeClass("disabled");
        var a = e.originalEvent;
        var touches = "undefined" != typeof a.changedTouches ? a.changedTouches : [a];
        /** @type {number} */
        var value = 0;
        /** @type {number} */
        var distance = 0;
        slider.touch.end.x = touches[0].pageX;
        slider.touch.end.y = touches[0].pageY;
        if ("fade" === slider.settings.mode) {
          /** @type {number} */
          distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
          if (distance >= slider.settings.swipeThreshold) {
            if (slider.touch.start.x > slider.touch.end.x) {
              el.goToNextSlide();
            } else {
              el.goToPrevSlide();
            }
            el.stopAuto();
          }
        } else {
          if ("horizontal" === slider.settings.mode) {
            /** @type {number} */
            distance = slider.touch.end.x - slider.touch.start.x;
            value = slider.touch.originalPos.left;
          } else {
            /** @type {number} */
            distance = slider.touch.end.y - slider.touch.start.y;
            value = slider.touch.originalPos.top;
          }
          if (!slider.settings.infiniteLoop && (0 === slider.active.index && distance > 0 || slider.active.last && distance < 0)) {
            setPositionProperty(value, "reset", 200);
          } else {
            if (Math.abs(distance) >= slider.settings.swipeThreshold) {
              if (distance < 0) {
                el.goToNextSlide();
              } else {
                el.goToPrevSlide();
              }
              el.stopAuto();
            } else {
              setPositionProperty(value, "reset", 200);
            }
          }
        }
        slider.viewport.unbind("touchend MSPointerUp pointerup", onTouchEnd);
        if (slider.viewport.get(0).releasePointerCapture) {
          slider.viewport.get(0).releasePointerCapture(slider.pointerId);
        }
      };
      /**
       * @param {?} width
       * @return {undefined}
       */
      var resizeWindow = function(width) {
        if (slider.initialized) {
          if (slider.working) {
            window.setTimeout(resizeWindow, 10);
          } else {
            var l = $(window).width();
            var undefined = $(window).height();
            if (!(mode === l && protocol === undefined)) {
              mode = l;
              protocol = undefined;
              el.redrawSlider();
              slider.settings.onSliderResize.call(el, slider.active.index);
            }
          }
        }
      };
      /**
       * @param {number} startVisibleIndex
       * @return {undefined}
       */
      var applyAriaHiddenAttributes = function(startVisibleIndex) {
        var numberOfSlidesShowing = getNumberSlidesShowing();
        if (slider.settings.ariaHidden && !slider.settings.ticker) {
          slider.children.attr("aria-hidden", "true");
          slider.children.slice(startVisibleIndex, startVisibleIndex + numberOfSlidesShowing).attr("aria-hidden", "false");
        }
      };
      /**
       * @param {number} slideIndex
       * @return {?}
       */
      var setSlideIndex = function(slideIndex) {
        return slideIndex < 0 ? slider.settings.infiniteLoop ? getPagerQty() - 1 : slider.active.index : slideIndex >= getPagerQty() ? slider.settings.infiniteLoop ? 0 : slider.active.index : slideIndex;
      };
      return el.goToSlide = function(slideIndex, direction) {
        var i;
        var origSection;
        var value;
        var requestEl;
        /** @type {boolean} */
        var ret = true;
        /** @type {number} */
        var nWindowScrollLeft = 0;
        var offset = {
          left : 0,
          top : 0
        };
        /** @type {null} */
        var $overlayContent = null;
        if (slider.oldIndex = slider.active.index, slider.active.index = setSlideIndex(slideIndex), !slider.working && slider.active.index !== slider.oldIndex) {
          if (slider.working = true, ret = slider.settings.onSlideBefore.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index), "undefined" != typeof ret && !ret) {
            return slider.active.index = slider.oldIndex, void(slider.working = false);
          }
          if ("next" === direction) {
            if (!slider.settings.onSlideNext.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index)) {
              /** @type {boolean} */
              ret = false;
            }
          } else {
            if ("prev" === direction) {
              if (!slider.settings.onSlidePrev.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index)) {
                /** @type {boolean} */
                ret = false;
              }
            }
          }
          /** @type {boolean} */
          slider.active.last = slider.active.index >= getPagerQty() - 1;
          if (slider.settings.pager || slider.settings.pagerCustom) {
            updatePagerActive(slider.active.index);
          }
          if (slider.settings.controls) {
            updateDirectionControls();
          }
          if ("fade" === slider.settings.mode) {
            if (slider.settings.adaptiveHeight && slider.viewport.height() !== getViewportHeight()) {
              slider.viewport.animate({
                height : getViewportHeight()
              }, slider.settings.adaptiveHeightSpeed);
            }
            slider.children.filter(":visible").fadeOut(slider.settings.speed).css({
              zIndex : 0
            });
            slider.children.eq(slider.active.index).css("zIndex", slider.settings.slideZIndex + 1).fadeIn(slider.settings.speed, function() {
              $(this).css("zIndex", slider.settings.slideZIndex);
              updateAfterSlideTransition();
            });
          } else {
            if (slider.settings.adaptiveHeight && slider.viewport.height() !== getViewportHeight()) {
              slider.viewport.animate({
                height : getViewportHeight()
              }, slider.settings.adaptiveHeightSpeed);
            }
            if (!slider.settings.infiniteLoop && slider.carousel && slider.active.last) {
              if ("horizontal" === slider.settings.mode) {
                $overlayContent = slider.children.eq(slider.children.length - 1);
                offset = $overlayContent.position();
                /** @type {number} */
                nWindowScrollLeft = slider.viewport.width() - $overlayContent.outerWidth();
              } else {
                /** @type {number} */
                i = slider.children.length - slider.settings.minSlides;
                offset = slider.children.eq(i).position();
              }
            } else {
              if (slider.carousel && slider.active.last && "prev" === direction) {
                /** @type {number} */
                origSection = 1 === slider.settings.moveSlides ? slider.settings.maxSlides - getMoveBy() : (getPagerQty() - 1) * getMoveBy() - (slider.children.length - slider.settings.maxSlides);
                $overlayContent = el.children(".bx-clone").eq(origSection);
                offset = $overlayContent.position();
              } else {
                if ("next" === direction && 0 === slider.active.index) {
                  offset = el.find("> .bx-clone").eq(slider.settings.maxSlides).position();
                  /** @type {boolean} */
                  slider.active.last = false;
                } else {
                  if (slideIndex >= 0) {
                    /** @type {number} */
                    requestEl = slideIndex * parseInt(getMoveBy());
                    offset = slider.children.eq(requestEl).position();
                  }
                }
              }
            }
            if ("undefined" != typeof offset) {
              /** @type {number} */
              value = "horizontal" === slider.settings.mode ? -(offset.left - nWindowScrollLeft) : -offset.top;
              setPositionProperty(value, "slide", slider.settings.speed);
            } else {
              /** @type {boolean} */
              slider.working = false;
            }
          }
          if (slider.settings.ariaHidden) {
            applyAriaHiddenAttributes(slider.active.index * getMoveBy());
          }
        }
      }, el.goToNextSlide = function() {
        if (slider.settings.infiniteLoop || !slider.active.last) {
          /** @type {number} */
          var pagerIndex = parseInt(slider.active.index) + 1;
          el.goToSlide(pagerIndex, "next");
        }
      }, el.goToPrevSlide = function() {
        if (slider.settings.infiniteLoop || 0 !== slider.active.index) {
          /** @type {number} */
          var pagerIndex = parseInt(slider.active.index) - 1;
          el.goToSlide(pagerIndex, "prev");
        }
      }, el.startAuto = function(preventControlUpdate) {
        if (!slider.interval) {
          /** @type {number} */
          slider.interval = setInterval(function() {
            if ("next" === slider.settings.autoDirection) {
              el.goToNextSlide();
            } else {
              el.goToPrevSlide();
            }
          }, slider.settings.pause);
          if (slider.settings.autoControls && preventControlUpdate !== true) {
            updateAutoControls("stop");
          }
        }
      }, el.stopAuto = function(preventControlUpdate) {
        if (slider.interval) {
          clearInterval(slider.interval);
          /** @type {null} */
          slider.interval = null;
          if (slider.settings.autoControls && preventControlUpdate !== true) {
            updateAutoControls("start");
          }
        }
      }, el.getCurrentSlide = function() {
        return slider.active.index;
      }, el.getCurrentSlideElement = function() {
        return slider.children.eq(slider.active.index);
      }, el.getSlideElement = function(index) {
        return slider.children.eq(index);
      }, el.getSlideCount = function() {
        return slider.children.length;
      }, el.isWorking = function() {
        return slider.working;
      }, el.redrawSlider = function() {
        slider.children.add(el.find(".bx-clone")).outerWidth(getSlideWidth());
        slider.viewport.css("height", getViewportHeight());
        if (!slider.settings.ticker) {
          setSlidePosition();
        }
        if (slider.active.last) {
          /** @type {number} */
          slider.active.index = getPagerQty() - 1;
        }
        if (slider.active.index >= getPagerQty()) {
          /** @type {boolean} */
          slider.active.last = true;
        }
        if (slider.settings.pager && !slider.settings.pagerCustom) {
          populatePager();
          updatePagerActive(slider.active.index);
        }
        if (slider.settings.ariaHidden) {
          applyAriaHiddenAttributes(slider.active.index * getMoveBy());
        }
      }, el.destroySlider = function() {
        if (slider.initialized) {
          /** @type {boolean} */
          slider.initialized = false;
          $(".bx-clone", this).remove();
          slider.children.each(function() {
            if (void 0 !== $(this).data("origStyle")) {
              $(this).attr("style", $(this).data("origStyle"));
            } else {
              $(this).removeAttr("style");
            }
          });
          if (void 0 !== $(this).data("origStyle")) {
            this.attr("style", $(this).data("origStyle"));
          } else {
            $(this).removeAttr("style");
          }
          $(this).unwrap().unwrap();
          if (slider.controls.el) {
            slider.controls.el.remove();
          }
          if (slider.controls.next) {
            slider.controls.next.remove();
          }
          if (slider.controls.prev) {
            slider.controls.prev.remove();
          }
          if (slider.pagerEl && slider.settings.controls && !slider.settings.pagerCustom) {
            slider.pagerEl.remove();
          }
          $(".bx-caption", this).remove();
          if (slider.controls.autoEl) {
            slider.controls.autoEl.remove();
          }
          clearInterval(slider.interval);
          if (slider.settings.responsive) {
            $(window).unbind("resize", resizeWindow);
          }
          if (slider.settings.keyboardEnabled) {
            $(document).unbind("keydown", keyPress);
          }
          $(this).removeData("bxSlider");
        }
      }, el.reloadSlider = function(settings) {
        if (void 0 !== settings) {
          options = settings;
        }
        el.destroySlider();
        init();
        $(el).data("bxSlider", this);
      }, init(), $(el).data("bxSlider", this), this;
    }
  };
}(jQuery);
