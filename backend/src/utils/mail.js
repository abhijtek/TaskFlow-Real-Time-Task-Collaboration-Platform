import Mailgen from "mailgen"
import nodemailer from "nodemailer"

const sendEmail = async(options)=>{
    const mailGenerator = new Mailgen({
        theme : "default",
        product : {

            name :"Task Manager",
            link : "https://taskmanagelink.com",
        }
    })
    const emailTextutal = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    // take my object and send it sending ... 
    const transporter = nodemailer.createTransport({
        host : process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth : {
            user : process.env.MAILTRAP_SMTP_USER,
            pass : process.env.MAILTRAP_SMTP_PASS,
        }
    })

    // creating a mailobject and sending it- finally ig
    const mail = {
        from : "mail.taskmanager@example.com",
        to : options.email,
        subject : options.subject,
        text : emailTextutal,
        html : emailHtml,
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed silently. Make sure your credentials are correct int the .env file")
        console.error("Error :", error)
    }
}


const emailVerificationMailgenContent = (username, verificationUrl) =>{
   return  {
     body : {
        name : username,
        intro : "Wecome to our App ",
        action : {
            instructions : "To verify your email please cl9ck on the button",
            button : {
                color: "#30c772ff",
                text : "Verify you email",
                link: verificationUrl,
            },
        },
        outro : "Need help or have questions ? ",
     },
   };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) =>{
   return  {
     body : {
        name : username,
        intro : "Got a req to reset you passowrd ",
        action : {
            instructions : "To reset click on following button",
            button : {
                color: "#30c772ff",
                text : "reset pass",
                link: passwordResetUrl,
            },
        },
        outro : "Need help or have questions ? ",
     },
   };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,sendEmail
};