// Middleware functions all follow a required format so they can work with Express

// Redirects to homepage if user is not logged in
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  // Continues the previous function
  return next();
};

// Redirects to maker page if user **is** logged in
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/maker');
  }
  return next();
};

// Code to check whether we're using HTTPS. Works differently on Heroku
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`); // Send to same url but in HTTPS
  }
  return next();
};

// Dummy function for use in development
const bypassSecure = (req, res, next) => {
  next();
};

module.exports = {
  requiresLogin,
  requiresLogout,
};

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
