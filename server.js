const express=require('express')
const userRouter=require('./routers/userRouter.js')
const con = require('./config/dbconfig.js');
const cors = require('cors');

const app=express()
const port=process.env.PORT||8000
app.use(express.json())
app.use('/u', userRouter)
app.use(cors());

app.get('/',(req,res) => {
    res.json({"code" : 200, "message" : "api posting data"});
})

app.listen(port,()=>{
    console.log('Server is up on the port '+port+" !")
})