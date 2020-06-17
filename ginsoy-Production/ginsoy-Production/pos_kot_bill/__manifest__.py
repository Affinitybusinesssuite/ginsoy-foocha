# -*- coding: utf-8 -*-
{
    'name': 'POS KOT Order Print',
    'summary': 'Allow to Print Orders In KOT without repetation',
    'description': """Module Developed for Print POS Orders for KOT.""",

    'author': 'iPredict IT Solutions Pvt. Ltd.',
    'website': 'http://ipredictitsolutions.com',
    "support": "ipredictitsolutions@gmail.com",

    'category': 'Point of Sale',
    'version': '12.0.0.1.0',
    'depends': ['pos_restaurant'],

    'data': [
        'views/templates.xml',
        'views/pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/preprintbill.xml',
    ],

    'license': "OPL-1",
    'price': 35,
    'currency': "EUR",

    "auto_install": False,
    "installable": True,

    'images': ['static/description/banner.png'],
    'live_test_url': 'https://youtu.be/KSGXqSPac4Y',
}
