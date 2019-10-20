# SchockApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.4.

## Preparations

Copy `src/assets/config.json.template` to `src/assets/config.json` and provide according information for your PouchDB.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

# Architecture

## Responsibilities of classes

```
component -----> provider -----> repository +-------------------> HTTP
   |                 |                      |
   |                 |                      |
   +---> service <---+                      +----> adapter -----> DB
```

* `component`: Shows the UI; may only import `provider`s; may use `service`s to process entities, map data, etc.
* `provider`: Calls the repository; usually passes the request to the repo; may use `service`s to process entities, map data, etc.
* `repository`: Processes backend calls; uses `HttpClient`
* `service`: Wraps functionality like mapping entities, handling on-/offline-state etc.
* `adapter`: Abstracts access to a specific DB, like PouchDB

## NGRX

* `actions`: simple objects, retrieving an optional payload
* `effect`: Business Logic, Services could be injected, error actions could be dispatched, actions can optionally dispatch other actions
* `reducer`: KISS! No logic.
* `selector`: Combine parts of state, grouping, sorting, filtering