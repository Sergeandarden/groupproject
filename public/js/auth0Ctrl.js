angular.module('myApp')
.controller('auth0Ctrl', function($scope, auth0Service, $state) {


  // function getUser() {
  //   userService.getUser().then(function(user) {
  //     if (user) $scope.user = user.username;
  //     else   $scope.user = 'NOT LOGGED IN';
  //   })
  // }

<<<<<<< HEAD
  getUser();
=======
  // getUser();
>>>>>>> master

  // $scope.loginLocal = function(username, password) {
  //   console.log('Logging in with', username, password);
  //   userService.loginLocal({
  //     username: username,
  //     password: password
  //   })
  //   .then(function(res) {
  //     getUser();
  //   })
  // }

  $scope.logout = userService.logout;


})
