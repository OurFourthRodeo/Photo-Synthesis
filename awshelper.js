const aws = require('aws-sdk');
const fs = require('fs');

const s3 = new aws.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET,
	signatureVersion: 'v4',
});

const uploadFile = (filename, serial) => {
	const fileContent = fs.readFileSync(filename);
	var now = new Date().toISOString();
	const params = {
		Bucket: process.env.AWS_BUCKET,
		Key: "images/"+serial+"/"+now+".jpg",
		Body: fileContent,
		ContentType: 'image/jpeg'
	};
	return s3.upload(params, function(err, data) {
		if(err){
			throw(err);
		};
	}).promise();
};

const signUrl = (response) => {
	return url = s3.getSignedUrl('getObject', {
		Bucket: process.env.AWS_BUCKET,
		Key: response,
		Expires: 60*60
	})
};

exports.uploadFile = uploadFile;
exports.signUrl = signUrl;
