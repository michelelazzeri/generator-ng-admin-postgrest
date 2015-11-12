# ng-admin PostgREST Generator

> Yeoman generator for ng-admin and PostgREST.

Scaffold an [ng-admin](https://github.com/marmelab/ng-admin) application generated on a Postgres database exposed via [PostgREST](https://github.com/begriffs/postgrest) . 

## Usage

Download [Postgrest](https://github.com/begriffs/postgrest/releases) 

Install `yo`, `grunt-cli`, `bower`:
```
npm install -g yo grunt-cli bower 
```

Make a new directory, and `cd` into it:
```
mkdir my-new-project && cd $_
```

Run `yo ng-admin-postgrest`, optionally passing an app name:
```
yo ng-admin-postgrest [app-name]
```

Run `grunt` for building and `grunt serve` for preview

## Credits

- Inspired by [ng-admin-postgrest](https://github.com/marmelab/ng-admin-postgrest)
- Based on 
  - [ng-admin](https://github.com/marmelab/ng-admin) 
  - [PostgREST](https://github.com/begriffs/postgrest)

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Michele Lazzeri
