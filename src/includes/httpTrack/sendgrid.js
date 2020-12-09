//app.sendgrid.com/guide/integrate/langs/nodejs
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')


module.exports.sendEmail = (sub,body,users)=> {   
   console.log('Email->','USERS:',users,'SUBJECT:',sub)
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to:users,
        from:process.env.SENDGRID_FROM,
        subject:sub,
        text:body
    }
    sgMail.send(msg).then(()=>{
        console.log('Email send')
    }).catch(error=>{
        //TODO: CREATE LOG 
        console.log(error)
    })
}
