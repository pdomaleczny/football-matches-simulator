# ⚽ Football matches simulator

[![Screenshot-2024-07-07-at-16-50-14.png](https://i.postimg.cc/rw0MnXs2/Screenshot-2024-07-07-at-16-50-14.png)](https://postimg.cc/xX2w8ZL6)
[![Screenshot-2024-07-07-at-16-31-48.png](https://i.postimg.cc/wBXVQZQ6/Screenshot-2024-07-07-at-16-31-48.png)](https://postimg.cc/06ND8t43)

## Description
This project is a football matches simulator. It is a simple web application that allows users to simulate football 3 matches between Germany vs Poland, Brazil vs Mexico, Argentina vs Uruguay.

#### How does it work?
1. User provides the name for the simulation (minimum 8 characters, maximum 30
characters, only digits, whitespaces or alphabetic characters e.g. “Katar 2023”)
2. Simulation cannot be started more frequently than once per 5 seconds.
3. Each simulation takes 9 seconds (unless manually finished by the user before 9 seconds elapses).
4. Before 9 seconds elapses user can manually finish the simulation. If simulation hasn’t been manually finished, it’s automatically stopped after 9 seconds.
5. Every 1 seconds random team (among all teams in a simulation) scores exactly 1 goal. First goal is scored at the 1st second, last goal is scored at the 9th second. Every change in a score should be sent to frontend.
6. When the simulation is finished, user can restart it. Then the results are reset and the simulation starts again.
7. User can start, finish and restart the simulation.


## Requirements

- Docker
- npm
- Node.js


## Installation
```bash
#  Build docker images
$ cp .env.example .env
$ npm run build:front
$ npm run build:back

# Run containers
$ npm run start:db
$ npm run start:front
$ npm run start:back
```

## Local development
#### Next.js app (only for testing purpose)
Frontend is running [http://localhost:3000](http://localhost:3000)

#### Nest.js app
Backend is running [http://localhost:3001](http://localhost:3001)

## Project structure
```
  fms-api -> nest.js app
    |- src
      |- api -> api module
        |- simulations -> All logic related with simulations
        |- liveupdate -> All logice responsible for live update with websockets
        |- games -> Schema and services for handling games update
      |- 
    |- test -> e2e tests 
  fms-frontend -> next.js app
```

## Endpoints

```bash
  GET /api/simulations -> get current simulations
  POST /api/simulations -> create or start simulation
  POST /api/simulations/end -> stop manually simulation
```

## Tests
Tests were only implemented for the backend part as Frontend was only implemented for testing purpose

Instructions to run it:
```bash
$ cd fms-api
$ yarn install

#  unit tests
$ yarn test

#  e2e tests
$ yarn test:e2e
```

## Comments to reviewers
- Frontend part was only implemented for testing purpose
- I decided to use docker for better local development
- I didn't decide to store data in memory, wanted to use MongoDB as the storage for better scalability
