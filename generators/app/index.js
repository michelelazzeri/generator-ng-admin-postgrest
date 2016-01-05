'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var pg = require('pg');
var fs = require('fs');
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
			
			// Set defaults
			this.config.defaults(
					{
					     dbHost: "localhost",
					     dbPort: "5432",
					     dbUser: "postgres",
					     dbPassword: "postgres",
					     dbName: "mydb",
					     dbSchema: "public",
					     postgrestStartServerLocally: true,
  				         postgrestCommand: "/usr/local/bin/postgrest",
					     postgrestIP: "127.0.0.1",
					     postgrestPort: "3000",
					     httpdIP: "127.0.0.1",
					     httpdPort: "3001",		
					}
			);
			
			// Propt database connection data
			var prompts = [
			               {
			            	   type: 'input',
			            	   name: 'dbHost',
			            	   message: 'Type the database hostname',
			            	   'default': this.config.get('dbHost')
			               },
			               {
			            	   type: 'input',
			            	   name: 'dbPort',
			            	   message: 'Type the database port',
			            	   'default': this.config.get('dbPort')
			               },
			               {
			            	   type: 'input',
			            	   name: 'dbUser',
			            	   message: 'Type the database user',
			            	   'default': this.config.get('dbUser')
			               },
			               {
			            	   type: 'password',
			            	   name: 'dbPassword',
			            	   message: 'Type the database pasword',
			            	   'default': this.config.get('dbPassword')
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
			            	   'default': this.config.get('dbName')
			               },
			               {
			            	   type: 'input',
			            	   name: 'dbSchema',
			            	   message: 'Type the database schema',
			            	   'default': this.config.get('dbSchema')
			               },
			               ];
			this.prompt(prompts, function (props) {
				this.props = props;

				this.config.set('dbUser',props.dbUser);
				this.config.set('dbPassword',props.dbPassword);
				this.config.set('dbHost',props.dbHost);
				this.config.set('dbPort',props.dbPort);
				this.config.set('dbName',props.dbName);
				this.config.set('dbSchema',props.dbSchema);

				this.props.conString = 'postgres://'+props.dbUser+':'+props.dbPassword+'@'+props.dbHost+':'+props.dbPort+'/'+props.dbName;

				// Load the table list
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
			
			// Select the tables
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

   		    // Load che column names
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
			
   		    // Load the primary keys
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
   		    		}
   		    		done();
   		    	});
   		    });
		},
		postgrestStartServerLocally: function() {
			var self = this;
			var done = this.async();
			
			// Ask if postgrest must run locally
			var prompts = [
			               {
				         	   type: 'confirm',
				         	   name: 'postgrestStartServerLocally',
				         	   message: 'start PostgREST server locally?',
			            	   'default': this.config.get('postgrestStartServerLocally')
				            },
			               ];
			this.prompt(prompts, function (props) {
				this.props.postgrestStartServerLocally = props.postgrestStartServerLocally;
				this.config.set('postgrestStartServerLocally',props.postgrestStartServerLocally);
				done();
			}.bind(this));			
		},
		postgrestCommand: function() {
			
			if (!this.props.postgrestStartServerLocally) {
				this.config.delete('postgrestCommand');
				return;
			}
			
			var self = this;
			var done = this.async();
			var prompts = [
			               {
				         	   type: 'input',
				         	   name: 'postgrestCommand',
				         	   message: 'type the PostgREST fullpath command',
			            	   'default': this.config.get('postgrestCommand')
				            },
			               ];
			this.prompt(prompts, function (props) {
				this.props.postgrestCommand = props.postgrestCommand;

				this.config.set('postgrestCommand',props.postgrestCommand);
				
				done();
			}.bind(this));			
		},
		postgrestConfig: function() {
			var self = this;
			var done = this.async();
			var prompts = [
			               {
			            	   type: 'input',
			            	   name: 'postgrestIP',
			            	   message: 'type the PostgREST server IP',
			            	   'default': this.config.get('postgrestIP')
			               },
			               {
			            	   type: 'input',
			            	   name: 'postgrestPort',
			            	   message: 'type the PostgREST port',
			            	   'default': this.config.get('postgrestPort')
			               },
			               ];
			this.prompt(prompts, function (props) {
				this.props.postgrestIP = props.postgrestIP;
				this.props.postgrestPort = props.postgrestPort;

				this.config.set('postgrestIP',props.postgrestIP);
				this.config.set('postgrestPort',props.postgrestPort);
				
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
			            	   'default': this.config.get('httpdIP')
			               },
			               {
			            	   type: 'input',
			            	   name: 'httpdPort',
			            	   message: 'type the HTTP server port',
			            	   'default': this.config.get('httpdPort')
			               },
			               ];
			this.prompt(prompts, function (props) {
				this.props.httpdIP = props.httpdIP;
				this.props.httpdPort = props.httpdPort;

				this.config.set('httpdIP',props.httpdIP);
				this.config.set('httpdPort',props.httpdPort);
				
				done();
			}.bind(this));			
		},
	},
	writing: {
		app: function () {
			this.props.appname = this.appname;
			this.fs.copyTpl(this.templatePath('_package.json'), this.destinationPath('package.json'), this.props);
			this.fs.copyTpl(this.templatePath('_bower.json'), this.destinationPath('bower.json'), this.props);
			this.fs.copyTpl(this.templatePath('_README.md'), this.destinationPath('README.md'), this.props);
			this.fs.copy(this.templatePath('Gruntfile.js'), this.destinationPath('Gruntfile.js'));
			this.fs.copyTpl(this.templatePath('_postgrest.json'), this.destinationPath('postgrest.json'), this.props);
			
			try { fs.statSync(this.destinationPath('app'));}
			catch (e) {fs.mkdirSync(this.destinationPath('app'));}

			this.fs.copyTpl(this.templatePath('app/_index.html'), this.destinationPath('app/index.html'), this.props);

			this.fs.copy(this.templatePath('app/favicon.ico'), this.destinationPath('app/favicon.ico'));
			
			this.fs.copy(this.templatePath('.jshintrc'), this.destinationPath('.jshintrc'));

			try { fs.statSync(this.destinationPath('app/styles'));}
			catch (e) {fs.mkdirSync(this.destinationPath('app/styles'));}

			this.fs.copy(this.templatePath('app/styles/main.scss'), this.destinationPath('app/styles/main.scss'));

			try { fs.statSync(this.destinationPath('app/scripts'));}
			catch (e) {fs.mkdirSync(this.destinationPath('app/scripts'));}

			this.fs.copyTpl(this.templatePath('app/scripts/_app.js'), this.destinationPath('app/scripts/app.js'), this.props);

			try { fs.statSync(this.destinationPath('app/scripts/ng-admin-postgrest'));}
			catch (e) {fs.mkdirSync(this.destinationPath('app/scripts/ng-admin-postgrest'));}

			this.fs.copy(this.templatePath('app/scripts/ng-admin-postgrest/config.js'), this.destinationPath('app/scripts/ng-admin-postgrest/config.js'));
			this.fs.copy(this.templatePath('app/scripts/ng-admin-postgrest/provider.js'), this.destinationPath('app/scripts/ng-admin-postgrest/provider.js'));

			try { fs.statSync(this.destinationPath('app/scripts/entities'));}
			catch (e) {fs.mkdirSync(this.destinationPath('app/scripts/entities'));}
			
			for (var i in this.props.tables) {
				var table = this.props.tables[i];
				var tableProps = {
						table: table,			
						tableKey: this.props.tablePKs[table],
						columns: this.props.tableColumns[table]
				}
				this.fs.copyTpl(this.templatePath('app/scripts/entities/_entity.js'), this.destinationPath('app/scripts/entities/'+table+'.js'), tableProps);
			}
		},
	},

	install: function () {
		this.installDependencies();
	},	
});
