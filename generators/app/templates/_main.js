(function () {
    'use strict';

    var app = angular.module('myApp', ['ng-admin']);

    app.controller('myCtrl', function() {});
    
    var resourceKeys = {
        	<% tables.forEach(function(table){ %>
        	'<%=table%>':'<%=tablePKs[table]%>',<% }); %>
    };

    app.config(function(RestangularProvider, $httpProvider) {
        RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
            headers = headers || {};
            headers.Prefer = 'return=representation';
            if (operation === 'getList') {
                headers['Range-Unit'] = what;
                headers.Range = ((params._page - 1) * params._perPage) + '-' + (params._page * params._perPage - 1);
                delete params._page;
                delete params._perPage;

                if (params._sortField) {
                    params.order = params._sortField + '.' + params._sortDir.toLowerCase();
                    delete params._sortField;
                    delete params._sortDir;
                }
            }
        });

        RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            switch (operation) {
                case 'get':
                    return data[0];
                case 'getList':
                    response.totalCount = response.headers('Content-Range').split('/')[1];
                    break;
            }

            return data;
        });

        // @see https://github.com/mgonto/restangular/issues/603
        $httpProvider.interceptors.push(function() {
            return {
                request: function(config) {
                    var pattern = /\/([a-zA-Z0-9_/]+)\/([a-zA-Z0-9_/]+)$/;

                    if (pattern.test(config.url)) {
                        config.params = config.params || {};
                        var urlComponents = pattern.exec(config.url);
                        var resource = urlComponents[1];
                        var resourceId = urlComponents[2];
                        var resourceKey = resourceKeys[resource];
                        config.params[resourceKey] = 'eq.' + resourceId;
                        config.url = config.url.replace(pattern, '/' + resource);
                    }
                    return config;
                },
            };
        });
    });

    app.config(function (NgAdminConfigurationProvider) {
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
