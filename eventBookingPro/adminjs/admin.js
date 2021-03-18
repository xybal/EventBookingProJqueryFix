/* Event Booking Pro - WordPress Plugin
 * Get plugin at: http://iplusstd.com/item/eventBookingPro/
 * iPlus Studio
 * Fixed by Xybal https://github.com/xybal/EventBookingProJqueryFix/
 */

(function ($) {

  $(document).ready(function () {

    window.appSettings = {
      googleMapsEnabled: 'true',
      emailBookingCanceled: 'false',
      emailRulesEnabled: 'false',
      sendEmailWhenCancelled: 'true'
    };


    var updateAdminAppSettings = function () {
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_admin_app_settings',
        success: function (response) {
          window.appSettings = $.parseJSON(response);
        }
      });
    };
    updateAdminAppSettings()

    // get ebp data

    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: 'https://moehaydar.github.io/ebpData/data.json?version=' + Date.now(),
      error: function (err) {
        if (err) console.error(err);
      },
      success: function (response) {
        setReleasedVersion(response.version);
        setDashdoardNews(response.dashboardNews)
      }

    });

    function setDashdoardNews(news) {
      $('#ebp--Dashboard-News').html("");
      news.forEach(function (n) {
        $('#ebp--Dashboard-News').append(getNewsHtml(n));
      })

    }

    function getNewsHtml(news) {
      var html = '<li><div class="alert alert-info">';
      html += '<h3>' + news.title + '</h3>';
      html += news.body
      html += '</div><li>';
      return html;
    }

    function setReleasedVersion(version) {
      if ($("#ebp-version").length > 0) {
        $mostRecentVersion = parseFloat(version);
        $currentVersion = parseFloat($("#ebp-version").attr("data-version"));

        if ($currentVersion < $mostRecentVersion) {
          $("#ebp-version").html('Version ' + version + ' is available.');
        } else if ($currentVersion > $mostRecentVersion) {
          $("#ebp-version").html('It seems that you have a newer version, you\'re lucky');
        } else {
          $("#ebp-version").html("EBP is up to date.")
        }
      }
    }

    //Button Events
    $(".eventlist li a").on('click',function (e) {
      e.preventDefault();
      eventClicked($(this));
    });

    $('#createEventBtn').on('click',function (e) {
      e.preventDefault();
      var newId = Number($("#eventCount").val()) + 1;
      $("#eventCount").val(newId);
      var html = '<li id="event_' + newId + '"><a href="#" data-id="' + newId + '" class="btnE btn-block "><small>' + newId + '</small><span>Event Name</span></a></li>';
      $(".eventlist li a.active").removeClass("active");
      $('.eventlist').append(html);
      $("#event_" + newId).find("a").addClass("active");

      $(".eventlist li:last-child a").on('click',function (e) {
        eventClicked($(this))
      });

      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      today = yyyy + '-' + mm + '-' + dd;

      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=event_get_addons_data',
        success: function (response) {
          var data = $.parseJSON(response);
          var formData = data.formsData;
          var emailsData = data.emailsData;
          prepareEventPage(newId, {
            id: newId,
            name: "Event Name",
            occur: [
              {
                id: 'new',
                start_date: today,
                start_time: '15:00:00',
                end_date: today,
                end_time: '17:00:00',
                bookingDirectly: 'true',
                bookingEndsWithEvent: 'true'
              }
            ],
            tickets: [
              {
                id: 'new',
                name: 'Regular',
                cost: '0',
                allowed: '20'
              }
            ],
            image: "",
            info: "",
            allowed: "20",
            cost: "0",
            showPrice: "true",
            modal: "true",
            showSpots: "true",
            mapAddressType: "address",
            mapAddress: "",
            address: "",
            mapZoom: "16",
            mapType: "ROADMAP",
            hasForms: formData.hasForms,
            forms: formData.forms,
            maxSpots: "-1",
            gateways: "",
            background: "",
            emailTemplateID: "-1",
            hasEmailTemplates: emailsData.hasEmailTemplates,
            hasEmailRules: emailsData.hasEmailRules,
            hasGiftCard: emailsData.hasGiftCard,
            emailTemplates: emailsData.emailTemplates,
            emailRules: [],
            eventStatus: "active"
          });
          $('#loader').slideUp(100);
        }
      });
    });

    function duplicateEvent() {
      var newId = Number($("#eventCount").val()) + 1;
      $("#eventCount").val(newId);

      var html = '<li id="event_' + newId + '"><a href="#" data-id="' + newId + '" class="btnE btn-block "><small>' + newId + '</small><span>' + $('#eventForm #name').val() + '</span></a></li>';

      $(".eventlist li a.active").removeClass("active");
      $('.eventlist').append(html);
      $("#event_" + newId).find("a").addClass("active");
      $('#event-id').val(newId);


      $('.Ebp--Occurrences--Occurrence input[name="occurid"]').val("new");
      $('.Ebp--Tickets--Ticket').each(function () {
        $(this).find('input[name="ticketid"]').val("new");
      });


      $('.ebp_email_rule').attr('data-id', '-1');

      saveEvent();
      window.scrollTo(0, 0);
    }


    $(".adminHeader a.EBP--TopBtn.settings").on('click',function (e) {
      e.preventDefault();

      $(".eventlist li a.active").removeClass("active");
      $(".adminHeader a.EBP--TopBtn").removeClass("active");
      $(this).addClass("active");
      $('#loader').slideDown(100);

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_settings&type=EVENT_BOX',
        success: function (response) {
          var data = $.parseJSON(response);
          getSettingsPage('EVENT_BOX', data);
          $('#loader').slideUp(100);
        }
      });
    });

    $(document).on("click", '.EBP--TopBtn.category', function (e) {
      e.preventDefault();

      $(".eventlist li a.active").removeClass("active");
      $(".adminHeader a.EBP--TopBtn").removeClass("active");
      $(this).addClass("active");
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_categories',
        success: function (response) {
          $('.eventDetails .cnt').hide();
          $('.eventDetails .cnt').html(response);
          $('.eventDetails .cnt').fadeIn(200);
          $('#loader').slideUp(100);
        }
      });
    });

    $(document).on("click", 'a.newCategory', function (e) {
      e.preventDefault();

      var newId = $(this).attr("data-id");
      $(this).attr("data-id", parseInt(newId, 10) + 1);
      $(".categories").find("a.newCategory").before('<a href="#" class="category editCategory" data-id="' + newId + '">Category Name</a>');

      buildCategorySection(newId, {
        id: newId,
        name: "Category Name"
      });

      saveCategory();
    });

    $(document ).on("click", 'a.editCategory',function (e) {
      e.preventDefault();
      var id = $(this).attr("data-id");
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_category&id=' + id,
        error: function (error) {
          $('#loader').slideUp(100);

          console.error(error);
          alert('check console for error');
        },
        success: function (response) {
          $('#loader').slideUp(100);

          var json = $.parseJSON(response);

          if (json.error != null) {
            alert("Error getting category!");
            return;
          }


          buildCategorySection(id, json);
        }
      });
    });

    function saveCategory() {
      $('#loader').slideDown(100);
      var id = $('#categoryForm input[name="categoryid"]').val();

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_save_category'
          + '&id=' + id
          + '&name=' + $('#categoryForm input[name="name"]').val(),
        success: function (response) {
          $('#loader').slideUp(100);
          var responseJson = $.parseJSON(response);
          if (responseJson.error !== null) {
            alert(responseJson.error);
            return;
          }


          $('a.newCategory').attr("data-id", responseJson.maxId);
          var $btn = $(".categories").find("[data-id='" + responseJson.id + "']");
          $btn.text(responseJson.html);
        }
      });
    }

    function buildCategorySection(id, data) {
      var html = '<form name="categoryForm"  method="post" id="categoryForm" class="eventForm">';
      html += '<input name="categoryid" value="' + id + '"  type="hidden"  />';

      html += '<div class="EBP--CategoryDetails--Head"><span class="id">Name: </span><input  name="name" value="' + data.name.replace(/\\/g, '') + '" class="EBP--CategoryDetails--Name" type="text"  /></div>';

      html += '<div class="EBP--CategoryDetails--Btns">';
      html += '<a href="#" class="btn btn-small btn-danger category-delete">Delete</a> ';
      html += '<a href="#" class="btn btn-small btn-success categoty-save">Save</a>';
      html += '</div>';

      html += ' </form>';

      $(".EBP--CategoryDetails").html(html);

      $(document ).on('click', '.category-delete', function (e) {
        e.preventDefault();
        deleteCategory();
      });

      $('.categoty-save').on('click',function (e) {
        e.preventDefault();
        saveCategory();
      });
    }

    function deleteCategory() {
      $('#loader').slideDown(100);
      var id = $('#categoryForm input[name="categoryid"]').val();

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_delete_category&id=' + id,
        success: function (response) {
          $('#loader').slideUp(100);
          $(".categories").find("[data-id='" + id + "']").remove();
          $(".EBP--CategoryDetails").empty();
        }
      });
    }

    function eventCategories($cnt) {
      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_event_categories&event-id=' + id,
        success: function (response) {
          $cnt.prepend(response);
          $cnt.addClass('loadedAlready');
          $('#loader').slideUp(100);

          $('a.category.toggle').on('click',function (e) {
            e.preventDefault();
            if ($(this).hasClass('notselected')) {
              $(this).removeClass('notselected');
            } else {
              $(this).addClass('notselected');
            }
          });
        }
      });
    }

    $('.EBP--TopBtn.addons').on('click',function (e) {
      e.preventDefault();

      $(".eventlist li a.active").removeClass("active");
      $(".adminHeader a.EBP--TopBtn").removeClass("active");
      $(this).addClass("active");
      $('#loader').slideDown(100);
      $('.eventDetails .cnt').fadeOut(200);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=checkAddons',
        success: function (response) {
          $('.eventDetails .cnt').html(response);
          $('.eventDetails .cnt').fadeIn(200);
          $('#loader').slideUp(100);
        }
      });
    });

    $('.EBP--TopBtn.coupon').on('click',function (e) {
      e.preventDefault();

      $(".eventlist li a.active").removeClass("active");
      $(".adminHeader a.EBP--TopBtn").removeClass("active");
      $(this).addClass("active");
      $('.eventDetails .cnt').fadeOut(200);
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_coupons_admin_page',
        error: function (error) {
          $('#loader').slideUp(100);
          console.error(error);
          alert('Check console for error');
        },
        success: function (response) {
          $('.eventDetails .cnt').html(response);
          $('.eventDetails .cnt').fadeIn(200);
          $('#loader').slideUp(100);
        }
      });
    });

    $(document).on("click", 'a.newCoupon', function (e) {
      e.preventDefault();
      var newId = $(this).attr("data-id");
      $(this).attr("data-id", parseInt(newId, 10) + 1);
      $(".coupons").find("a.newCoupon").before('<a href="" class="coupon editCoupon" data-id="' + newId + '">Coupon Name</a>');

      buildCouponSection(newId, {
        id: newId,
        name: "Coupon Name",
        amount: "0",
        code: "code_" + newId,
        isActive: "true",
        allowed: -1
      });

      saveCoupon();
    });

    $(document).on("click",  'a.editCoupon', function (e) {
      e.preventDefault();
      var id = $(this).attr("data-id");
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_coupon_get&id=' + id,
        error: function (error) {
          $('#loader').slideUp(100);

          console.error(error);
          alert('check console for error');
        },
        success: function (response) {
          $('#loader').slideUp(100);

          var json = $.parseJSON(response);

          if (json.error != null) {
            alert("Error getting coupon!");
            return;
          }

          buildCouponSection(id, json)
        }
      });
    });

    $('.EBP--TopBtn.shortcode').on('click',function (e) {
      e.preventDefault();

      $(".eventlist li a.active").removeClass("active");
      $(".adminHeader a.EBP--TopBtn").removeClass("active");
      $(this).addClass("active");
      var html = '<h2>Shortcodes</h2>';

      // <span class="new marginRight10">new </span><strong>
      html += '<div class="addonCnt">';
      html += '<h3>Event Box</h3>';
      html += '<span>To use: [eventBox id="EventID"]</span>';
      html += '<h4>Options: </h4><em>* : required</em>';
      html += '<ul>';
      html += '<li><strong>width</strong>  <em>in px</em></li>';
      html += '<li><strong>id *</strong>: ID of the event</li>';
      html += '<li><strong>date_id</strong>: If the event has multiple dates then you can specifiy which one to display. If this is not set then the eventBox will display the next upcoming date. If all dates have passed then the event box will display a message set from the settings, check examples.</li>';
      html += '<li><strong>show_all_tickets</strong>: (true/ false) when set it overrides the default value that was set in settings page</li>';
      html += '</ul>';

      html += '<h4>Examples:</h4>';
      html += '<ul><li>[eventBox id="2"]</li><li>[eventBox width="400" id="3"]</li><li>[eventBox id="2" date_id="9"]</li></ul>';
      html += '</div>';


      html += '<div class="addonCnt">';
      html += '<h3>Event Card</h3>';
      html += '<span>To use: [eventCard id="EventID"]</span>';
      html += '<h4>Options: </h4><em>* : required</em>';
      html += '<ul>';
      html += '<li><strong>width</strong>  <em>in px</em></li>';
      html += '<li><strong>id *</strong>: ID of the event</li>';
      html += '<li><strong>expand</strong>: <ul><li>on (default)</li><li>off</li></ul></li>';
      html += '<li><strong>date_id</strong>: If the event has multiple dates then you can specifiy which one to display. If this is not set then the eventBox will display the next upcoming date. If all dates have passed then the event box will display a message set from the settings, check examples.</li>';
      html += '</ul>';

      html += '<h4>Examples:</h4>';
      html += '<ul><li>[eventCard id="2"]</li><li>[eventCard width="400" id="3"]</li><li>[eventCard id="2" date_id="9"]</li></ul>';

      html += '<em>Note: To list event cards use eventsList shortcode with type="cards". Details below.</em>';
      html += '</div>';



      html += '<div class="addonCnt">';
      html += '<h3>Event Button</h3>';
      html += '<span>To use: [eventButton id="EventID"]Custom Button Text[/eventButton]</span>';
      html += '<h4>Options: </h4><em>* : required</em>';
      html += '<ul>';
      html += '<li><strong>include_price</strong>: true/false (override option set in settings)</li>';
      html += '<li><strong>id *</strong>: ID of the event</li>';
      html += '<li><strong>date_id</strong>: If the event has multiple dates then you can specifiy which one to display. If this is not set then the eventBox will display the next upcoming date. If all dates have passed then a "(passed)" msg is appended to the button</li>';
      html += '<li>Leave Shortcode content empty to display text set in settings page<ul><li>Example:[eventButton id="2"][/eventButton]</li><li>Add text to override the button text[eventButton id="2"]Buy Now[/eventButton]</li></ul></li>';

      html += '</ul>';

      html += '<h4>Examples:</h4>';
      html += '<ul><li>[eventButton id="2"][/eventButton]</li>';
      html += '<li>[eventButton id="1"]Buy Now[/eventButton]</li>';

      html += '<li>[eventButton id="1" include_price="true"][/eventButton]</li>';
      html += '</ul>';
      html += '</div>';

      html += '<div class="addonCnt">';
      html += '<h3>Calendar Shortcode</h3>';
      html += '<span>To use: [eventCalendar]</span>';
      html += '<h4>Options: </h4><em>All are optional</em>';
      html += '<ul>';
      html += '<li><strong>width</strong> <em>in px</em></li>';
      html += '<li><strong>height</strong> <em>in px</em></li>';
      html += '<li><strong>categories</strong>:';
      html += '<ul>';
      html += '<li>List of category ids to display events from. Example: 1,4,7</li>';
      html += '<li>When not used, all events are loaded</li>';
      html += '</ul>';
      html += '</li>';
      html += '<li><strong>display_mode</strong>:';
      html += '<ul>';
      html += '<li><strong>tooltip</strong>: Shows a dot on the calendar day cell. Event are then shown in a tooltip. <em>(default)</em></li>';
      html += '<li><strong>show_directly</strong>: Shows events directly on the calendar day cell</li>';
      html += '<li><strong>show_spread</strong>: Shows events spread over all days of the duration of the event.</li>';
      html += '</ul>';
      html += '</li>';
      html += '<li><strong>show_spots_left</strong>: Show spots left inside the tooltip or on the calendar day cell directly. <em>(on/off): Default is off.</em></li>';

      html += '<li><strong>category_filter</strong>: Display a filter by categories <em>Add to enable</em></li>';
      html += '<li><strong>event_filter</strong>: Display a filter by events. <em>Add to enable</em></li>';

      html += '</ul>';

      html += '<h4>Deprecated/Removed options:</h4>';
      html += '<ul>';
      html += '<li><strong><strong>lazy_load (removed)</strong>:</strong> (Now by default active)</li>';
      html += '<li><strong>loadall</strong>: Pre loads all events. <em>Default is false. (Not supported anymore, option ignored)</em></li>';
      html += '<li><strong>tooltip (deprecated)</strong>: Shows the event names when hovering over the day: <em>(Supported and will force display_mode to tooltip)</em></li>';
      html += '<li><strong>show_events_directly (deprecated)</strong>: Shows the event names directly on the calendar: <em>(Supported and will force display_mode to show_directly</em></li>';
      html += '</ul>';


      html += '<h4>Examples:</h4>';
      html += '<ul><li>[eventCalendar]</li><li>[eventCalendar width="400" categories="3"]</li><li>[eventCalendar width="400" height=400"]</li></ul>';
      html += '</div>';

      html += '<div class="addonCnt">';
      html += '<h3>Events List</h3>';
      html += '<p class="desc">Displays a list of events.</p>';
      html += '<span>To use: [eventslist]</span>';
      html += '<h4>Options: </h4><em>All are optional</em>';
      html += '<ul>';
      html += '<li><strong>type</strong><ul><li>box: <em>Displays events as box (default)</em></li><li>card: <em>Displays events as cards</em></li><li>cardExpand: <em>Displays events as Expandable Cards</em></li></ul></li>';
      html += '<li><strong>width</strong>  <em>in px</em>, if not set will default to the settings.</li>';
      html += '<li><strong>categories</strong>:';
      html += '<ul><li>Dont include to display all.</li><li>List of ids to display events from those categories only. Example: 1,2,3</li></ul>';
      html += '</li>';
      html += '<li><strong>events</strong>: <em>Default: "all", values: "all" - "upcoming" - "passed"</li>';
      html += '<li><strong>months</strong>: <em>Gets events in set months. Ex "1,2" will display events from Jan and Feb.</em> Dont set to fetch from all months.</li>';
      html += '<li><strong>nextdays</strong>: <em>If set will show events in the coming set days. Ex: 15 will show events of the comming 15 days.</em></li>';
      html += '<li><strong>order</strong>: <em>Default: "asc", values:  "asc" - "desc"</em></li>';
      html += '<li><strong>limit</strong>: <em>Default: "100" </em></li>';
      html += '<li><strong>filter</strong>: <em>Allows user to filter events by categories. Default: "off" ("on"/"off") </em></li>';

      html += '<li>show_occurences_as_seperate</strong>: <em>When off, will show event once in the list even if it has more than one occurrence. If turned on, will show every occurrences as a new entires (eventbox/card) in the list. "more dates" button will still be shown on the event.. Default: "off" ("on"/"off") </em></li>';


      html += '</ul>';
      html += '<em>Mixing options can be helpful. Ex: if you set months="2" and nextdays="15" then only events of the next 15 days that fall in feb will be displayed. Example: if today is 20 feb, then events from 20-28 will be shown. Similarly, If today is 3 feb, then events from 3-18 feb will be shown.</em>';

      html += '<h4>Examples:</h4>';
      html += '<ul><li>[eventslist]</li><li>[eventslist width="400" categories="1,3"]</li><li>[eventslist months="1,2,3"]</li><li>[eventslist nextdays="15"]</li><li>[eventslist events="upcoming" limit="5"]</li><li>[eventslist events="upcoming" type="card"]</li></ul>';
      html += '</div>';


      html += '<div class="addonCnt isAddon">';
      html += '<h3>ByDay Calendar</h3>';
      html += '<p class="desc">This interactive horizontal calendar will allow you to see events for a chosen day for the focused month.</p>';
      html += '<span>To use: [byDayCalendar]</span>';
      html += '<h4>Options: </h4><em>All are optional</em>';
      html += '<ul>';
      html += '<li>type</strong><ul><li>box: <em>Displays events as box (default)</em></li><li>card: <em>Displays events as cards</em></li><li>cardExpand: <em>Displays events as Expandable Cards</em></li></ul></li>';
      html += '<li><strong>width</strong>  <em>in px</em></li>';
      html += '<li><strong>categories</strong>:';
      html += '<ul><li>Dont include to display all.</li><li>List of ids to display events from those categories only. Eample: 1,2,3</li></ul>';
      html += '</li>';
      html += '</ul>';

      html += '<h4>Examples:</h4>';
      html += '<ul><li>[byDayCalendar]</li><li>[byDayCalendar width="400" categories="3"]</li><li>[byDayCalendar categories="1,2,4"]</li></ul>';
      html += '</div>';

      html += '<div class="addonCnt isAddon">';
      html += '<h3>Weekly Calendar</h3>';
      html += '<p class="desc">A weekly view of your events calendar</p>';
      html += '<span>To use: [eventWeeklyView]</span>';
      html += '<h4>Options: </h4><em>All are optional</em>';
      html += '<ul>';

      html += '<li><strong>width</strong> <em>in px</em></li>';
      html += '<li><strong>height</strong> <em>in px</em></li>';
      html += '<li><strong>categories</strong>:';
      html += '<ul>';
      html += '<li>List of category ids to display events from. Example: 1,4,7</li>';
      html += '<li>When not used, all events are loaded</li>';
      html += '</ul>';
      html += '</li>';
      html += '<li><strong>show_spots_left</strong>: Show spots left inside the tooltip or on the calendar day cell directly. <em>(on/off): Default is off.</em></li>';
      html += '<li><strong>show_background: </strong><em>(on/off): Default is off.</em></li>';

      html += '</ul>';

      html += '<h4>Examples:</h4>';
      html += "<ul><li>[eventWeeklyView width='400' height='1000' ]</li><li>[eventWeeklyView width='400' height='1000' show_spots_left='on']</li><li>[eventWeeklyView width='400' height='1000' show_background='on']</li></ul>";
      html += '</div>';

      html += '<div class="addonCnt isAddon">';
      html += '<h3>Booked events</h3>';
      html += '<p class="desc">Show booked events for the user on your website + ability to cancel them.</span>';
      html += '<span>To use: [listBookedEvents]</span>';
      html += '<a href="http://iplusstd.com/item/eventBookingPro/example/users-addon/">Users addon</a>'
      html += '</div>';


      html += '<div class="addonCnt isAddon">';
      html += '<h3>Gift card</h3>';
      html += '<p class="desc">Displays the gift card</p>';
      html += '<span>To use: [eventGiftCard id="1"]BUTTON_TEXT[/eventGiftCard]</span>';

      html += '<h4>For shortcode content (BUTTON_TEXT)</h4>';
      html += '<ul>';
      html += '<li>use <strong>%amount%</strong> is a keyword that can be used in shortcode content. It will be replaced by the formatted amount.</li>'
      html += '<li>Leave empty for default setting</li>';
      html += '</ul>';

      html += '<h4>Options: </h4>';
      html += '<ul>';
      html += '<li><strong>id</strong>: <em>Gift card id (required)</em></li>';
      html += '<li><strong>display</strong><ul><li><strong>button</strong></li><li><strong>box</strong></li></ul></li>';
      html += '<li><strong>width</strong>  <em>in px</em>, if not set will default to the settings. (only for box)</li>';
      html += '</ul>';
      html += '</div>'

      html += '<div class="addonCnt isAddon">';
      html += '<h3>Events Slider</h3>';
      html += '<p class="desc">Displays a slider of events </p>';
      html += '<span>To use: [ebpSlider]</span>';
      html += '<h4>Options: </h4><em>All are optional</em>';
      html += '<ul>';
      html += '<li><strong>UI Options</strong>:<ul>';
      html += '<li><strong>width</strong>  <em>in px</em>, if not set will default to the settings.</li>';
      html += '<li><strong>height</strong>  <em>in px</em>, if not set will default to the settings.</li>';


      html += '<li><strong>vertical</strong>: <em>adsad Default: "off" ("on"/"off") </em></li>';

      html += '<li><strong>central</strong>: <em>adsad Default: "off" ("on"/"off") </em></li>';
      html += '<li><strong>thumbnail</strong>: <em>Show the event\'s image in slide. Default: "off" ("on"/"off") </em></li>';

      html += '<li><strong>slides_to_show</strong>: <em>Number of slides to show. Default: 1</em></li>';
      html += '<li><strong>slides_to_scroll</strong>: <em>Number of slides to scroll on prev/next button press. Default: 1</em></li>';
      html += '<li><strong>infinite</strong>: <em>Enable circular effect of slides (next/prev button loop through slides)  Default: "on" ("on"/"off") </em></li>';
      html += '<li><strong>speed</strong>: <em>Slider effect speed Default: 300</em></li>';

      html += '<li><strong>autoplay</strong>: <em>Default: "off" ("on"/"off") </em></li>';
      html += '<li><strong>autoplay_speed</strong>: <em>Default: 2000</em></li>';

      html += '<li><strong>slider_id</strong>: <em>give an html id to your slider</em></li>';
      html += '</ul></li>';

      html += '<li><strong>Data Options</strong>:<ul>';
      html += '<li><strong>events_types</strong><ul><li>upcoming <em>(default)</em></li><li>passed</li><li>all</li></ul></li>';
      html += '<li><strong>categories</strong>:';
      html += '<ul><li>Dont include to display all.</li><li>List of ids to display events from those categories only. Example: 1,2,3</li></ul>';
      html += '</li>';
      html += '<li><strong>months</strong>: <em>Gets events in set months. Ex "1,2" will display events from Jan and Feb.</em> Dont set to fetch from all months.</li>';
      html += '<li><strong>nextdays</strong>: <em>If set will show events in the coming set days. Ex: 15 will show events of the comming 15 days.</em></li>';
      html += '<li><strong>order</strong>: <em>Default: "asc", values:  "asc" - "desc"</em></li>';
      html += '<li><strong>limit</strong>: <em>Default: "100" </em></li>';
      html += '<li><strong>show_occurences_as_seperate</strong>: <em>When off, will show event once in the list even if it has more than one occurrence. If turned on, will show every occurrences as a new entires (eventbox/card) in the list. "more dates" button will still be shown on the event.. Default: "off" ("on"/"off") </em></li>';


      html += '<em>Mixing options can be helpful. Ex: if you set months="2" and nextdays="15" then only events of the next 15 days that fall in feb will be displayed. Example: if today is 20 feb, then events from 20-28 will be shown. Similarly, If today is 3 feb, then events from 3-18 feb will be shown.</em>';
      html += '</ul></li>';
      html += '</ul>';


      html += '<h4>Examples:</h4>';
      html += '<ul>';

      html += '<li>[ebpSlider central="off"]<ul><li>Shows a single slide (banner style).</li></ul></li>';

      html += '<li>[ebpSlider width="600" height="150" infinite="off"  dots="off"]<ul><li>Custom size without dots and the circular effect. Central mode and no thumbnail</li></ul></li>';

      html += '<li>[ebpSlider width="800" thumbnail="on" autoplay="on"]<ul><li>Slider with custom width, autoplay and thumbnails on slides</li></ul></li>';

      html += '<li>[ebpSlider slides_to_show="3" slides_to_scroll="1"]<ul><li>Slider that shows 3 slides and scrolls 1. With central effect and no thumbnail</li></ul></li>';

      html += ' <li>[ebpSlider vertical="on"]<ul><li>A vertical slider</li></ul></li>';

      html += '<li>[ebpSlider vertical="on" dots="off" events_types="passed"]<ul><li>A vertical slider that shows passed events without dots</li></ul></li>';

      html += '<li>[ebpSlider categories="4"]<ul><li>A slider that shows events from a specific category</li></ul></li>';

      html += '<li>[ebpSlider limit="2"]<ul><li>A slider that shows 2 upcoming events only</li></ul></li>';

      html += '<li>[ebpSlider months="9,10"]<ul><li>A slider that shows upcoming events for month 9 and 10</li></ul></li>';

      html += '<li>[ebpSlider nextdays="10"]<ul><li>A slider that shows events for the next 10 days</li></ul></li>';

      html += '</ul>';
      html += '</div>';



      html += '</div>';

      $('.eventDetails .cnt').hide();
      $('.eventDetails .cnt').html(html);
      $('.eventDetails .cnt').fadeIn(200)
    });

    function getDetails(id) {
      prepareEventPage(id, ["load"])
    }

    function buildCouponSection(id, data) {
      var html = '<form name="couponForm" method="post" id="couponForm">';
      html += '<input name="couponid" value="' + id + '" type="hidden" />';

      html += '<div class="EBP--CouponsPage--Head"><span class="id">Name: </span><input  name="name" value="' + data.name.replace(/\\/g, '') + '" class="EBP--CouponsPage--Name" type="text"  /></div>';

      html += '<div class="EBP--CouponsPage--Row"><span>Code:</span><input name="code" value="' + data.code + '"  type="text" /></div>';
      html += '<div class="EBP--CouponsPage--Row"><span>Amount: <a href="#" class="tip-below tooltip" data-tip="Enter either a percentage value (10%) or a direct amount (10)">?</a></span><input name="amount" value="' + data.amount + '"  type="text" /></div>';

      html += '<div class="EBP--CouponsPage--Row">';
      html += '<span>Deducts from:</span>';
      html += '<select name="type">';
      var isSelected = (data.type == 'single') ? ' selected="selected"' : '';
      html += '<option value="single" ' + isSelected + '>Single cost</option>';
      var isSelected = (data.type == 'total') ? ' selected="selected"' : '';
      html += '<option value="total" ' + isSelected + '>Total cost</option></option>';
      html += '</select>';

      html += '</div>';

      html += '<div class="EBP--CouponsPage--Row"><span>Limit:</span><input name="maxAllowed" value="' + data.maxAllowed + '"  min="-1" type="number" /> <em style="margin-left:10px">-1 for unlimited</em></div>';

      html += '<div class="EBP--CouponsPage--Row EBP--CouponsPage--Row-Large"><span></span>';

      var checked = (data.isActive == "true") ? 'checked' : '';

      html += '<div class="hasWrapper"><div class="switch-square" id="coupon-active" data-isAnOption="yes" data-on-label="Enabled" data-off-label="Disabled"><input type="checkbox" ' + checked + '></div>';

      html += '</div></div>';

      html += '<div class="alert alert-danger" style="display:none;"></div>';
      html += '<div class="EBP--CouponsPage--Btns">';
      html += '<a href="#" class="btn btn-small btn-danger coupon-delete">Delete</a> ';
      html += '<a href="#" class="btn btn-small btn-success coupon-save">Save</a> </div>';

      html += ' </form>';

      $(".EBP--CouponsDetails").html(html);
      $('#coupon-active')['bootstrapSwitch']();

      $(document).on('click',  '.coupon-delete', function (e) {
        e.preventDefault();
        deleteCoupon();
      });

      $('.coupon-save').on('click',function (e) {
        e.preventDefault();
        saveCoupon();
      });
    }

    function eventCoupons($cnt) {
      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_event_coupon_fetch&event-id=' + id,
        success: function (response) {
          $cnt.prepend(response);
          $cnt.addClass("loadedAlready");
          $('#loader').slideUp(100);

          $('a.coupon.toggle').on('click',function (e) {
            e.preventDefault();

            if ($(this).hasClass("notselected")) {
              $(this).removeClass("notselected");
            } else {
              $(this).addClass("notselected");
            }
          });
        }
      });
    }

    function getShortCodes($cnt) {
      var id = $("#event-id").val();

      $('#loader').slideDown(100);

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_event_shortcodes&event-id=' + id,
        success: function (response) {
          json = $.parseJSON(response);
          var html = '<div class="details_sc">';

          html += "<div class='alert-info alert'>Check the 'Shortcode page' for a detailed parameters explanation!</div>";

          html += '<h3>Shortcodes for this event</h3>';

          html += '<div class="addonCnt">';
          html += '<h3>Main ShortCodes</h3>';
          html += '<h4>Main Event Box:</h4>';
          html += '<p>[eventBox id="' + id + '"]</p>';
          html += '<h4>Main Event Card:</h4>';
          html += '<p>[eventCard id="' + id + '"]</p>';
          html += '<h4>Main Event Button:</h4><p>[eventButton id="' + id + '"][/eventButton]</p>';
          html += '</div>';

          var subData;
          for (var i = 0; i < json.length; i++) {
            subData = json[i]

            html += '<div class="addonCnt">';
            html += "<h3>Shortcodes for event that occurs on " + subData.start_date + " @ " + subData.start_time + "</h3>";
            html += '<h4>Specific Event Box:</h4>';
            html += '<p>[eventBox id="' + id + '" date_id="' + subData.id + '"]</p>';
            html += '<h4>Specific Event Card:</h4>';
            html += '<p>[eventCard id="' + id + '" date_id="' + subData.id + '"]</p>';

            html += '<h4>Specific Event Button:</h4>';
            html += '<p>[eventButton id="' + id + '" date_id="' + subData.id + '"][/eventButton]</p>';
            html += '</div>';
          }

          html += '</div>';
          $cnt.html(html);

          $cnt.addClass("loadedAlready");
          $('#loader').slideUp(100);
        }
      });
    }

    function getBookingTable() {
      if ($("#ticketDateIDSELECT").length < 1) {
        getBookings();
        return;
      } else {
        var bookingDateID = $("#ticketDateIDSELECT").val();

        $('#loader').slideDown(100);
        $.ajax({
          type: 'POST',
          url: $('input[name="ajaxlink"]').val() + '/wp-admin/admin-ajax.php',
          data: 'action=event_booking_fetch&id=' + bookingDateID,
          success: function (response) {
            $('#loader').slideUp(100);
            $(".bookings").html(response);

            $('.table').dynatable({
              features: {
                pushState: false
              }
            });

            CSV($("#bookings"));
            valdiateBookingTables();
          }
        });
      }
    }

    function getBookings() {
      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=event_booking_main&event-id=' + id,
        success: function (response) {
          $("#bookings").html(response);

          $('.table').dynatable({
            features: {
              pushState: false
            }
          });

          CSV($("#bookings"));
          valdiateBookingTables();

          $("#ticketDateIDSELECT").on('change',function () {
            getBookingTable();
          });

          $("#bookings").addClass("loadedAlready");
          $('#loader').slideUp(100);
        }
      });
    }


    $(document ).on("click", '.bookings .EBP--BookingDetails' , function (e) {
      e.preventDefault();
      if ($(this).height() < 90 || e.offsetY < $(this).height() - 30) {
        return;
      }
      if ($(this).hasClass('EBP--expanded')) {
        $(this).removeClass('EBP--expanded');
      } else {
        $(this).addClass('EBP--expanded');
      }
    });

    $(document ).on("click", '.bookings a.markPaid', function (e) {
      e.preventDefault();
      markBook($(this))
    });

    $(document).on("click",  '.deleteBooking', function (e) {
      e.preventDefault();
      var confirmMsg = 'Are you sure?';

      if (window.appSettings.emailBookingCanceled == 'true') {
        confirmMsg += '\n\nThis will also send an email to the buyer.';
      }

      var confirm = window.confirm(confirmMsg);

      if (confirm) {
        deleteBooking($(this));
      }
    });

    $(document ).on("click", '.editBooking', function (e) {
      e.preventDefault();
      editBooking($(this))
    });

    $(document).on("click",  '#addNewBooking', function (e) {
      e.preventDefault();
      addBooking();
    });

    $(document ).on("click", '.resendEmail', function (e) {
      e.preventDefault();
      resendEmail($(this))
    });

    function markBook($this) {
      $('#loader').slideDown(100);
      var id = $this.attr("data-id");

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=update_booking_status&id=' + id,

        success: function (response) {
          $this.parent().html(response);
          $('#loader').slideUp(100);
        }
      });
    }

    function CSV($cnt) {
      var $table = $cnt.find("table");
      if ($table.length > 0) {
        var $button = $("<a href='#' class='btn btn-primary'></a>");
        $button.text("Export to spreadsheet");
        $cnt.find(".bookings").append($button);

        $button.on('click',function () {
          toCSV()
        });
      }
    }


    function toCSV() {
      var id = $('.bookings input[name="data_id"]').val();
      var win = window.open("admin-ajax.php?action=ebp_export_bookings_csv&&dateid=" + id, '_blank');
      if (!win) {
        //Browser has blocked it
        alert('Please allow popups for this website');
      }
    }

    function encodeToCSV(str) {
      str = str.replace(/<br>/g, '|').replace(" ", "-");
      return '"' + str + '"';
    }

    function getEventDetails() {
      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_event&event-id=' + id,
        success: function (response) {
          $("#eventEdit").addClass("loadedAlready");
          $('#loader').slideUp(100);
          var data = $.parseJSON(response);
          getEventPageMarkUp(id, data)
        }
      });
    }

    function getOccurenceHTML(id, startObj, endObj, startBookingObj, endBookingObj) {
      var startDate = startObj.date;
      var startTime = startObj.time;

      var endDate = endObj.date;
      var endTime = endObj.time;

      if (!startBookingObj.date || startBookingObj.date === '') startBookingObj.date = startObj.date;
      if (!startBookingObj.time || startBookingObj.time === '') startBookingObj.time = startObj.time;

      if (!endBookingObj.date || endBookingObj.date === '') endBookingObj.date = endObj.date;
      if (!endBookingObj.time || endBookingObj.time === '') endBookingObj.time = endObj.time;

      var html = '<div class="Ebp--Occurrences--Occurrence">';

      html += '<div class="date-group start">  <span>Starts on:</span>';
      html += '<input  name="occurid" value="' + id + '" class="txtField" type="hidden"  />';
      html += '<input  name="date" value="' + startDate + '" class="txtField" type="text"  style="width:250px"/>';
      html += '<input  name="time" value="' + startTime + '" data-value="' + startTime + '" class="txtField" style="width:100px" type="text"  />';
      html += '<a href="#" class="tip-below tooltip Ebp--Occurrences--Occurrence--Delete close" data-tip="Deleting this will also delete all bookings for this occurrence! Edit the date/time to preserve the bookings made!">x</a>';
      html += '</div>';

      html += '<div class="date-group end">  <span>Ends On:</span>';
      html += '<input name="date" value="' + endDate + '" class="txtField" type="text" style="width:250px"/>';
      html += '<input name="time" value="' + endTime + '" data-value="' + endTime + '" class="txtField" style="width:100px" type="text"  />';
      html += '</div>';

      var uniqueId = _.uniqueId('bookingStart_checkbox_');

      var isChecked = '';
      var hideOptions = ''
      if (startBookingObj.on === true || startBookingObj.on === 'true') {
        isChecked = 'checked';
        hideOptions = 'style="display: none"';
      }

      html += '<div class="date-group bookingStart">  <span></span>';
      html += '<input id="' + uniqueId + '" name="toggler" type="checkbox" ' + isChecked + '/> <label for="' + uniqueId + '" >Booking opens immediately.</label>';

      html += '<div class="options" ' + hideOptions + '>';
      html += '<input name="date" value="' + startBookingObj.date + '" class="txtField" type="text" style="width:250px"/>';
      html += '<input name="time" value="' + startBookingObj.time + '" data-value="' + startBookingObj.time + '" class="txtField" style="width:100px" type="text"  />';
      html += '</div>';
      html += '</div>';

      uniqueId = _.uniqueId('bookingEnd_checkbox_');


      var isChecked = '';
      var hideOptions = ''
      if (endBookingObj.on === true || endBookingObj.on === 'true') {
        isChecked = 'checked';
        hideOptions = 'style="display: none"';
      }

      html += '<div class="date-group bookingEnd">  <span></span>';
      html += '<input id="' + uniqueId + '" name="toggler" type="checkbox" ' + isChecked + '/> <label for="' + uniqueId + '" >Booking closes when event starts.</label>';

      html += '<div class="options" ' + hideOptions + '>';
      html += '<input name="date" value="' + endBookingObj.date + '" class="txtField" type="text" style="width:250px"/>';
      html += '<input name="time" value="' + endBookingObj.time + '" data-value="' + endBookingObj.time + '" class="txtField" style="width:100px" type="text"  />';
      html += '</div>';
      html += '</div>';

      html += '</div>';

      return html;
    }

    // email_rules
    var GLOBAL_EMAIL_TEMPLATES;
    var GLOBAL_EMAIL_INC = 0;
    function addEmailRule(id, choosenEmailTemplate, hours, before, activated) {
      var html = '';
      GLOBAL_EMAIL_INC++;
      var beforeChecked = (before) ? 'checked' : '';
      var afterChecked = (!before) ? 'checked' : '';

      html += '<div class="ebp_email_rule" data-id="' + id + '">';
      // email template
      html += '<div>Email: ' + EbpAdminBuilder.generateSelectField('rule_email_template_' + GLOBAL_EMAIL_INC, GLOBAL_EMAIL_TEMPLATES, choosenEmailTemplate) + '</div>';

      // hours
      html += '<div>'
      html += 'Hours: <input type="number" name="hours" value="' + hours + '" min="0" />'
      html += '</div>'

      // before/after
      var beforeId = 'before_email_rule_' + GLOBAL_EMAIL_INC;
      var afterId = 'after_email_rule_' + GLOBAL_EMAIL_INC;
      html += '<div>'
      html += '<div class="radioOption"><input type="radio" id="' + beforeId + '" name="rule_' + GLOBAL_EMAIL_INC + '" value="before" ' + beforeChecked + '/> <label for="' + beforeId + '">Before</label></div>'
      html += '<div class="radioOption"><input type="radio" id="' + afterId + '" name="rule_' + GLOBAL_EMAIL_INC + '" value="after" ' + afterChecked + '/> <label for="' + afterId + '">After</label></div>'
      html += '</div>'

      // activated
      var activatedId = 'active_email_rule_' + GLOBAL_EMAIL_INC;
      var activedChecked = (activated) ? 'checked' : '';
      html += '<div>'
      html += '<div class="radioOption"><input type="checkbox" id="' + activatedId + '" name="activated" ' + activedChecked + '/> <label for="' + activatedId + '">Active</label></div>'
      html += '</div>'

      // remove
      html += '<div><a href="#" class="tip-below tooltip removeEventRule" data-tip="Deleting the rule will also delete all scheduled emails">x</a></div>';
      html += '</div>'

      return html;
    }

    function emailRulesHTML(emailTemplates, emailRules) {
      GLOBAL_EMAIL_TEMPLATES = emailTemplates;
      GLOBAL_EMAIL_INC = 0;
      var html = '';
      html += '<div class="event-row-large">';
      html += '<span class="Ebp--Title" style="margin-bottom:10px">Email Rules :</div>';

      if (window.appSettings.emailRulesEnabled !== 'true') {
        html += '<small>Disabled: rules are ignored. Activate in Settings > Email Rules</small>';
      }

      html += '<div class="emailRules">';
      var rule;
      for (var i = 0; i < emailRules.length; i++) {
        rule = emailRules[i];

        html += addEmailRule(rule.id, rule.template, rule.hours, rule.isBefore === 'true', rule.activated === 'true');
      };

      html += '</div>';

      html += '<a class="addEventRule btn btn-primary" href="#">+ Add event rule</a>'

      html += '</div>'
      return html;
    }

    // email_rules
    function emailRulesHooks() {
      $('.addEventRule').on('click',function (e) {
        e.preventDefault()
        var newRule = addEmailRule('-1', '', 24, true, true);
        $('#eventForm .emailRules').append(newRule);
      });

      $(document).on('click', '#eventForm .emailRules .removeEventRule', function (e) {
        e.preventDefault();
        $(this).parent().parent().remove();
      });
    }

    // tickets
    function getSubTicketHtml(subTicket) {
      var html = '<div class="Ebp--Tickets--SubTickets">';
      html += '<div><em class="ticketname" >Name</em><em class="cost">Price</em></div>';
      html += '<div class="Ebp--Tickets--SubTickets--subTicket">';
      html += '<input class="name" name="name" value="' + subTicket.name.replace(/\\/g, '') + '" type="text"  />';
      html += '<input class="cost" name="cost" value="' + subTicket.cost + '" type="number"  /> ';
      html += '<a href="#" class="Ebp--Tickets--SubTickets--Delete">x</a>';
      html += '</div>';
      html += '</div>';

      return html;
    }

    function getTicketHtml(ticket) {
      var html = '<div class="Ebp--Tickets--Ticket">';
      html += '<div><em class="ticketname" >Name</em><em class="cost">Price</em><em class="allowed">Spots</em></div>';
      html += '<div>';
      html += '<input name="ticketid" value="' + ticket.id + '" class="txtField" type="hidden"  />';
      html += '<input class="ticketname" name="ticketname" value="' + ticket.name.replace(/\\/g, '') + '" type="text"  />';
      html += '<input class="cost" name="cost" value="' + ticket.cost + '" type="number"  /> ';
      html += '<input class="allowed" name="allowed" value="' + ticket.allowed + '" type="number"  /> ';
      html += '<a href="#" class="Ebp--Tickets--TicketDelete">x</a>';
      html += '</div>';

      html += '<div class="Ebp--Tickets--Ticket--SubCnt">';

      if (ticket.breakdown && ticket.breakdown != '' && ticket.breakdown.length > 0) {
        ticket.breakdown.forEach(function (subTicket) {
          html += getSubTicketHtml(subTicket);
        });
      }

      html += '<a href="#" class="btn Ebp--Tickets--SubTickets--Add">Add sub ticket</a>';
      html += '</div>';

      html += '</div>';

      return html;
    }

    function getEditTicketsSection(tickets, maxSpots) {
      var html = '<div class="Ebp--Tickets sect">';

      html += '<div class="Ebp--Title">Tickets : </div>';

      html += '<small><a class="Ebp--HelpBtn" href="http://iplusstd.com/item/eventBookingPro/example/tickets" target="_blank">?</a></small>';


      html += '<div class="Ebp--Tickets--Row Ebp--Tickets--List">';
      var ticket;
      for (var i = 0; i < tickets.length; i++) {
        ticket = tickets[i];
        if (ticket.breakdown && ticket.breakdown != '' && ticket.breakdown.length > 0) {
          ticket.breakdown = $.parseJSON(ticket.breakdown);
        }
        html += getTicketHtml(ticket);
      }
      html += '</div>';

      html += '<div class="Ebp--Tickets--Row Ebp--Tickets--Add">';
      html += '<a class="btn btn-primary Ebp--Tickets--Add--Simple" href="#">Add ticket</a> ';
      html += '</div>';


      html += '<div class="Ebp--Tickets--MaxSpots">';
      html += '<div style=" vertical-align:top; padding-top:3px; margin-bottom:10px;">Maximum allowed spots per occurrence: </div>';

      var checked = (maxSpots != "-1") ? "checked" : "";

      html += '<div class="Ebp--Tickets--MaxSpotsCnt">';
      html += '<div class="hasWrapper"><div class="switch-square" id="maxSpotsSwitcher" data-isAnOption="yes" data-on-label="Enabled" data-off-label="Disabled"><input type="checkbox" ' + checked + ' ></div>';
      html += '</div>';

      html += '<div class="Ebp--Tickets--MaxSpotsInput"><input type="number" id="maxSpots" name="maxSpots" class="txtField mini" value="' + maxSpots + '"/></div>';

      html += '</div>';


      html += '</div>';
      html += '</div>';

      return html;
    }

    // get event page
    function getEventPageMarkUp(id, data) {
      var checked;

      var html = '<form name="eventForm"  method="post" id="eventForm" class="eventForm">';

      html += '<div class="sect">';
      html += '<div class="head"><span class="Ebp--Title">Name : </span><input id="name" name="name" value="' + data.name.replace(/\\/g, '') + '" class="eventNametxtField" type="text"  /></div>';
      html += '</div>';

      // occurrences
      html += '<div class="Ebp--Occurrences sect">';
      html += '<div class="Ebp--Title">Occurrences : </div>';
      html += '<div class="Ebp--Occurrences--List">';
      var dates = data.occur
      var subOcc;
      var startObj, endObj, startBookingObj, endBookingObj;
      for (var j = 0; j < dates.length; j++) {
        subOcc = dates[j];

        if (subOcc != "") {
          startObj = { date: subOcc.start_date, time: subOcc.start_time };
          endObj = { date: subOcc.end_date, time: subOcc.end_time };

          startBookingObj = { on: subOcc.bookingDirectly, date: subOcc.startBooking_date, time: subOcc.startBooking_time }
          endBookingObj = { on: subOcc.bookingEndsWithEvent, date: subOcc.endBooking_date, time: subOcc.endBooking_time }

          html += getOccurenceHTML(subOcc.id, startObj, endObj, startBookingObj, endBookingObj);
        }
      }
      html += '</div>';

      html += '<div class="Ebp--Occurrences--Add Ebp--Occurrences--Add--Single">';
      html += '<a href="" class="btn btn-primary">Add occurrence</a>';
      html += '</div>';

      html += '<div class="Ebp--Occurrences--Add Ebp--Occurrences--Add--Multiple">';
      html += '<a href="" class="btn btn-primary">Generate batch (multiple) occurrences</a>';
      html += '</div>';

      html += '</div>';


      // booking
      html += '<div class="sect">';
      html += '<div class="Ebp--Title">Booking : </div>';

      html += '<div class="event-row-large">';
      html += EbpAdminBuilder.doOption({ name: "paypal", value: data.paypal, type: "toggle", title: "PayPal: " });
      html += '</div>';

      html += '<div class="event-row-large">';
      html += EbpAdminBuilder.doOption({ name: "offlineBooking", value: data.modal, type: "toggle", title: "Offline Booking: " });
      html += '</div>';

      if (data.gateways != "") {
        var gatway = data.gateways.split("%");
        var gatwaySubData;
        for (var i = 0; i < gatway.length; i++) {
          gatwaySubData = gatway[i].split('=');

          html += '<div class="event-row-large">';

          html += '<span class="label" style=" vertical-align:top; padding-top:3px; margin-bottom:10px;">' + gatwaySubData[0] + ':</span>';

          checked = (gatwaySubData[1] === 'true') ? 'checked' : '';
          html += '<div class="hasWrapper">';
          html += '<div class="switch-square gateway" data-name="' + gatwaySubData[0] + '" data-isAnOption="yes" data-on-label="On" data-off-label="Off"><input type="checkbox" ' + checked + '></div>';
          html += '</div>';

          html += '</div>';
        }
      }


      html += '<div class="event-row-large">';
      html += EbpAdminBuilder.doOption({ name: "showPrice", value: data.showPrice, type: "toggle", title: "Show Price: " });
      html += '</div>';

      html += '<div class="event-row-large">';
      html += EbpAdminBuilder.doOption({ name: "showSpots", value: data.showSpots, type: "toggle", title: "Show Spots Left: " });
      html += '</div>';


      html += '</div>';


      // currency
      html += '<div class="sect">';
      html += '<div class="Ebp--Title">Currency : </div>';
      html += '<div class="sectCnt">';
      html += EbpAdminBuilder.getCurrencySelect("currency", data.currency, [{ name: 'Default currency', value: "" }]);
      html += '</div>';
      html += '</div>';

      // tickets
      html += getEditTicketsSection(data.tickets, data.maxSpots);


      //image
      html += '<div class="sect">';
      html += '<div class="Ebp--Title">Image : </div>';

      html += "<div class='sectCnt upload'>";

      html += '<input type="hidden" id="image" class="regular-text text-upload" name="image" value="' + data.image + '" />';

      html += '<a href="#" class="btn btn-primary button-upload">Add/Change</a>';
      html += '<a href="#" class="removeImg" style="margin-left:10px">remove</a>';
      html += '<img  src="' + data.image + '" class="preview-upload"/>';
      html += '</div>';

      html += '</div>';


      //background
      if (!data.background) data.background = '';
      html += '<div class="sect">';
      html += '<div class="Ebp--Title">Background : </div>';
      html += '<small>Can be used in EventCard and EventCalendar (Set in Settings page)</small>';

      html += "<div class='sectCnt upload'>";

      html += '<input type="hidden" id="background" class="regular-text text-upload" name="background" value="' + data.background + '" />';

      html += '<a href="#" class="btn btn-primary button-upload">Add/Change</a>';
      html += '<a href="#" class="removeImg" style="margin-left:10px">remove</a>';
      html += '<img  src="' + data.background.split('__and__')[0] + '" class="preview-upload"/>';
      html += '</div>';

      html += '</div>';


      //map
      html += '<div class="sect" id="mapControl">';
      html += '<div class="Ebp--Title">Location: </div>';

      html += '<div class="event-row spaced"><span style="vertical-align:top;">Address Type:</span>';

      var addressType = (data.mapAddressType == "address") ? 'selected="selected"' : '';
      var latlongType = (data.mapAddressType == "latlng") ? 'selected="selected"' : '';
      html += '<select id="mapAddressType" name="mapAddressType">';
      html += '<option value="address" ' + addressType + '>Address</option>';
      html += '<option value="latlng" ' + latlongType + '>Latitude/Longitude</option>';
      html += '</select>';
      html += "</div>";

      html += '<div class="event-row spaced"><span style="vertical-align:top;">Location address (gmaps):</span>';
      html += '<input  name="mapAddress" value="' + data.mapAddress + '" class="txtField" type="text"  />';
      html += '<small  style="float:none;margin-left:10px; display: inline-block;" >leave location emtpy to remove googlemaps. </small>';
      html += "</div>";

      html += '<div class="event-row spaced"><span style="vertical-align:top;">Map Zoom Level:</span>';
      html += '<input name="mapZoom" value="' + data.mapZoom + '" class="txtField mini" type="number"  /> ';
      html += "</div>";



      html += '<div class="event-row spaced"><span style="vertical-align:top;">Map Type:</span>';
      var HYBRID = (data.mapType == "HYBRID") ? 'selected="selected"' : '';
      var ROADMAP = (data.mapType == "ROADMAP") ? 'selected="selected"' : '';
      var SATELLITE = (data.mapType == "SATELLITE") ? 'selected="selected"' : '';
      var TERRAIN = (data.mapType == "TERRAIN") ? 'selected="selected"' : '';

      html += '<select id="mapType" name="mapType">';
      html += '<option value="HYBRID" ' + HYBRID + '>HYBRID</option>';
      html += '<option value="ROADMAP" ' + ROADMAP + '>ROADMAP</option>';
      html += '<option value="SATELLITE" ' + SATELLITE + '>SATELLITE</option>';
      html += '<option value="TERRAIN" ' + TERRAIN + '>TERRAIN</option>';
      html += '</select>';

      if (window.appSettings.googleMapsEnabled == 'false') {
        html += '<div class="warning" style="margin-top:20px">Warning: Maps are disabled. To use them enable maps in Settings > Maps</div>';
      }

      html += "</div>";

      html += '<div class="event-row spaced"><span style="vertical-align:top;">Alternative Location address:</span>';
      html += '<input  name="address" value="' + data.address + '" class="txtField" type="text"  />';
      html += '<small  style="float:none;margin-left:10px; display: inline-block;" >Used for display only. If left empty location above is used (if available).</small>';
      html += "</div>";


      html += "</div>";


      //description
      html += '<div class="sect">';
      html += '<div class="Ebp--Title">Description : </div>';

      html += '<div class="event-row spaced"><textarea id="info" name="info" class="textareaField">' + data.info.replace(/\\/g, '') + '</textarea> </div>';
      html += '</div>';

      //form
      html += '<div class="sect">';
      html += '<div class="Ebp--Title">Booking form : </div>';
      if (data.hasForms == "false") {
        html += '<div class="event-row spaced ">';
        html += '<div class="alert alert-info"><h3>To use Custom Forms you have to <a href="http://iplusstd.com/item/eventBookingPro/buyFormsAddon.php">purchase</a>/enable the <a href="http://iplusstd.com/item/eventBookingPro/buyFormsAddon.php">Event Booking Forms Add-on</a></h3>';
        html += "Default form will be used. Customize it in settings page: It contains 4 fields: Name, email, phone and Address. The last two can be toggled on and off.</div>";
        html += '<input  id="formID" type="hidden" value="' + data.form + '">';
      } else {
        html += '<div class="event-row ">';

        html += '<span style="vertical-align:top;">Choose Form:</span>';
        html += EbpAdminBuilder.generateSelectField('formID', data.forms, data.form)
      }

      html += '</div>';
      html += '</div>';

      //email
      html += '<div class="sect">';
      html += '<span class="Ebp--Title" style="margin-bottom:10px">Emails : </div>';

      if (data.hasEmailTemplates == "false") {
        html += '<div class="event-row spaced ">';
        html += '<div class="alert alert-info"><h3>Requires Email Templates Add-on. <a href="http://iplusstd.com/item/eventBookingPro/buyEmailTemplatesAddon.php">Purchase</a> or enable the addon.</h3><br/>Allows you to change the email template and set an alternative email address to receive email when a booking happens.</div>';
        html += '<input id="emailTemplateID" type="hidden" value="' + data.emailTemplateID + '">';
        html += '</div>';
      } else {
        var emailTemplates = data.emailTemplates;

        html += '<div class="event-row ">';

        html += '<span style="vertical-align:top;">Confirmation Email Template:</span>';
        html += EbpAdminBuilder.generateSelectField("emailTemplateID", emailTemplates, data.emailTemplateID);
        html += '</div>';

        html += '<div class="event-row-large">';
        if (!validateEmail(data.ownerEmail)) data.ownerEmail = '';

        html += EbpAdminBuilder.getToggling({
          title: 'Alternative email address:',
          info: "Alternative Email address to receive an email when a booking happens. Default is set in settings.",
          value: (data.ownerEmail === '') ? 'false' : 'true',
          name: "ownerEmailToggle",
          items: [
            EbpAdminBuilder.doOption({
              name: "ownerEmail", value: data.ownerEmail,
              type: "input", title: "Email: "
            })
          ]
        });

        html += '</div>';

        // email_rules
        var clonedEmailTempaltes = emailTemplates.slice(0);
        // remove first element (default email template)
        clonedEmailTempaltes.shift();
        if (data.hasEmailRules === 'true') {
          var emailRulesArr = (data.emailRules) ? data.emailRules : [];

          html += emailRulesHTML(clonedEmailTempaltes, emailRulesArr);
        } else {
          html += '<div class="alert alert-info" style="margin-top:20px">Update email addon to v 1.0+ and use the "email rules" feature.</div>';
        }
      }

      html += '</div>';

      html += '<div class="sect EventOperations--Sect">';
      html += '<span class="Ebp--Title" style="margin-bottom:10px">Event operations: </span>';
      html += '<div class="sectCnt" style="min-height: 35px;"><a href="#" class="btn btn-small btn-activate">Activate</a><a href="#" class="btn btn-small btn-cancel btn-danger">Cancel Event</a><a href="#" class="btn btn-small btn-operationLogs">Show logs</a></div>';
      html += '</div>';


      html += '<div class="EBP--EventEdit--Btns-Cnt">';
      html += '<a href="#" class="btn btn-small btn-danger btn-delete">Delete</a>';
      html += '<a href="#" class="btn btn-small btn-duplicate btn-primary">Duplicate</a>';
      html += '<a href="#" class="btn btn-small btn-success btn-save">Save</a>';

      html += '</div>';

      html += '<div class="EBP--EventEdit--Btns-Cnt--Fixed">';
      html += '<a href="#" class="btn btn-small btn-success btn-save">Save</a>';
      html += '<a href="#" class="btn btn-small btn-duplicate btn-primary">Duplicate</a>';
      html += '<a href="#" class="btn btn-small btn-danger btn-delete">Delete</a>';
      html += '</div>';


      html += '</form>';

      $("#eventEdit").html(html);

      setEventStatus(data.eventStatus);


      // email_rules
      html += emailRulesHooks();

      //
      $('.switch-square')['bootstrapSwitch']();

      // start do hiding
      setTimeout(function () {
        $('.switcher').each(function (index, element) {
          var $switcher = $(this).find('.make-switch');
          if ($switcher.hasClass("hasCnt")) {
            var inverseToggle = $switcher.hasClass('inverseToggle');
            isOn = $switcher.find('.switch-animate').hasClass('switch-off');

            if (!inverseToggle && isOn || inverseToggle && !isOn) {
              $(this).find(".cnt").slideUp(100);
            } else {
              $(this).find(".cnt").slideDown(100);
            }
          }
        });
      }, 10);


      $('.make-switch').on('switch-change', function (e, data) {
        var $parent = $(this).parent().parent().parent();

        if ($(this).hasClass("hasCnt")) {
          var inverseToggle = $(this).hasClass('inverseToggle');

          if ((!inverseToggle && data.value) || (inverseToggle && !data.value)) {
            var oldAttr = ($parent.find(".isBorder").attr("data-oldvalue")) ? $parent.find(".isBorder").attr("data-oldvalue") : "1";

            $parent.find(".isBorder input").val(oldAttr);
            $parent.find(".cnt").slideDown(100);

          } else {
            $parent.find(".isBorder").attr("data-oldvalue", $parent.find(".isBorder input").val());

            $parent.find(".cnt").slideUp(100, "linear", function () {
              $(this).find(".isBorder input").val("0");
            });
          }
        }
      });

      if (data.maxSpots == "-1") {
        $('.Ebp--Tickets--MaxSpotsInput').hide();
      }

      $('#maxSpotsSwitcher').on('switch-change', function (e, data) {
        if (data.value) {
          if (parseInt($('input[name="maxSpots"]').val()) < 0) {
            $('input[name="maxSpots"]').val("1");
          }
          $('.Ebp--Tickets--MaxSpotsInput').show(100);
        } else {
          $('.Ebp--Tickets--MaxSpotsInput').hide(100, "linear", function () {
            $('input[name="maxSpots"]').val("-1");
          });
        }
      });


      $('.upload').uploader();


      $(".Ebp--Occurrences--Add--Single a").on('click',function (e) {
        e.preventDefault();

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        var lastDateUsed = yyyy + '-' + mm + '-' + dd;;

        if ($('.Ebp--Occurrences--Occurrence').length > 0) {
          var lastDateObj = $('.Ebp--Occurrences--Occurrence').last().find('.start input[name="date"]').datepicker('getDate');
          lastDateUsed = lastDateObj.getFullYear() + "-" + (lastDateObj.getMonth() + 1) + "-" + lastDateObj.getDate();
        }

        var startObj = {
          date: lastDateUsed,
          time: "20:00:00"
        };
        var endObj = {
          date: startObj.date,
          time: "22:00:00"
        };

        var startBookingObj = {
          on: 'true',
          date: '',
          time: ''
        };

        var occurrence = getOccurenceHTML("new", startObj, endObj, startBookingObj, startBookingObj);

        $('.Ebp--Occurrences .Ebp--Occurrences--List').append(occurrence);

        $('.Ebp--Occurrences .Ebp--Occurrences--Occurrence').last().find('.start input[name="date"]').attr("id", "");
        $('.Ebp--Occurrences .Ebp--Occurrences--Occurrence').last().find('.end input[name="date"]').attr("id", "");

        if ($('.Ebp--Occurrences .Ebp--Occurrences--Occurrence').last().find('.start input[name="date"]').hasClass("hasDatepicker")) {
          $('.Ebp--Occurrences .Ebp--Occurrences--Occurrence').last().find('.start input[name="date"]').removeClass("hasDatepicker");
        }

        if ($('.Ebp--Occurrences .Ebp--Occurrences--Occurrence').last().find('.end input[name="date"]').hasClass("hasDatepicker")) {
          $('.Ebp--Occurrences .Ebp--Occurrences--Occurrence').last().find('.end input[name="date"]').removeClass("hasDatepicker");
        }
        getDateRowStuff($('.Ebp--Occurrences .Ebp--Occurrences--Occurrence').last())
      });

      $(".Ebp--Occurrences--Occurrence").each(function (index, element) {
        getDateRowStuff($(this))
      });

      try {
        wp.editor.remove('info');
      } catch (exception) {
        console.error(exception)
      }

      wp.editor.initialize('info', {
        tinymce: {
          content_css: ['//fonts.googleapis.com/css?family=Open+Sans', '//www.tinymce.com/css/codepen.min.css'],
          plugins: 'charmap colorpicker compat3x directionality fullscreen hr image lists media paste tabfocus textcolor wordpress wpautoresize wpdialogs wpeditimage wpemoji wpgallery wplink wptextpattern wpview',
          toolbar: ['formatselect bold italic bullist numlist hr forecolor blockquote alignleft aligncenter alignright link unlink wp_more spellchecker wp_add_media wp_adv',
            'strikethrough  pastetext removeformat charmap outdent indent undo redo wp_help']
        },
        quicktags: true

      });

    }

    function setEventStatus(active) {
      $('.btn-activate').attr('data-active', active);
      var id = $("#event-id").val();
      $eventLI = $("#event_" + id);
      $eventLI.removeClass('eventDeactivated');

      if (active == 'active') {
        $('.btn-activate').text('Deactivate event');
        $('.btn-activate').addClass('btn-danger');
        $('.btn-activate').removeClass('btn-success');
      } else {
        $('.btn-activate').text('Activate event');
        $('.btn-activate').addClass('btn-success');
        $('.btn-activate').removeClass('btn-danger');
        $eventLI.addClass('eventDeactivated');
      }
    }

    $(document ).on('click', '.btn-activate', function (e) {
      e.preventDefault();

      var eventStatus;
      if ($('.btn-activate').attr('data-active') == 'active') {
        eventStatus = 'canceled';
      } else {
        eventStatus = 'active';
      }

      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_set_event_active&id=' + id + '&eventStatus=' + eventStatus,
        success: function (response) {
          $('#loader').slideUp(100);
          setEventStatus(eventStatus);
        }
      });
    });


    $(document ).on('click', '.btn-operationLogs', function (e) {
      e.preventDefault();

      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_operation_logs&id=' + id,
        success: function (response) {
          var json = $.parseJSON(response);

          $('#loader').slideUp(100);
          var html = '<h2>"' + $("#name").val() + '" logs</h2>';

          if (json.length < 1) {
            html += 'No operations yet!';
          } else {
            html += '<table class="table">'
            html += '<thead><th>Date</th><th>Operation</th><th>User</th><th>Notes</th></thead>'
            html += '<tbody>';
            json.forEach(function (record) {
              html += '<tr>';
              html += '<td>' + record.date + '</td>';
              html += '<td>' + record.type + '</td>';
              html += '<td>' + record.user_login + '</td>';
              html += '<td>' + record.log + '</td>';
              html += '</tr>';
            })
            html += '<tbody>';
            html += '</table>'
          }

          setPopUpContent(html);
          openPopUp();
          $('.table').dynatable({
            features: {
              pushState: false
            }
          });
        }
      });
    });

    $(document ).on('click', '.btn-cancel',function (e) {
      e.preventDefault();

      if (window.appSettings.sendEmailWhenCancelled == 'true') {
        var alertResult = confirm('This will send an email to all bookers of upcoming occurrences.');
        if (!alertResult) return;
      }

      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_set_event_cancel&id=' + id,
        success: function (response) {
          $('#loader').slideUp(100);
          setEventStatus('canceled');
        }
      });
    });


    $(document ).on("click", '.upload a.removeImg', function (e) {
      e.preventDefault();
      $(this).parent().find('input').val('');
      $(this).parent().find(".preview-upload").attr('src', "");
    });

    $(document ).on("click", ".Ebp--Tickets--Add--Simple", function (e) {
      e.preventDefault();

      $('.Ebp--Tickets .Ebp--Tickets--List').append(getTicketHtml({
        id: 'new',
        name: 'Ticket Name',
        cost: 0,
        allowed: 100,
        breakdown: []
      }));
    });

    $(document ).on("click", ".Ebp--Tickets--SubTickets--Add", function (e) {
      e.preventDefault();
      $(this).before(getSubTicketHtml({
        name: 'Name',
        cost: 0
      }));
    });


    $(document).on("click",  ".Ebp--Tickets .Ebp--Tickets--TicketDelete", function (e) {
      e.preventDefault();
      $(this).parent().parent().remove();
    });

    $(document ).on("click", ".Ebp--Tickets--SubTickets--Delete", function (e) {
      e.preventDefault();
      $(this).parent().parent().remove();
    });

    $(document ).on("click", ".Ebp--Occurrences--Occurrence--Delete", function (e) {
      e.preventDefault();
      $(this).parent().parent().remove();
    });




    function getDateRowStuff($which) {
      if ($which.attr("data-processed") === "processed") return;

      $which.attr("data-processed", "processed");



      $which.find('.start input[name="time"]').timepicker({ defaultTime: $which.find('.start input[name="time"]').attr("data-value") });
      $which.find('.end input[name="time"]').timepicker({ defaultTime: $which.find('.end input[name="time"]').attr("data-value") });

      var date_str_s = $which.find('.start input[name="date"]').val().split("-");
      var date_str_e = $which.find('.end input[name="date"]').val().split("-");

      var date_s = new Date(date_str_s[0], date_str_s[1] - 1, date_str_s[2]);
      var date_e = new Date(date_str_e[0], date_str_e[1] - 1, date_str_e[2]);

      $which.find('.start input[name="date"]').datepicker({ dateFormat: "DD, d MM, yy" });
      $which.find('.end input[name="date"]').datepicker({ dateFormat: "DD, d MM, yy" });

      $which.find('.start input[name="date"]').datepicker("setDate", date_s);
      $which.find('.end input[name="date"]').datepicker("setDate", date_e);

      //bookingStart
      $which.find('.bookingStart input[name="toggler"]').on('click',function () {
        $(this).parent().find('.options').toggle(!this.checked);
      });
      $which.find('.bookingEnd input[name="toggler"]').on('click',function () {
        $(this).parent().find('.options').toggle(!this.checked);
      });

      $which.find('.bookingStart input[name="time"]').timepicker({ defaultTime: $which.find('.bookingStart input[name="time"]').attr("data-value") });
      $which.find('.bookingEnd input[name="time"]').timepicker({ defaultTime: $which.find('.bookingEnd input[name="time"]').attr("data-value") });

      date_str_s = $which.find('.bookingStart input[name="date"]').val().split("-");
      date_str_e = $which.find('.bookingEnd input[name="date"]').val().split("-");

      date_s = new Date(date_str_s[0], date_str_s[1] - 1, date_str_s[2]);
      date_e = new Date(date_str_e[0], date_str_e[1] - 1, date_str_e[2]);

      $which.find('.bookingStart input[name="date"]').datepicker({ dateFormat: "DD, d MM, yy" });
      $which.find('.bookingEnd input[name="date"]').datepicker({ dateFormat: "DD, d MM, yy" });

      $which.find('.bookingStart input[name="date"]').datepicker("setDate", date_s);
      $which.find('.bookingEnd input[name="date"]').datepicker("setDate", date_e);
    }

    // btns
    $(document ).on('click', '.btn-delete', function (e) {
      e.preventDefault();
      deleteData();
    });

    $(document ).on('click', '.btn-save', function (e) {
      e.preventDefault();
      saveEvent();
    });

    $(document ).on('click','.btn-duplicate', function (e) {
      e.preventDefault();
      duplicateEvent();
    });

    $(document ).on('click','.Ebp--Occurrences--Add--Multiple a', function (e) {
      e.preventDefault();
      openAdvancedDates()
    });

    $('.ebp-content input[name="start_time"]').timepicker();
    $('.ebp-content input[name="end_time"]').timepicker();
    $('.ebp-content input[name="start_date"]').datepicker({ dateFormat: "DD, d MM, yy" });
    $('.ebp-content input[name="end_date"]').datepicker({ dateFormat: "DD, d MM, yy" });

    $('#advancedDates #bookingsStartClose input[name="BookingCloseOpenTime"]').timepicker();

    $('.ebp-content input[name="start_date"]').datepicker("setDate", $('.ebp-content input[name="end_date"]').datepicker('getDate'));
    $('.ebp-content input[name="end_date"]').datepicker("setDate", $('.ebp-content input[name="end_date"]').datepicker('getDate'));

    $(document ).on("click", '.ebp-content  .generateDates',function (e) {
      e.preventDefault();
      var startDate = $('.ebp-content input[name="start_date"]').datepicker('getDate');
      var endDate = $('.ebp-content input[name="end_date"]').datepicker('getDate');
      var per = $('.ebp-content  input[name="advanced_per"]:checked').val();

      var startTime_F = $('.ebp-content input[name="start_time"]').val();
      var endTime_F = $('.ebp-content input[name="end_time"]').val();
      var days = parseInt($('.ebp-content input[name="event_days"]').val()) - 1;

      var startYear = startDate.getFullYear();
      var endYear = endDate.getFullYear();

      var startMonth = startDate.getMonth() + 1;
      var endMonth = endDate.getMonth() + 1;

      var startDay = startDate.getDate();
      var endDay = endDate.getDate();

      var daysOkay = [];

      if (per === "month") {
        for (var c = 1; c <= 31; c++)
          daysOkay.push($(".daysCheck #w-" + c).is(':checked'));
      } else if (per === "week") {
        for (var c = 0; c <= 6; c++)
          daysOkay.push($(".weekDaysCheck #d-" + c).is(':checked'));
      }

      var datesArr = [];

      var d_s, d_e, m_s, m_e;

      for (var y = startYear; y <= endYear; y++) {
        m_s = 1;
        m_e = 12;

        if (y == startYear) m_s = startMonth;

        if (y == endYear) m_e = endMonth;

        for (var m = m_s; m <= m_e; m++) {
          d_s = 1;

          if (m == startMonth && y == startYear) d_s = startDay;

          d_e = 31;

          if (m == endMonth && y == endYear) d_e = endDay;

          for (var d = d_s; d <= d_e; d++) {
            if (per === "month") {
              if (daysOkay[d - 1] && isValidDate(m, d, y)) {
                datesArr.push(y + "-" + m + "-" + d);
              }
            } else if (per === "week") {

              if (isValidDate(m, d, y)) {
                var dayDate = new Date(y, m - 1, d);

                if (daysOkay[dayDate.getDay()]) {
                  datesArr.push(y + "-" + m + "-" + d)
                }
              }
            }
          }
        }
      }

      // bookings
      var batchStartBookingObj = getBookingClosesOpensOptions($('#advancedDates #bookingsStartClose .bookingOpens'));
      var batchEndBookingObj = getBookingClosesOpensOptions($('#advancedDates #bookingsStartClose .bookingCloses'));

      function getBookingClosesOpensOptions($localParent) {
        var isOn = $localParent.find('input[type="checkbox"]').is(':checked');
        var bookingClosesOpensDays = '';
        var bookingClosesOpensTime = '';

        if (!isOn) {
          bookingClosesOpensDays = $localParent.find('.CB_deselected_Cnt input[name="bookingCloseOpenDays"]').val();
          bookingClosesOpensTime = formatTime($localParent.find('.CB_deselected_Cnt input[name="BookingCloseOpenTime"]').val());
        }

        return { on: isOn, days: bookingClosesOpensDays, time: bookingClosesOpensTime };
      }

      var finishDate;
      var startObj;
      var endObj;
      var startBookingObj;
      var endBookingObj;

      var startBookingOn;
      var startBookingTime;
      var startBookingDay;
      var endBookingOn;
      var endBookingTime;
      var endBookingDay;

      for (var o in datesArr) {
        finishDate = editDateByDays(datesArr[o], days);

        startObj = { date: datesArr[o], time: startTime_F };
        endObj = { date: finishDate, time: endTime_F };


        startBookingOn = batchStartBookingObj.on;
        startBookingTime = (!startBookingOn) ? batchStartBookingObj.time : "";
        if (startBookingOn) {
          startBookingDate = '';
        } else {
          startBookingDate = editDateByDays(datesArr[o], - parseInt(batchStartBookingObj.days))
        }
        startBookingObj = { on: startBookingOn, date: startBookingDate, time: startBookingTime };

        endBookingOn = batchEndBookingObj.on;
        endBookingTime = (!endBookingOn) ? batchEndBookingObj.time : "";
        if (endBookingOn) {
          endBookingDate = '';
        } else {
          endBookingDate = editDateByDays(datesArr[o], - parseInt(batchEndBookingObj.days))
        }

        endBookingObj = { on: endBookingOn, date: endBookingDate, time: endBookingTime };

        $('.Ebp--Occurrences--Add--Single').before(getOccurenceHTML("new", startObj, endObj, startBookingObj, endBookingObj));
      }

      $(".Ebp--Occurrences--Occurrence").each(function (index, element) {
        getDateRowStuff($(this));
      });

      $(".ebp-show").removeClass('ebp-show');
      $(document).removeClass('ebp-perspective');

    });

    function editDateByDays(dateString, days) {
      var date = new Date(dateString);

      date.setDate(date.getDate() + days);
      return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    }

    function isValidDate(m, d, y) {
      if (m == 3 && d == 30) return true;

      var date = new Date(y, m - 1, d);

      return (date.getFullYear() == y && (date.getMonth() + 1) == m && date.getDate() == d);
    }

    $('#advancedDates input[name="advanced_per"]').on('change',function () {
      if ($(this).is(':checked')) {
        $('.ebp-content .radioToggled').not("." + $(this).attr("data-toggle")).hide(100);
        $("." + $(this).attr("data-toggle")).show(100);
      }
    });


    $('#advancedDates #bookingsStartClose input[type="checkbox"]').on('change',function () {

      var isSelected = $(this).is(':checked');
      var $cbCnt = $(this).parent().find('.CB_deselected_Cnt')

      if (isSelected) {
        $cbCnt.hide();
      } else {
        $cbCnt.show();
      }
    });

    function resetBookingsStartClose() {
      $('#advancedDates #bookingsStartClose input[type="checkbox"]').each(function () {
        $(this).parent().find('.CB_deselected_Cnt').hide();
        $(this).attr('checked', true);
      })
    }

    function openAdvancedDates() {
      var $modalAdvaced = $('#advancedDates');
      resetBookingsStartClose();

      $modalAdvaced.addClass('ebp-show');

      setTimeout(function () { $(document).addClass('ebp-perspective'); }, 25);

      $(document).on('click', 'a.ebp-close, .ebp-overlay', function (e) {
        $modalAdvaced.removeClass('ebp-show');
        $(document).removeClass('ebp-perspective');
      });
    }

    function prepareEventPage(id, data) {
      var html = '<ul class="nav nav-tabs">';
      html += '<li class="active"><a href="#" id="edit-btn" class="tabBtn">Edit Event</a></li>';
      html += '<li><a href="#" id="booking-btn"  class="tabBtn  ">View Bookings</a></li>';
      html += '<li><a href="#" id="coupon-btn"  class="tabBtn  ">Coupons</a></li>';
      html += '<li><a href="#" id="category-btn"  class="tabBtn ">Categories</a></li>';
      html += '<li><a href="#" id="shortcode-btn"  class="tabBtn ">Shortcodes</a></li></ul>';
      html += '<input type="hidden" id="event-id" value="' + id + '"/>';
      html += '<br class="ev-clear"><div id="eventEdit" class="eventCnt"></div>';
      html += '<div id="bookings" class="eventCnt" style="display:none;"></div>';
      html += '<div id="eventShortCodes" class="eventCnt" style="display:none;"></div>';
      html += '<div id="eventCoupons" class="eventCnt" style="display:none;">';
      html += '<div style="display:block; width:100%; position:relative; margin-top:30px;">';
      html += '<a href="#" class="btn btn-small btn-success eventCouponsSave" style="margin:0 auto;">Save</a>';
      html += '</div>';
      html += '</div>';

      html += '<div id="eventCategories" class="eventCnt" style="display:none;">';
      html += '<div style="display:block; width:100%; position:relative; margin-top:30px;">';
      html += '<a href="#" class="btn btn-small btn-success eventCategoriesSave" style="margin:0 auto;">Save</a>';
      html += '</div>';
      html += '</div>';

      $('.eventDetails .cnt').html(html);

      if (data[0] === "load") {
        getEventDetails();
      } else {
        getEventPageMarkUp(id, data);
        saveEvent();
      }
    }

    $(document ).on('click', ".eventCouponsSave",function (e) {
      e.preventDefault();
      saveEventCoupons()
    });

    $(document).on('click', "#coupon-btn", function (e) {
      e.preventDefault();
      $(this).parent().parent().find(".active").removeClass("active");

      if (!$(this).parent().hasClass("active")) {
        $(this).parent().addClass("active");
        $("#eventEdit").slideUp(100);
        $("#bookings").slideUp(100);
        $("#eventShortCodes").slideUp(100);
        $("#eventCoupons").slideDown(100);
        $("#eventCategories").slideUp(100);

        if (!$("#eventCoupons").hasClass("loadedAlready")) {
          eventCoupons($("#eventCoupons"));
        }
      }

    });

    $(document ).on('click',"#category-btn", function (e) {
      e.preventDefault();
      $(this).parent().parent().find(".active").removeClass("active");

      if (!$(this).parent().hasClass("active")) {
        $(this).parent().addClass("active");
        $("#eventEdit").slideUp(100);
        $("#bookings").slideUp(100);
        $("#eventShortCodes").slideUp(100);
        $("#eventCoupons").slideUp(100);
        $("#eventCategories").slideDown(100);

        if (!$("#eventCategories").hasClass("loadedAlready")) {
          eventCategories($("#eventCategories"));
        }
      }
    });

    $(document ).on('click', ".eventCategoriesSave", function (e) {
      e.preventDefault();
      $('#loader').slideDown(100);
      var id = $('#event-id').val();
      var data = "";
      $('#eventCategories a.category.toggle').each(function (index, element) {
        data += '&categoryid-' + $(this).attr("data-id") + '=' + $(this).attr("data-id")
          + '&selected-' + $(this).attr("data-id") + '=' + $(this).hasClass("notselected");
      });

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_event_categories_update&id=' + id + "&data=" + data,
        success: function (response) {
          $('#loader').slideUp(100);
        }
      });
    });

    $(document ).on('click', "#booking-btn", function (e) {
      e.preventDefault();
      $(this).parent().parent().find(".active").removeClass("active");

      if (!$(this).parent().hasClass("active")) {
        $(this).parent().addClass("active");
        $("#eventEdit").slideUp(100);
        $("#eventCoupons").slideUp(100);
        $("#bookings").slideDown(100);
        $("#eventShortCodes").slideUp(100);
        $("#eventCategories").slideUp(100);
        getBookings();
      }
    });

    $(document ).on('click', "#shortcode-btn", function (e) {
      e.preventDefault();
      $(this).parent().parent().find(".active").removeClass("active");
      if (!$(this).hasClass("active")) {
        $(this).parent().addClass("active");
        $("#eventEdit").slideUp(100);
        $("#eventCoupons").slideUp(100);
        $("#bookings").slideUp(100);
        $("#eventShortCodes").slideDown(100);
        $("#eventCategories").slideUp(100);
        getShortCodes($("#eventShortCodes"));
      }
    });

    $(document).on('click',  "#edit-btn", function (e) {
      e.preventDefault();
      $(this).parent().parent().find(".active").removeClass("active");
      if (!$(this).parent().hasClass("active")) {
        $(this).parent().addClass("active");
        $("#eventEdit").slideDown(100);
        $("#eventCoupons").slideUp(100)
        $("#eventCategories").slideUp(100);;
        $("#eventShortCodes").slideUp(100);
        $("#bookings").slideUp(100);

        if (!$("#eventEdit").hasClass("loadedAlready")) getEventDetails();
      }
    });

    function eventClicked($which) {
      $(".adminHeader a.EBP--TopBtn").removeClass("active");
      $(".eventlist li a.active").removeClass("active");
      $which.addClass("active");

      getDetails($which.attr("data-id"));
    }

    function deleteData() {
      var id = $("#event-id").val();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_event_delete&id=' + id,
        success: function (response) {
          $('#loader').slideUp(100);
        }
      });

      $("#event_" + id).remove();
      $(".eventDetails .cnt").empty();
    }

    function resendEmail($which) {
      $('#loader').slideDown(100);
      var id = $which.parent().parent().find("td:first").html();

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=resendEmail&id=' + id,
        success: function (response) {
          $('#loader').slideUp(100);
        }
      });
    }


    function deleteBooking($which) {
      var id = $which.parent().parent().find("td:first").html();

      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_booking_delete&id=' + id,
        success: function (response) {
          $('#loader').slideUp(100);
          var json = JSON.parse(response);
          if (json.error) {
            alert('error while deleting');

            return;
          }

          $which.parent().parent().remove();
          valdiateBookingTables()
        }
      });
    }

    var $lastBookingClicked;

    function addBooking() {
      var popUpTitle = 'Add Booking';
      var d = new Date();

      var data = {
        id: '-1',
        event_id: $('input[id="event-id"]').val(),
        date_id: $('#bookings input[name="data_id"]').val(),
        quantity: 1,
        tax_rate: $('#bookings input[name="taxRate"]').val(),
        date_paid: d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(),
        ticket_id: '-1',
        type: '',
        name: '',
        email: '',
        amount: '',
        amount_taxed: '',
        txn_id: '',
        status: '',
        came: 'false',
        extras: ''
      }
      openEditBookingPopup(popUpTitle, data);
    }

    //editing booking
    function editBooking($which) {
      var id = $which.parent().parent().find("td:first").html();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=get_booking_by_id&id=' + id,
        success: function (response) {
          $('#loader').slideUp(100);
          openEditBookingPopup("Edit Booking #" + id, JSON.parse(response));
        }
      });
    }

    function openEditBookingPopup(popUpTitle, data) {

      var html = '<h3>' + popUpTitle + '</h3>';
      html += '<ul id="editBookingUL">';


      html += '<li><span>Tickets</span><select name="tickets">' + $("#availabeTickets").html() + '</select></li>';
      html += '<li><span>Type</span><input name="type" value="' + data.type + '"></li>';
      html += '<li><span>Coupon</span><select name="coupon">' + $("#availabeCoupons").html() + '</select></li>';

      html += '<li><span>Quantity</span><input type="number" min="1" name="quantity" value="' + data.quantity + '"></li>';
      html += '<li><span>Name</span><input name="name" value="' + data.name + '"></li>';
      html += '<li><span>Email</span><input name="email" value="' + data.email + '"></li>';
      html += '<li><span>Amount</span><input name="amount" value="' + data.amount + '"></li>';
      html += '<li><span>Tax Rate</span><input name="tax_rate" type="number" min="0" max="100" value="' + data.tax_rate + '"></li>';
      html += '<li><span>Amount Taxed</span><input name="amount_taxed" value="' + data.amount_taxed + '"></li>';
      html += '<li><span>Date</span><input name="date" value=""></li>';
      html += '<li><span>Payment ID</span><input name="txn_id" value="' + data.txn_id + '"></li>';
      html += '<li><span>Status</span><input name="status" value="' + data.status + '"></li>';
      html += '<li><input name="came" type="hidden" value="' + data.came + '"></li>';

      html += '<li><span>More details</span><textarea name="extras" style="width:350px; margin-left: 20px">' + data.extras.replace(/\\/g, '') + '</textarea>';

      html += '<li><input name="id" type="hidden" value="' + data.id + '"></li>';
      html += '<li><input name="event_id" type="hidden" value="' + data.event_id + '"></li>';
      html += '<li><input name="date_id" type="hidden" value="' + data.date_id + '"></li>';


      html += '</ul>';
      html += '<div style="text-align:center;">';
      html += '<a href="#" class="btn btn-small btn-primary saveBookingInfo">save</a>';
      html += '</div>';

      setPopUpContent(html);
      openPopUp();
      setTimeout(function () { calcManualBooking(); }, 10);


      if (data.ticket_id == "-1") {
        $("#editBookingUL li:first-child select option:first-child").attr("selected", "selected");
      } else {
        $("#editBookingUL li:first-child select option[value='" + data.ticket_id + "']").attr("selected", "selected");
      }

      $("#editBookingUL input[name='date']").datepicker({ dateFormat: "DD, d MM, yy" });
      var dateStr = data.date_paid.split("-");

      $("#editBookingUL input[name='date']").datepicker("setDate", new Date(dateStr[0], dateStr[1] - 1, dateStr[2]));


      $('#editBookingUL li:first-child select, #editBookingUL li:nth-child(3) select, #editBookingUL li input').on('change',calcManualBooking);
    }

    function calcManualBooking() {
      var cost = parseFloat($('#editBookingUL select[name="tickets"] option:selected').attr('data-cost'))
      var quantity = parseInt($('#editBookingUL li input[name="quantity"]').val());

      var taxRate = parseFloat($('#editBookingUL li input[name="tax_rate"]').val());
      if (isNaN(taxRate)) {
        taxRate = 0;
      }

      var couponType = $('#editBookingUL select[name="coupon"] option:selected').attr('data-type');
      var couponAmount = $('#editBookingUL select[name="coupon"] option:selected').attr('data-amount');
      var couponAmountFormatted = parseFloat(couponAmount)
      var total = quantity * cost;

      var newPrice;
      if (couponType === 'single') {
        if (couponAmount.indexOf("%") > -1)
          newPrice = cost - couponAmountFormatted * cost / 100;
        else {
          newPrice = cost - couponAmountFormatted;
        }

        total = quantity * newPrice;
      } else if (couponType === 'total') {
        if (couponAmount.indexOf("%") > -1)
          total = total - (total * couponAmountFormatted) / 100;
        else {
          total = total - couponAmountFormatted;
        }
      }

      // fix floating point
      total = Math.round(total * 1000) / 1000
      // amount taxed
      var totalTaxed = total + total * taxRate / 100;
      totalTaxed = Math.round(totalTaxed * 1000) / 1000

      $('#editBookingUL li input[name="amount"]').val(total)
      $('#editBookingUL li input[name="amount_taxed"]').val(totalTaxed)
    }

    // save booking

    $(document ).on("click", '.ebp-content  .saveBookingInfo', function (e) {
      e.preventDefault();
      var $modal = $('#popUpBox');

      $('#loader').slideDown(100);
      var id = $("#editBookingUL input[name='id']").val();

      var newDate = $modal.find('#editBookingUL input[name="date"]').datepicker('getDate');
      var newDateStr = newDate.getFullYear() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getDate();

      var booking = {
        'id': id,
        'event_id': $("#editBookingUL input[name='event_id']").val(),
        'date_id': $("#editBookingUL input[name='date_id']").val(),
        'ticket_id': $("#editBookingUL select[name='tickets']").val(),
        'type': $("#editBookingUL input[name='type']").val(),
        'coupon': $("#editBookingUL select[name='coupon']").val(),
        'quantity': $("#editBookingUL input[name='quantity']").val(),
        'name': $("#editBookingUL input[name='name']").val(),
        'email': $("#editBookingUL input[name='email']").val(),
        'amount': $("#editBookingUL input[name='amount']").val(),
        'tax_rate': $("#editBookingUL input[name='tax_rate']").val(),
        'amount_taxed': $("#editBookingUL input[name='amount_taxed']").val(),
        'date_paid': newDateStr,
        'txn_id': $("#editBookingUL input[name='txn_id']").val(),
        'status': $("#editBookingUL input[name='status']").val(),
        'came': $("#editBookingUL input[name='came']").val(),
        'extras': $("#editBookingUL textarea[name='extras']").val(),
      }

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=save_booking&id=' + id + '&booking=' + encodeURIComponent(JSON.stringify(booking)),
        success: function (response) {
          $('#loader').slideUp(100);
          $modal.removeClass('ebp-show');
          $(document).removeClass('ebp-perspective');
          getBookingTable();
        }
      });
    });

    function valdiateBookingTables() {
      if ($(".bookings table tbody tr").length > 0) {
        $(".bookings").slideDown(0);
        $("#bookings .noRecords").slideUp(0);
      } else {
        $(".bookings").slideUp(0);
        $("#bookings .noRecords").slideDown(0);
      }

    }

    function setPopUpContent(content) {
      var $modal = $('#popUpBox');
      $modal.find(".ebp-content>div").html(content);
    }

    function openPopUp() {

      var $modal = $('#popUpBox');

      $modal.addClass('ebp-show');

      setTimeout(function () {
        $('.ebp-content .offlineloader').hide();
        $(document).addClass('ebp-perspective');
      }, 25);

      $(document).on('click', 'a.ebp-close, .ebp-overlay', function (e) {
        $modal.removeClass('ebp-show');
        $(document).removeClass('ebp-perspective');
      });

    }

    function formatTime(time) {

      var timeParts = time.split(" ");
      var hourMin = timeParts[0].split(":");
      var hour = parseInt(hourMin[0]);
      var min = parseInt(hourMin[1]);

      if (timeParts[1] && timeParts[1].toLowerCase() == "pm" && hour != 12) {
        hour += 12;
      }

      if (timeParts[1] && timeParts[1].toLowerCase() == "am" && hour == 12) {
        hour = 0;
      }

      if (hour == 24) {
        hour = 0;
      }

      if (hour < 10) {
        hour = "0" + hour
      }

      if (min < 10) {
        min = "0" + min
      }

      if (hour === 0) {
        hour = "00";
      }

      if (min === 0) {
        min = "00";
      }
      return hour + ":" + min + ":" + "00";
    }

    function saveEvent() {
      var id = $('#event-id').val();

      var occur = [];

      var startDate, endDate, timeStart, timeEnd;
      $('.Ebp--Occurrences--Occurrence').each(function (index, element) {
        startDate = $(this).find('.start input[name="date"]').datepicker('getDate');
        endDate = $(this).find('.end input[name="date"]').datepicker('getDate');

        timeStart = formatTime($(this).find('.start input[name="time"]').val());
        timeEnd = formatTime($(this).find('.end input[name="time"]').val());

        bookingStarOn = $(this).find('.bookingStart input[name="toggler"]').is(':checked') ? 'true' : 'false'
        bookingEndOn = $(this).find('.bookingEnd input[name="toggler"]').is(':checked') ? 'true' : 'false'

        bookingStartDate = $(this).find('.bookingStart input[name="date"]').datepicker('getDate');
        bookingEndDate = $(this).find('.bookingEnd input[name="date"]').datepicker('getDate');

        bookingStartTime = formatTime($(this).find('.bookingStart input[name="time"]').val());
        bookingEndTime = formatTime($(this).find('.bookingEnd input[name="time"]').val());

        occur.push({
          id: $(this).find('input[name="occurid"]').val(),
          start_date: startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate(),
          start_time: timeStart,
          end_date: endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate(),
          end_time: timeEnd,

          bookingDirectly: bookingStarOn,
          startBooking_date: bookingStartDate.getFullYear() + "-" + (bookingStartDate.getMonth() + 1) + "-" + bookingStartDate.getDate(),
          startBooking_time: bookingStartTime,
          bookingEndsWithEvent: bookingEndOn,
          endBooking_date: bookingEndDate.getFullYear() + "-" + (bookingEndDate.getMonth() + 1) + "-" + bookingEndDate.getDate(),
          endBooking_time: bookingEndTime
        });
      });

      if (occur.length < 1) {
        alert("Please add at least one occurrence.");
        return;
      }

      var tickets = [];
      $('.Ebp--Tickets--Ticket').each(function (index, element) {

        var breakdown = [];
        $(this).find('.Ebp--Tickets--SubTickets--subTicket').each(function () {
          breakdown.push({
            cost: $(this).find('input[name="cost"]').val(),
            name: $(this).find('input[name="name"]').val()
          })
        });

        tickets.push({
          id: $(this).find('input[name="ticketid"]').val(),
          cost: $(this).find('input[name="cost"]').val(),
          name: $(this).find('input[name="ticketname"]').val(),
          allowed: $(this).find('input[name="allowed"]').val(),
          breakdown: breakdown
        });
      });

      if (tickets.length < 1) {
        alert("Please add at least one ticket.");
        return;
      }

      // collect email rules
      var hasEmailRules = $('#eventForm .emailRules').length > 0;
      var emailRulesData = [];

      if (hasEmailRules) {
        $('#eventForm .emailRules .ebp_email_rule').each(function () {
          var isBefore = ($(this).find('input[type="radio"]:checked').val() == 'before') ? 'true' : 'false';
          var activated = ($(this).find('input[name="activated"]').is(':checked')) ? 'true' : 'false';

          emailRulesData.push({
            id: $(this).attr('data-id'),
            template: $(this).find('select').val(),
            hours: $(this).find('input[name="hours"]').val(),
            isBefore: isBefore,
            activated: activated
          });

        });
      }

      var form = $('#eventForm #formID').val();
      var emailTemplateID = $('#eventForm #emailTemplateID').val();
      var maxSpots = $('#eventForm #maxSpots').val();

      var infoText = (tinyMCE && tinyMCE.activeEditor) ? encodeURIComponent(tinyMCE.activeEditor.getContent()) : '';

      var gatewayData = '';

      $('.gateway').each(function (index, element) {
        gatewayData += $(this).attr('data-name') + '=';
        gatewayData += $(this).bootstrapSwitch('status') ? 'true' : 'false';
        gatewayData += '%';
      });

      if (gatewayData.length > 1 && gatewayData.charAt(gatewayData.length - 1) === "%") {
        gatewayData = gatewayData.substring(0, gatewayData.length - 1);
      }

      var ownerEmail = 'default';
      var hasOwnerEmail = $("#ownerEmailToggle").bootstrapSwitch('status');

      if (hasOwnerEmail) {
        ownerEmail = $('#eventForm input[name="ownerEmail"]').val();

        if (!validateEmail(ownerEmail)) {
          alert('Alternate email is not valid.');
          return;
        }
      }

      $('#loader').slideDown(100);
      var saveEventFormData = 'action=ebp_event_save&event-id=' + id
        + '&name=' + encodeURIComponent($('#eventForm #name').val())
        + '&info=' + infoText
        + '&image=' + $('#eventForm #image').val().split('__and__')[0]
        + '&mapAddressType=' + encodeURIComponent($('#eventForm #mapAddressType').val())
        + '&mapAddress=' + encodeURIComponent($('#eventForm input[name="mapAddress"]').val())
        + '&mapZoom=' + encodeURIComponent($('#eventForm input[name="mapZoom"]').val())
        + '&mapType=' + encodeURIComponent($('#eventForm #mapType').val())
        + '&address=' + encodeURIComponent($('#eventForm input[name="address"]').val())
        + '&paypal=' + $("#paypal").bootstrapSwitch('status')
        + '&offlineBooking=' + $("#offlineBooking").bootstrapSwitch('status')
        + '&showSpots=' + $("#showSpots").bootstrapSwitch('status')
        + '&showPrice=' + $("#showPrice").bootstrapSwitch('status')
        + '&occurrences=' + JSON.stringify(occur)
        + '&tickets=' + encodeURIComponent(JSON.stringify(tickets))
        + '&form=' + form
        + '&maxSpots=' + maxSpots
        + '&gateways=' + gatewayData
        + '&background=' + $('#eventForm #background').val()
        + '&ownerEmail=' + ownerEmail
        + '&currency=' + $('#eventForm select[name="currency"]').val()
        + '&emailTemplateID=' + emailTemplateID;

      if (hasEmailRules) {
        saveEventFormData += '&emailRulesData=' + JSON.stringify(emailRulesData);
      }

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: saveEventFormData,

        error: function (response) {
          console.error(response);
          alert('An error occurred while saving. Check console for details.');
          $('#loader').slideUp(100);
        },
        success: function (response) {
          $("#event_" + id).find("span").html($('#eventForm #name').val());
          $('#loader').slideUp(100);
        }
      });
    }

    function saveEventCoupons() {
      $('#loader').slideDown(100);
      var id = $('#event-id').val();
      var data = "";
      $('#eventCoupons a.coupon.toggle').each(function (index, element) {
        if ($(this).attr("data-id") % 500 == 0) {
          sendEventCouponData(id, data, false);
          data = "";
        }

        data += '&couponid-' + $(this).attr("data-id") + '=' + $(this).attr("data-id") + '&selected-' + $(this).attr("data-id") + '=' + $(this).hasClass("notselected");
      });

      sendEventCouponData(id, data, true);
    }

    function sendEventCouponData(id, data, lastOne) {
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_event_coupon_update&id=' + id + "&data=" + data,
        error: function (error) {
          console.error(error);
          alert('check console for error');
        },

        success: function (response) {
          if (lastOne) $('#loader').slideUp(100);
        }
      });
    }


    function deleteCoupon() {
      $('#loader').slideDown(100);
      var id = $('#couponForm input[name="couponid"]').val();

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_coupon_delete&id=' + id,

        error: function (error) {
          $('#loader').slideUp(100);

          console.error(error);
          alert('check console for error');
        },

        success: function (response) {
          $('#loader').slideUp(100);
          $(".coupons").find("[data-id='" + id + "']").remove();
          $(".EBP--CouponsDetails").empty();
        }
      });
    }

    function saveCoupon() {
      $('#loader').slideDown(100);
      var id = $('#couponForm input[name="couponid"]').val();

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_coupon_save'
          + '&id=' + id
          + '&name=' + $('#couponForm input[name="name"]').val()
          + '&amount=' + $('#couponForm input[name="amount"]').val()
          + '&code=' + $('#couponForm input[name="code"]').val()
          + '&type=' + $('#couponForm select[name="type"]').val()
          + '&maxAllowed=' + $('#couponForm input[name="maxAllowed"]').val()
          + '&isActive=' + $("#coupon-active").bootstrapSwitch('status'),

        error: function (error) {
          $('#loader').slideUp(100);

          console.error(error);
          alert('check console for error');
        },
        success: function (response) {
          $('#loader').slideUp(100);
          var json = $.parseJSON(response);

          if (json.error != null) {
            if (json.error === "codeError") {
              $('#couponForm .alert').html("Code already taken!");
              $('#couponForm .alert').slideDown(100);
            } else {
              alert('Error while saving coupon');
            }

            return;
          }


          $('#couponForm .alert').slideUp(100);
          $('a.newCoupun').attr("data-id", json.maxId);

          var $btn = $(".coupons").find("[data-id='" + json.id + "']");
          $btn.text(json.html);

          if (!$("#coupon-active").bootstrapSwitch('status') && !$btn.hasClass("deactive")) {
            $btn.addClass("deactive");
          } else if ($btn.hasClass("deactive") && $("#coupon-active").bootstrapSwitch('status')) {
            $btn.removeClass("deactive");
          }
        }
      });
    }

    function saveSettingsData() {
      $('#loader').slideDown(100);
      var type = $("#setting-type").val();

      if (type === 'TRANSLATIONS') {
        $.ajax({
          type: 'POST',
          url: 'admin-ajax.php',
          data: 'action=ebp_save_language_settings' + "&" + $("#settingsForm").serialize(),
          success: function (response) {
            $('#loader').slideUp(100);
            $('.EbpLanguageBtns a.active').removeClass('btn-danger');
            $('.EbpLanguageBtns a.active').addClass('btn-primary');
          }
        });

      } else {
        // fix images
        var $cppLogo = $("#settingsForm").find('input[name="cpp_logo_image"]');
        var $cppHeader = $("#settingsForm").find('input[name="cpp_header_image"]');

        if ($cppHeader.length && $cppHeader.val().indexOf('__and__') > 0) {
          $cppHeader.val($cppHeader.val().split('__and__')[0]);
        }
        if ($cppLogo.length && $cppLogo.val().indexOf('__and__') > 0) {
          $cppLogo.val($cppLogo.val().split('__and__')[0]);
        }

        $.ajax({
          type: 'POST',
          url: 'admin-ajax.php',
          data: 'action=ebp_save_settings&type=' + type + "&" + $("#settingsForm").serialize(),
          success: function (response) {
            $('#loader').slideUp(100);
            updateAdminAppSettings();
          }
        });
      }

    }

    function getSettingsPage(type, data) {
      var html = '<div class="settingsPage">';
      html += EbpAdminBuilder.getSettingsNavSection(type, data);

      html += '<form id="settingsForm" name="settingsForm">';
      html += EbpAdminBuilder.getSettingsTabSection(type, data);
      html += EbpAdminBuilder.getSettingsTabSideSection(type)
      html += '</form>';
      html += '</div>';


      $('.eventDetails .cnt').html(html);

      // init color pickers
      $('.colorPicker').wpColorPicker();

      // init upload
      $('.upload').uploader();

      // init email related functions
      $('.loadDefaultTemplate').on('click',function (e) {
        e.preventDefault();
        $('#loader').slideDown(100);

        $.ajax({
          type: 'POST',
          url: 'admin-ajax.php',
          data: 'action=get_email_default_template',
          success: function (response) {
            $("#emailTemplate").val(response);
            $('#loader').slideUp(100);
          }
        });
      });

      $('.loadDefaultOwnerTemplate').on('click',function (e) {
        e.preventDefault();
        $('#loader').slideDown(100);

        $.ajax({
          type: 'POST',
          url: 'admin-ajax.php',
          data: 'action=get_owner_email_default_template',
          success: function (response) {
            $("#ownerEmailTemplate").val(response);
            $('#loader').slideUp(100);
          }
        });
      });

      $('.emailTemplateCodes a').on('click',function (e) {
        e.preventDefault();
        if ($(this).text() === 'Show Keywords') {
          $(this).text('Hide Keywords')
          $(this).parent().find('li').show();
        } else {
          $(this).text('Show Keywords')
          $(this).parent().find('li').hide();
        }

      });

      $('.emailTemplateCodes li').hide();

      $('.testEmail').on("click", function (e) {
        e.preventDefault();
        $('#loader').slideDown(100);

        $("#testEmailDiv").html("Saving settings...");

        var type = $("#setting-type").val();

        $.ajax({
          type: 'POST',
          url: 'admin-ajax.php',
          data: 'action=ebp_save_settings&type=' + type + "&" + $("#settingsForm").serialize(),
          success: function (response) {
            $("#testEmailDiv").append("<br/>Testing Email...");

            $.ajax({
              type: 'POST',
              url: 'admin-ajax.php',
              data: 'action=testEmail',
              success: function (response) {
                $("#testEmailDiv").append("<br/><br/>" + response);
                $('#loader').slideUp(100);
              }
            });
          }
        });
      });


      // init togglers
      $('.make-switch')['bootstrapSwitch']();

      // init do hiding
      setTimeout(function () {
        $('.switcher').each(function (index, element) {
          var $switcher = $(this).find('.make-switch');

          if ($switcher.hasClass("hasCnt")) {
            var inverseToggle = $switcher.hasClass('inverseToggle');
            isOn = $switcher.find('.switch-animate').hasClass('switch-off');

            if (!inverseToggle && isOn || inverseToggle && !isOn) {
              $(this).find(".cnt").slideUp(100);
            } else {
              $(this).find(".cnt").slideDown(100);
            }

          }
        });

      }, 10);

      $('.make-switch').on('switch-change', function (e, data) {
        if ($(this).hasClass("hasCnt")) {
          var inverseToggle = $(this).hasClass('inverseToggle');
          var $localParent = $(this).parent().parent().parent();

          if ((!inverseToggle && data.value) || (inverseToggle && !data.value)) {

            var oldAttr = ($localParent.find(".isBorder").attr("data-oldvalue")) ? $localParent.find(".isBorder").attr("data-oldvalue") : "1";

            $localParent.find(".isBorder input").val(oldAttr);
            $localParent.find(".cnt").slideDown(100);
          } else {
            $localParent.find(".isBorder").attr("data-oldvalue", $localParent.find(".isBorder input").val());

            $localParent.find(".cnt").slideUp(100, "linear", function () {
              $(this).find(".isBorder input").val("0");
            });
          }
        }
      });
    }


    // translate buttons

    function loadLanguageSettings(language) {
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_language_settings&language=' + language,
        success: function (response) {
          $('#loader').slideUp(100);
          var json = $.parseJSON(response);
          $('#texts_settings_cnt').html(EbpAdminBuilder.getLanguageSettingsSection(json));
        }
      });
    }

    $(document).on("click", '.EbpLanguageBtns a', function (e) {
      e.preventDefault();
      $('#loader').slideDown(100);
      $('.EbpLanguageBtns .active').removeClass('active');
      $(this).addClass('active');

      var language = $(this).attr('data-language');
      loadLanguageSettings(language);
    });

    // translate restore buttons
    $(document).on("click", '.EbpRestoreLangaugeToDefault', function (e) {
      e.preventDefault();
      $('#loader').slideDown(100);
      var language = $(this).attr('data-language');
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_restore_language_settings&language=' + language,
        success: function (response) {
          $('#loader').slideUp(100);
          $('.EbpLanguageBtns a.active').removeClass('btn-danger');
          $('.EbpLanguageBtns a.active').addClass('btn-primary');
          loadLanguageSettings(language);
        }
      });
    });



    $(document).on("click", '.fixMobilePage', function (e) {
      e.preventDefault();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=fix_mobile_page',
        success: function (response) {
          $('#loader').slideUp(100);
        }
      });
    });


    $(document).on("click", '.setCollation', function (e) {
      e.preventDefault();
      $('#loader').slideDown(100);

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_set_collation',
        success: function (response) {
          $('#loader').slideUp(100);
        }
      });
    });

    $(document).on("click", '.fixOccurences', function (e) {
      e.preventDefault();
      $('#loader').slideDown(100);
      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_clean_occurences',
        success: function (response) {
          $('#loader').slideUp(100);
        }
      });
    });

    $(document).on("click", '.quicklink', function (e) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: $($(this).attr("href")).offset().top - 50
      }, 300);
    });

    $(document).on("click", '.btn-settings-save', function (e) {
      e.preventDefault();
      saveSettingsData();
    });

    $(document).on("click", "#changeSettings a", function (e) {
      if ($(this).hasClass("active")) return;

      $('#loader').slideDown(100);
      $('.eventDetails .cnt').fadeOut(200);
      var settingType = $(this).attr("data-type");

      $.ajax({
        type: 'POST',
        url: 'admin-ajax.php',
        data: 'action=ebp_get_settings&type=' + settingType,
        success: function (response) {
          var data = $.parseJSON(response);
          getSettingsPage(settingType, data);
          $('.eventDetails .cnt').fadeIn(200);
          $('#loader').slideUp(100);
        }
      });
    });

    function validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }



    $(window).on('scroll',function (e) {

      if ($('.EBP--EventEdit--Btns-Cnt--Fixed').length > 0) {
        var anchorTop = $('.EBP--EventEdit--Btns-Cnt').offset().top
        var cntTop = $('.EBP--EventEdit--Btns-Cnt--Fixed').offset().top
        if (cntTop > anchorTop) {
          $('.EBP--EventEdit--Btns-Cnt--Fixed').css("bottom", "-100px")
        } else {
          $('.EBP--EventEdit--Btns-Cnt--Fixed').css("bottom", "0")
        }
      }

      $('.EBP--Fix-Top').each(function () {
        var $el = $(this);
        var top = $el[0].getBoundingClientRect().top;
        if (top < 40) {
          $el.find(">div").addClass("EBP--Fix-Top--Fixed");
        } else {
          $el.find(">div").removeClass("EBP--Fix-Top--Fixed");
        }
      });
    });
  })
})(jQuery);
