# ⚽ Football matches simulator

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

## Installation

### TODO

## Local development

### TODO

## Scalability improvements

### TODO
