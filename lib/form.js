var api_url = 'https://api.101xp.com/',
    auth_url = 'https://auth.101xp.com/',
    ads_url = 'https://api-stat.101xp.com/ads',
    checkMail_url = 'https://101xp.com/session/emailexists',
    stat_url = 'https://api-stat.101xp.com/lpstat',
    game_url = '//en.101xp.com/games/clashofheaven/play',
    game_id = '53A2F65319E83',
    advert_id = '',
    advert_event = 1,
    ad_platform = $.cookie('platform'),
    ad_source = $.cookie('ad_source'),
    ad_campaign = $.cookie('campaign'),ad_canal = $.cookie('canal'),
    client_id = '5B1EB814FEC8C',
    MetricOptions = '',
    page_id = 756,
    ref_url = location.search.substring(1),
    allOk = 'Correct', locale = 'en';
var startTimer = new Date().getTime();
var regularPatern =  /[^a-zA-Z0-9.@_-]+/gi;

$.extend({
    SendAds: function (api, args) {

        var stopTimer = new Date().getTime(),
        msTime = stopTimer - startTimer;
        var defaultArgsAd = {

            // id юзера на портале
            uid: 0,
            // название платформы
            platform: ad_platform,
            // id игры
            game: game_id,
            //  json строка с параметрами рекламы
            params: paramsAd,
            // id источника рекламы
            source: ad_source,
            // название рекламной кампании
            campaign: ad_campaign,
            // id рекламной сети для постбека
            // aid: advert_id,
            // отслеживать ли события для этого юзера
            events: advert_event, timer: msTime, ip: ip, xpguid: xpguid, platformguid: platformguid, canal: ad_canal, page_id: page_id

        };

        args = $.extend({}, defaultArgsAd, args);

        jqxhr = $.post(
            api,
            args,
            function (res) {
                checkStat(res);
            },
            "json"
        );

        jqxhr.fail(checkStat);

        function checkStat(data){ MetricOptions = {type: 'tracker',element: 'checkStat',ref: data}; $.SendMetrics(stat_url, MetricOptions);
            if(typeof data === 'object'){
                if (data.status === 'success') {
                    ga('send', 'event', 'portal', 'reg', 'click');
                    yaCounter45211608.reachGoal('reg');

                    if (ad_platform !== 'fb') {
                        fbq('track', 'CompleteRegistration');
                        setTimeout(function () {
                            window.location.href = game_url;
                        }, 500);
                    } else {
                        window.location.href = game_url;
                    }
                } else {
                    window.location.href = game_url;
                }
            } else {
                window.location.href = game_url
            }
        }

    },
    SendMetrics: function (api, args, ads) {

        var defaultArgsMetric = {

            // что это за событие, возможны варианты load,click,signin
            type: 'load',
            // страница, на которой произошло событие
            page: page_id,
            // метки рекламной кампании
            ref: paramsAd,
            // id вебмастера в сетке
            webmaster: ad_source,
            // название рекламной кампании
            campaign: ad_campaign,
            // алиас рекламной сети
            platform: ad_platform,
            // на каком элементе зафиксировано, 0 - не указано, btn_1 - вход по токену, btn_2 - новая регистрация
            element: 0,
            // id пользователя: 0 - не указан
            user: 0,
            // ip пользователя
            ip: ip, xpguid: xpguid, platformguid: platformguid

        };

        args = $.extend({}, defaultArgsMetric, args);

        jqxhr = $.post(
            api,
            args,
            function (res) {
                // do nothing
            },
            "json"
        );

        jqxhr.always(function () {
            if (typeof ads == "object") {
                $.SendAds(ads_url, ads);
            }
        });
    },
    TokenAuth: function (api, token, element) {
        $.get(
            api + 'account?access_token=' + token,
            function (res) {
                if (res.status === 'success') {

                    MetricOptions = {
                        type: 'signin',
                        element: element,
                        user: res.account['id']
                    };

                    AdsOptions = {
                        uid: res.account['id']
                    };

                    $.SendMetrics(stat_url, MetricOptions, AdsOptions);

                }
            }, 'json'
        ).fail(function () {
            $.removeCookie('auth_token');
            //  location.reload();
        });
    },
    TokenRefresh: function (api, token, client) {
        $.post(
            api + 'refresh',
            {client_id: client, refresh_token: token},
            function (res) {
                if (res.status === 'success') {
                    $.cookie('auth_token', res.access['access_token'], {expires: 1, domain: '.101xp.com', path: '/'});
                    $.cookie('refresh_token', res.access['refresh_token'], {expires: 7, domain: '.101xp.com', path: '/'});
                    $.TokenAuth(api_url, res.access['access_token'], 'btn_1');
                } else {
                    $.removeCookie('refresh_token');
                    $('#loader').hide();
                }
            }, 'json'
        ).fail(function () {
            $.removeCookie('refresh_token');
            // location.reload();
        });
    },
    UserSignIn: function (api, fields) {
        $.post(
            api + 'signin',
            fields,
            function (res) {
                if (res.status === 'success') {

                    $.cookie('auth_token', res.access['access_token'], {expires: 1, domain: '.101xp.com', path: '/'});
                    $.cookie('refresh_token', res.access['refresh_token'], {
                        expires: 7,
                        domain: '.101xp.com',
                        path: '/'
                    });

                    //       $.TokenAuth(api_url,$.cookie('auth_token'),'btn_2');

                    MetricOptions = {
                        type: 'signin',
                        element: 'btn_2',
                        user: res.access['id']
                    };

                    AdsOptions = {
                        uid: res.access['id']
                    };

                    $.SendMetrics(stat_url, MetricOptions, AdsOptions);

                }
            }, 'json'
        ).fail(function(data){

            res = JSON.parse(data.responseText);
            if (res.error_code === 10) {
                alert('Wrong email and password combination\n\nAuthorization failed!\n\nCheck keyboard input mode, "Caps Lock" key and try another time.');
                $('#spinner').hide();
            }
        });
    },
    UserSignUp: function (api, fields) {
        $.post(
            api + 'signup',
            fields,
            function (res) {
                if (res.status === 'success') {

                    $.cookie('auth_token', res.access_token, {expires: 1, domain: '.101xp.com', path: '/'});
                    $.cookie('refresh_token', res.refresh_token, {expires: 7, domain: '.101xp.com', path: '/'});

                    $.TokenAuth(api_url, $.cookie('auth_token'), 'btn_2');

                }
            }, 'json'
        ).fail(function (data) {

            res = JSON.parse(data.responseText);
            if (res.error_code === 806) {
                // alert('Email address is occupied');

                    $('label[for=email]').text('Email is taken').addClass("badchecked").removeClass("checked");

                }
            $('#spinner').hide();

        });
    },
});


if (document.documentElement.attachEvent)  document.documentElement.attachEvent('onmousedown', function () {
    event.srcElement.hideFocus = true
});
$(document).ready(function () {
    var intervalTitle;

    $.SendMetrics(stat_url);

    if (typeof $.cookie('social_login') != 'undefined') {

        $.removeCookie('social_login', {domain: '.101xp.com', path: '/'});

      //      $.TokenAuth(api_url, $.cookie('auth_token'), 'btn_2');

    }

    if (typeof $.cookie('social_email') != 'undefined') {

        $.removeCookie('social_email', {domain: '.101xp.com', path: '/'});
        $.removeCookie('provider_token', {domain: '.101xp.com', path: '/'});
        alert('Chosen social network is currently unavailable to provide you a registration.\nPlease choose another method.');

    }

    $('.social_login').click(function (e) {

        e.preventDefault();

        var windowSrc = auth_url + 'socialauth/connect/' + $(this).data('provider') + '?client_id=' + game_id + '&redirect=' + location.protocol  + '//' + location.hostname + location.pathname;

        location.href = windowSrc;

    });


    $form = $('#profileForm'); // main class for main and genera form
    $form.find(':input[type="submit"]').prop('disabled', true);// disable submit btn

    $form.everyTime(250, function (i) {
        dirty_work();
    });

    $('input').on('blur', function () {
        $(this).next().removeClass('focused');
    }).on('focus', function () {
        $(this).next().addClass('focused');
    });

    function dirty_work() {
        validator.checkForm();

        $(document).find('.label_text').each(function (j, element) {
            if ($(element).find('label').text() == allOk) {
                $(element).addClass("checked").removeClass("badchecked");
            } else {
                $(element).addClass("badchecked").removeClass("checked");
            }
        });

        var emailUser =  $.trim($form.find(':input[name=email]').val()).match(regularPatern),
            emptyInput = $.trim($form.find(':input[name=email]').val()) ? true : false,
            labledata = $form.find(':input[name=email]').next().text();

        if(labledata == "Required to enter the game"){
        } else if(emailUser == null && emptyInput && labledata != "Required to enter the game"){
            if ($('label[for=email]').text() == allOk) {
                $('label[for=email]').removeClass("badchecked").addClass("checked");
                $('input[name=email]').removeClass("badchecked").addClass("checked");
            } else {
                $('label[for=email]').addClass("badchecked").removeClass("checked");
                $('input[name=email]').addClass("badchecked").removeClass("checked");
            }
        } else {
            $('input[name=email]').addClass("badchecked").removeClass("checked");
            $('label[for=email]').addClass('badchecked').removeClass("checked");
            $('label[for=email]').text('Incorrect Email');
        }


        if (!$.trim($form.find(':input[name=email]').val()).length) {
            $('label[for=email]').parent().removeClass("badchecked checked");
        }

        $(document).find('.label_text').each(function (j, element) {
            if ($(element).hasClass("badchecked") || $(element).hasClass("focused")) {
                $(element).fadeIn().css({display: 'table'});

            } else {
                $(element).fadeOut();
            }
        });

        if ($('label[for=email]').text() == allOk) {
            $form.find('input[type="submit"]').attr('disabled', false);
        } else {
            $form.find('input[type="submit"]').attr('disabled', true);
        }
    }

    $(document).click(function(){
        if($('#email').val() == '') {
            $('#email').removeClass("error").focus();
            $('#label_text').hide();
        } else  if($('#email').val() != '' && $('#email').hasClass("error")){
            $('#email').focus();
        }
    });

    // try to enable if all good
    $form.keydown(function () {
        dirty_work();
    });
    $form.keyup(function () {
        dirty_work();
    });


    // validate signup form on keyup and submit
    var validator = $("#profileForm").validate({
        debug: false,
        rules: {
            email: {
                required: true,
                email: true

            }
        },
        messages: {
            email: {
                required: "Required to enter the game",
                minlength: "Incorrect Email",
                email: "Incorrect Email",
                remote: "Email is taken"
            }
        },
        submitHandler: function () {
            validator.checkForm();

            $(document).find('label').each(function (j, element) {
                if ($(element).text() == allOk) {
                    $(element).addClass("checked").removeClass("badchecked");
                } else {
                    $(element).addClass("badchecked").removeClass("checked");
                    $('input#email').focus();
                }
            });

            if (!$.trim($form.find(':input[name=email]').val()).length) {
                $('label[for=email]').removeClass("badchecked").removeClass("checked");
            }

            if ($('label[for=email]').text() == allOk) {

                MetricOptions = {
                    type: 'click',
                    element: 'btn_2'
                };

                $.SendMetrics(stat_url, MetricOptions);

                var email = $form.find(':input[name="email"]').val();
                $form.find(':input[name="username"]').val(email);
                var fields_signup = $($form).serializeArray();

                $.UserSignUp(auth_url, fields_signup);

                $('#spinner').show();
            }

        },
        success: function (label) {
            label.html(allOk).addClass("checked");
        }

    });

    $('#label_text').hide();

    // manipulate forms for other variants

    $(".two_btn").click(function () {
        $('.form_2').find('input[type="email"]').val($form.find(':input[name="email"]').val());
        $(".secondary.num2").fadeIn(200);
    });

    $(".cross").click(function () {
        $(this).parent().parent().fadeOut(200);
    });

    $('.form_2').submit(function (e) {
        e.preventDefault();

        var email = $(this).find('input[name="login"]').val();

        $('#spinner').show();
        $.RememberPasword(auth_url, client_id, email);
    });

    $(".form_1").submit(function (e) {
        e.preventDefault();

        var email = $(this).find('input[type="email"]').val(),
            password = $(this).find('input[type="password"]').val(),
            rememberMe = $(this).find('input[type="checkbox"]:checked').length > 0 ? 1 : 0,
            fields = {client_id: client_id, username: email, password: password, remember: rememberMe};


        if(email.length && password.length) {
            $.UserSignIn(auth_url, fields);
            $('#spinner').show();
        } else {
            alert('Please fill in all the fields.');
        }
    });

    $(".bg_video").click(function (e) {
      $(".overlay").show();
      $(".col_wrapper").addClass("clicked");
    });

    // ------------------- Обработка баннера --------------------
            var $banner = $('.dark_layer_for_banner'); // блок с баннером, который будет показываться/скрываться
            var bannerWasShown = false; // для показа баннера не более одного раза
            var $title = $('title');
            var intervalTitle = null;
            var $timer = $('.banner span'); // блок со счетчиком секунд
            var seconds = 60;
            function showBanner () { // ф-ция показывает баннер
                bannerWasShown = !bannerWasShown;
                $banner.fadeIn(300);
                $(".col_wrapper").addClass("clicked"); // отключение ховер эффектов на бэке
                startTimer();
            }
            function startTimer () { // ф-ция ведет отсчет времени
                var intervalTimer = setInterval(function () {
                    seconds -= 1;
                    $timer.text(String(seconds));
                    if (seconds <= 0) {
                        closeBanner();
                    }
                }, 1000);
            }
            function titleBlink () {
                intervalTitle = window.setInterval(function () {
                  $title.text('Present for you is here!');
                  setTimeout(function () {
                    $title.text('Clash of heaven');
                  }, 1000);
                }, 2000);
              }
            function closeBanner () {
              $(".dark_layer_for_banner").fadeOut(300);
              clearInterval(intervalTitle);
            }

        $('.banner .cross').click(function () {
            closeBanner();
        });
        $('a.guest_btn').click(function () {
            closeBanner();

        });
        // отлавливание потери hover-а у body
        $('body').mouseleave(function () {
            if (bannerWasShown) {return false;}
            showBanner();
            titleBlink();
        });
        // отлавливание потери фокуса window
        window.onblur = function () {
            if (bannerWasShown) {return false;}
            showBanner();
            titleBlink();
        };

      // ----------------- Конец обработки баннера ---------------
});
