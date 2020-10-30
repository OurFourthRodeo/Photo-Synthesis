const aws = require('aws-sdk');
const fs = require('fs');

const s3 = new aws.S3({
	accessKeyId: process.env.AWSID,
	secretAccessKey: process.env.AWSSECRET,
	signatureVersion: 'v4',
});

const uploadFile = (filename, serial) => {
	const fileContent = fs.readFileSync(filename);
	var now = new Date().toISOString();
	const params = {
		Bucket: process.env.BUCKET,
		Key: "images/"+serial+"/_"+now+".jpg",
		Body: fileContent
	};
	return s3.upload(params, function(err, data) {
		if(err){
			throw(err);
		};
	}).promise();
};

const signUrl = (response) => {
	return url = s3.getSignedUrl('getObject', {
		Bucket: process.env.BUCKET,
		Key: response.key,
		Expires: 60*60
	})
};

exports.uploadFile = uploadFile;
exports.signUrl = signUrl;
