module.exports = function(grunt) {
	grunt.initConfig({
	
		<% if (postgrestStartServerLocally === true) {%>	
	    shell: {
	    	postgrest: {
	            command: '<%= postgrestCommand %> --db-host <%= dbHost %> --db-port <%= dbPort %> --db-name <%= dbName %> --db-user <%= dbUser %> --db-pass <%=dbPassword%> --db-pool 200 --anonymous postgres --port <%=postgrestPort%>  --v1schema <%=dbSchema%>'
	        }
	    },
	    <%} %>

	    jshint: {
	        all: ['Gruntfile.js', 'main.js']
	    },

	    'http-server': {
	 
	        dev: {
	 
	            // the server root directory 
	            root: '.',
	 
	            // the server port 
	            // can also be written as a function, e.g. 
	            // port: function() { return 8282; } 
	            port: <%= httpdPort %>,
	 
	            // the host ip address 
	            // If specified to, for example, "127.0.0.1" the server will 
	            // only be available on that ip. 
	            // Specify "0.0.0.0" to be available everywhere 
	            host: '<%= httpdIP %>',
	 
	            cache: 0,
	            showDir : false,
	            autoIndex: false,
	 
	            // server default file extension 
	            ext: "html",
	 
	            // run in parallel with other tasks 
	            runInBackground: true,
	 
	            // specify a logger function. By default the requests are 
	            // sent to stdout. 
	            logFn: function(req, res, error) { },
	 
	            // Proxies all requests which can't be resolved locally to the given url 
	            // Note this this will disable 'showDir' 
	            //proxy: "http://someurl.com",
	 
	            // Use 'https: true' for default module SSL configuration 
	            // (default state is disabled) 
	            //https: {
	            //    cert: "cert.pem",
	            //    key : "key.pem"
	            //},
	 
	            // Tell grunt task to open the browser 
	            openBrowser : true
	        }
	    }
	});
	 
	grunt.loadNpmTasks('grunt-http-server');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('serve', ['http-server' <% if (postgrestStartServerLocally === true) {%>, 'shell:postgrest'<%} %>]);	
};