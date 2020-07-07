odoo.define('rider_performance_analysis.employee_pos', function (require) {
    "use strict";
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var PopupWidget = require('point_of_sale.popups');
    var _t = core._t;
    var models = require('point_of_sale.models');
    
    models.load_models({
        model: 'hr.employee',
        fields: ['id', 'name'],
        domain: function(){ return [['is_a_rider','=',true]]; },
        loaded: function (selfr, employeer) {
            selfr.employee_name_by_idr = {};
            console.log(selfr.employee_name_by_idr);
            for (var i = 0; i < employeer.length; i++) {
                selfr.employee_name_by_idr[employeer[i].id] = employeer[i];
            }
        }
    });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        export_as_JSON: function () {
            var json = _super_order.export_as_JSON.apply(this, arguments);
            json.order_rider = this.order_rider;
            json.employee_id = this.employee_id;
            return json;
        },
        init_from_JSON: function (json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.order_rider = json.order_rider;
            this.employee_id = json.employee_id;
            _super_order.init_from_JSON.call(this, json);
        }
    });

    var RiderPopupWidget = PopupWidget.extend({
        template: 'RiderPopupWidget',
        init: function (parent, options) {
            this.options = options || {};
            this._super(parent, _.extend({}, {
                size: "medium"
            }, this.options));
        },
        renderElement: function () {
            this._super();
            for (var employeer in this.pos.employee_name_by_idr) {
                $('#rider_boy').append($("<option>" + this.pos.employee_name_by_idr[employeer].name + "</option>").attr("value", this.pos.employee_name_by_idr[employeer].name).attr("id", this.pos.employee_name_by_idr[employeer].id))
            }
        },
        click_confirm: function () {
            var remployee_id = $("#rider_boy :selected").attr('id');
            var remployee_name = $("#rider_boy :selected").text();
            var rorder = this.pos.get_order();
            rorder.order_rider = remployee_name;
            rorder.employee_id = remployee_id;
            this.gui.close_popup();
           // $("#selectionbutton").innerHTML = employee_name;
            $(selectionbutton).text("Rider - " + remployee_name)
            console.log($(selectionbutton).text());
        },

    });
    gui.define_popup({name: 'pos_no1', widget: RiderPopupWidget});

    var RiderSelectionButton = screens.ActionButtonWidget.extend({
        template: 'RiderSelectionButton',
        button_click: function () {
            var note = this.pos.get_order().order_rider;
            this.gui.show_popup('pos_no1', {'value': this.pos.get_order().order_rider});
        }
    });

    screens.define_action_button({
        'name': 'pos_rider_selection',
        'widget': RiderSelectionButton,
        'condition': function(){
        return this.pos.config.rider_configuration;
    }
    });
});


