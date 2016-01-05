# ng-admin PostgREST Generator

> Yeoman generator for ng-admin + PostgREST.

Scaffold an [ng-admin](https://github.com/marmelab/ng-admin) web application generated on an existing [PostgreSQL](http://www.postgresql.org) database exposed via [PostgREST](https://github.com/begriffs/postgrest).

**ng-admin PostgREST Generator** explore your PostgreSQL database, detecting tables and automagically generate ng-admin entities.

## Usage

Download [PostgREST](https://github.com/begriffs/postgrest/releases) 

Install `yo`, `grunt-cli`, `bower`, `generator-ng-admin-postgrest`:
```
npm install -g yo grunt-cli bower generator-ng-admin-postgrest
```

Make a new directory, and `cd` into it:
```
mkdir my-new-project && cd $_
```

Run `yo ng-admin-postgrest`, optionally passing an app name:
```
yo ng-admin-postgrest [app-name]
```

Generator will ask you:
- database connection
- which entities generate
- postrest configuration
- http server configuration

Start the http and postgrest server for preview. 
```
grunt
grunt serve
```

## Structure

The application structure follow the official Yeoman `generator-angular`

```
├── bower.json
├── Gruntfile.js
├── package.json
├── postgrest.json
├── app
│   ├── index.html
│   ├── app.js
│   ├── favicon.ico
│   ├── scripts
│   │   ├── entities
│   │   │   ├── <entity 1>.js
│   │   │   ├── <entity 2>.js
│   │   │   ├── <entity 3>.js
│   │   ├── ng-admin-postgrest
│   │   │   ├── config.js
│   │   │   ├── provider.js
│   │   ├── styles
│   │   │   ├── main.scss
```

## Requirements

a PostgresQL database  with a user credentials for access `information_schema` catalog

## Credits

- Starting from [ng-admin-postgrest](https://github.com/marmelab/ng-admin-postgrest)
- Based on 
  - [ng-admin](https://github.com/marmelab/ng-admin) 
  - [PostgREST](https://github.com/begriffs/postgrest)
  - [generator-angular](https://github.com/yeoman/generator-angular)

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Michele Lazzeri
