from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_kotbill = fields.Boolean(string='Kitchen Order Printing', help='Enables Kitchen Order Printing in the Point of Sale')
