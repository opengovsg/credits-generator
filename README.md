# credits-generator

Takes in package.json and outputs a CREDITS.md file attributing the authors of your dependencies

## Usage

1. `npx @opengovsg/credits-generator` from your node project
2. `CREDITS.md` generated!

An example is in this project's own `package.json` and `CREDITS.md`.

## Motivation

Use of open-source software is often governed by the terms of their licenses.
Such terms often include the obligation to provide some form of acknowledgement
of use, along with the full text of the license. This practice is strongly 
recommended at several organisations, including the [Government Technology Agency
of Singapore](https://www.tech.gov.sg/). 

This tool was hence created to make it convenient to attribute authors of 
dependencies in the node.js projects that we publish. As beneficiaries of 
open-source software, we want to provide due recognition to those authors, 
and hope that others would do so too.

More information on this topic can be found in this excellent article found 
at [nexB](https://www.nexb.com/blog/oss_attribution_obligations.html)

## Contributing

We welcome contributions to code open-sourced by the Government Technology
Agency of Singapore. All contributors will be asked to sign a Contributor
License Agreement (CLA) in order to ensure that everybody is free to use their
contributions.
