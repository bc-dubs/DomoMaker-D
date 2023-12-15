const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);

  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);

  app.post('/swapDomos', mid.requiresLogin, controllers.Domo.swapDomos);

  app.post('/deleteDomo', mid.requiresLogin, controllers.Domo.deleteDomo);

  app.post('/toggleFave', mid.requiresLogin, controllers.Domo.toggleFave);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
