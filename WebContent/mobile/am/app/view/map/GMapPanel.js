Ext.define('AM.view.map.GMapPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.gmappanel',
    initComponent: function () {
        Ext.applyIf(this, {
            plain: true,
            gmapType: 'map',
            border: false
        });
        this.center = {
            latLng: {
                lat: 34.33,
                lng: -101.33
            },
            marker: {title: 'Fenway Park'}
        };
        var markers = [];
        for (var i = 0; i < this.config.latLngData.length; i++) {
            var rec = this.config.latLngData[i];
            var marker = {
                lat: rec.lat,
                lng: rec.lng,
                recInfo: rec,
                listeners: {
                    click: function (e) {
                        Ext.Msg.alert('Information', 'City :' + this.recInfo.city + ' </br>No of Visits :' + this.recInfo.noOfHits + '</br>');
                    }
                }
            };
            markers[markers.length] = marker;
        }
        this.markers = markers;
        this.callParent();
    },

    afterFirstLayout: function () {
        var center = this.center;
        this.callParent();

        if (center) {
            this.createMap(center.latLng, center.marker);
        } else {
            Ext.Error.raise('center is required');
        }

    },

    createMap: function (center, marker) {
        var options = Ext.apply({}, this.mapOptions);

        options = Ext.applyIf(options, {
            zoom: 4,
            center: new google.maps.LatLng(center.lat, center.lng),
            mapTypeId: google.maps.MapTypeId.HYBRID
        });
        this.gmap = new google.maps.Map(this.body.dom, options);


        Ext.each(this.markers, this.addMarker, this);
        this.fireEvent('mapready', this, this.gmap);
    },

    addMarker: function (marker) {
        marker = Ext.apply({
            map: this.gmap
        }, marker);

        if (!marker.position) {
            marker.position = new google.maps.LatLng(marker.lat, marker.lng);
        }
        var o = new google.maps.Marker(marker);
        Ext.Object.each(marker.listeners, function (name, fn) {
            google.maps.event.addListener(o, name, fn);
        });
        return o;
    },

    lookupCode: function (addr, marker) {
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({
            address: addr
        }, Ext.Function.bind(this.onLookupComplete, this, [marker], true));
    },

    onLookupComplete: function (data, response, marker) {
        if (response != 'OK') {
            Ext.MessageBox.alert('Error', 'An error occured: "' + response + '"');
            return;
        }
        this.createMap(data[0].geometry.location, marker);
    },

    afterComponentLayout: function (w, h) {
        this.callParent(arguments);
        this.redraw();
    },

    redraw: function () {
        var map = this.gmap;
        if (map) {
            google.maps.event.trigger(map, 'resize');
        }
    }

});
