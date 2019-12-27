'use strict';
var PromiseFtp = require('promise-ftp');
var moment = require('moment');
var fs = require('fs');

exports.uploadCsvFTP = (event, context) => {
	const time = new Date();
  	console.log(`Your cron function "${context.functionName}" ran at ${time}`);
	console.log("Event: \n" + JSON.stringify(event, null, 2))

	var ftpClient = new PromiseFtp();
	uploadDataToServerUsingFTP(ftpClient);

};

function connectToFTPServer(ftpClient) {
	// Connect to server
	// @TODO: to check if we can easily connect to ftp server like this
	return ftpClient.connect({
	  host: "ftp.dlptest.com",
	  port: 21, // defaults to 21
	  user: "dlpuser@dlptest.com", // defaults to "anonymous"
	  password: "SzMf7rTE4pCrf9dV286GuNe4N", // defaults to "@anonymous"
	});
}

function closeConnection(ftpClient) {
	return ftpClient.end();
}

function getUsersData() {
	// dummy data
  	let userData = [
    	{
	      'id': 1,
	      'username': 'Dhruv@123',
	      'firstName': 'Dhruv',
	      'lastName': 'Sharma',
	      'email': 'xyz@gmail.com',
	      'facilityName': 'McBay',
	      'manager': 'DS',
	      'role': 'Facility',
	      'group': ['xyz', 'abc']
    	},
    	{
	      'id': 2,
	      'username': 'Sharma@123',
	      'firstName': 'Dhruv',
	      'lastName': 'Sharma',
	      'email': 'abc@gmail.com',
	      'facilityName': 'McBay',
	      'manager': 'DS',
	      'role': 'Doctor',
	      'group': ['def', 'abc']
    	}
  	];
	
	// writing to file
	let reportData = "Connect User id,Connect Username,First Name,Last Name,Email ID,Facility Name,Manager,Connect Role,Group Membership\n";

	const objFields = ['id', 'username', 'firstName', 'lastName', 'email', 'facilityName', 'manager', 'role'];

  	const userFields = userData.map(userObj => {
    	let userValues = objFields.map(field => userObj[field]);
    	userValues.push(userObj['group'].join('|'));
    	return userValues.join(',');
  	});
  
  	reportData += (userFields.join('\n'));
  	return reportData;
}

function getDirectoryListing(ftpClient) {
	return ftpClient.list();
}

function uploadReportData(ftpClient, reportData) {

	const fileName = 'report_' + moment().format('YYYY-MM-DD-HH-mm-ss') + '.csv';
	return ftpClient.put(reportData, fileName);
}

function getFileData(ftpClient) {
	return ftpClient.get('report_2019-12-27-13-09-55.csv');
}

function uploadDataToServerUsingFTP(ftpClient) {
	
	const reportData = getUsersData();
  	console.log(`Report data: ${reportData}`);

	connectToFTPServer(ftpClient)
	.then(serverMessage => {
		console.log('Server message: ' + serverMessage);
		return uploadReportData(ftpClient, reportData);
	}).
	/*then(obj => {
		return getDirectoryListing(ftpClient);
	}).
	then(list => {
    	console.log('Directory listing:');
    	console.dir(list);
  	}).
  	then(obj => {
  		return getFileData(ftpClient);
  	}).
  	then(function (stream) {
    	return new Promise(function (resolve, reject) {
      		stream.once('close', resolve);
      		stream.once('error', reject);
      		stream.pipe(fs.createWriteStream('foo.local-copy.txt'));
    	});
    }).*/
  	then(() => {
  		return closeConnection(ftpClient);
  	});
}