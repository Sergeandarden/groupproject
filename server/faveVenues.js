module.exports = {
  read: function(req, res, next) {
    // console.log("server", req.user.user_id)
    var db = req.app.get('db')
    db.getFaveVenues(req.user.user_id).then(faves => {
        res.status(200).json(faves)
    })
  },
  create: function(req, res, next) {
    var db = req.app.get('db')
    db.addToFaveVenues(req.params.userId, req.params.venue_id).then(added => {
        res.status(200).json(added)
    })
  },
  delete: function(req, res, next) {
    var db = req.app.get('db')
    db.removeFaveVenueById(req.params.userId, req.params.band_id).then(deleted =>{
        res.status(200).json(deleted)
    })
  }
}
