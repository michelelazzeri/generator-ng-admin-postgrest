'use strict';
angular.module('ngAdminPostgrestApp')
  .controller('ngAdminPostgrestController', function() {})
  .config(function (
		  <% tables.forEach(function(table){ %>
		  <%=table%>Provider,<% }); %>
		  NgAdminConfigurationProvider, 
		  NgAdminPostgrestProvider) {
                	        
	    	NgAdminPostgrestProvider.setResourceKeys({
	        	<% tables.forEach(function(table){ %>
	        	'<%=table%>':'<%=tablePKs[table]%>',<% }); %>
	        });
	
	        var nga = NgAdminConfigurationProvider;

	        var app = nga
	            .application('<%= appname %>')
	            .baseApiUrl('http://<%= postgrestIP %>:<%= postgrestPort %>/');

	        <% tables.forEach(function(table){ %>
	        app.addEntity(<%=table%>Provider.create(nga));<% }); %>
	        	            
	        nga.configure(app);
});