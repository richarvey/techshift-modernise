'use strict';
const fs = require('fs');
const aws = require('aws-sdk');


module.exports = class FileSystem {

    constructor(app) {
        this.config = app.locals.config;
        
        aws.config.update({ region: this.config.aws.region });
        this.s3 = new aws.S3();
    }

    getVersion() {
        return 2.3;     //Track 2, lab 3
    }

    async renameTemp(src, dest) {
        fs.renameSync(src, dest);
    }

    async deleteTemp(filename) { 
        if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);
        }
    }

   async deletePublic(image) { 
        try {    
            await this.s3.deleteObject({
                Bucket: this.config.aws.s3Bucket,
                Key: this.pathForImage(image)
            }).promise();
            await this.s3.deleteObject({
                Bucket: this.config.aws.s3Bucket,
                Key: this.pathForImageThumb(image)
            }).promise();
        } catch (err) {
            console.log(err);
        }
    }

    async moveFileToPublic(src, dest) {
        console.log("Moving file to S3: " + src);
        console.log("Destination: " + dest);

        var params = {
            Bucket: this.config.aws.s3Bucket,
            Key: dest,
            Body: fs.createReadStream(src)
        }

        try {
            await this.s3.upload(params).promise();
        } catch (err) {
            console.log(err);
        }
        
        //fs.renameSync(src, "public" + dest);
    }

    uriForImage(req, image) {
        return "/images/uploads/" + image.id + "." + image.extension;
    }

    uriForImageThumb(req, image) {
        return "/images/uploads/" + image.id + "_thumb." + image.extension;
    }

    pathForImage(image) {
        return "images/uploads/" + image.id + "." + image.extension;
    }

    pathForImageThumb(image) {
        return "images/uploads/" + image.id + "_thumb." + image.extension;
    }
}
