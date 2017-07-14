const express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    massive = require('massive'),
    http = require("http"),
    request = require('request'),
    query = require('querystring'),
    Auth0Strategy = require('passport-auth0'),
    passport = require('passport'),
    config = require('./config.js'),
    cors = require('cors');
    connectionString = "postgres://postgres:1234a@localhost/rockshow";

    const app = express();

    const client_id = "915c4e67aa804345b234fc3290ae7e91",
          client_secret = config.spotifySecret;

    app.use(bodyParser.json())
    app.use(cors())
    app.use(session({
      resave: true, //Without this you get a constant warning about default values
      saveUninitialized: true, //Without this you get a constant warning about default values
      secret: 'pizzaisgood'
    }))
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(express.static('./public'))

    massive(connectionString).then((db) => {
        app.set('db', db);

        app.get('/users', function(req, res) {
          const db = req.app.get('db');
          console.log('running')
          db.getallusers().then(data =>{
            console.log('users', data)
            res.status(200).json(data)
          })
        })
        passport.use(new Auth0Strategy({
           domain:       config.auth0.domain,
           clientID:     config.auth0.clientID,
           clientSecret: config.auth0.clientSecret,
           callbackURL:  '/auth/callback'
          },
          function(accessToken, refreshToken, extraParams, profile, done) {
            console.log(profile.id)
            console.log(profile.displayName)
            // console.log('db', db)
            //Find user in database
            db.getUserByAuthId([profile.id]).then(function(user) {
              console.log('gettinguser')
              // if (!err) {
                // user = user[0]

              if (!user[0]) { //if there isn't one, we'll create one!
                console.log('CREATING USER');
                db.createUserByAuth([profile.displayName, profile.id]).then(function(user2) {
                  // console.log("er2", err2)
                  console.log('USER CREATED', user2);
                  return done("user2", user2[0]); // GOES TO SERIALIZE USER
                })
              } else {
                
                //when we find the user, return it
                return done(user[0]);
              }
            // } else {
            //   console.log("err", err)
            // }
            })
          }
        ));

    })

      app.get('/auth', passport.authenticate('auth0'));

      app.get('/auth/callback', passport.authenticate('auth0', {successRedirect: '/'}), function(req, res) {
        console.log('runningcallback')
        res.status(200).send(req.user);
      })
      app.get('/auth/me', function(req, res) {
        if (!req.user) return res.sendStatus(404);
        res.status(200).send(req.user);
      })
      app.get('/auth/logout', function(req, res) {
        req.logout();
        res.redirect('/');
      })
    // 1234a password
    // app.get('/artists/incubus/events', bands.read)

    //This section is for Spotify API
    http.createServer(function(req, res) {
         res.writeHead(200, {"Content-Type": "text/plain"});
         res.write("Hello World");
         res.end();
      }).listen(8888);
    
    let redirect_uri = "";
    
    // @params {number}
    // @return {string}
    let generateRandomString = function(length){
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    var stateKey = 'spotify_auth_state';

    
    app.get('/login', function(req, res) {

      var state = generateRandomString(16);
      res.cookie(stateKey, state);

      var scope = "user-read-private user-read-email";
      res.redirect('http://acounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
    });
    
    app.get ('/callback', function(req, res){

      var code = req.query.code || null;
      var state = req.query.state || null;
      var storedState = req.cookies ? req.cookies[stateKey] : null;

      if(state === null || state !== storedState) {
        res.redirect('/#' + querystring.stringify({
          error: "state_mismatch"
        }));
      } else {
        res.clearCookie(stateKey);
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
          },
          headers: {
            "Authorization" :"Basic " + (new Buffer(client_id + ':' + client_secret).toString('base64'))
          },
          json: true
        }
      };
      request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
    
  });




          var port = 3000
      app.listen(port, function() {
        console.log("listening on port " + port)
      })
