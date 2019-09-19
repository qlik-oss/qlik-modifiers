# qlik-modifiers
A JavaScript module for handling expression modifiers in Qlik products.
### !EXPERIMENTAL!
[![CircleCI](https://circleci.com/gh/qlik-oss/qlik-modifiers.svg?style=shield)](https://circleci.com/gh/qlik-oss/qlik-modifiers)
[![Coverage Status](https://coveralls.io/repos/github/qlik-oss/qlik-modifiers/badge.svg)](https://coveralls.io/github/qlik-oss/qlik-modifiers)

The idea is to provide a set of useful expression modifiers and a convenient way to work with those.  
First in place is `accumulation` which can produce results similar to this:

<p>
  <img width="800" src="./docs/assets/accumulation.png" alt="Accumulation modifier" />
</p>

### How does it work?

A modifier transforms a hypercube measure expression in a certain way to achieve desired results.
Below is a high-level overview of how the concept works.
<p align="left">
  <img width="400" src="./docs/assets/concept-flow.jpg" alt="Concept flow" />
</p>
<p>
  <img width="900" src="./docs/assets/properties.jpg" alt="Properties" />
</p>

### Api
[See Api documentation](docs/api.md)