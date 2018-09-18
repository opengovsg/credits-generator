#!/usr/bin/env node

const Crawler = require('crawler')
const fs = require('fs')
let c = new Crawler({})
let dependencies = []

/**
 * Enter file names here
 */
const INPUT_PACKAGE_JSON = 'package.json'
const CREDITS_MD = 'CREDITS.md'

let retrieveNext = () => {
  if (dependencies.length === 0) {
    console.log(`Done generating ${CREDITS_MD}`)
    return
  }
  retrieve(dependencies.shift())
}

let retrieve = (dep) => {
  console.log('[Step 1] Retrieving ' + dep)
  c.queue({
    uri: `https://registry.npmjs.org/${dep}`,
    jQuery: false,
    callback: function (err, res, done) {
      if (err) throw err
      const { repository, license } = JSON.parse(res.body) || {}
      const { url: gitLink } = repository || {}

      // Find github repo
      const [, rp] = (gitLink && gitLink.match(/github\.com\/(.+)/)) || []
      if (rp) {
        const repoPath = rp.replace('.git', '')
        const sourceLink = `https://github.com/${repoPath}`
        extractLicense(sourceLink, dep)
      } else {
        const licenseBody = `No source repository found, npm lists license as ${license}`
        writeToFile(licenseBody, 'Not Known', dep)
      }
      done()
    },
  })
}

let extractLicense = (sourceLink, dep) => {
  console.log('[Step 2] Extracting license for ' + sourceLink)
  c.queue({
    uri: sourceLink,
    callback: function (err, res, done) {
      if (err) throw err
      let $ = res.$
      // Grab the href that has LICENSE in it
      let licenseElement = $('a[href*="LICENSE"]')
      if (licenseElement.length) {
        // License is in a LICENSE file
        let licenseLink = 'https://github.com' + (licenseElement[0].attribs.href)
        extractRaw(licenseLink, sourceLink, dep)
      } else {
        // Check if license is in the README
        let body = $('.Box-body').text()
        // Default license body in case no license in README
        let licenseBody = 'There is no license specified in this repository.' +
          ' Please visit the source and contact the repository\'s owners to find out more.\n'
        if (body.includes('License')) {
          // Attempt to extract license from README
          licenseBody = body.split('License')[1].split('\n\n')[0]
        }
        writeToFile(licenseBody, sourceLink, dep)
      }
      done()
    },
  })
}

let extractRaw = (licenseLink, sourceLink, dep) => {
  console.log('[Step 3] Extracting raw for ' + licenseLink)
  c.queue({
    uri: licenseLink,
    callback: function (err, res, done) {
      if (err) throw err
      let $ = res.$
      let rawLink = 'https://github.com' + $('a[id="raw-url"]')[0].attribs.href
      extractBody(rawLink, sourceLink, dep)
      done()
    },
  })
}

let extractBody = (rawLink, sourceLink, dep) => {
  console.log('[Step 4] Extracting body for ' + rawLink)
  c.queue({
    uri: rawLink,
    jQuery: false,
    callback: function (err, res, done) {
      if (err) throw err
      // Write to file
      writeToFile(res.body, sourceLink, dep)
      done()
    },
  })
}

let writeToFile = (body, sourceLink, dep) => {
  console.log('[Step 5] Writing to file for ' + dep)
  let project = `\n## Project\n${dep}\n`
  let source = `\n### Source\n${sourceLink}\n`
  let license = `\n### License\n${body}\n\n`
  let hr = '-------------------------------------------------------------------------------\n'
  fs.appendFile(
    CREDITS_MD,
    `${project}${source}${license}${hr}`,
    'utf8',
    err => {
      if (err) {
        console.error(err)
      }
    }
  )
  retrieveNext()
}

let initialiseCredits = () => {
  let header = '# Credits\n'
  let body = 'This application uses Open Source components. You can find the ' +
    'source code of their open source projects along with license information below.' +
    ' We acknowledge and are grateful to these developers for their contributions to open source.\n\n'
  let hr = '-------------------------------------------------------------------------------\n'
  fs.writeFileSync(CREDITS_MD, `${header}${body}${hr}`, {encoding: 'utf8', flag: 'w'})
}

initialiseCredits()
let packageJson = JSON.parse(fs.readFileSync(INPUT_PACKAGE_JSON, 'utf8'))

// Only extracts prod not dev dependencies
dependencies = Object.keys(packageJson['dependencies'])

// Sequentially retrieve licenses
retrieve(dependencies.shift())
