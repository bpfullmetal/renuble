window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = instance.id === evt.detail.sectionId;

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(
      function(index, container) {
        this._createInstance(container, constructor);
      }.bind(this)
    );
  }
});


/* ================ MODULES ================ */
/*============================================================================
  Money Format
  - Shopify.format money is defined in option_selection.js.
    If that file is not included, it is redefined here.
==============================================================================*/
if (typeof Shopify === 'undefined') {
  Shopify = {};
}
if (!Shopify.formatMoney) {
  Shopify.formatMoney = function(cents, format) {
    var value = '',
      placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
      formatString = format || this.money_format;

    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }

    function defaultOption(opt, def) {
      return typeof opt === 'undefined' ? def : opt;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal = defaultOption(decimal, '.');

      if (isNaN(number) || number === null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.'),
        dollars = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          '$1' + thousands
        ),
        cents = parts[1] ? decimal + parts[1] : '';

      return dollars + cents;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  };
}

// Timber functions
window.timber = window.timber || {};

timber.cacheSelectors = function() {
  timber.cache = {
    // General
    $window: $(window),
    $html: $('html'),
    $body: $('body'),

    // Navigation
    $navigation: $('#AccessibleNav'),
    $navBar: $('.nav-bar'),
    $mobileSubNavToggle: $('.mobile-nav__toggle'),
    $header: $('.site-header'),
    $mobileMenuButton: $('#menu-opener'),

    // Collection Pages
    $changeView: $('.change-view'),

    // Product Page
    $productImage: $('#ProductPhotoImg'),
    $thumbImages: $('#ProductThumbs').find('a.product-single__thumbnail'),

    // Cart Page
    $cartSection: $('#CartSection'),
    cartNoCookies: 'cart--no-cookies',

    // Customer Pages
    $recoverPasswordLink: $('#RecoverPassword'),
    $hideRecoverPasswordLink: $('#HideRecoverPasswordLink'),
    $recoverPasswordForm: $('#RecoverPasswordForm'),
    $customerLoginForm: $('#CustomerLoginForm'),
    $passwordResetSuccess: $('#ResetSuccess')
  };
};

timber.init = function() {
  timber.cacheSelectors();
  timber.drawersInit();
  timber.cartInit();
  timber.mobileNavToggle();
  timber.productImageSwitch();
  timber.collectionViews();
  timber.loginForms();
};

timber.openDrawerMenu = function() {
  var $allLinks = $('button, a', timber.cache.$navBar);

  timber.cache.$body.addClass('opened-drawer');
  timber.cache.$navBar.addClass('opened').attr('aria-hidden', 'false');
  timber.cache.$mobileMenuButton
    .attr('aria-expanded', 'true')
    .addClass('opened');

  // Set focus on drawer
  timber.trapFocus({
    $container: timber.cache.$navBar,
    namespace: 'drawer_focus'
  });

  // Reset tabindex
  $allLinks.attr('tabindex', '');

  // Escape key closes menu
  timber.cache.$html.on('keyup.drawerMenu', function(evt) {
    if (evt.keyCode === 27) {
      timber.closeDrawerMenu();
    }
  });
};

timber.closeDrawerMenu = function() {
  var $allLinks = $('button, a', timber.cache.$navBar);

  timber.cache.$body.removeClass('opened-drawer');

  timber.cache.$navBar.removeClass('opened').attr('aria-hidden', 'true');

  timber.cache.$mobileMenuButton
    .attr('aria-expanded', 'false')
    .removeClass('opened');

  // Remove focus on drawer
  timber.removeTrapFocus({
    $container: timber.cache.$navBar,
    namespace: 'drawer_focus'
  });

  // Reset tabindex
  $allLinks.attr('tabindex', '-1');

  timber.cache.$html.off('keyup.drawerMenu');
};

timber.drawersInit = function() {
  timber.LeftDrawer = new timber.Drawers('NavDrawer', 'left');
  timber.RightDrawer = new timber.Drawers('CartDrawer', 'right', {
    onDrawerOpen: theme.settings.ajax_cart_enable
  });
};

timber.cartInit = function() {
  if (!timber.cookiesEnabled()) {
    timber.cache.$cartSection.addClass(timber.cache.cartNoCookies);
  }
};

timber.cookiesEnabled = function() {
  var cookieEnabled = navigator.cookieEnabled;

  if (!cookieEnabled) {
    document.cookie = 'testcookie';
    cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
  }
  return cookieEnabled;
};

timber.mobileNavToggle = function() {
  timber.cache.$mobileSubNavToggle.on('click', function() {
    $(this)
      .parent()
      .toggleClass('mobile-nav--expanded');
  });
};

/**
 * Traps the focus in a particular container
 *
 * @param {object} options - Options to be used
 * @param {jQuery} options.$container - Container to trap focus within
 * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
 * @param {string} options.namespace - Namespace used for new focus event handler
 */
timber.trapFocus = function(options) {
  var eventName = options.namespace
    ? 'focusin.' + options.namespace
    : 'focusin';

  if (!options.$elementToFocus) {
    options.$elementToFocus = options.$container;
    options.$container.attr('tabindex', '-1');
  }

  options.$elementToFocus.focus();

  $(document).on(eventName, function(evt) {
    if (
      options.$container[0] !== evt.target &&
      !options.$container.has(evt.target).length
    ) {
      options.$container.focus();
    }
  });
};

/**
 * Removes the trap of focus in a particular container
 *
 * @param {object} options - Options to be used
 * @param {jQuery} options.$container - Container to trap focus within
 * @param {string} options.namespace - Namespace used for new focus event handler
 */
timber.removeTrapFocus = function(options) {
  var eventName = options.namespace
    ? 'focusin.' + options.namespace
    : 'focusin';

  if (options.$container && options.$container.length) {
    options.$container.removeAttr('tabindex');
  }

  $(document).off(eventName);
};

timber.getHash = function() {
  return window.location.hash;
};

timber.updateHash = function(hash) {
  window.location.hash = '#' + hash;
  $('#' + hash)
    .attr('tabindex', -1)
    .focus();
};

timber.productPage = function(options) {
  var moneyFormat = options.money_format,
    variant = options.variant;

  // Selectors
  var $productImage = $('#ProductPhotoImg'),
    $addToCart = $('#AddToCart'),
    $productPrice = $('#ProductPrice'),
    $unitLimit = $('#unit-limit'),
    $comparePrice = $('#ComparePrice'),
    $quantityElements = $('.quantity-selector, label + .js-qty'),
    $addToCartText = $('#AddToCartText');

  if (variant) {
    // Update variant image, if one is set
    if (variant.featured_image) {
      var newImg = variant.featured_image,
        el = $productImage[0];
      Shopify.Image.switchImage(newImg, el, timber.switchImage);
    }

    // Select a valid variant if available
    if (variant.available) {
      // Available, enable the submit button, change text, show quantity elements
      $addToCart.removeClass('disabled').prop('disabled', false);
      $addToCartText.html(theme.strings.add_to_cart);
      $quantityElements.show();
    } else {
      // Sold out, disable the submit button, change text, hide quantity elements
      $addToCart.addClass('disabled').prop('disabled', true);
      $addToCartText.html(theme.strings.sold_out);
      $quantityElements.hide();
    }

    // Regardless of stock, update the product price
    $productPrice.html(Shopify.formatMoney(variant.price, moneyFormat));

    // Also update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      $comparePrice
        .html(Shopify.formatMoney(variant.compare_at_price, moneyFormat))
        .show();
    } else {
      $comparePrice.hide();
    }
  } else {
    // The variant doesn't exist, disable submit button.
    // This may be an error or notice that a specific variant is not available.
    // To only show available variants, implement linked product options:
    //   - http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
    $addToCart.addClass('disabled').prop('disabled', true);
    $addToCartText.html(theme.strings.unavailable);
    $quantityElements.hide();
  }
};

timber.productImageSwitch = function() {
  if (timber.cache.$thumbImages.length) {
    // Switch the main image with one of the thumbnails
    // Note: this does not change the variant selected, just the image
    timber.cache.$thumbImages.on('click', function(evt) {
      evt.preventDefault();
      var newImage = $(this).attr('href');
      timber.switchImage(newImage, null, timber.cache.$productImage);
    });
  }
};

timber.switchImage = function(src, imgObject, el) {
  // Make sure element is a jquery object
  var $el = $(el);
  $el.attr('src', src);
};

timber.collectionViews = function() {
  if (timber.cache.$changeView.length) {
    timber.cache.$changeView.on('click', function() {
      var view = $(this).data('view'),
        url = document.URL,
        hasParams = url.indexOf('?') > -1;

      if (hasParams) {
        window.location = replaceUrlParam(url, 'view', view);
      } else {
        window.location = url + '?view=' + view;
      }
    });
  }
};

timber.loginForms = function() {
  function showRecoverPasswordForm() {
    timber.cache.$recoverPasswordForm.show();
    timber.cache.$customerLoginForm.hide();
  }

  function hideRecoverPasswordForm() {
    timber.cache.$recoverPasswordForm.hide();
    timber.cache.$customerLoginForm.show();
  }

  timber.cache.$recoverPasswordLink.on('click', function(evt) {
    evt.preventDefault();
    showRecoverPasswordForm();
  });

  timber.cache.$hideRecoverPasswordLink.on('click', function(evt) {
    evt.preventDefault();
    hideRecoverPasswordForm();
  });

  // Allow deep linking to recover password form
  if (timber.getHash() === '#recover') {
    showRecoverPasswordForm();
  }
};

timber.resetPasswordSuccess = function() {
  timber.cache.$passwordResetSuccess.show();
};

/*============================================================================
  Drawer modules
  - Docs http://shopify.github.io/Timber/#drawers
==============================================================================*/
timber.Drawers = (function() {
  var Drawer = function(id, position, options) {
    var defaults = {
      close: '.js-drawer-close',
      open: '.js-drawer-open-' + position,
      openClass: 'js-drawer-open',
      dirOpenClass: 'js-drawer-open-' + position
    };

    this.nodes = {
      $parent: $('body, html'),
      $page: $('#PageContainer'),
      $moved: $('.is-moved-by-drawer')
    };

    this.config = $.extend(defaults, options);
    this.position = position;

    this.$drawer = $('#' + id);

    if (!this.$drawer.length) {
      return false;
    }

    this.drawerIsOpen = false;
    this.init();
  };

  Drawer.prototype.init = function() {
    $(this.config.open).on('click', $.proxy(this.open, this));
    this.$drawer.find(this.config.close).on('click', $.proxy(this.close, this));
  };

  Drawer.prototype.open = function(evt) {
    // Keep track if drawer was opened from a click, or called by another function
    var externalCall = false;

    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    // Without this, the drawer opens, the click event bubbles up to $nodes.page
    // which closes the drawer.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }

    if (this.drawerIsOpen && !externalCall) {
      return this.close();
    }

    // Add is-transitioning class to moved elements on open so drawer can have
    // transition for close animation
    this.nodes.$moved.addClass('is-transitioning');
    this.$drawer.prepareTransition();

    this.nodes.$parent.addClass(
      this.config.openClass + ' ' + this.config.dirOpenClass
    );
    this.drawerIsOpen = true;

    // Set focus on drawer
    this.trapFocus(this.$drawer, 'drawer_focus');

    // Run function when draw opens if set
    if (
      this.config.onDrawerOpen &&
      typeof this.config.onDrawerOpen === 'function'
    ) {
      if (!externalCall) {
        this.config.onDrawerOpen();
      }
    }

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }

    // Lock scrolling on mobile
    this.nodes.$page.on('touchmove.drawer', function() {
      return false;
    });

    this.nodes.$page.on(
      'click.drawer',
      $.proxy(function() {
        this.close();
        return false;
      }, this)
    );
  };

  Drawer.prototype.close = function() {
    if (!this.drawerIsOpen) {
      // don't close a closed drawer
      return;
    }

    // deselect any focused form elements
    $(document.activeElement).trigger('blur');

    // Ensure closing transition is applied to moved elements, like the nav
    this.nodes.$moved.prepareTransition({ disableExisting: true });
    this.$drawer.prepareTransition({ disableExisting: true });

    this.nodes.$parent.removeClass(
      this.config.dirOpenClass + ' ' + this.config.openClass
    );

    this.drawerIsOpen = false;

    // Remove focus on drawer
    this.removeTrapFocus(this.$drawer, 'drawer_focus');

    this.nodes.$page.off('.drawer');
  };

  Drawer.prototype.trapFocus = function($container, eventNamespace) {
    var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

    $container.attr('tabindex', '-1');

    $container.focus();

    $(document).on(eventName, function(evt) {
      if ($container[0] !== evt.target && !$container.has(evt.target).length) {
        $container.focus();
      }
    });
  };

  Drawer.prototype.removeTrapFocus = function($container, eventNamespace) {
    var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

    $container.removeAttr('tabindex');
    $(document).off(eventName);
  };

  return Drawer;
})();

// Initialize Timber's JS on docready
$(timber.init);

window.theme = window.theme || {};

theme.Header = (function() {
  var cache = {};

  function cacheSelectors() {
    cache = {
      $html: $('html'),
      $body: $('body'),
      $wrapper: $('.wrapper'),
      $sidebar: $('#sidebar'),
      $logo: $('#logo'),
      $meta: $('#meta'),
      $announcementBar: $('.announcement-bar'),
      $siteHeader: $('.site-header'),
      $menu: $('#menu'),
      $nav: $('.site-nav'),
      $siteLogo: $('.site-header__logo'),
      $siteLogoLink: $('.site-header__logo-link') || null,
      $siteLogoLinkInverted: $('.site-header__logo-link--inverted') || null,
      $mobileMenu: $('.nav-bar'),
      $mobileMenuButton: $('#menu-opener'),
      $mobileCloseMenuButton: $('#menu-closer'),
      $pageContainer: $('#PageContainer'),
      $responsiveMenu: $('#meta').find('.responsive-menu'),
      $responsiveClose: $('.responsive-close'),
      $options: $('#options'),
      $footer: $('#footer'),
      $content: $('#content'),
      $allLinks: $('button, a', cache.$mobileMenu),
      $siteNavs: $('.site-nav'),
      isindexTemplate: $('body').hasClass('template-index'),
      menuStyle: $('.site-header').data('menu-style'),
      touchM: 'ontouchstart' in window,
      iOS: /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
      navWidth: 0,
      logoWidth: 0,
      navigation: {
        activeClass: 'opened',
        childClass: 'site-nav__link--child',
        active: '.opened',
        parents: '.site-nav--has-dropdown',
        links: '.site-nav__link',
        dropdown: '.site-nav__dropdown'
      }
    };
  }

  function init() {
    cacheSelectors();
    if (cache.touchM) {
      cache.$body.addClass('touch');
    } else {
      cache.$body.addClass('no-touch');
    }

    if ($('header').hasClass('is-dark')) {
      cache.$pageContainer.addClass('is-dark');
      cache.$pageContainer.removeClass('is-light');
    } else if ($('header').hasClass('is-light')) {
      cache.$pageContainer.addClass('is-light');
      cache.$pageContainer.removeClass('is-dark');
    }

    cache.$footer.removeClass('loading');

    /* Enable fit vid & custom solution for posts videos */

    $(
      'p[style="text-align: center;"] img, p[style="text-align: center;"] iframe'
    ).each(function() {
      $(this)
        .parent()
        .addClass('centered-media');
    });

    $('.main-content').fitVids();

    menuStyleCheck();
    stickyHeader();

    if ($('.link-list').length > 0) {
      $('.link-list')
        .clone()
        .appendTo($('.nav-bar'))
        .find('a')
        .attr('tabindex', '-1');
    }

    menuDrawerButtons();
    dropDownMenus();
  }

  /* Function that decides whether to show a hamburger icon or all the links */
  function fitNav() {
    var navWiderThanWrapper =
      cache.$wrapper.width() < cache.navWidth + cache.logoWidth;
    if (
      navWiderThanWrapper &&
      cache.$siteHeader.hasClass('site-header--classic')
    ) {
      collapseMenu();
      hideInvertedLogo();
    } else if (
      !navWiderThanWrapper &&
      cache.$siteHeader.hasClass('site-header--drawer') &&
      cache.menuStyle !== 'drawer'
    ) {
      timber.closeDrawerMenu();
      expandMenu();
      showInvertedLogo();
    }
    if (navWiderThanWrapper) {
      cache.$mobileMenu.css('height', $(window).height());
    }
    cache.$siteLogo.css('opacity', '1');
    cache.$nav.css('opacity', '1');
  }

  function menuStyleCheck() {
    timber.cache.$window.on('load', function() {
      cache.logoWidth = cache.$siteLogo.width() || 0;
      cache.$nav.children('li').each(function() {
        cache.navWidth += $(this).outerWidth(true);
      });
      // Make drawer a11y accessible
      timber.cache.$navBar.attr('aria-hidden', 'false');
      $('.main-content').css('padding-top', '100px')
      fitNav();
      $(window).on('resize', $.debounce(250, fitNav));
    });
  }

  function collapseMenu() {
    cache.$mobileMenu.removeClass('animate');
    cache.$announcementBar.addClass('mobile');
    cache.$siteHeader
      .addClass('site-header--drawer mobile sticky')
      .removeClass('site-header--classic active')
      .find('.btn__buy a')
      .removeClass('btn--small btn--dark')
      .addClass('btn--regular btn--light');
    // Make drawer a11y unaccessible
    timber.cache.$navBar.attr('aria-hidden', 'true');
    $('.main-content').css('padding-top', '71px')
    cache.$allLinks.attr('tabindex', '-1');
    if (cache.$body.hasClass('header-expanded')) {
      cache.$body.removeClass('header-expanded');
    }
  }

  function expandMenu() {
    cache.$announcementBar.removeClass('mobile');
    cache.$siteHeader
      .addClass('site-header--classic active')
      .removeClass('site-header--drawer mobile sticky')
      .find('.btn__buy a')
      .addClass('btn--small btn--dark')
      .removeClass('btn--regular btn--light');
    cache.$mobileMenu.css('height', '100%');
    // Make drawer a11y accessible
    timber.cache.$navBar.attr('aria-hidden', 'false');
    $('.main-content').css('padding-top', '100px')
    cache.$allLinks.attr('tabindex', '');
    if (!cache.$body.hasClass('header-expanded')) {
      cache.$body.addClass('header-expanded');
    }
  }

  function stickyHeader() {
    if (cache.menuStyle === 'drawer') return;

    cache.$siteHeader
      .attr('aria-hidden', true)
      .find('a, button')
      .attr('tabIndex', -1);

    $(window).on('scroll', function() {
      if (
        cache.$siteHeader.hasClass('mobile') ||
        cache.$siteHeader.hasClass('site-header--drawer')
      )
        return;
      if ($(window).scrollTop() > 300) {
        startAnimateHeader();
      } else if ($(window).scrollTop() < 300) {
        stopAnimateHeader();
        var $menus = cache.$siteNavs.find(cache.navigation.active);
        closeAllMenus($menus);
      }
    });
  }

  function startAnimateHeader() {
    cache.$siteHeader.addClass('sticky');
    hideInvertedLogo();
    setTimeout(function() {
      cache.$siteHeader.addClass('active');
    }, 500);
  }

  function stopAnimateHeader() {
    cache.$siteHeader.removeClass('active sticky');
    showInvertedLogo();
  }

  function hideInvertedLogo() {
    if (!cache.isindexTemplate || !cache.$siteLogoLinkInverted.length) return;
    cache.$siteLogoLink.removeClass('logo--hidden');
    cache.$siteLogoLinkInverted.addClass('logo--hidden');
  }

  function showInvertedLogo() {
    if (!cache.isindexTemplate || !cache.$siteLogoLinkInverted.length) return;
    cache.$siteLogoLink.addClass('logo--hidden');
    cache.$siteLogoLinkInverted.removeClass('logo--hidden');
  }

  function menuDrawerButtons() {
    cache.$mobileMenuButton.on('click', function(e) {
      timber.openDrawerMenu();
      e.preventDefault();
    });

    cache.$mobileCloseMenuButton.on('click', function(e) {
      timber.closeDrawerMenu();
      e.preventDefault();
    });

    setTimeout(function() {
      cache.$mobileMenu.addClass('animate');
    }, 500);
  }

  function dropDownMenus() {
    $(cache.navigation.parents)
      .children(cache.navigation.links)
      .on('click', function() {
        var $link = $(this),
          $parent = $link.parent(),
          $menus;

        // If I click on an active dropdown parent, close it.
        if ($parent.hasClass(cache.navigation.activeClass)) {
          closeMenu($parent);
          return;
        }

        if ($link.hasClass(cache.navigation.childClass)) {
          $menus = $parent.siblings();
        } else {
          $menus = cache.$siteNavs.find(cache.navigation.active);
        }

        closeAllMenus($menus);
        openMenu($parent);
      });
  }

  function openMenu($menu) {
    $menu.addClass(cache.navigation.activeClass);
    $menu.children(cache.navigation.links).attr('aria-expanded', true);
    $menu
      .children(cache.navigation.dropdown)
      .stop()
      .slideDown(200);

    setTimeout(function() {
      timber.cache.$body.on('click.outsideMegaNav', function(e) {
        if ($(e.target).is(cache.navigation.links)) return;
        var $menus = cache.$siteNavs.find(cache.navigation.active);
        closeAllMenus($menus);
      });
    }, 250);
  }

  function closeMenu($menu) {
    $menu.removeClass(cache.navigation.activeClass);
    $menu.children(cache.navigation.links).attr('aria-expanded', false);
    $menu
      .children(cache.navigation.dropdown)
      .stop()
      .slideUp(150);
  }

  function closeAllMenus($menus) {
    $.each($menus, function() {
      closeMenu($(this));
    });

    timber.cache.$body.off('click.outsideMegaNav');
  }

  function onSelect() {
    if (cache.menuStyle === 'drawer') return;
    cache.navWidth = 0;
    cache.logoWidth = cache.$siteLogo.width() || 0;
    cache.$nav.children('li').each(function() {
      cache.navWidth += $(this).outerWidth(true);
    });
    // Make drawer a11y accessible
    timber.cache.$navBar.attr('aria-hidden', 'false');
    fitNav();
    timber.cache.$window.on('resize', $.debounce(250, fitNav));
  }

  function unload() {
    if (cache.$body.hasClass('opened-drawer')) {
      cache.$body.removeClass('opened-drawer');
    }
  }

  return {
    init: init,
    unload: unload,
    onSelect: onSelect
  };
})();

window.theme = window.theme || {};

theme.Slideshow = function(el) {
  this.cache = {
    $slider: $(el),
    sliderArgs: {
      animation: 'slider',
      animationSpeed: 300,
      slideshow: false,
      slideshowSpeed: 5000,
      directionNav: true,
      controlNav: true,
      keyboard: true,
      prevText: $.themeAssets.arrow_left,
      nextText: $.themeAssets.arrow_right,
      smoothHeight: true,
      before: function(slider) {
        $(slider)
          .find('.slide')
          .not('.flex-active-slide')
          .removeClass('slide-hide');
      },
      after: function(slider) {
        $(slider)
          .find('.slide')
          .not('.flex-active-slide')
          .addClass('slide-hide');
        $(slider).resize();
      },
      start: function(slider) {
        $(slider)
          .find('.slide')
          .not('.flex-active-slide')
          .addClass('slide-hide');
        if (
          $(slider)
            .find('.slide')
            .not('.clone').length === 1
        ) {
          $(slider)
            .find('.flex-direction-nav')
            .remove();
        }
        $(slider).addClass('loaded');
        if ($('#slider').data('loaded-index') !== undefined) {
          $('#slider').flexslider($('#slider').data('loaded-index'));
        }
      }
    }
  };

  if (this.cache.$slider.find('li').length === 1) {
    this.cache.sliderArgs.touch = false;
  }

  this.cache.$slider.flexslider(this.cache.sliderArgs);
  if (
    $(el)
      .attr('id')
      .indexOf('flexslider--') >= 0
  ) {
    this.cache.$slider.flexslider('play');
  }
};


/* ================ SECTIONS ================ */
window.theme = window.theme || {};

theme.HeaderSection = (function() {
  function HeaderSection() {
    timber.cacheSelectors();
    timber.drawersInit();
    timber.cartInit();
    timber.mobileNavToggle();
    theme.Header.init();
  }

  return HeaderSection;
})();

theme.HeaderSection.prototype = _.assignIn({}, theme.HeaderSection.prototype, {
  onUnload: function() {
    theme.Header.unload();
  },
  onSelect: function() {
    theme.Header.onSelect();
  }
});

/* eslint-disable no-new */
theme.Product = (function() {
  var defaults = {
    selectors: {
      addToCart: '#AddToCart',
      productPrice: '#ProductPrice',
      unitLimit: '#unit-limit',
      comparePrice: '#ComparePrice',
      addToCartText: '#AddToCartText',
      quantityElements: '.quantity-selector',
      optionSelector: 'productSelect'
    }
  };

  function Product(container) {
    var $container = (this.$container = $(container));
    var sectionId = $container.attr('data-section-id');

    this.settings = $.extend({}, defaults, {
      sectionId: sectionId,
      enableHistoryState: true,
      $container: this.$container,
      selectors: {
        originalSelectorId: 'productSelect-' + sectionId,
        productSection: '#ProductSection-' + sectionId,
        productLink: '.product__content--link-' + sectionId,
        addToCart: '#AddToCart-' + sectionId,
        productPrice: '#ProductPrice-' + sectionId,
        unitLimit: '#unit-limit-' + sectionId,
        comparePrice: '#ComparePrice-' + sectionId,
        addToCartText: '#AddToCartText-' + sectionId,
        quantityElements: '#quantity-selector-' + sectionId,
        slider: '#slider-' + sectionId,
        selectorWrapper: '.selector-wrapper' + sectionId,
        SKU: '.variant-sku',
        shopifyPaymentButton: '.shopify-payment-button'
      }
    });

    // disable history state if on homepage
    if ($('body').hasClass('template-index')) {
      this.settings.enableHistoryState = false;
    }

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$('#ProductJson-' + sectionId).html()) {
      this.addQuantityButtons();
      return;
    }

    this.productSingleObject = JSON.parse(
      document.getElementById('ProductJson-' + sectionId).innerHTML
    );
    this.init();
  }

  Product.prototype = _.assignIn({}, Product.prototype, {
    init: function() {
      this.stringOverrides();
      this.initProductVariant();
      this.initSliderImages();
      this.addQuantityButtons();
      theme.customSelectorArrow(this.$container);

      $('.image-popup', this.$container).magnificPopup({
        type: 'image',
        gallery: {
          enabled: true,
          tCounter: ''
        },
        mainClass: 'mfp-fade'
      });
    },

    onUnload: function() {
      delete theme.slideshows[this.settings.selectors.slider];
    },

    stringOverrides: function() {
      // Override defaults in theme.strings with potential
      // template overrides

      theme.productStrings = theme.productStrings || {};
      $.extend(theme.strings, theme.productStrings);
    },

    addQuantityButtons: function() {
      if (
        $(this.settings.selectors.quantityElements).children('input#Quantity')
          .length > 0
      ) {
        $(this.settings.selectors.quantityElements)
          .children('input#Quantity')
          .after(
            '<div class="input-holder plus"><button type="button" value="" class="plus" aria-label="' +
              theme.strings.increase_quantity +
              '">' +
              $.themeAssets.plus +
              '</button></div>'
          )
          .before(
            '<div class="input-holder minus"><button type="button" value="" class="minus" aria-label="' +
              theme.strings.reduce_quantity +
              '">' +
              $.themeAssets.minus +
              '</button></div>'
          );
      }
    },

    initProductVariant: function() {
      // this.productSingleObject is a global JSON object defined in theme.liquid
      if (!this.productSingleObject) {
        return;
      }

      var self = this;
      this.optionSelector = new Shopify.OptionSelectors(
        self.settings.selectors.originalSelectorId,
        {
          selectorClass: self.settings.selectors.optionSelectorClass,
          product: self.productSingleObject,
          onVariantSelected: self.productVariantCallback,
          enableHistoryState: self.settings.enableHistoryState,
          settings: self.settings
        }
      );

      // Clean up variant labels if the Shopify-defined
      // defaults are the only ones left
      this.simplifyVariantLabels(this.productSingleObject);
    },

    simplifyVariantLabels: function(productObject) {
      // Hide variant dropdown if only one exists and title contains 'Default'
      if (
        productObject.variants.length === 1 &&
        productObject.options.length === 1 &&
        productObject.options[0].toLowerCase().indexOf('title') >= 0 &&
        productObject.variants[0].title
          .toLowerCase()
          .indexOf('default title') >= 0
      ) {
        $(this.settings.selectors.productSection + ' .selector-wrapper').hide();
      }
    },

    initSliderImages: function() {
      var slideshow = this.settings.selectors.slider;
      $('img', this.slideshow).addClass('lazypreload');
      // $(slideshow).imagesLoaded().done( function( instance ) {
      theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
      // });
    },

    // **WARNING** This function actually inherits `this` from `this.optionSelector` not
    // from `product` when passed in as a callback for `option_selection.js`
    productVariantCallback: function(variant) {
      if (variant) {
        // Update variant image, if one is set
        if (variant.featured_image) {
          var $slider = $(this.settings.selectors.slider);
          var $newImg = $slider.find(
            '.slide[data-variant-img="' + variant.featured_image.id + '"]'
          );
          if ($newImg.length > 0) {
            if ($slider.hasClass('loaded')) {
              $slider.flexslider($newImg.data('index'));
            } else {
              $slider.data('loaded-index', $newImg.data('index'));
            }
          }
        }

        // Update the product link to the current variant
        var $productLink = $(this.settings.selectors.productLink);
        if ($productLink.length) {
          $productLink.attr(
            'href',
            updateUrlParameter($productLink.attr('href'), 'variant', variant.id)
          );
        }

        // Update the product price
        $(this.settings.selectors.productPrice).html(
          Shopify.formatMoney(variant.price, theme.settings.moneyFormat)
        );

        if ( $(this.settings.selectors.unitLimit).length ) {

          if ( variant.inventory_quantity <= 0 ) {
            $(this.settings.selectors.unitLimit).show()
            $(this.settings.selectors.unitLimit).html(
              `<strong>Only ${$(this.settings.selectors.unitLimit).data('unit-limit') - ( variant.inventory_quantity * -1 )} units available -- pre-order now!</strong>`
            );
          } else {
            $(this.settings.selectors.unitLimit).hide()
          }
        }

        // Show SKU
        $(this.settings.selectors.SKU).html(variant.sku);

        // Update and show the product's compare price if necessary
        if (variant.compare_at_price > variant.price) {
          $(this.settings.selectors.comparePrice)
            .html(
              Shopify.formatMoney(
                variant.compare_at_price,
                theme.settings.moneyFormat
              )
            )
            .show();
        } else {
          $(this.settings.selectors.comparePrice).hide();
        }

        // Select a valid variant if available
        if (variant.available) {
          // We have a valid product variant, so enable the submit button
          $(this.settings.selectors.addToCart)
            .removeClass('btn--disabled')
            .prop('disabled', false);
          $(this.settings.selectors.addToCartText).text(
            theme.strings.add_to_cart
          );
          $(this.settings.selectors.quantityElements).removeClass('hidden');
          $(
            this.settings.selectors.shopifyPaymentButton,
            this.settings.$container
          ).show();
        } else {
          // Variant is sold out, disable the submit button and change the text
          $(this.settings.selectors.addToCart)
            .addClass('btn--disabled')
            .prop('disabled', true);
          $(this.settings.selectors.addToCartText).text(theme.strings.sold_out);
          $(this.settings.selectors.quantityElements).addClass('hidden');
          $(
            this.settings.selectors.shopifyPaymentButton,
            this.settings.$container
          ).hide();
        }
      } else {
        // The variant doesn't exist, disable submit button and change the text.
        // This may be an error or notice that a specific variant is not available.
        $(this.settings.selectors.addToCart)
          .addClass('btn--disabled')
          .prop('disabled', true);
        $(this.settings.selectors.addToCartText).text(
          theme.strings.unavailable
        );
        $(this.settings.selectors.quantityElements).addClass('hidden');
        $(
          this.settings.selectors.shopifyPaymentButton,
          this.settings.$container
        ).hide();
      }

      function updateUrlParameter(url, key, value) {
        var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        var separator = url.indexOf('?') === -1 ? '?' : '&';

        if (url.match(re)) {
          return url.replace(re, '$1' + key + '=' + value + '$2');
        } else {
          return url + separator + key + '=' + value;
        }
      }
    }
  });

  return Product;
})();

theme.slideshows = {};

theme.SlideshowSection = (function() {
  function SlideshowSection(container) {
    var $container = (this.$container = $(container));
    var id = $container.attr('data-section-id');
    var slideshow = (this.slideshow = '#flexslider--' + id);
    theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
  }

  return SlideshowSection;
})();

theme.SlideshowSection.prototype = _.assignIn(
  {},
  theme.SlideshowSection.prototype,
  {
    onUnload: function() {
      delete theme.slideshows[this.slideshow];
    },
    onBlockSelect: function(evt) {
      var $slideshow = $(this.slideshow);
      // Ignore the cloned version
      var $slide = $('#slide-' + evt.detail.blockId + ':not(.clone)');
      var slideIndex = $slide.data('flexslider-index');
      var $slideImg = $slide.find('img') || $slide.find('svg');

      $slide.imagesLoaded($slideImg, function() {
        $slideshow.flexslider(slideIndex);
        $slideshow.resize();
        $slideshow.flexslider('pause');
      });
    },
    onBlockDeselect: function() {
      // Resume autoplay
      var $slideshow = $(this.slideshow);
      $slideshow.flexslider('play');
    }
  }
);

window.theme = window.theme || {};

theme.Kickstarter = (function() {
  function Kickstarter(container) {
    this.$container = $(container);
    theme.crowdCampaign(this.$container);
  }

  Kickstarter.prototype = _.assignIn({}, Kickstarter.prototype, {
    init: function() {
      theme.crowdCampaign(this.$container);
    },
    onSelect: function() {
      theme.crowdCampaign(this.$container);
    }
  });

  return Kickstarter;
})();

window.theme = window.theme || {};

theme.FAQs = (function() {
  function FAQs(container) {
    var $container = (this.$container = $(container));

    this.faqSelector = '.jumpstart-accordion-' + this.sectionId;

    theme.accordionFAQs(this.$container);

    this.$blocks = $('.section', $container);
    this.$opened = $('.opened', $container);
  }

  FAQs.prototype = _.assignIn({}, FAQs.prototype, {
    init: function() {
      this.$opened.find('.content').slidedown(0);

      this.$blocks
        .find('.title')
        .prepend($.themeAssets.plus + $.themeAssets.minus);

      this.$blocks.on('click', function(evt) {
        var blockId = $(evt.target).attr('data-block-id');
        this.focusFAQ(blockId);
      });
    },
    focusFAQ: function(blockId, isEditorEvent) {
      var $accordionItem = $('.section-' + blockId);

      if ($accordionItem.hasClass('opened') && !isEditorEvent) {
        $accordionItem.removeClass('opened');
        $accordionItem
          .children('div')
          .stop()
          .slideUp(300);
      } else {
        $accordionItem.addClass('opened');
        $accordionItem
          .children('div')
          .stop()
          .slideDown(300);
        this.$blocks
          .not($accordionItem)
          .removeClass('opened')
          .children('div')
          .stop()
          .slideUp(300);
      }
    },
    onBlockSelect: function(evt) {
      this.focusFAQ(evt.detail.blockId, true);
    },
    onload: function() {
      theme.accordionFAQs(this.$container);
    }
  });

  return FAQs;
})();

theme.Maps = (function() {
  var config = {
    zoom: 14
  };
  var apiStatus = null;
  var mapsToLoad = [];

  function Map(container) {
    theme.$currentMapContainer = this.$container = $(container);
    var key = this.$container.data('api-key');

    if (typeof key !== 'string' || key === '') {
      return;
    }

    if (apiStatus === 'loaded') {
      var self = this;

      // Check if the script has previously been loaded with this key
      var $script = $('script[src*="' + key + '&"]');
      if ($script.length === 0) {
        $.getScript('https://maps.googleapis.com/maps/api/js?key=' + key).then(
          function() {
            apiStatus = 'loaded';
            self.createMap();
          }
        );
      } else {
        this.createMap();
      }
    } else {
      mapsToLoad.push(this);

      if (apiStatus !== 'loading') {
        apiStatus = 'loading';
        if (typeof window.google === 'undefined') {
          $.getScript(
            'https://maps.googleapis.com/maps/api/js?key=' + key
          ).then(function() {
            apiStatus = 'loaded';
            initAllMaps();
          });
        }
      }
    }
  }

  function initAllMaps() {
    // API has loaded, load all Map instances in queue
    $.each(mapsToLoad, function(index, instance) {
      instance.createMap();
    });
  }

  function geolocate($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({ address: address }, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }

  Map.prototype = _.assignIn({}, Map.prototype, {
    createMap: function() {
      var $map = this.$container.find('.map-section__container');

      return geolocate($map)
        .then(
          function(results) {
            var mapOptions = {
              zoom: config.zoom,
              styles: config.styles,
              center: results[0].geometry.location,
              draggable: false,
              clickableIcons: false,
              scrollwheel: false,
              disableDoubleClickZoom: true,
              disableDefaultUI: true
            };

            var map = (this.map = new google.maps.Map($map[0], mapOptions));
            var center = (this.center = map.getCenter());

            //eslint-disable-next-line no-unused-vars
            var marker = new google.maps.Marker({
              map: map,
              position: center
            });

            google.maps.event.addDomListener(
              window,
              'resize',
              $.debounce(250, function() {
                google.maps.event.trigger(map, 'resize');
                map.setCenter(center);
              })
            );
          }.bind(this)
        )
        .fail(function() {
          var errorMessage;

          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage = theme.strings.addressNoResults;
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage = theme.strings.addressQueryLimit;
              break;
            default:
              errorMessage = theme.strings.addressError;
              break;
          }

          var $mapContainer = $map.parents('.map-section');

          // Only show error in the theme editor
          if (Shopify.designMode) {
            $mapContainer.addClass('page-width map-section--load-error');
            $mapContainer.find('.map-section__content-wrapper').remove();
            $mapContainer
              .find('.map-section__wrapper')
              .html(
                '<div class="errors text-center" style="width: 100%;">' +
                  errorMessage +
                  '</div>'
              );
          } else {
            $mapContainer.removeClass('map-section--display-map');
          }
        });
    },

    onUnload: function() {
      if (typeof window.google !== 'undefined') {
        google.maps.event.clearListeners(this.map, 'resize');
      }
    }
  });

  return Map;
})();

// Global function called by Google on auth errors.
// Show an auto error message on all map instances.
// eslint-disable-next-line camelcase, no-unused-vars
function gm_authFailure() {
  if (Shopify.designMode) {
    theme.$currentMapContainer.addClass('page-width map-section--load-error');
    theme.$currentMapContainer.find('.map-section__content-wrapper').remove();
    theme.$currentMapContainer
      .find('.map-section__wrapper')
      .html(
        '<div class="errors text-center" style="width: 100%;">' +
          theme.strings.authError +
          '</div>'
      );
  } else {
    theme.$currentMapContainer.removeClass('map-section--display-map');
  }
}


/* ================ TEMPLATES ================ */
window.theme = window.theme || {};

theme.Collection = (function() {
  function Collection() {
    theme.collectionGridMasonry();
  }

  Collection.prototype = _.assignIn({}, Collection.prototype, {
    init: function() {
      theme.collectionGridMasonry();
    },
    onSelect: function() {
      theme.collectionGridMasonry();
    }
  });

  return Collection;
})();

window.theme = window.theme || {};

theme.Search = (function() {
  function Search() {
    theme.collectionGridMasonry();
  }

  Search.prototype = _.assignIn({}, Search.prototype, {
    init: function() {
      theme.collectionGridMasonry();
    },
    onSelect: function() {
      theme.collectionGridMasonry();
    }
  });

  return Search;
})();


theme.cacheSelectors = function() {
  theme.cache = {
    $html: $('html'),
    $body: $('body'),
    $wrapper: $('.wrapper'),
    $sidebar: $('#sidebar'),
    $logo: $('#logo'),
    $meta: $('#meta'),
    $siteHeader: $('.site-header'),
    $menu: $('#menu'),
    $nav: $('#AccessibleNav'),
    $siteLogo: $('.site-header__logo'),
    $mobileMenu: $('.nav-bar'),
    $mobileMenuButton: $('#menu-opener'),
    $responsiveMenu: $('#meta').find('.responsive-menu'),
    $responsiveClose: $('.responsive-close'),
    $options: $('#options'),
    $footer: $('#footer'),
    $content: $('#content'),
    touchM: 'ontouchstart' in window,
    iOS: /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
    navWidth: 0,
    logoWidth: 0
  };
};

theme.customSelectorArrow = function(el) {
  var scope = el || document;
  $('select', $(scope)).each(function() {
    $(this).wrap('<div class="jumpstart-selector"></div>');
    $(this)
      .parent()
      .attr('style', $(this).attr('style'));
    $(this)
      .parent()
      .append('<span class="arrow">' + $.themeAssets.arrow_down + '</span>');
  });
};

theme.collectionGridMasonry = function() {
  if (typeof $.fn.packery !== 'undefined' && $('.collection-list').length > 0) {
    $('.collection-list').imagesLoaded(function() {
      $('.collection-list').packery({
        itemSelector: '.product',
        transitionDuration: 0
      });
    });
  }
};

theme.parallaxBg = function() {
  if (!$('.parallax-bg').length > 0 || !$('#section-a').length > 0) return;

  var $prlxBg, $prlxTxt;

  if ($('#section-a').length > 0) {
    $prlxBg = $('#section-a span.prlx-bg');
    $prlxTxt = $('#section-a .wrapper').addClass('prlx-txt');
    $prlxBg.parent().addClass('parallax-bg');
  } else {
    $prlxBg = $('.prlx-bg');
    $prlxTxt = $('.prlx-txt');
  }
  $(window).on('scroll', function() {
    if (!$(window).scrollTop() < $prlxBg.height()) return;

    $prlxBg.css(
      'transform',
      'translate3d(0px, ' + $(window).scrollTop() / 4 + 'px, 0px)'
    );
    $prlxTxt.css(
      'transform',
      'translate3d(0px, ' + $(window).scrollTop() / 8 + 'px, 0px)'
    );
  });
};

theme.quantityButtons = function() {
  if ($('input#Quantity').length > 0) {
    $(document).on('click', '.plus, .minus', function() {
      var $qty = $(this).siblings('#Quantity'),
        currentVal = parseFloat($qty.val()),
        max = parseFloat($qty.attr('max')),
        min = parseFloat($qty.attr('min')),
        step = $qty.attr('step');

      if (!currentVal || currentVal === '' || currentVal === 'NaN')
        currentVal = 0;
      if (max === '' || max === 'NaN') max = '';
      if (min === '' || min === 'NaN') min = 0;
      if (
        step === 'any' ||
        step === '' ||
        step === undefined ||
        parseFloat(step) === 'NaN'
      )
        step = 1;

      if ($(this).is('.plus')) {
        if (max && (max === currentVal || currentVal > max)) {
          $qty.val(max);
        } else {
          $qty.val(currentVal + parseFloat(step));
        }
      } else {
        if (min && (min === currentVal || currentVal < min)) {
          $qty.val(min);
        } else if (currentVal > 0) {
          $qty.val(currentVal - parseFloat(step));
        }
      }
      $qty.trigger('change');
    });
  }
};

theme.passwordFooter = function() {
  if (!$('.template-password').length > 0) return;

  var $pageContainer = $('#PageContainer'),
    $passwordFooter = $('#password-footer');
  $(window)
    .on('resize', function() {
      if ($(window).height() < $pageContainer.height()) {
        $passwordFooter.removeClass('full');
      } else {
        $passwordFooter.addClass('full');
      }
    })
    .trigger('resize');
};

theme.infiniteBlog = function() {
  var $infiniteLink = $('#infinite-link'),
    $infiniteURL = $infiniteLink.children('a'),
    $blogList = $('.blog-list');

  if ($infiniteLink.length > 0) {
    $infiniteURL.on('click', function(e) {
      $infiniteURL.addClass('btn--disabled').text('Loading ...');
      var href = $(this).attr('href');
      $.ajax({
        url: href,
        dataType: 'html',
        success: function(data) {
          var $data = $(data),
            $posts = $data.find('.article'),
            $infinite = $data.find('#infinite-link');
            console.log($posts)
          $posts.imagesLoaded(function() {
            $posts.css('display', 'none');
            $blogList.append($posts);
            $posts.slideDown(300);
            if ($infinite.length > 0) {
              $infiniteURL
                .removeClass('btn--disabled')
                .text('More publications')
                .prop('href', $infinite.children('a').prop('href'));
            } else {
              $infiniteURL.text('All posts loaded');
            }
          });
        }
      });
      e.preventDefault();
    });
  }
};

theme.homeGallery = function() {
  if ($('.home-gallery').length > 0) {
    $('.home-gallery').imagesLoaded(function() {
      $('.home-gallery')
        .find('.item')
        .each(function() {
          var $img = $(this).find('img');
          if ($img[0].naturalWidth <= $img[0].naturalHeight) {
            $(this).addClass('one-quarter medium-down--one-half');
          } else {
            $(this).addClass('one-half medium-down--one-whole');
          }
        });
      $('.home-gallery')
        .find('.packery-container')
        .packery({
          itemSelector: '.grid__item',
          gutter: 0,
          percentPosition: true,
          transitionDuration: 0
        });
      $('.home-gallery').addClass('init');
      $('.home-gallery')
        .find('.packery-container')
        .packery();
    });
  }
};

theme.iframePopUp = function() {
  $('.video-overlay').magnificPopup({
    type: 'iframe',
    mainClass: 'mfp-fade'
  });
};

theme.accordionFAQs = function(el) {
  var scope = el || document;

  if ($('.jumpstart-accordion', $(scope)).length > 0) {
    $('.jumpstart-accordion', $(scope)).each(function() {
      var $sections = $(this).children('div');
      var $opened = $sections.filter('.opened');
      $opened.children('div').slideDown(0);
      $(this)
        .children('div')
        .children('h3')
        .prepend($.themeAssets.plus + $.themeAssets.minus)
        .click(function() {
          var $this = $(this).parent();
          if ($this.hasClass('opened')) {
            $this.removeClass('opened');
            $this
              .children('div')
              .stop()
              .slideUp(300);
          } else {
            $this.addClass('opened');
            $this
              .children('div')
              .stop()
              .slideDown(300);
            $sections
              .not($this)
              .removeClass('opened')
              .children('div')
              .stop()
              .slideUp(300);
          }
        });
    });
  }
};

theme.crowdCampaign = function($campaignContainer) {
  if (!$('.home-kickstarter').length > 0) return;

  var sectionId = $campaignContainer.data('section-id');

  // PIE
  $('.kickstarter__graphic.pie', $campaignContainer).html(
    '<canvas id="kickstarter__pie--help--' +
      sectionId +
      '" width="110" height="110"></canvas><canvas id="kickstarter__pie--' +
      sectionId +
      '" width="110" height="110"></canvas>'
  );

  var progress = 0,
    pieI = null,
    pieValue = Math.min(
      parseInt($('.kickstarter__graphic', $campaignContainer).data('value')) /
        100,
      1
    ),
    pieColor = $('.kickstarter__graphic', $campaignContainer).data('color'),
    pieCanvas = document.getElementById('kickstarter__pie--' + sectionId),
    context = pieCanvas.getContext('2d'),
    centerX = pieCanvas.width / 2,
    centerY = pieCanvas.height / 2,
    radius = 45;

  context.lineWidth = 15;
  context.strokeStyle = pieColor;
  context.lineCap = 'round';

  pieI = setInterval(function() {
    progress = progress + 0.0025;
    context.clearRect(0, 0, pieCanvas.width, pieCanvas.height);
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * progress * Math.PI, false);
    context.stroke();
    if (progress >= pieValue) {
      clearInterval(pieI);
    }
  }, 5);

  var pieCanvasHelp = document.getElementById(
      'kickstarter__pie--help--' + sectionId
    ),
    contextHelp = pieCanvasHelp.getContext('2d'),
    centerXHelp = pieCanvasHelp.width / 2,
    centerYHelp = pieCanvasHelp.height / 2,
    radiusHelp = 45;

  contextHelp.lineWidth = 15;
  contextHelp.strokeStyle = '#e9e9e9';
  contextHelp.lineCap = 'round';
  contextHelp.beginPath();
  contextHelp.arc(centerXHelp, centerYHelp, radiusHelp, 0, 2 * Math.PI, false);
  contextHelp.stroke();

  // BAR

  var barValue = Math.min(
    parseInt($('.kickstarter__graphic.bar', $campaignContainer).data('value')),
    100
  );
  $('.kickstarter__graphic.bar', $campaignContainer).append(
    '<div class="value"></div>'
  );
  $('.kickstarter__graphic.bar .value', $campaignContainer).css(
    'width',
    barValue + '%'
  );
};

$(document).ready(function() {
  var sections = new theme.Sections();

  sections.register('header-section', theme.HeaderSection);
  sections.register('slideshow-section', theme.SlideshowSection);
  sections.register('product', theme.Product);
  sections.register('home-product', theme.Product);
  sections.register('collection-template', theme.Collection);
  sections.register('list-collection-template', theme.Collection);
  sections.register('home-kickstarter', theme.Kickstarter);
  sections.register('home-faq', theme.FAQs);
  sections.register('faq-accordion', theme.FAQs);
  sections.register('product-accordion', theme.FAQs);
  sections.register('feature-collection', theme.Collection);
  sections.register('map-section', theme.Maps);
  sections.register('search', theme.Search);
});

(function($) {
  $(document).ready(function($) {
    'use strict';

    /* Elements */
    /* -----      Subscribe popup for newsletter     ----- */

    // Show signup popup for newsletter after 10s
    setTimeout(function() {
      var signupCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('subscribe_for_newsletter='));

      var showSignupPopup = false
      if (signupCookie !== undefined) {
        var cookieValue = signupCookie.split('=')[1];
        if (cookieValue === 'true') {
          showSignupPopup = false
        } else {
          showSignupPopup = true
        }
      } else {
        showSignupPopup = true
      }

      if (showSignupPopup) {
        $('#newsletter-popup').addClass('show');
        document.cookie = 'subscribe_for_newsletter=true'
      }
    }, 10000)

    $(document).on('click', '#newsletter-popup .popup-container #popup-close-button', function() {
      $('#newsletter-popup').removeClass('show');
    });

    $(document).on('click', '#newsletter-popup .newsletter-popup__wrapper', function(e) {
      e.stopPropagation();
      $('#newsletter-popup').removeClass('show');
    });

    /* eslint-disable */
    var $html = $('html'),
      $body = $('body'),
      $wrapper = $('.wrapper'),
      $sidebar = $('#sidebar'),
      $logo = $('#logo'),
      $meta = $('#meta'),
      $siteHeader = $('.site-header'),
      $menu = $('#menu'),
      $nav = $('#AccessibleNav'),
      $siteLogo = $('.site-header__logo'),
      $mobileMenu = $('.nav-bar'),
      $mobileMenuButton = $('#menu-opener'),
      $responsiveMenu = $meta.find('.responsive-menu'),
      $responsiveClose = $('.responsive-close'),
      $options = $('#options'),
      $footer = $('#footer'),
      $content = $('#content'),
      touchM = 'ontouchstart' in window,
      iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
      navWidth = 0,
      logoWidth = 0;
    /* eslint-enable */
  });
})(jQuery);

theme.init = function() {
  theme.cacheSelectors();
  theme.parallaxBg();
  theme.customSelectorArrow();
  theme.quantityButtons();
  theme.passwordFooter();
  theme.infiniteBlog();
  theme.homeGallery();
  theme.iframePopUp();

  if (theme.cache.$body.hasClass('template-index')) {
    if (
      $('.main-content')
        .children('.index-sections')
        .children('.shopify-section').length %
        2 !==
      0
    ) {
      $('.social-footer').addClass('even');
    }
  }
};
$(theme.init);
