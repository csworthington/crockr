import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import mongoose, { mongo, Mongoose } from "mongoose";
import bluebird from "bluebird";
const userSchema = new mongoose.Schema({userID: "string", roomID:"string", name: "string", canEdit: "boolean", TA: "boolean"});
const User = mongoose.model("user", userSchema );
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;
export const resetDatabase = () =>{
    mongoose.connect(mongoUrl).then(() =>{
        User.collection.drop();
    }
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
};
export const addUser = (userId : string, roomId :string) => {
    console.log("made it to add user");
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
    mongoose.connect(mongoUrl).then(() => {  
        User.find({userID: userId}).deleteOne().exec();
    }
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
};

export const getRoomID = async (userId : string) => {
    let foundRoomID = "-1";
    console.log(`Initialized ${foundRoomID}`);
    await mongoose.connect(mongoUrl).then(async () => {
        console.log("testing trigger");   
        await User.findOne({userID: userId}).exec().then(async (user : any) => {
            console.log(`roomID: ${user.roomID}`);
            console.log(foundRoomID);
            foundRoomID = user.roomID;
            console.log(foundRoomID);

        });
    }
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
    console.log(`before return ${foundRoomID}`);
    return foundRoomID;     
};
export const setTA = async (userId: string, value: boolean) =>{
    const updateValue = {TA: value};
    console.log("Entered Ta SEt");
    await mongoose.connect(mongoUrl).then(async () => {
        await User.findOneAndUpdate({userID: userId}, updateValue), (err: any, doc: any) =>{
            if(!err){
                console.log(`Changed Ta to ${value}`);
                console.log(doc);
    
            }
            else{
                console.log(err);
            }
        };
    }
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
};
export const setCanEdit = async (userId: string, value: boolean) =>{
    const updateValue = {canEdit: value};
    console.log("Entered Ta Set");
    await mongoose.connect(mongoUrl).then(async () => {
        await User.findOneAndUpdate({userID: userId}, updateValue), (err: any, doc: any) =>{
            if(!err){
                console.log(`Changed Ta to ${value}`);
                console.log(doc);
    
            }
            else{
                console.log(err);
            }
        };
    }
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        // process.exit();
    });
};


    


