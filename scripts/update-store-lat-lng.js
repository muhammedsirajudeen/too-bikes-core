
// Run this in mongosh or mongo shell
// usage: mongosh "your_connection_string" update-store-lat-lng.js

db.stores.find({ "location.coordinates.coordinates": { $exists: true } }).forEach(function (doc) {
    if (doc.location && doc.location.coordinates && Array.isArray(doc.location.coordinates.coordinates)) {
        var coords = doc.location.coordinates.coordinates;
        // GeoJSON is [longitude, latitude]
        var lng = coords[0];
        var lat = coords[1];

        db.stores.updateOne(
            { _id: doc._id },
            { $set: { latitude: lat, longitude: lng } }
        );
        print("Updated store: " + doc.name + " with lat: " + lat + ", lng: " + lng);
    }
});
print("Update complete.");
