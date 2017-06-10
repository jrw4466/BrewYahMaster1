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

var center_of_austin = {
    lat: 30.267,
    lng: -97.743
}

//the ID for each marker in firebase
var currentMarkerId;
var rating;
var markers;
var idCounter = 0;
var brewery_locations = [{}];

var starRating = document.getElementById("starRating").cloneNode(true);

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

        centerLat = parseFloat(googleResults.results[0].geometry.location.lat);
        centerLong = parseFloat(googleResults.results[0].geometry.location.lng);

        var locations = getBreweryLocations(centerLat, centerLong);
        initMap();
        
    })
})


function getBreweryLocationsCallPromise(lat, lng) {
    var queryURL = "http://127.0.0.1:3000/breweries" + "?lat=" + String(lat) + "&lng=" + String(lng);

           return $.ajax({
               url: queryURL,
                method: "GET",
           });
        }
        // https://stackoverflow.com/questions/5316697/jquery-return-data-after-ajax-call-success
        
function processBreweryLocationsData(promise) {
    promise.success(function(data) {
        var data_object = JSON.parse(data);

        brewery_locations = [{}];

        var results = data_object.data;
        for (var i=0; i < results.length; i++) {

            brewery_locations[i] = {
                location: {
                    lat: results[i].latitude,
                    lng: results[i].longitude
                },

                name: results[i].brewery.name,
                url: results[i].brewery.website
            };
        };
        initMap();
    });
}    

function getBreweryLocations(lat, lng) {
    var promise = getBreweryLocationsCallPromise(lat, lng);
    processBreweryLocationsData(promise);
}



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

                //BUG with currentMarjerId
                currentMarkerId = JSON.stringify(e.latLng.lat() + e.latLng.lng()).replace(".", "?");
                
                $("#breweryReview").empty();
                $("#breweryName").html(marker.name + "<br>" + "<a>" + marker.url);
                $("#initialInfo").css({
                    "display": "none"
                });
                $("#breweryInfo").css({
                    "display": "initial"
                });

                 var stars = $("#starRating").rateYo({
                    starWidth: "18px",
                 })

                // turns off previous click event to not have repetitive values 
                $("#reviewBtn").off('click');
                $("#reviewBtn").on("click", function(event) {
                    event.preventDefault();

                    var reviewText = $("#reviewText").val().trim();
                    var rating = $("#starRating").rateYo("rating");
                    $("#starRating").rateYo("rating", 0);

                    
                    var reviewDB = {
                        review: reviewText,
                        rating: rating
                    };
                    //the .child lets you add branches 
                    database.ref()
                        .child("markers")
                        .child(currentMarkerId)
                        .push(reviewDB)
                        //once data is pushed to firebase, it appends the newest review to #breweryReview
                        .then(function() {
                           var parentDiv = $("<div id=" +idCounter + ">");
                           var stars = $("<div class=starReview>").rateYo({
                                starWidth: "18px",
                                rating: reviewDB.rating,
                                readOnly: true
                           })
                           var review = $("<p>").text(reviewDB.review);
                           $(parentDiv).append(stars);
                           $(parentDiv).append(review);
                           $("#breweryReview").append(parentDiv);
                           idCounter += 1;
                        })

                    $("#reviewText").val("");
                });

                database.ref()
                    .child("markers")
                    .child(currentMarkerId)
                    //It gets all the previous values in firebase only one time
                    .once("value", function(childSnapshot, prevChildKey) {

                        idCounter = 0;
                        var data = childSnapshot.val();
                        //if data is undefined, then dont do anything
                        if(!data) {
                            return;
                        }
                        //This gives the values of the object
                        var reviews = Object.values(data)
                        //forEach goes through the reviews array and runs the function in each of the items in reviews
                        reviews.forEach(function(reviewObj) {
                            var parentDiv = $("<div id=" +idCounter + ">");
                           var stars = $("<div class=starReview>").rateYo({
                                starWidth: "18px",
                                rating: reviewObj.rating,
                                readOnly: true
                           })
                           var review = $("<p>").text(reviewObj.review);
                           $(parentDiv).append(stars);
                           $(parentDiv).append(review);
                           $("#breweryReview").append(parentDiv);
                           idCounter += 1;
                        });
                        
                    });
                    
            }
        );
    });

}

var markers = getBreweryLocations(center_of_austin.lat, center_of_austin.lng)