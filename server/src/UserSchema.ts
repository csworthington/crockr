import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import mongoose, { mongo } from "mongoose";
import bluebird from "bluebird";
const userSchema = new mongoose.Schema({userID: "string", roomID:"string", name: "string", canEdit: "boolean", TA: "boolean"});
const User = mongoose.model("user", userSchema );
export const addUser = (userId : string, roomId :string) => {
    const mongoUrl = MONGODB_URI;
    mongoose.Promise = bluebird;
    mongoose.connect(mongoUrl).then(
        () => {  
            User.exists({userID: userId}, function(err, res) {
                if(err){ 
                    console.log(err);
                }
                else{
                if(res == null){
                    User.create({ userID: userId, roomID: roomId, name: "JohnDoe", canEdit: true, TA: false }, function (err, twist) {
                        // saved!
                    });
                }
                }
            });
        },
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
};
export const removeUser = (userId : string) => {
    const mongoUrl = MONGODB_URI;
    mongoose.Promise = bluebird;
    mongoose.connect(mongoUrl).then(() => {  
        User.find({userID: userId}).deleteOne().exec();
    }
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
};