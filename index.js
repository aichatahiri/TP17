// index.js
const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// -----------------
// Charger le schéma Protobuf
// -----------------
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// -----------------
// Liste d'employés
// -----------------
const employees = [
  { id: 1, name: 'Ali', salary: 9000 },
  { id: 2, name: 'Kamal', salary: 22000 },
  { id: 3, name: 'Amal', salary: 23000 }
];

const jsonObject = { employee: employees };

// -----------------
// JSON
// -----------------
console.time('JSON encode');
const jsonData = JSON.stringify(jsonObject, null, 2);
console.timeEnd('JSON encode');

console.time('JSON decode');
const jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

fs.writeFileSync('data.json', jsonData);

// -----------------
// XML
// -----------------
const options = { compact: true, ignoreComment: true, spaces: 2 };

console.time('XML encode');
const xmlData = "<root>\n" + convert.js2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

console.time('XML decode');
const xmlJson = convert.xml2json(xmlData, { compact: true });
const xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

fs.writeFileSync('data.xml', xmlData);

// -----------------
// Protobuf
// -----------------
const errMsg = EmployeeList.verify(jsonObject);
if (errMsg) throw Error(errMsg);

console.time('Protobuf encode');
const message = EmployeeList.create(jsonObject);
const buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

console.time('Protobuf decode');
const decodedMessage = EmployeeList.decode(buffer);
const protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');

fs.writeFileSync('data.proto', buffer);

// -----------------
// Comparaison des tailles
// -----------------
const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log('\n--- Taille des fichiers ---');
console.log(`JSON     : ${jsonFileSize} octets`);
console.log(`XML      : ${xmlFileSize} octets`);
console.log(`Protobuf : ${protoFileSize} octets`);
