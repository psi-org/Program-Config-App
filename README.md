# Program Configuration App

<img src="https://github.com/psi-org/Program-Config-App/blob/main/src/images/PCA-logo.png" width="100px" alt="PCA Logo">

### Introduction
The Program Config App (PCA) can be used as a generic DHIS2 Program Configuration wizard that simplifies the process of creating, editing, and maintaining DHIS2 programs and all related metadata. Users are presented with a unified interface from which they can add pre-existing or new Data Elements or Attributes to a Program individually or in bulk, add or edit Options Sets, apply Organisation Units access, configure Sharing Settings for multiple objects, as well as Import and Export Program configurations, and much more.

Also, the PCA fully automates the configuration of clinical quality improvement checklists based on PSI's HNQIS (Health Network Quality Improvement System) methodology.

This repository contains all the source code for the PCA, which is built using the DHIS2 App Platform and DHIS2 CLI. The PCA is being actively developed and has planned support for several years to come.

### Usage and Installation

For in depth instructions on how to use and install the PCA on your DHIS2 instance please refer to the [Program Configuration App Documentation](https://psi.atlassian.net/wiki/spaces/PCA/overview).

### Dev Setup

Use node version 16.20.2 - for working properly with Dhis2 components (@dhis2/cli-app-scripts)
 --> use of 'nvm' (Node.js Version Manager) is suggested if there already is a later version of node installed.

Use 'yarn' rather than 'npm'

Add Dhis2 cli with global
- yarn global add @dhis2/cli-app-scripts

Add react-scripts with global
- yarn global add react-scripts

Install packages:
- yarn install

Run in dev:
--> It might fail on 1st try, but succeed on 2nd time.
- yarn start

Deployment:
 - yarn build
 - yarn deploy

Notes:
 -- 'yarn start' would open up the 'Sign-in' in 'http://localhost:3000'.
  For this to work, Set CORS whitelist with 'http://localhost:3000' in the target DHIS2 server.

 -- Alternative way: Deploy to a target Dhis2 server.
   Change 'name' in 'package.json' & 'title' in 'd2.config.js' to be a unique name. (Ex: Program Configuration V10.9.1)
   Deploy package by following above 'Deployment:' steps.


### License

This project is licensed under the Creative Commons Attribution 4.0 International License - see the [LICENSE.md](LICENSE.md) file for details. Please make sure that you read and understand the terms of the license before using and modifying this software.

### Credits

The PCA was developed by [KnowTechTure](https://www.knowtechture.com/) in collaboration with [Population Services International](https://www.psi.org/).
