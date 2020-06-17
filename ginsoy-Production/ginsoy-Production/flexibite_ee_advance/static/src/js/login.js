odoo.define('flexibite_ee_advance.login', function(require) {
    "use strict";

    var core = require('web.core');
    var WebClient = require('web.WebClient');
    var session = require('web.session');

    var _t = core._t;

    WebClient.include({

        /*
            Prepare and post notification!
        */
        notification: function(message) {
            if (message.length) {
                var html = '<div class="cust_notify alert alert-danger alert-dismissable mb0 fade show" role="alert" style="width: 20%;position: absolute;top: 20%;right: 1%;z-index:999;">';
                html += '<button type="button" class="btn_close close o_slides_hide_channel_settings" t-att-data-channel-id="channel.id" data-dismiss="alert">x</button>';
                html += '<div class="data-scroll">';
                html += '<ul>';
                html += "<li>" + message + "</li>";
                html += '</ul>';
                html += '</div>';
                html += '</div>';
                $('body').append(html);
                $(".alert").removeClass("in").show();
                $(".alert").addClass("in");
            }
        },

        /*
            Need to show user notification if the user is SUPERUSER
                or the user has administrative access rights !
        */
        show_application: function() {
            var self = this;
            this.set_title();

            return this.instanciate_menu_widgets().then(function () {
                $(window).bind('hashchange', self.on_hashchange);

                // Listen to 'scroll' event in home_menu and propagate it on main bus
                self.home_menu.$el.on('scroll', core.bus.trigger.bind(core.bus, 'scroll'));

                // If the url's state is empty, we execute the user's home action if there is one (we
                // show the home menu if not)
                // If it is not empty, we trigger a dummy hashchange event so that `self.on_hashchange`
                // will take care of toggling the home menu and loading the action.
                /*
                    If the url's state is empty,
                    we execute the user's home action if there is one
                        else (we toggle the apps)
                */
                var state = $.bbq.getState(true);
                if (_.isEmpty(state) || state.action === "login") {
                    if (session.new_error_message){
                        self.notification(session.new_error_message);
                    }
                    return self._rpc({
                            model: 'res.users',
                            method: 'read',
                            args: [session.uid, ["action_id"]],
                        }).then(function(result) {
                            var data = result[0];
                            if(data.action_id) {
                                return self.do_action(
                                    data.action_id[0]
                                ).then(function() {
                                    self.toggle_home_menu(false);
                                    self.menu.change_menu_section(
                                        self.menu.action_id_to_primary_menu_id(
                                            data.action_id[0]
                                        )
                                    );
                                });
                            } else {
                                self.toggle_home_menu(true);
                            }
                        });
                } else {
                    return self.on_hashchange();
                }
            });
        },

    });
});
