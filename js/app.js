// Global variables
var map;
var markers = [];
var infoWindow;

// Locations
var placesList = [{
        name: 'Land of a Thosand Hills',
        location: {
            lat: 33.7931793,
            lng: -84.39551719999997
        }
    },
    {
        name: 'Spiller Park Coffee',
        location: {
            lat: 33.7725223,
            lng: -84.36596759999997
        }
    },
    {
        name: 'Caribou Coffee',
        location: {
            lat: 33.7820794,
            lng: -84.38072899999997
        }
    },
    {
        name: 'Dancing Goats Coffee Bar',
        location: {
            lat: 33.7717641,
            lng: -84.36697240000001
        }
    },
    {
        name: 'Blue Donkey Craft Coffee',
        location: {
            lat: 33.778757,
            lng: -84.409679
        }
    },
    {
        name: 'Brash Coffee',
        location: {
            lat: 33.778757,
            lng: -84.409679
        }
    },
    {
        name: 'Octane Coffee Bar',
        location: {
            lat: 33.7894552,
            lng: -84.3862338
        }
    },
    {
        name: 'Urban Grind',
        location: {
            lat: 33.7776531,
            lng: -84.40900679999998
        }
    },
    {
        name: 'Eastpole Coffee Co',
        location: {
            lat: 33.8103946,
            lng: -84.3786836
        }
    }
];

// Initialize map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.7820794,
            lng: -84.38072899999997
        },
        zoom: 13
    });

    // Knockout viewmodel binding
    ko.applyBindings(new ViewModel());
}

//Location object constructor
var Places = function(data) {
    this.name = ko.observable(data.name);
    this.mapError = ko.observable('');
};

// Knockout ViewModel
var ViewModel = function() {
    var self = this;
    self.locations = ko.observableArray();
    self.filter = ko.observableArray(self.locations());
    self.locationInput = ko.observable('');
    self.errorMessage = ko.observable('');
    self.temp = ko.observable('');

    // InfoWindow object
    var largeInfowindow = new google.maps.InfoWindow();

    // Filter list
    placesList.forEach(function(data) {
        var location = new Places(data);
        var position = placesList.location;
        var title = placesList.name;

        // Marker information
        var marker = new google.maps.Marker({
            position: data.location,
            map: map,
            title: data.name,
            animation: google.maps.Animation.DROP
        });

        // Marker and infowindow event listener
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });

        // Pushes marker to markers array
        location.marker = marker;
        self.locations.push(location);
    });

    // Populates infowindow
    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1400);

        // Foresquare API
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search',
            type: 'GET',
            dataType: 'json',
                data: {
                    client_id: '00E1VL52E4TPZKVXJ5Y3YEBZ2QOXYJXZ2VZFQYHOPU4W33FN',
                    client_secret: '2BH1BJECU2JQW3HUZGVUE2HXRRFTSGYYQ4LIR3VOBJ53XX3U',
                    v: '20170101',
                    limit: '1',
                    ll: marker.position.lat() + ',' + marker.position.lng(),
                    query: marker.title
                },

        }).done(function (data) {
            venue = data.response.hasOwnProperty("venues") ? data.response.venues[0] : '';
            location = venue.hasOwnProperty('location') ? venue.location : '';
                if (location.hasOwnProperty('address')) {
                    var address = location.address || '';
                    var location;
                }
            infowindow.open(map, marker);
            infowindow.setContent('<div>' + marker.title + '</div><p>' + address + '</p>');

        }).fail(function (e) {
            infowindow.setContent('Foursquare info failed to load');
            this.errorMessage();
            });
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    }

    // Array Filter
    this.listFilter = ko.computed(function() {
        return ko.utils.arrayFilter(self.filter(), function(location) {
            if (location.name().toLowerCase().indexOf(self.locationInput().toLowerCase()) >= 0) {
                location.marker.setVisible(true);
                return true;
            } else {
                location.marker.setVisible(false);
                return false;
            }
        });
    });

    // List view click event
    self.locationClicked = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    };

    // Wunderground API
    jQuery(document).ready(function($) {
        $.ajax({
            url: "http://api.wunderground.com/api/d8483e016960a875/geolookup/conditions/q/GA/Atlanta.json",
            dataType: "jsonp",
            success: function(parsed_json) {
                var location = parsed_json['location']['city'];
                var temp_f = parsed_json['current_observation']['temp_f'];
                self.temp ("The temperature in " + location + " is " + temp_f +" °F");
            },
            error: function(textStatus, errorThrown) {
                alert('Wunderground failed to load.');
            }
        });
    });
};

//Google Map error message
function googlemapError() {
    alert("Google Maps failed to load.");
    this.mapError ('Google Maps failed to load.');
}