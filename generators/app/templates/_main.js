(function () {
    'use strict';

    var app = angular.module('ngAdminPostgrestApp', ['ng-admin-postrest'])
    
    .controller('ngAdminPostgrestCtrl', function() {})
    
    .config(function (NgAdminConfigurationProvider, NgAdminPostgrestProvider) {
    	    	
    	NgAdminPostgrestProvider.setResourceKeys({
        	<% tables.forEach(function(table){ %>
        	'<%=table%>':'<%=tablePKs[table]%>',<% }); %>
        });
    
        var nga = NgAdminConfigurationProvider;

        var app = nga
            .application('<%= appname %>')
            .baseApiUrl('http://<%= postgrestIP %>:<%= postgrestPort %>/');

        <% tables.forEach(function(table){ %>
        var <%=table%> = nga.entity('<%=table%>').identifier(nga.field('<%=tablePKs[table]%>'));
        app.addEntity(<%=table%>);
        
        <%=table%>.listView()
        .perPage(10)
        .sortField('<%=tablePKs[table]%>')
        .fields([
            <% tableColumns[table].forEach(function(column){ %>
            nga.field('<%=column.column_name%>'),<% }); 
            %>    
        ])
        .listActions(['edit', 'show']);

        <%=table%>.showView()
        .fields([
            <% tableColumns[table].forEach(function(column){ %>
            nga.field('<%=column.column_name%>'),<% }); 
            %>    
        ]);

        <%=table%>.creationView()
        .fields([
            <% tableColumns[table].forEach(function(column){ %>
            nga.field('<%=column.column_name%>'),<% }); 
            %>    
        ]);

        <%=table%>.editionView()
        .fields(<%=table%>.creationView().fields());        
        <% }); %>

        nga.configure(app);
    });
}());