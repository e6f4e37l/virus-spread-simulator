# Overview
This simulation uses [matter.js](https://brm.io/matter-js/) and [chart.js](https://www.chartjs.org/) to visualize the spread of a disease through a population of 100. It is intended to demonstrate that pandemic safety/prevention policies actually work to lower R<sub>0</sub> ([basic reproductive number](https://youtu.be/5TJ8RJiQPYA)) of a virus and how that relates to easing the spread of the virus.

The basic idea is to lower R<sub>0</sub> below 1, which will both greatly lower the load on hospitals by "flattening the curve" and slow the spread.

# Variable "policies"
There are a series of "policies" that can be modified to demonstrate how policies may actually help "flatten the curve" and ease the pandemic. The results of changing each and its relation to the real world are shown in the following table:
| "Policy"              | Change to Decrease R<sub>0</sub> | Reason                                         | Application IRL                          |
| :---------------------|:--------------------------------:|:-----------------------------------------------|:-----------------------------------------|
| Infection Rate        | Decrease                         | Less chance for infection upon contact         | Practice good hygiene: masks/wash hands  |
| % People Qurantining  | Increase                         | Less events for virus transmission to occur    | Stay indoors/practice social distancing  |
| Testing Period        | Decrease                         | Infected people identified and treated faster  | More accessible/effective/faster testing |
| Recovery Period       | Decrease                         | Infected people are treated faster⇒infect less | Better/more funding for research         |
| Hospital Capacity     | Increase                         | More infected people are able to be treated    | Better/more funding for hospitals        |
