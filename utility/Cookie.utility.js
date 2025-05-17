// set cookie
function setCookie(res,cookieName, jwt, age=Math.floor(Date.now()/1000)+(60)){
      res.cookie(cookieName,jwt,{
            maxAge: age,
            httpOnly:true,
            secure: false, // set to true if HTTPS
            sameSite: process.env.NODE_ENV !== "development"
      })
      // res.setHeader('Set-Cookie',)
}

module.exports = {setCookie}