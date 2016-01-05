'use strict';
angular.module('ngAdminPostgrestApp', ['ng-admin'])
	.provider('NgAdminPostgrest', function () {
		var resourceKeys = {};
	    
	    this.setResourceKeys = function(value) {
	    	resourceKeys = value;
	    };
	    
	    this.getResourceKey = function(resource) {
	        return resourceKeys[resource];
	    };
	 
	    this.$get = function () {
	        return null;
	    };
	});