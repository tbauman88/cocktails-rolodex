# CocktailsRolodex

[![CI](https://github.com/tbauman88/cocktails-rolodex/actions/workflows/ci.yml/badge.svg)](https://github.com/tbauman88/cocktails-rolodex/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/tbauman88/cocktails-rolodex/branch/main/graph/badge.svg?token=2WZ27315F6)](https://codecov.io/gh/tbauman88/cocktails-rolodex)

## Setup
Run the following commands;
- `cp .env.example .env`
- `nvm use`
- `npm install`

## Docker
Run `npm run api:docker` to build your api project, generate your prisma types and build your docker container. 

## Migrations 
To run your migrations you can run both by using `npm run migrate:all` or individually `npm run migrate:api` or `npm run migrate:tests`

## Development server
Run `nx serve cocktails` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Testing 
Run `nx client:test` or `nx api:test` to run project tests.

## Understand this workspace
Run `nx graph` to see a diagram of the dependencies of the projects.
