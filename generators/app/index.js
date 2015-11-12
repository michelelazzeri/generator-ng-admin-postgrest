'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var sync = require('synchronize');
var pg = require('pg');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
	constructor: function () {
		yeoman.generators.Base.apply(this, arguments);
	    this.argument('appname', 
	    	{ 
	    		type: String, 
	    		required: false,
	    	    defaults: path.basename(path.resolve('.'))
	    });
	},	
	prompting: { 
		dbConf: function () {
			var self = this;
			var done = this.async();
	
			// Have Yeoman greet the user.
			this.log(yosay(
					'Welcome to the superior ' + chalk.red('NgAdminPostgrest') + ' generator for ' + chalk.green(this.appname)
			));
			var prompts = [
			               {
			            	   type: 'input',
			            	   name: 'dbHost',
			            	   message: 'Type the database hostname',
			            	   'default': 'localhost'
			               },
			               {
			            	   type: 'input',
			            	   name: 'dbPort',
			            	   message: 'Type the database port',
			            	   'default': '5432'
			               },
			               {
			            	   type: 'input',
			            	   name: 'dbUser',
			            	   message: 'Type the database user',
			            	   'default': 'postgres'
			               },
			               {
			            	   type: 'password',
			            	   name: 'dbPassword',
			            	   message: 'Type the database pasword',
			            	   'default': 'postgres'
			               },
			               {
			            	   type: 'input',
			            	   name: 'dbName',
			            	   validate: function(input) {
			            		   if (input == '') {
			            			   self.log("You need to provide a database name");
			            			   return false;
			            		   }
		            			   return true;
			            	   },
			            	   message: 'Type the database name',
			            	   'default': 'mydb'
			               },
			               {
			            	   type: 'input',
			            	   name: 'dbSchema',
			            	   message: 'Type the database schema',
			            	   'default': 'public'
			               },
			               ];
			this.prompt(prompts, function (props) {
				this.props = props;
				
				this.props.conString = 'postgres://'+props.dbUser+':'+props.dbPassword+'@'+props.dbHost+':'+props.dbPort+'/'+props.dbName;

				self.props.tables = [];
				pg.connect(this.props.conString, function(err, client, pgDone) {
				  if(err) {return self.log(chalk.red('error connecting to postres, check connection parameters. ' + err));}
				  client.query('select tablename from pg_tables where schemaname = $1', [self.props.dbSchema], function(err, result) {
					  // release connection  
					  pgDone();
					  if(err) {return self.log(chalk.red('error running query. ' + err));}
					  for ( var i in result.rows) {
						  self.props.tables.push(result.rows[i].tablename);
					  }
					  done();				    
				  });
				});
			}.bind(this));
		},
		dbTables: function() {
			var self = this;
			var done = this.async();
			var prompts = [
			               {
			            	   type: 'checkbox',
			            	   name: 'tables',
			            	   choices: self.props.tables,
			            	   message: 'Select the tables',
			            	   'default': ''
			               },
			               ];
			this.prompt(prompts, function (props) {
				this.props.tables = props.tables;
				done();
			}.bind(this));			
		}, 
		dbTableColumns: function() {
			var self = this;
			var done = this.async();
   		    self.props.tableColumns = {};
			
   		    pg.connect(this.props.conString, function(err, client, pgDone) {
				  if(err) {return self.log(chalk.red('error connecting to postres, check connection parameters. ' + err));}
   		    	client.query('SELECT table_name, column_name, udt_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = ANY($2::name[]) order by ordinal_position', 
   		    			[self.props.dbSchema, self.props.tables], function(err, result) {
   		    		// release connection  
   		    		pgDone();
					  if(err) {return self.log(chalk.red('error running query. ' + err));}
   		    		for (var i in result.rows) {
   		    			var row = result.rows[i];
   		    			if (!self.props.tableColumns[row.table_name]) {
   		    				self.props.tableColumns[row.table_name] = [];
   		    			}
   		    			self.props.tableColumns[row.table_name].push(row);
   		    		}
   		    		done();
   		    	});
   		    });
		},
		dbTablePrimaryKeys: function() {
			var self = this;
			var done = this.async();
   		    self.props.tablePKs = {};
			
   		    pg.connect(this.props.conString, function(err, client, pgDone) {
				if(err) {return self.log(chalk.red('error connecting to postres, check connection parameters. ' + err));}
   		    	client.query('SELECT ' +
   		    			' c.column_name, tc.table_name ' +
   		    			' FROM information_schema.table_constraints tc ' + 
   		    			' JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) ' + 
   		    			' JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema AND tc.table_name = c.table_name AND ccu.column_name = c.column_name ' +
   		    			' where constraint_type = \'PRIMARY KEY\'' +
   		    			' and tc.constraint_schema = $1 ' +
   		    			' and tc.table_name = ANY($2::name[]) ', [self.props.dbSchema, self.props.tables], function(err, result) {
   		    		// release connection  
   		    		pgDone();
					if(err) {return self.log(chalk.red('error running query. ' + err));}
   		    		for (var i in result.rows) {
   		    			var row = result.rows[i];
   		    			if (!self.props.tablePKs[row.table_name]) {
   		    				self.props.tablePKs[row.table_name] = row.column_name;
   		    			}
   		    			else {
   		    				return self.log(chalk.red('not allowed multiple field primary key of table ' + row.table_name));
   		    			}
   		    			//self.props.tablePKs[row.table_name].push(row);
   		    		}
   		    		done();
   		    	});
   		    });
		},
		postgrest: function() {
			var self = this;
			var done = this.async();
			var prompts = [
			               {
				         	   type: 'input',
				         	   name: 'postgrestCommand',
				         	   message: 'type the PostgREST fullpath command',
				         	   'default': '/usr/local/bin/postgrest'
				            },
			               {
			            	   type: 'input',
			            	   name: 'postgrestIP',
			            	   message: 'type the PostgREST server IP',
			            	   'default': '127.0.0.1'
			               },
			               {
			            	   type: 'input',
			            	   name: 'postgrestPort',
			            	   message: 'type the PostgREST port',
			            	   'default': '3000'
			               },
			               ];
			this.prompt(prompts, function (props) {
				this.props.postgrestCommand = props.postgrestCommand;
				this.props.postgrestIP = props.postgrestIP;
				this.props.postgrestPort = props.postgrestPort;
				done();
			}.bind(this));			
		},
		httpd: function() {
			var self = this;
			var done = this.async();
			var prompts = [
			               {
			            	   type: 'input',
			            	   name: 'httpdIP',
			            	   message: 'type the HTTP server IP',
			            	   'default': '127.0.0.1'
			               },
			               {
			            	   type: 'input',
			            	   name: 'httpdPort',
			            	   message: 'type the HTTP server port',
			            	   'default': '3001'
			               },
			               ];
			this.prompt(prompts, function (props) {
				this.props.httpdIP = props.httpdIP;
				this.props.httpdPort = props.httpdPort;
				done();
			}.bind(this));			
		},
	},
	writing: {
		app: function () {
			this.props.appname = this.appname;
			this.fs.copyTpl(this.templatePath('_package.json'), this.destinationPath('package.json'), this.props);
			this.fs.copyTpl(this.templatePath('_bower.json'), this.destinationPath('bower.json'), this.props);
			this.fs.copyTpl(this.templatePath('_index.html'), this.destinationPath('index.html'), this.props);
			this.fs.copyTpl(this.templatePath('_main.js'), this.destinationPath('main.js'), this.props);
			this.fs.copyTpl(this.templatePath('_Gruntfile.js'), this.destinationPath('Gruntfile.js'), this.props);
		},

		projectfiles: function () {
			this.fs.copy(
				this.templatePath('editorconfig'),
				this.destinationPath('.editorconfig')
			);
			this.fs.copy(
				this.templatePath('jshintrc'),
				this.destinationPath('.jshintrc')
			);
		}
	},

	install: function () {
		this.installDependencies();
	},	
});
