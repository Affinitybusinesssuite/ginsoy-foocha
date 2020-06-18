odoo.define('pos_kot_bill.preprintbill', function (require) {
"use strict";

var core = require('web.core');
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var models = require('point_of_sale.models');

var QWeb = core.qweb;

var PreBillScreenWidget = screens.ReceiptScreenWidget.extend({
    template: 'PreBillScreenWidget',
    click_next: function(){
        for (var i=0; i < this.pos.get_order().get_orderlines().length; i++){
            this.pos.get_order().get_orderlines()[i].set_dirty(true);
        } 
        this.trigger('change',this); 
        window.print();
        this.gui.show_screen('products');  
	    console.log("START10");
        var self = this;
	var order = self.pos.get_order();
	    console.log("Order: ", order);
	var today = new Date();
	var dateNow = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
	var d = new Date();
	var H = d.getHours();
	var M = d.getMinutes();
	console.log(H+":"+M);    
	    
	if(self.pos.config.enable_delivery_charges){
            	var time = H+":"+M;
		console.log(time);
                if(!time){
                	time = $("#txt_del_time").val();
                	if(time){
                		order.set_delivery_time(time);
                	}
            	}
		
		var customer = order.get_client();
                var street = '';
		street = customer.street;
		
                var address = order.get_delivery_address();
		console.log(address);
                if(!address){
                	address = street;
			console.log(address);			
                	if(address){
                		order.set_delivery_address(address);
                	}
                }
    		var date = dateNow;
	        console.log(date);
            	var is_deliver = order.get_is_delivery();
            	if(is_deliver && !order.get_client()){
            		return self.pos.db.notification('danger',_t('Customer is required to validate delivery order!'));
            	}
            	if(is_deliver && (!date || !time)){
            		return self.pos.db.notification('danger',_t('Delivery information required to validate order!'));
            	}
            	var delivery_user_id = $('.delivery_user').val();
		console.log(delivery_user_id);
            	if(order.get_delivery_user_id()){
        			delivery_user_id = order.get_delivery_user_id();
        		}
                if(is_deliver && delivery_user_id == 0){
                	return self.pos.db.notification('danger',_t('Please select delivery user to validate order!'));
                }else{
                	order.set_delivery_user_id(delivery_user_id);
                }
            	if(is_deliver && date && time && address){
            		order.set_delivery_type('pending');
			
            	}
            	var paymentlines = order.get_paymentlines();
            	if(paymentlines && paymentlines.length > 0){
            		return self.pos.gui.show_popup('flexi_alert',{
        			    'title':_t('Warning'),
        			    'body':_t("You can't create draft order with payment."),
        			});
            	}
            }else{
            	order.set_delivery_type('pending');
            }
			if(order){
				var env = {
	                widget:self,
	                pos: self.pos,
	                order: order,
	                receipt: order.export_for_printing(),
	                orderlines: order.get_orderlines(),
	                paymentlines: order.get_paymentlines(),
	            };
	        /*    var receipt_html = QWeb.render('PosTicket',env);
	        	order.set_pos_normal_receipt_html(receipt_html.replace(/<img[^>]*>/g,"").replace(/<object[^>]*>/g,"")); */
	        	var receipt = QWeb.render('XmlReceipt',env);
	        	order.set_pos_xml_receipt_html(receipt.replace(/<img[^>]*>/g,"").replace(/<object[^>]*>/g,""));
			console.log("ok yhn tk: ");				
	        	self.pos.push_order(order);
			console.log("Picking ID ",order.picking_id);
            	self.pos.gui.show_screen('receipt'); 
			}
	    console.log("Picking ID1",order.picking_id);
	     console.log("END");
    },
    click_back: function(){
        this.gui.show_screen('products');
    },
    print_web: function(){
	 
        window.print();
    },
    render_receipt: function() {
	    
	   //var self = this;
        	//var order_id = self.pos
		//console.log("order id: ",order_id);
            //var result = self.pos.db.get_order_by_id(order_id);
	    
       // this._super();
        var order = this.pos.get_order();
	    console.log("order: ",order);
        var orderLines = [];
        var GorderLines = order.get_orderlines();
	    console.log("order lines: ",GorderLines);
        for (var i=0; i < order.get_orderlines().length; i++){
            if (!order.orderlines.models[i].ap_printed) {
                orderLines.push(order.orderlines.models[i]);
            }
        }
	console.log("ok yhn tk 2: ");
        order.orderlines.models = orderLines;
        this.$('.pos-prereceipt-container').html(QWeb.render('PrePosTicket',{
            widget:this,
            order: order,
            receipt: order.export_for_printing(),
            orderlines: order.get_orderlines(),
            paymentlines: order.get_paymentlines(),
        }));
        this.$('.receipt-paymentlines').remove();
        this.$('.receipt-change').remove();
        order.orderlines.models = GorderLines;
	console.log("ok yhn tk 3: ");
	
    },
});

gui.define_screen({
    name:'prebill',
    widget: PreBillScreenWidget,
    'condition': function(){ 
	   
        return this.pos.config.iface_kotbill;
    },
});

var PrePrintBillButton = screens.ActionButtonWidget.extend({
    template: 'PrePrintBillButton',
    button_click: function(){
	   
        if (!this.pos.config.iface_print_via_proxy) {
            this.gui.show_screen('prebill');
        }
    },
});

screens.define_action_button({
    'name': 'pre_print_bill',
    'widget': PrePrintBillButton,
    'condition': function(){ 
	   
        return this.pos.config.iface_kotbill;
    },
});

var _super_orderline = models.Orderline.prototype;
models.Orderline = models.Orderline.extend({
    initialize: function() {
	   
        _super_orderline.initialize.apply(this,arguments);
        if (typeof this.ap_printed === 'undefined') {
            this.ap_printed = false;
        } 
    },
    init_from_JSON: function(json) {
        _super_orderline.init_from_JSON.apply(this,arguments);
        this.ap_printed = json.ap_printed;
    },
    export_as_JSON: function() {
        var json = _super_orderline.export_as_JSON.apply(this,arguments);
        json.ap_printed = this.ap_printed;
        return json;
    },
    set_dirty: function(dirty) {
        this.ap_printed = dirty;
        this.trigger('change',this);
    },
});

});
