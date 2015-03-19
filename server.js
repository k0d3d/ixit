/**
 * Module dependencies.
 */
/*
Main application entry point
 */

// pull in the package json
var pjson = require('./package.json');
console.log('ixit api server version: ' + pjson.version);

// REQUIRE SECTION
var express = require('express'),
    router = express.Router(),
    config = require('config'),
    app = express(),
    passport = require('passport'),
    routes = require('./controllers/routes'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash'),
    session = require('express-session'),
    favicon = require('static-favicon'),
    compress = require('compression'),
    restler = require('restler'),
    helpers = require('view-helpers'),
    errors = require('./lib/errors'),
    staticAsset = require('static-asset'),
    useragent = require('express-useragent'),
    crashProtector = require('common-errors').middleware.crashProtector,
    Q = require('q');
var MongoStore = require('connect-mongo')(session);

Q.longStackSupport = true;

//color  on console output
require('colors');
// set version
app.set('version', pjson.version);

// port
var port = process.env.PORT || 3000;

function isApiUri (url) {
  var t = '/api/internal/';
  var av1 = '/api/v1/';
  var av2 = '/api/v2/';
  var oauth = '/oauth/';
  if (url.indexOf(t) > -1 || url.indexOf(av1) > -1 || url.indexOf(av2) > -1 || url.indexOf(oauth) > -1) {
    return true;
  }
  return false;
}


function afterResourceFilesLoad(mongooseConnection, redis_client) {

    console.log('configuring application, please wait...');

    app.set('showStackError', true);

    console.log('Enabling crash protector...');
    app.use(crashProtector());

    console.log('Enabling error handling...');
    app.use(errors.init());


    app.use(staticAsset(__dirname + '/public') );

    // make everything in the public folder publicly accessible - do this high up as possible
    app.use(express.static(__dirname + '/public'));

    // set compression on responses
    app.use(compress({
      filter: function (req, res) {
        return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
      },
      level: 9
    }));

    // efficient favicon return - will enable when we have a favicon
    app.use(favicon('public/favicon.ico'));


    app.locals.layout = false;
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');


    console.log('Loading ' + 'passport'.inverse + ' config...');
    // try {
    // } catch(e) {
    //   console.log('Error Loading Passport Config...');
    //   console.trace(e);
    // }
    require('./lib/auth/passport.js')(passport, redis_client);

    // set logging level - dev for now, later change for production
    app.use(logger('dev'));


    // expose package.json to views
    app.use(function (req, res, next) {
      res.locals.pkg = pjson;
      next();
    });

    // signed cookies
    app.use(cookieParser(config.express.secret));

    app.use(useragent.express());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(methodOverride());


    // setup session management
    console.log('setting up session management, please wait...');
    app.use(session({
        secret: config.express.secret,
        saveUninitialized: true,
        resave: true,
        // store: new MongoStore({
        //     db: config.db.database,
        //     host: config.db.server,
        //     port: config.db.port,
        //     auto_reconnect: true,
        //     username: config.db.user,
        //     password: config.db.password,
        //     collection: "mongoStoreSessions"
        // })
        store: new MongoStore({
            autoReconnect: true,
            url: config.db.url,
            // mongooseConnection: mongooseConnection,
            collection: "mongoStoreSessions",
            db: config.db.database,
        })
    }));

    app.use(function (req, res, next) {
      // console.log(req.cookies);
      // check if client sent cookie
      var cookie = req.cookies['ixid-anon-session'];
      if (cookie === undefined && !req.xhr)
      {
        // no: set a new cookie
        var randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        res.cookie('ixid-anon-session',require('./lib/commons').randomString(16), { maxAge: 900000});
      }
        next();
    });

    //Initialize Passport
    app.use(passport.initialize());

    //enable passport sessions
    app.use(passport.session());


    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // should be declared after session and flash
    app.use(helpers(pjson.name));

    // set our default view engine
    // app.set('views', __dirname + '/views');
    // app.set('view engine', 'jade');


    //pass in the app config params in to locals
    app.use(function(req, res, next) {

        res.locals.app = config.app;
        next();

    });

    // our router
    //app.use(app.router);


    // test route - before anything else
    console.log('setting up test route /routetest');

    app.route('/routetest')
    .get(function(req, res) {
        res.send('IXIT Document Client is running');
    });


    // our routes
    console.log('setting up routes, please wait...');
    routes(app, passport, redis_client);


    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next){
      // treat as 404
      if  ( err.message &&
          (~err.message.indexOf('not found') ||
          (~err.message.indexOf('Cast to ObjectId failed'))
          )) {
        return next();
      }

      // log it
      // send emails if you want
      console.log('Error Stack....');
      console.error(err.stack);

      // error page
      //res.status(500).json({ error: err.stack });
      //res.json(500, err.message);

      if (isApiUri(req.url) ) {
        res.json(500, err);
      } else {
        res.status(500).render('500', {
          url: req.originalUrl,
          error: err.message
        });
      }

    });

    // assume 404 since no middleware responded
    app.use(function(req, res){

      if (isApiUri(req.url)) {
        res.json(404, {message: 'resource not found'});
      } else {
        res.status(404).render('404', {
          url: req.originalUrl,
          error: 'Not found'
        });
      }

    });


    // development env config
    if (process.env.NODE_ENV == 'development') {
      app.locals.pretty = true;
    }

}


console.log('Running Environment: %s', process.env.NODE_ENV);

console.log('Creating connection to redis server...');
var redis_client = require('redis').createClient( config.redis.port, config.redis.host, {});
if (config.redis.password) {
    redis_client.auth(config.redis.password);
}
redis_client.on('ready', function () {
  console.log('Redis connection is....ok');
});
redis_client.on('error', function () {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Redis connection failure...%s:%s', config.redis.host, config.redis.port);
  }
});

console.log("Checking connection to IXIT Document Server...");
restler.get(config.dkeep_api_url + '/ping')
.on('success', function (data) {
  // console.log(data);
  if (data === 'ready' ) {
    console.log('Connected to IXIT Document Server'.green + ' running on ' + config.dkeep_api_url);
  }
})
.on('error', function (data) {
  console.log('Error Connecting to '+ 'IXIT Document Server'.red + ' on ' + config.dkeep_api_url);
});


console.log("Setting up database communication...");
// setup database connection
require('./lib/db').open()
.then(function (mongooseConnection) {
  console.log('Database Connection open...');
  //load resources
  afterResourceFilesLoad(mongooseConnection, redis_client);

  // actual application start
  app.listen(port);
  console.log('IXIT API Server started on port '+port);
  // CATASTROPHIC ERROR
  app.use(function(err, req, res){

    console.error(err.stack);

    // make this a nicer error later
    res.status(500).send('Ewww! Something got broken on IXIT. Getting some tape and glue');

  });
})
.catch(function (e) {
  console.log(e);
});


