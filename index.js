'use strict';

const fs = require('fs');
const getFiles = require('node-recursive-directory');
const { Parser } = require('json2csv');

const filesFolder = '../LOGS/es.product-family.cds-sbt/';
const report = [];
const fields = ["Family-ID", "errors"];

async function getDetails() {
  let filesList = await getFiles(filesFolder);
  
  filesList.forEach(file => {
    if(file.includes('error_details')) {
      let data = fs.readFileSync(file, {encoding: 'utf-8'});
      let entity = '';
      let errors = JSON.parse(data).errors.map(e => {
        entity = e.entity;

        if(e.body && e.body.length) {
          return e.body.map(e=> {
            if(e) {
              // console.log(e)
              let obj = JSON.parse(JSON.stringify(e));
              // console.log(obj)
              if(obj.Error) {
                return {
                  Error : obj && JSON.parse(obj.Error).isNotEmpty ? JSON.parse(obj.Error).isNotEmpty : ''
                }
              }
            }
          });
        } else {
          return {
            'message': e.message,
            'Error': e.body
          }
        }
      });
      
      let familyId = entity.split('/');

      report.push({
        'Family-ID' : familyId[familyId.length-1],
        errors : errors,
        // bolbFileName : file.split(filesFolder)[1]
      });
    }
  });

  const parser = new Parser({
    report,
    unwind: fields
  });

  const csv = parser.parse(report);
  // console.log(report)
  fs.writeFileSync(`REPORT/report_${Date.now()}.csv`, csv, {encoding: 'utf-8'});
}

getDetails();