// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

/* GET home page. */
router.get('/', sessionChecker, async function(req, res, next) {
  let parms = { title: 'Home', active: { home: true } };
  req.session.isHost = true;

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;
    parms.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
  } else {
    parms.signInUrl = authHelper.getAuthUrl();
    parms.debug = parms.signInUrl;
  }
  parms.currentUser = req.session.user;
  res.render('host', parms);
});

// middleware function to check for logged-in users
function sessionChecker(req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.redirect('/auth/signin');
    }  
}

module.exports = router;
