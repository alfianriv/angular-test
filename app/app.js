angular
	.module("myApp", ["ngRoute", "ngResource", "ngCookies", "datatables"])

	//---------------
	// Services
	//---------------

	.factory("Todos", [
		"$resource",
		function ($resource) {
			return $resource("/todos/:id", null, {
				post: { method: "PUT" },
			});
		},
	])

	.factory("Login", [
		"$resource",
		function ($resource) {
			return $resource("/auth/login");
		},
	])

	.factory("Register", [
		"$resource",
		function ($resource) {
			return $resource("/auth/register");
		},
	])

	//---------------
	// Controllers
	//---------------

	.controller("LoginController", [
		"$rootScope",
		"$scope",
		"Login",
		"$cookies",
		"$location",
		function ($rootScope, $scope, Login, $cookies, $location) {
			$scope.form = {
				email: null,
				password: null,
			};

			$scope.login = async () => {
				if (!$scope.form.email) {
					return alert("Email is required");
				}

				if (!$scope.form.password) {
					return alert("Password is required");
				}

				const user = Login.save({}, $scope.form);
				user.$promise.then(function (response) {
					if (response.error) {
						alert(response.message);
					} else {
						$cookies.put("token", response.data.token);
						$rootScope.globals = { user: response.data };
						$location.url("/home");
					}
				});
			};
		},
	])

	.controller("RegisterController", [
		"$scope",
		"Register",
		"$location",
		function ($scope, Register, $location) {
			$scope.form = {
				name: null,
				email: null,
				phone: null,
				password: null,
			};

			$scope.register = async () => {
				if (!$scope.form.name) {
					return alert("Name is required");
				}

				if (!$scope.form.email) {
					return alert("Email is required");
				}

				if (!$scope.form.phone) {
					return alert("Phone is required");
				}

				if (!$scope.form.password) {
					return alert("Password is required");
				}

				const user = Register.save({}, $scope.form);
				user.$promise.then(function (response) {
					if (response.error) {
						alert(response.message);
					} else {
						alert("Success registered");
						$location.url("/login");
					}
				});
			};
		},
	])

	.controller("HomeController", [
		"$rootScope",
		"$scope",
		"$location",
		"DTOptionsBuilder",
		"DTColumnBuilder",
		"$http",
		"$cookies",
		function (
			$rootScope,
			$scope,
			$location,
			DTOptionsBuilder,
			DTColumnBuilder,
			$http,
			$cookies
		) {
			$scope.user = $rootScope.globals.user;
			$scope.items = [];
			$scope.total = 0;
			$scope.vm = {};
			$scope.vm.instance = null;
			$scope.vm.dtColumns = [
				DTColumnBuilder.newColumn("date").withTitle("Date"),
				DTColumnBuilder.newColumn("amount").withTitle("Amount"),
			];
			$scope.vm.dtOptions = DTOptionsBuilder.newOptions()
				.withOption("ajax", function (data, callback, settings) {
					$http
						.get("/transactions", {
							params: { ...data, user: $scope.user.id },
						})
						.then(function (response) {
							$scope.items = [];
							$scope.items = response.data.data;
							$scope.total = response.data.total_amount[0].total;
							callback({
								recordsTotal: response.data.recordsTotal,
								recordsFiltered: response.data.recordsFiltered,
								data: [],
							});
						});
				})
				.withOption("dataSrc", "data")
				.withOption("processing", true) // to set the processing at serverside
				.withOption("serverSide", true)
				.withOption("searching", false);

			$scope.logout = () => {
				$cookies.remove("token");
				$rootScope.globals = null;
				$scope.user = null;
				$location.url("/login");
			};
		},
	])

	//---------------
	// Routes
	//---------------

	.config([
		"$routeProvider",
		function ($routeProvider) {
			$routeProvider
				.when("/login", {
					templateUrl: "/views/login.template.html",
					controller: "LoginController",
				})
				.when("/register", {
					templateUrl: "/views/register.template.html",
					controller: "RegisterController",
				})
				.when("/home", {
					templateUrl: "/views/home.template.html",
					controller: "HomeController",
				})
				.otherwise("/login");
		},
	])

	//---------------
	// Middleware
	//---------------
	.run(async function ($rootScope, $location, $cookies, $http) {
		if ($cookies.get("token")) {
			$http
				.get("/auth/getUser?token=" + $cookies.get("token"))
				.then(({ data }) => {
					if (!data.error) {
						$rootScope.globals = { user: data.data };
						$location.path("/home");
					}
				});
		}

		$rootScope.$on("$locationChangeStart", function (event, next, current) {
			if ($location.path() == "/home" && !$rootScope.globals) {
				$location.path("/login");
			}
			if ($location.path() != "home" && $rootScope.globals) {
				$location.path("/home");
			}
		});
	});
