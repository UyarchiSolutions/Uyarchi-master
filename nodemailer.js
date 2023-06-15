const nodeMailer = require('nodemailer');

const generateOTP = () => {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const transpoter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'muthamizhyadav@gmail.com',
    pass: 'dramjibzgemvmmsp',
  },
});

const options = {
  from: 'muthamizhyadav@gmail.com',
  to: 'vignesh1041996@gmail.com',
  text: `Hai Your OTP Is:${generateOTP()}`,
  subject: ' Wow That is Simple',
};

transpoter.sendMail(options, (err, info) => {
  if (err) {
    //console.log(err);
    return;
  }
  //console.log('send' + info.response);
});
