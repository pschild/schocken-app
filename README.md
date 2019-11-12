# SchockenApp

## Development
Terminal 1: `$ npm run watch:hop-backend-api`  
Terminal 2: `$ npm run watch:hop-basic-components`  
Terminal 3: `$ npm start`

or

`$ npm run build:libraries && npm start`

## Architecture
```
Component <----> DataProvider <----> NGRX <----> Repository <----> DB
                      ^                              ^
                      |                              |
                      +------------------------------+
```

* `Component`: Shows the UI; may only call `DataProvider`s; may use `Service`s.
* `DataProvider`: Calls Mapping-`Services` to map DTO <=> VO; it calls/collects data from multiple repositories when necessary; belongs to a `Component`; may call NgRx effects when appropriate.
* `Service`: Wraps functionality like mapping entities, handling on-/offline-state etc.
* `Repository`: Processes backend calls; uses `HttpClient`.
* `Adapter`: Abstracts access to a specific DB, like PouchDB.

## NGRX

* `actions`: Simple objects, containing an optional payload.
* `effect`: Business Logic, `Repositories` (`DataProviders`?) could be injected, error actions could be dispatched, actions can optionally dispatch other actions.
* `reducer`: KISS! No logic except for filter/push to arrays, update object properties etc.
* `selector`: Combine parts of state, grouping, sorting, filtering.