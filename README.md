# nextel-test

a [Sails v1](https://sailsjs.com) application

# Nextel REST api
This repo is dedicated to use Node, Sails, Mysql, PubSub, Joi, chai, redis, Istanbul, mocha and more things...

### Links

+ [Get started](https://sailsjs.com/get-started)
+ [Sails framework documentation](https://sailsjs.com/documentation)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Community support options](https://sailsjs.com/support)
+ [Professional / enterprise options](https://sailsjs.com/enterprise)


### Version info

This api was originally generated on Sat 25 2018 21:14:30 GMT-0300 (GMT-03:00) using Sails v1.0.2.

<!-- Internally, Sails used [`sails-generate@1.15.28`](https://github.com/balderdashy/sails-generate/tree/v1.15.28/lib/core-generators/new). -->

## Installation

1- Install Node, MySql and Redis in your machine

2- Install dependecies, in the root directory use:
```
npm install
```

3- To run tests, in the root directory use:
```
npm run test
```

4- To run tests coverage, in the root directory use:
```
npm run test:coverage
```

5- To run the code, use: 
```
sails lift
```

6- To run lint, use: 
```
npm run lint
```

OBS: ***** 
There is a need as a premise to create a new schema in the mysql database with the name
db_super_hero_catalogue the integration of the sails with the database

The whole project is raised in a local environment. Was used default ports and settings.

<!--
Note:  Generators are usually run using the globally-installed `sails` CLI (command-line interface).  This CLI version is _environment-specific_ rather than app-specific, thus over time, as a project's dependencies are upgraded or the project is worked on by different developers on different computers using different versions of Node.js, the Sails dependency in its package.json file may differ from the globally-installed Sails CLI release it was originally generated with.  (Be sure to always check out the relevant [upgrading guides](https://sailsjs.com/upgrading) before upgrading the version of Sails used by your app.  If you're stuck, [get help here](https://sailsjs.com/support).)
-->

