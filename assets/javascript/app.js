var config = {
    apiKey: "AIzaSyDO5UYGxmaz95GKMLc3Zt4t7VbD7i44nhk",
    authDomain: "brewyah-e463a.firebaseapp.com",
    databaseURL: "https://brewyah-e463a.firebaseio.com",
    projectId: "brewyah-e463a",
    storageBucket: "brewyah-e463a.appspot.com",
    messagingSenderId: "260245499962"
};
firebase.initializeApp(config);

var database = firebase.database();

var city = "";
var state = "";
var centerLat = 30.267;
var centerLong = -97.743;
//the ID for each marker in firebase
var currentMarkerId;

$("#locationBtn").on("click",function(event){
    event.preventDefault();

    city = $("#city").val().trim();
    state = $("#state").val().trim();

    var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "," + state + "&key=AIzaSyAL1B97DDVFjIxxJ1MiQdM6GY68WmrSaRo"

    $.ajax({
        url: googleURL,
        method: "GET"
    }).done(function(responseGoogle){
        var googleResults = responseGoogle;
        console.log(googleResults);
        //console.log(googleResults.results[0].geometry.location.lat);

        centerLat = parseFloat(googleResults.results[0].geometry.location.lat);
        centerLong = parseFloat(googleResults.results[0].geometry.location.lng);

        console.log(centerLat);
        console.log(centerLong);

        initMap();
    })
})



function getBreweryLocations() {
            var queryURL = "http://127.0.0.1:3000/breweries";

           return $.ajax({
               url: queryURL,
                method: "GET",
           });
        }
        // https://stackoverflow.com/questions/5316697/jquery-return-data-after-ajax-call-success
        var promise = getBreweryLocations();
        promise.success(function(data) {
            var data_object = JSON.parse(data);
           console.log(data_object.data);
       });

var markers;

// grab these from api
var brewery_locations = [{
    location: {
        lat: 30.30,
        lng: -97.643
    },
    url: 'http://southaustinbrewery.com/',
    name: "South Austin Brewery"
}, {
    location: {
        lat: 30.35,
        lng: -97.743
    },
    url: 'one_of_your_page.html'
}, {
    location: {
        lat: 30.25,
        lng: -97.56
    },
    url: 'http://www.hopsandgrain.com/',
    name: "Hops and Grain"
}, {
    location: {
        lat: 30.23,
        lng: -97.443
    },
    url: 'one_of_your_page.html'
}, ]

function initMap(locations) {
    function addMarker(dataset, map_object) {
        var marker = new google.maps.Marker({
            position: dataset.location,
            map: map_object,
            url: dataset.url,
            name: dataset.name
        });
        return marker
    }

    var center_of_map = {
        lat: centerLat,
        lng: centerLong
    };

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: center_of_map
    });

    markers = brewery_locations.map(function(location) {
        return addMarker(location, map)
    });

    markers.forEach(function(marker) {
        google.maps.event.addListener(
            marker,
            'click',

            //Once you click on a marker, it gets the "e" event which contains the lat and long which is then used as the ID 
            function(e) {
                //Make the lat and long into a string and replace the "." with "?"
                //lat.Lng.lat() comes from google maps API.
                currentMarkerId = JSON.stringify(e.latLng.lat() + e.latLng.lng()).replace(".", "?");
                $("#breweryReview").empty();
                $("#breweryName").html(marker.name + "<br>" + marker.url);
                $("#initialInfo").css({
                    "display": "none"
                });
                $("#breweryInfo").css({
                    "display": "initial"
                });
                // turns off previous click event to not have repetitive values 
                $("#reviewBtn").off('click');
                $("#reviewBtn").on("click", function(event) {
                    event.preventDefault();

                    var reviewText = $("#reviewText").val().trim();

                    
                    var reviewDB = {
                        review: reviewText
                    };
                    //the .child lets you add branches 
                    database.ref()
                        .child("markers")
                        .child(currentMarkerId)
                        .push(reviewDB)
                        //once data is pushed to firebase, it appends the newest review to #breweryReview
                        .then(function() {
                            $("#breweryReview").append(reviewText + "<br>");
                        })

                    $("#reviewText").val("");
                });

                database.ref()
                    .child("markers")
                    .child(currentMarkerId)
                    //It gets all the previous values in firebase only one time
                    .once("value", function(childSnapshot, prevChildKey) {
                        var data = childSnapshot.val();
                        //if data is undefined, then dont do anything
                        if(!data) {
                            return;
                        }
                        //This gives the values of the object
                        var reviews = Object.values(data)
                        //forEach goes through the reviews array and runs the function in each of the items in reviews
                        reviews.forEach(function(reviewObj) {
                            $("#breweryReview").append(reviewObj.review + "<br>");
                        })
                        
                    })
                    // if(currentMarkerId) {
                    //     // database.ref().child("markers").child(currentMarkerId).off();
                    //     database.ref().child("markers").child(currentMarkerId).once("child_added", function(childSnapshot,prevChildKey){
                    //         var reviewText = childSnapshot.val().review;

                //         $("#breweryReview").append(reviewText + "<br>");
                //      })
                // }  
            }
        );
    });
}

// google.maps.event.addDomListener(window, 'load', initMap);

