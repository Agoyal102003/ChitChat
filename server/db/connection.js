const mongoose=require('mongoose');

const url=`mongodb+srv://2021ceb1012:Goyal_13151719@cluster1.gjnb8ms.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(url, {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log('connected to db')
}).catch((e)=> console.log('error', e))