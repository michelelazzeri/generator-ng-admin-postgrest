'use strict';
angular.module('ngAdminPostgrestApp')
	.provider('<%=table%>', function () {
		this.create = function(nga) {
		    var table = nga.entity('<%=table%>').identifier(nga.field('<%=tableKey%>'));
		    
		    table.listView()
		    .perPage(10)
		    .sortField('<%=tableKey%>')
		    .fields([
		        <% columns.forEach(function(column){ %>
		        nga.field('<%=column.column_name%>'),<% }); 
		        %>    
		    ])
		    .listActions(['edit', 'show']);
		
		    table.showView()
		    .fields([
		        <% columns.forEach(function(column){ %>
				nga.field('<%=column.column_name%>'),<% }); 
				%>    
		    ]);
		
		    table.creationView()
		    .fields([
		        <% columns.forEach(function(column){ %>
				nga.field('<%=column.column_name%>'),<% }); 
				%>    
		    ]);
		
		    table.editionView()
		    .fields(table.creationView().fields());        
		    
            // postgrest version >= 3.0.0, use PATH instead PUT for update.
		    table.updateMethod('patch');

		    return table;
		};
		
	    this.$get = function () {
	        return null;
	    };
});